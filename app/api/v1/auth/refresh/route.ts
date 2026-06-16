/**
 * POST /api/v1/auth/refresh
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken, user }
 *
 * リフレッシュ時に古いトークンは失効、新リフレッシュトークンを発行（ローテーション）。
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAccessToken, generateRefreshToken, hashRefreshToken } from "@/lib/api/jwt";
import { badRequest, unauthorized } from "@/lib/api/errors";
import { toUserProfile } from "../_lib/profile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { refreshToken?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("不正なJSONです");
  }

  const oldToken = body.refreshToken?.trim();
  if (!oldToken) return badRequest("refreshToken は必須です");

  const oldHash = hashRefreshToken(oldToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: oldHash },
    include: { user: true },
  });
  if (!stored) return unauthorized("リフレッシュトークンが無効です");
  if (stored.revokedAt) return unauthorized("リフレッシュトークンは失効済みです");
  if (stored.expiresAt <= new Date()) return unauthorized("リフレッシュトークンが期限切れです");
  if (!stored.user.isActive) return unauthorized("アカウントが無効です");

  // ローテーション: 旧トークン失効 + 新トークン発行
  const { token: newToken, hash: newHash, expiresAt } = generateRefreshToken();
  const accessToken = await signAccessToken(stored.userId, stored.user.role);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        userId: stored.userId,
        tokenHash: newHash,
        expiresAt,
        userAgent: req.headers.get("user-agent") ?? undefined,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      },
    }),
  ]);

  return NextResponse.json({
    accessToken,
    refreshToken: newToken,
    user: toUserProfile(stored.user),
  });
}
