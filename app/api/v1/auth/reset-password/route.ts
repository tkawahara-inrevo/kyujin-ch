/**
 * POST /api/v1/auth/reset-password
 * Body: { token, password }
 * トークン検証 + パスワード変更。
 */
import { NextRequest, NextResponse } from "next/server";
import { badRequest } from "@/lib/api/errors";
import { consumePasswordResetToken } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("不正なJSONです");
  }
  const token = body.token?.trim();
  const password = body.password;
  if (!token) return badRequest("token は必須です");
  if (!password || password.length < 8) return badRequest("パスワードは8文字以上で入力してください");

  const ok = await consumePasswordResetToken(token, password);
  if (!ok) {
    return NextResponse.json(
      { message: "トークンが無効または期限切れです", code: "INVALID_TOKEN" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
