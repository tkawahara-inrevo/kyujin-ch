/**
 * POST /api/v1/auth/register
 * Body: { email, password, name, agreedTerms, agreedPrivacy }
 * Returns: { accessToken, refreshToken, user }
 *
 * モバイルアプリ用 求職者(USER)新規登録。
 * Web 側の register 経路とは別経路。
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, generateRefreshToken } from "@/lib/api/jwt";
import { badRequest, conflict } from "@/lib/api/errors";
import { toUserProfile } from "../_lib/profile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    password?: string;
    name?: string;
    agreedTerms?: boolean;
    agreedPrivacy?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return badRequest("不正なJSONです");
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const name = body.name?.trim() ?? "";

  if (!email || !password || !name) {
    return badRequest("email, password, name は必須です");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("メールアドレスの形式が不正です");
  }
  if (password.length < 8) {
    return badRequest("パスワードは8文字以上にしてください");
  }
  if (!body.agreedTerms || !body.agreedPrivacy) {
    return badRequest("利用規約とプライバシーポリシーへの同意が必要です");
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return conflict("このメールアドレスは既に登録されています");

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      role: "USER",
      isActive: true,
    },
  });

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

  return NextResponse.json(
    {
      accessToken,
      refreshToken,
      user: toUserProfile(user),
    },
    { status: 201 },
  );
}
