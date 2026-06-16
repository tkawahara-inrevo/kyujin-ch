/**
 * POST /api/v1/messages/threads/{id}/messages
 * メッセージ送信（認証必須・本人のスレッドのみ）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { badRequest, notFound, unauthorized } from "@/lib/api/errors";
import { toMessage } from "../../../_lib/format";

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

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("不正なJSONです");
  }
  const text = body.body?.trim();
  if (!text) return badRequest("body は必須です");
  if (text.length > 5000) return badRequest("メッセージが長すぎます (5000文字以内)");

  const conv = await prisma.conversation.findFirst({
    where: { id, application: { userId: ctx.userId } },
    select: {
      id: true,
      application: {
        select: { job: { select: { company: { select: { companyUserId: true } } } } },
      },
    },
  });
  if (!conv) return notFound("スレッドが見つかりません");

  // ブロック判定
  const companyUserId = conv.application?.job?.company?.companyUserId;
  if (companyUserId) {
    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: ctx.userId, blockedId: companyUserId },
          { blockerId: companyUserId, blockedId: ctx.userId },
        ],
      },
      select: { id: true },
    });
    if (blocked) return badRequest("このスレッドへのメッセージ送信はブロックされています");
  }

  const msg = await prisma.$transaction(async (tx) => {
    const m = await tx.message.create({
      data: {
        conversationId: id,
        senderId: ctx.userId,
        senderType: "USER",
        body: text,
      },
    });
    await tx.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
    return m;
  });

  return NextResponse.json(toMessage(msg, "あなた"), { status: 201 });
}
