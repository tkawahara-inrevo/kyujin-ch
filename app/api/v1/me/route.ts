/**
 * GET    /api/v1/me  -> 自分のプロフィール
 * PATCH  /api/v1/me  -> プロフィール更新
 * DELETE /api/v1/me  -> 退会（アカウント匿名化）
 *
 * すべて認証必須。Web側 /mypage には影響なし。
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { unauthorized, notFound, badRequest } from "@/lib/api/errors";
import { toUserProfile } from "../auth/_lib/profile";

export const dynamic = "force-dynamic";

async function withAuth(
  req: NextRequest,
  fn: (userId: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const ctx = await authenticate(req);
    return await fn(ctx.userId);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return notFound("ユーザーが見つかりません");
    return NextResponse.json(toUserProfile(user));
  });
}

export async function PATCH(req: NextRequest) {
  return withAuth(req, async (userId) => {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest("不正なJSONです");
    }

    // 受け付けるフィールドだけ抽出
    const data: Record<string, unknown> = {};
    const stringFields = [
      "firstName", "lastName", "firstNameKana", "lastNameKana",
      "gender", "phone", "postalCode", "prefecture", "cityTown", "addressLine",
    ] as const;
    for (const f of stringFields) {
      if (typeof body[f] === "string") {
        const v = (body[f] as string).trim();
        data[f] = v === "" ? null : v;
      } else if (body[f] === null) {
        data[f] = null;
      }
    }
    if (typeof body.birthDate === "string" && body.birthDate) {
      const d = new Date(body.birthDate);
      if (!Number.isNaN(d.getTime())) data.birthDate = d;
    } else if (body.birthDate === null) {
      data.birthDate = null;
    }
    if (typeof body.notificationsEnabled === "boolean") {
      data.notificationsEnabled = body.notificationsEnabled;
    }

    // 氏名フルネームを name に同期
    const fn = typeof data.firstName === "string" ? data.firstName : undefined;
    const ln = typeof data.lastName === "string" ? data.lastName : undefined;
    if (fn || ln) {
      data.name = `${ln ?? ""} ${fn ?? ""}`.trim() || undefined;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return NextResponse.json(toUserProfile(updated));
  });
}

export async function DELETE(req: NextRequest) {
  return withAuth(req, async (userId) => {
    // 退会: 関連データは保持して User を匿名化
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        name: "退会済みユーザー",
        email: `deleted_${userId}@deleted.invalid`,
        password: null,
        isActive: false,
        firstName: null,
        lastName: null,
        firstNameKana: null,
        lastNameKana: null,
        phone: null,
        postalCode: null,
        prefecture: null,
        cityTown: null,
        addressLine: null,
        image: null,
      },
    });
    // 全リフレッシュトークン失効
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return new NextResponse(null, { status: 204 });
  });
}
