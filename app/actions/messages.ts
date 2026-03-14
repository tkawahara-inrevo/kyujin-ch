"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type MessageAttachmentInput = {
  attachmentUrl: string;
  attachmentName: string;
  attachmentType?: string;
};

export async function sendMessage(
  conversationId: string,
  body: string,
  attachment?: MessageAttachmentInput,
) {
  if (!body.trim() && !attachment) return;

  const user = await getCurrentUser();

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      senderType: "USER",
      body: body.trim(),
      attachmentUrl: attachment?.attachmentUrl,
      attachmentName: attachment?.attachmentName,
      attachmentType: attachment?.attachmentType ?? null,
    },
  });

  // 既読フラグを更新（自分→自分のメッセージは即既読）
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderType: "COMPANY",
      isRead: false,
    },
    data: { isRead: true },
  });

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
}
