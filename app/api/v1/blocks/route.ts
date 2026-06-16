/**
 * GET  /api/v1/blocks - 自分がブロックしているユーザー一覧
 * POST /api/v1/blocks - ユーザーをブロック (body: { userId })
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { badRequest, unauthorized, conflict, notFound } from "@/lib/api/errors";

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
    const blocks = await prisma.block.findMany({
      where: { blockerId: userId },
      orderBy: { createdAt: "desc" },
    });
    if (blocks.length === 0) return NextResponse.json([]);
    const users = await prisma.user.findMany({
      where: { id: { in: blocks.map((b) => b.blockedId) } },
      select: { id: true, name: true, image: true },
    });
    const map = new Map(users.map((u) => [u.id, u]));
    return NextResponse.json(
      blocks.map((b) => ({
        userId: b.blockedId,
        name: map.get(b.blockedId)?.name ?? "(削除済みユーザー)",
        avatarUrl: map.get(b.blockedId)?.image ?? null,
        blockedAt: b.createdAt.toISOString(),
      })),
    );
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    let body: { userId?: string };
    try {
      body = await req.json();
    } catch {
      return badRequest("不正なJSONです");
    }
    const blockedId = body.userId?.trim();
    if (!blockedId) return badRequest("userId は必須です");
    if (blockedId === userId) return badRequest("自分自身はブロックできません");

    const target = await prisma.user.findUnique({ where: { id: blockedId }, select: { id: true } });
    if (!target) return notFound("ユーザーが見つかりません");

    try {
      await prisma.block.create({ data: { blockerId: userId, blockedId } });
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === "P2002") return conflict("既にブロック済みです");
      throw e;
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  });
}
