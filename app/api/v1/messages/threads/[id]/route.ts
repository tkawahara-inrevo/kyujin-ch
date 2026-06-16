/**
 * GET /api/v1/messages/threads/{id}
 * スレッド詳細とメッセージ一覧（認証必須・本人のみ）
 *
 * クエリ: before=ISO日時 でページネーション（無指定で最新50件）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { notFound, unauthorized } from "@/lib/api/errors";
import { senderTypeLabel, toMessage } from "../../_lib/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    include: {
      application: {
        select: {
          job: {
            select: {
              title: true,
              company: { select: { name: true } },
            },
          },
        },
      },
    },
  });
  if (!conv) return notFound("スレッドが見つかりません");

  const before = req.nextUrl.searchParams.get("before");
  const beforeDate = before ? new Date(before) : null;

  const messages = await prisma.message.findMany({
    where: {
      conversationId: id,
      ...(beforeDate ? { createdAt: { lt: beforeDate } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
  });

  const hasMore = messages.length > PAGE_SIZE;
  const sliced = hasMore ? messages.slice(0, PAGE_SIZE) : messages;

  // 発信者名解決（USER=自分名 / COMPANY=会社名 / ADMIN=管理者）
  const companyName = conv.application.job.company.name;
  const latestMessage = sliced[0];

  return NextResponse.json({
    thread: {
      id: conv.id,
      title: conv.application.job.title,
      companyName,
      latestMessage: latestMessage
        ? {
            body: latestMessage.body,
            createdAt: latestMessage.createdAt.toISOString(),
            senderType: senderTypeLabel(latestMessage.senderType),
          }
        : null,
      unreadCount: 0,
      updatedAt: conv.updatedAt.toISOString(),
    },
    messages: sliced.map((m) =>
      toMessage(
        m,
        m.senderType === "USER" ? "あなた" : m.senderType === "COMPANY" ? companyName : "運営",
      ),
    ),
    hasMore,
  });
}
