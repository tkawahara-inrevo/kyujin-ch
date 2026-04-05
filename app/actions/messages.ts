"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { sendTransactionalEmail } from "@/lib/email";

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

  // 企業へのメッセージ通知メール
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        application: {
          include: {
            job: { include: { company: { include: { companyUser: { select: { email: true } } } } } },
          },
        },
      },
    });
    const companyEmail = conversation?.application.job.company?.companyUser?.email;
    if (companyEmail) {
      const siteUrl = process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp";
      await sendTransactionalEmail({
        to: companyEmail,
        subject: "【求人ちゃんねる】応募者からメッセージが届きました",
        html: `<p>応募者からメッセージが届きました。<br>メッセージを確認してください。</p><p><a href="${siteUrl}/company/applicants/${conversation.application.id}">メッセージを確認する</a></p><p>求人ちゃんねる</p>`,
        text: `応募者からメッセージが届きました。\n\nメッセージ確認: ${siteUrl}/company/applicants/${conversation.application.id}\n\n求人ちゃんねる`,
      });
    }
  } catch (e) {
    console.error("メッセージ通知メール送信エラー:", e);
  }

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
}
