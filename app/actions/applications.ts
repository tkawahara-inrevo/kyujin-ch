"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { sendTransactionalEmail } from "@/lib/email";

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

// 企業アカウント発行から3ヶ月以内は無料
function isFreeCampaignPeriod(companyCreatedAt: Date, now: Date) {
  const threeMonthsLater = new Date(companyCreatedAt);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  return now < threeMonthsLater;
}

async function resolveChargeAmount(categoryTag: string | null, companyCreatedAt: Date, now: Date) {
  if (isFreeCampaignPeriod(companyCreatedAt, now)) {
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
    select: { id: true, title: true, categoryTag: true, employmentType: true, location: true, company: { select: { createdAt: true, companyUser: { select: { email: true } } } } },
  });
  if (!job) throw new Error("求人が見つかりません");

  const now = new Date();
  const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const companyCreatedAt = job.company.createdAt;
  const chargeAmount = await resolveChargeAmount(job.categoryTag, companyCreatedAt, now);

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

  // メール通知（失敗してもフローは止めない）
  const siteUrl = process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp";
  try {
    // 求職者への応募確認メール
    if (user.notificationsEnabled) {
      await sendTransactionalEmail({
        to: user.email,
        subject: `【求人ちゃんねる】「${job.title}」に応募しました`,
        html: `<p>${user.name} 様</p><p>「${job.title}」への応募が完了しました。<br>企業からの返信をお待ちください。</p><p><a href="${siteUrl}/applications">応募一覧を確認する</a></p><p>求人ちゃんねる</p>`,
        text: `${user.name} 様\n\n「${job.title}」への応募が完了しました。\n企業からの返信をお待ちください。\n\n応募一覧: ${siteUrl}/applications\n\n求人ちゃんねる`,
      });
    }
    // 企業への応募通知メール
    const companyEmail = job.company?.companyUser?.email;
    if (companyEmail) {
      await sendTransactionalEmail({
        to: companyEmail,
        subject: `【求人ちゃんねる】「${job.title}」に新しい応募がありました`,
        html: `<p>「${job.title}」に新しい応募がありました。<br>応募者の情報を確認してください。</p><p><a href="${siteUrl}/company/applicants">応募管理を確認する</a></p><p>求人ちゃんねる</p>`,
        text: `「${job.title}」に新しい応募がありました。\n応募者の情報を確認してください。\n\n応募管理: ${siteUrl}/company/applicants\n\n求人ちゃんねる`,
      });
    }
  } catch (e) {
    console.error("応募通知メール送信エラー:", e);
  }

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
      select: { id: true, categoryTag: true, company: { select: { createdAt: true } } },
    });
    if (!job) continue;

    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const chargeAmount = await resolveChargeAmount(job.categoryTag, job.company.createdAt, now);

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
