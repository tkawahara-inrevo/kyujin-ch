"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function submitApplication(jobId: string, motivation: string) {
  const user = await getCurrentUser();

  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId: user.id, jobId } },
  });

  if (existing) {
    redirect("/applications");
  }

  // Get job with category info for pricing
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, categoryTag: true },
  });
  if (!job) throw new Error("求人が見つかりません");

  const now = new Date();
  const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Look up price from PriceEntry based on job's categoryTag
  let chargeAmount = 11000; // default
  if (job.categoryTag) {
    const priceEntry = await prisma.priceEntry.findFirst({
      where: { subcategory: job.categoryTag },
    });
    if (priceEntry) {
      chargeAmount = priceEntry.experiencedPrice;
    }
  }

  // Create application + conversation + charge in a transaction
  await prisma.$transaction(async (tx) => {
    const application = await tx.application.create({
      data: { userId: user.id, jobId, motivation },
    });

    await tx.conversation.create({
      data: { applicationId: application.id },
    });

    await tx.charge.create({
      data: {
        applicationId: application.id,
        amount: chargeAmount,
        billingMonth,
      },
    });
  });

  redirect("/applications");
}
