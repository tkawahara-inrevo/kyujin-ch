/**
 * POST /api/v1/auth/logout
 * Body: { refreshToken? }
 * Returns: 204
 *
 * リフレッシュトークンを失効させる。アクセストークンは短命なので失効リスト不要。
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashRefreshToken } from "@/lib/api/jwt";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { refreshToken?: string } = {};
  try {
    body = await req.json();
  } catch {
    // body 空 = アクセストークンだけでログアウト試みの場合あり
  }

  const token = body.refreshToken?.trim();
  if (token) {
    const hash = hashRefreshToken(token);
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  return new NextResponse(null, { status: 204 });
}
