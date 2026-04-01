"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export type SimilarJob = {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  categoryTag: string | null;
  tags: string[];
  createdAt: string;
  imageSrc: string;
};

const cardImages = [
  "/assets/Online.png",
  "/assets/Talk_01.png",
  "/assets/Resume.png",
];

// 無料期間（JST）: 2026/04/06 00:00:00 〜 2026/07/06 23:59:59.999
const FREE_CAMPAIGN_START_UTC = Date.UTC(2026, 3, 5, 15, 0, 0, 0);
const FREE_CAMPAIGN_END_UTC = Date.UTC(2026, 6, 6, 14, 59, 59, 999);

function isFreeCampaignPeriod(now: Date) {
  const ts = now.getTime();
  return ts >= FREE_CAMPAIGN_START_UTC && ts <= FREE_CAMPAIGN_END_UTC;
}

async function resolveChargeAmount(categoryTag: string | null, now: Date) {
  if (isFreeCampaignPeriod(now)) {
    return 0;
  }

  let chargeAmount = 11000;
  if (categoryTag) {
    const priceEntry = await prisma.priceEntry.findFirst({
      where: { subcategory: categoryTag },
    });
    if (priceEntry) {
      chargeAmount = priceEntry.experiencedPrice;
    }
  }

  return chargeAmount;
}

export async function submitApplication(jobId: string, motivation: string) {
  const user = await getCurrentUser();

  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId: user.id, jobId } },
  });

  if (existing) {
    redirect("/applications");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, categoryTag: true, employmentType: true, location: true },
  });
  if (!job) throw new Error("求人が見つかりません");

  const now = new Date();
  const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const chargeAmount = await resolveChargeAmount(job.categoryTag, now);

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

  // ユーザーが既に応募済みの求人IDを取得
  const appliedJobIds = (
    await prisma.application.findMany({
      where: { userId: user.id },
      select: { jobId: true },
    })
  ).map((a) => a.jobId);

  // 同じ職種カテゴリで類似求人を3件取得（応募済み除外）
  const similarJobs = await prisma.job.findMany({
    where: {
      isPublished: true,
      isDeleted: false,
      id: { notIn: appliedJobIds },
      ...(job.categoryTag && { categoryTag: job.categoryTag }),
    },
    include: { company: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    similarJobs: similarJobs.map((j, i) => ({
      id: j.id,
      title: j.title,
      companyName: j.company.name,
      location: j.location,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      description: j.description,
      categoryTag: j.categoryTag,
      tags: j.tags,
      createdAt: j.createdAt.toISOString(),
      imageSrc: cardImages[i % cardImages.length],
    })),
  };
}

export async function submitBulkApplications(jobIds: string[]) {
  const user = await getCurrentUser();

  for (const jobId of jobIds) {
    const existing = await prisma.application.findUnique({
      where: { userId_jobId: { userId: user.id, jobId } },
    });
    if (existing) continue;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, categoryTag: true },
    });
    if (!job) continue;

    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const chargeAmount = await resolveChargeAmount(job.categoryTag, now);

    await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: { userId: user.id, jobId, motivation: "" },
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
  }

  redirect("/applications");
}
