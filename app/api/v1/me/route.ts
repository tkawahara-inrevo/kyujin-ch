/**
 * GET /api/v1/me  -> 自分のプロフィール（認証必須）
 * 認証ヘルパの動作確認も兼ねた最初のエンドポイント。
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { unauthorized, notFound } from "@/lib/api/errors";
import { toUserProfile } from "../auth/_lib/profile";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
  if (!user) return notFound("ユーザーが見つかりません");

  return NextResponse.json(toUserProfile(user));
}
