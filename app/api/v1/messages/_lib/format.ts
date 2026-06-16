/**
 * Conversation / Message → モバイルAPI 変換
 */
import type { Message } from "@prisma/client";

export function senderTypeLabel(t: string): "user" | "company" {
  return t === "USER" ? "user" : "company";
}

export function toMessage(m: Message, senderName?: string) {
  return {
    id: m.id,
    threadId: m.conversationId,
    senderId: m.senderId,
    senderType: senderTypeLabel(m.senderType),
    senderName: senderName ?? "",
    body: m.body,
    attachments: m.attachmentUrl
      ? [
          {
            url: m.attachmentUrl,
            type: m.attachmentType ?? "",
            name: m.attachmentName ?? "",
          },
        ]
      : [],
    createdAt: m.createdAt.toISOString(),
    readAt: m.isRead ? m.createdAt.toISOString() : null,
  };
}
