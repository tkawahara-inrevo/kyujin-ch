"use server";

import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-helpers";
import { parsePendingContent } from "@/lib/job-pending";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  await requireAdmin();
}

export async function approveJob(jobId: string) {
  await ensureAdmin();

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { pendingContent: true },
  });
  if (!job) throw new Error("Job not found");

  const pendingContent = parsePendingContent(job.pendingContent);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      ...(pendingContent
        ? {
            title: pendingContent.title,
            description: pendingContent.description,
            employmentType: pendingContent.employmentType as any,
            location: pendingContent.location,
            salaryMin: pendingContent.salaryMin,
            salaryMax: pendingContent.salaryMax,
            categoryTag: pendingContent.categoryTag,
            tags: pendingContent.tags,
            imageUrl: pendingContent.imageUrl,
            requirements: pendingContent.requirements,
            desiredAptitude: pendingContent.desiredAptitude,
            recommendedFor: pendingContent.recommendedFor,
            monthlySalary: pendingContent.monthlySalary,
            annualSalary: pendingContent.annualSalary,
            access: pendingContent.access,
            officeName: pendingContent.officeName,
            officeDetail: pendingContent.officeDetail,
            benefits: pendingContent.benefits,
            selectionProcess: pendingContent.selectionProcess,
            workingHours: pendingContent.workingHours,
            closingDate: pendingContent.closingDate ? new Date(pendingContent.closingDate) : null,
            employmentPeriodType: pendingContent.employmentPeriodType,
            region: pendingContent.region,
            categoryTagDetail: pendingContent.categoryTagDetail,
            employmentTypeDetail: pendingContent.employmentTypeDetail,
            targetType: pendingContent.targetType,
            graduationYear: pendingContent.graduationYear,
            pendingContent: Prisma.DbNull,
          }
        : {}),
      reviewStatus: "PUBLISHED",
      isPublished: true,
      reviewComment: null,
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/company/jobs");
  revalidatePath("/company/dashboard");
  revalidatePath("/");
  revalidatePath("/jobs");
}

export async function returnJob(jobId: string, reviewComment?: string) {
  await ensureAdmin();

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { pendingContent: true },
  });
  if (!job) throw new Error("Job not found");

  const hasPendingVersion = !!parsePendingContent(job.pendingContent);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      reviewStatus: "RETURNED",
      isPublished: hasPendingVersion,
      reviewComment: reviewComment?.trim() || "差し戻し理由を確認してください",
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/company/jobs");
  revalidatePath("/company/dashboard");
  revalidatePath("/");
  revalidatePath("/jobs");
}
