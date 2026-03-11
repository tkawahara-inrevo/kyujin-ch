"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function sendMessage(conversationId: string, body: string) {
  if (!body.trim()) return;

  const user = await getCurrentUser();

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      senderType: "USER",
      body: body.trim(),
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
