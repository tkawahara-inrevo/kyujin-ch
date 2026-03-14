"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatus(applicationId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") throw new Error("Unauthorized");

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) throw new Error("Company not found");

  // Verify the application belongs to this company
  const app = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId: company.id } },
  });
  if (!app) throw new Error("Application not found");

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status as any },
  });

  revalidatePath(`/company/applicants/${applicationId}`);
  revalidatePath("/company/applicants");
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

  revalidatePath(`/company/applicants/${applicationId}`);
}
