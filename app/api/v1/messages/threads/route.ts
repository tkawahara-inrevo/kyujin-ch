/**
 * GET /api/v1/messages/threads
 * 自分のメッセージスレッド一覧（認証必須）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { unauthorized } from "@/lib/api/errors";
import { senderTypeLabel } from "../_lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  // 自分のApplicationに紐づくConversationを取得
  const conversations = await prisma.conversation.findMany({
    where: { application: { userId: ctx.userId } },
    orderBy: { updatedAt: "desc" },
    include: {
      application: {
        select: {
          id: true,
          job: { select: { title: true, company: { select: { name: true } } } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // 未読数を一括カウント（自分が受け取った=USER以外発信、isRead=false）
  const conversationIds = conversations.map((c) => c.id);
  const unreadCountsRaw = conversationIds.length
    ? await prisma.message.groupBy({
        by: ["conversationId"],
        where: {
          conversationId: { in: conversationIds },
          senderType: { not: "USER" },
          isRead: false,
        },
        _count: { _all: true },
      })
    : [];
  const unreadMap = new Map(unreadCountsRaw.map((u) => [u.conversationId, u._count._all]));

  const result = conversations.map((c) => {
    const latest = c.messages[0];
    return {
      id: c.id,
      title: c.application.job.title,
      companyName: c.application.job.company.name,
      latestMessage: latest
        ? {
            body: latest.body,
            createdAt: latest.createdAt.toISOString(),
            senderType: senderTypeLabel(latest.senderType),
          }
        : null,
      unreadCount: unreadMap.get(c.id) ?? 0,
      updatedAt: c.updatedAt.toISOString(),
    };
  });

  return NextResponse.json(result);
}
