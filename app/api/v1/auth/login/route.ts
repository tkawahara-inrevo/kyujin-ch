/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 * Returns: { accessToken, refreshToken, user }
 *
 * モバイルアプリ用ログイン。NextAuth とは独立した経路。
 * 求職者(USER) と企業(COMPANY) を受け付ける。初期スコープでは USER 主体。
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, generateRefreshToken } from "@/lib/api/jwt";
import { badRequest, unauthorized } from "@/lib/api/errors";
import { toUserProfile } from "../_lib/profile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("不正なJSONです");
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) return badRequest("email と password は必須です");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("メールアドレスの形式が不正です");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || !user.isActive) {
    return unauthorized("メールアドレスまたはパスワードが正しくありません");
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return unauthorized("メールアドレスまたはパスワードが正しくありません");
  }

  const accessToken = await signAccessToken(user.id, user.role);
  const { token: refreshToken, hash, expiresAt } = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      expiresAt,
      userAgent: req.headers.get("user-agent") ?? undefined,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    },
  });

  return NextResponse.json({
    accessToken,
    refreshToken,
    user: toUserProfile(user),
  });
}
