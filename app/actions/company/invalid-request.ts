"use server";

import { auth } from "@/auth";
import { getInvalidRequestDeadline } from "@/lib/invalid-request-deadline";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitInvalidRequest(applicationId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) {
    throw new Error("企業情報が見つかりません");
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId: company.id } },
  });
  if (!application) {
    throw new Error("対象の応募が見つかりません");
  }

  const existing = await prisma.invalidRequest.findFirst({
    where: { applicationId, status: "PENDING" },
  });
  if (existing) {
    throw new Error("すでに無効申請が提出されています");
  }

  const deadline = getInvalidRequestDeadline(application.createdAt);
  if (new Date().getTime() > deadline.getTime()) {
    throw new Error("無効申請の期限を過ぎています");
  }

  await prisma.invalidRequest.create({
    data: {
      applicationId,
      companyId: company.id,
      reason,
      deadline,
    },
  });

  revalidatePath("/company/billing");
}
