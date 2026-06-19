import { NextRequest, NextResponse } from "next/server";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { badRequest, unauthorized } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/v1/me/devices
 * モバイルアプリの FCM/APNs プッシュトークンを登録する。
 * 同じ deviceId が既にあれば更新、なければ作成。
 */
export async function POST(req: NextRequest) {
  let userId: string;
  try {
    ({ userId } = await authenticate(req));
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");
  const { token, platform, deviceId } = body as {
    token?: string;
    platform?: string;
    deviceId?: string;
  };
  if (!token || typeof token !== "string") return badRequest("token is required");
  if (platform !== "ios" && platform !== "android") return badRequest("platform must be ios or android");
  if (!deviceId || typeof deviceId !== "string") return badRequest("deviceId is required");

  await prisma.pushDevice.upsert({
    where: { deviceId },
    update: { token, platform, userId },
    create: { token, platform, deviceId, userId },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

/**
 * DELETE /api/v1/me/devices
 * 端末ログアウト時にトークンを削除。
 */
export async function DELETE(req: NextRequest) {
  let userId: string;
  try {
    ({ userId } = await authenticate(req));
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");
  const { deviceId } = body as { deviceId?: string };
  if (!deviceId) return badRequest("deviceId is required");

  await prisma.pushDevice.deleteMany({
    where: { deviceId, userId },
  });

  return new NextResponse(null, { status: 204 });
}
