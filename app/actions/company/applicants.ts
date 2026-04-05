"use server";

import { auth } from "@/auth";
import type { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendTransactionalEmail } from "@/lib/email";

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") throw new Error("Unauthorized");

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) throw new Error("Company not found");

  // Verify the application belongs to this company
  const app = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId: company.id } },
    include: {
      invalidRequests: {
        where: { status: "APPROVED" },
      },
    },
  });
  if (!app) throw new Error("Application not found");
  if (app.invalidRequests.length > 0) throw new Error("Invalidated application");

  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  revalidatePath(`/company/applicants/${applicationId}`);
  revalidatePath("/company/applicants");
  revalidatePath("/company/messages");
}

type MessageAttachmentInput = {
  attachmentUrl: string;
  attachmentName: string;
  attachmentType?: string;
};

export async function sendCompanyMessage(
  applicationId: string,
  body: string,
  attachment?: MessageAttachmentInput,
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") throw new Error("Unauthorized");

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) throw new Error("Company not found");

  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId: company.id } },
    include: {
      invalidRequests: {
        where: { status: "APPROVED" },
      },
      user: { select: { email: true, name: true, notificationsEnabled: true } },
    },
  });
  if (!application) throw new Error("Application not found");
  if (application.invalidRequests.length > 0) throw new Error("Invalidated application");

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { applicationId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { applicationId },
    });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: session.user.id,
      senderType: "COMPANY",
      body,
      attachmentUrl: attachment?.attachmentUrl,
      attachmentName: attachment?.attachmentName,
      attachmentType: attachment?.attachmentType ?? null,
    },
  });

  // 求職者へのメッセージ通知メール（notificationsEnabled チェック）
  if (application.user.notificationsEnabled) {
    try {
      const siteUrl = process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp";
      await sendTransactionalEmail({
        to: application.user.email,
        subject: "【求人ちゃんねる】企業からメッセージが届きました",
        html: `<p>${application.user.name} 様</p><p>企業からメッセージが届きました。<br>確認してください。</p><p><a href="${siteUrl}/messages/${conversation.id}">メッセージを確認する</a></p><p>求人ちゃんねる</p>`,
        text: `${application.user.name} 様\n\n企業からメッセージが届きました。\n\nメッセージ確認: ${siteUrl}/messages/${conversation.id}\n\n求人ちゃんねる`,
      });
    } catch (e) {
      console.error("メッセージ通知メール送信エラー:", e);
    }
  }

  revalidatePath(`/company/applicants/${applicationId}`);
  revalidatePath("/company/messages");
}
