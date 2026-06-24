import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const TOKEN_TTL_MINUTES = 60;

/**
 * パスワードリセットトークンを生成して User に紐づけ、トークンの平文を返す。
 * (DBには平文を保存。リセット URL に乗せるため。盗用リスクは TTL 60分で軽減)
 *
 * メアドが存在しない場合は null を返すが、呼出側ではセキュリティの観点から
 * 「メールを送信しました」と返却すべき (アカウント存在の漏洩防止)。
 */
export async function issuePasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, isActive: true, role: true },
  });
  if (!user || !user.isActive) return null;
  // モバイルアプリのリセットは USER ロールのみ許可。管理者・企業は Web 別フローを想定
  if (user.role !== "USER") return null;

  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
  });

  return token;
}

/**
 * トークン検証 + パスワード変更を実行。
 * 成功時 true、無効/期限切れ時 false。
 */
export async function consumePasswordResetToken(
  token: string,
  newPassword: string,
): Promise<boolean> {
  if (newPassword.length < 8) return false;

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
    select: { id: true, passwordResetExpiresAt: true, isActive: true },
  });
  if (!user || !user.isActive) return false;
  if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) return false;

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  // 既存の全 refresh token を失効 (パスワード変更でセキュリティリセット)
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return true;
}

/** リセット URL を生成 */
export function buildResetUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp";
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}
