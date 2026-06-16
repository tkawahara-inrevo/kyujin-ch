/**
 * POST /api/v1/messages/threads/{id}/read
 * 自分が受け取った（=USER以外発信）未読メッセージを全て既読化
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { notFound, unauthorized } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }
  const { id } = await params;

  const conv = await prisma.conversation.findFirst({
    where: { id, application: { userId: ctx.userId } },
    select: { id: true },
  });
  if (!conv) return notFound("スレッドが見つかりません");

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderType: { not: "USER" },
      isRead: false,
    },
    data: { isRead: true },
  });

  return new NextResponse(null, { status: 204 });
}
