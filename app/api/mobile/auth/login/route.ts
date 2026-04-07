import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/mobile-jwt";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { error: "メールアドレスとパスワードを入力してください" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: (body.email as string).toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.password || !user.isActive) {
    return NextResponse.json(
      { error: "メールアドレスまたはパスワードが正しくありません" },
      { status: 401 }
    );
  }

  if (user.role !== "USER") {
    return NextResponse.json(
      { error: "このアカウントはアプリからログインできません" },
      { status: 403 }
    );
  }

  const valid = await bcrypt.compare(body.password as string, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "メールアドレスまたはパスワードが正しくありません" },
      { status: 401 }
    );
  }

  const payload = { sub: user.id, email: user.email!, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  return NextResponse.json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
