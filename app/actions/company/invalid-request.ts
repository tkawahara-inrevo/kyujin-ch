"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitInvalidRequest(
  applicationId: string,
  reason: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) throw new Error("企業情報が見つかりません");

  // Verify the application belongs to this company
  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId: company.id } },
  });
  if (!application) throw new Error("応募が見つかりません");

  // Check for existing pending request
  const existing = await prisma.invalidRequest.findFirst({
    where: { applicationId, status: "PENDING" },
  });
  if (existing) throw new Error("既に無効申請が提出されています");

  // Deadline is 14 days from now
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 14);

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
