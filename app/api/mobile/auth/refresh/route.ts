import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/mobile-jwt";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.refreshToken) {
    return NextResponse.json({ error: "refreshTokenが必要です" }, { status: 400 });
  }

  try {
    const payload = await verifyRefreshToken(body.refreshToken as string);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "アカウントが無効です" }, { status: 401 });
    }

    const newPayload = { sub: user.id, email: user.email!, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(newPayload),
      signRefreshToken(newPayload),
    ]);

    return NextResponse.json({ accessToken, refreshToken });
  } catch {
    return NextResponse.json({ error: "トークンが無効です" }, { status: 401 });
  }
}
