"use server";

import { EmploymentType, Prisma } from "@prisma/client";
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
            employmentType: pendingContent.employmentType as EmploymentType,
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
            postalCode: pendingContent.postalCode,
            benefits: pendingContent.benefits,
            benefitNote: pendingContent.benefitNote,
            selectionProcess: pendingContent.selectionProcess,
            workingHours: pendingContent.workingHours,
            closingDate: pendingContent.closingDate ? new Date(pendingContent.closingDate) : null,
            employmentPeriodType: pendingContent.employmentPeriodType,
            region: pendingContent.region,
            categoryTagDetail: pendingContent.categoryTagDetail,
            employmentTypeDetail: pendingContent.employmentTypeDetail,
            targetType: pendingContent.targetType,
            graduationYear: pendingContent.graduationYear,
            trainingInfo: pendingContent.trainingInfo,
            youthEmploymentStats: pendingContent.youthEmploymentStats ? pendingContent.youthEmploymentStats as unknown as Prisma.InputJsonValue : Prisma.DbNull,
            smokingPolicyIndoor: pendingContent.smokingPolicyIndoor,
            smokingPolicyOutdoor: pendingContent.smokingPolicyOutdoor,
            smokingNote: pendingContent.smokingNote,
            recruitmentBackground: pendingContent.recruitmentBackground,
            positionMission: pendingContent.positionMission,
            holidayPolicy: pendingContent.holidayPolicy,
            holidayNote: pendingContent.holidayNote,
            holidayType: pendingContent.holidayType,
            holidayFeatures: pendingContent.holidayFeatures,
            annualHolidayCount: pendingContent.annualHolidayCount,
            bonus: pendingContent.bonus,
            bonusNote: pendingContent.bonusNote,
            salaryNote: pendingContent.salaryNote,
            salaryType: pendingContent.salaryType,
            salaryRevision: pendingContent.salaryRevision,
            annualPaymentMethod: pendingContent.annualPaymentMethod,
            annualPaymentNote: pendingContent.annualPaymentNote,
            hasFixedOvertime: pendingContent.hasFixedOvertime,
            fixedOvertime: pendingContent.fixedOvertime,
            experienceType: pendingContent.experienceType,
            experienceYears: pendingContent.experienceYears,
            trialPeriod: pendingContent.trialPeriod,
            trialPeriodExists: pendingContent.trialPeriodExists,
            trialPeriodMonths: pendingContent.trialPeriodMonths,
            trialPeriodWeeks: pendingContent.trialPeriodWeeks,
            trialPeriodDays: pendingContent.trialPeriodDays,
            trialEmploymentSame: pendingContent.trialEmploymentSame,
            trialEmploymentType: pendingContent.trialEmploymentType,
            trialWorkingHours: pendingContent.trialWorkingHours,
            trialSalarySame: pendingContent.trialSalarySame,
            trialSalaryType: pendingContent.trialSalaryType,
            trialSalaryMin: pendingContent.trialSalaryMin,
            trialSalaryMax: pendingContent.trialSalaryMax,
            trialAnnualSalary: pendingContent.trialAnnualSalary,
            interviewCount: pendingContent.interviewCount,
            selectionDuration: pendingContent.selectionDuration,
            joinTiming: pendingContent.joinTiming,
            workingHoursType: pendingContent.workingHoursType,
            workingHoursDetail: pendingContent.workingHoursDetail ? pendingContent.workingHoursDetail as unknown as Prisma.InputJsonValue : Prisma.DbNull,
            jobSubcategory: pendingContent.jobSubcategory,
            pendingContent: Prisma.DbNull,
          }
        : {}),
      reviewStatus: "PUBLISHED",
      isPublished: true,
      reviewComment: null,
      reviewStatusChangedAt: new Date(),
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
      reviewStatusChangedAt: new Date(),
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/company/jobs");
  revalidatePath("/company/dashboard");
  revalidatePath("/");
  revalidatePath("/jobs");
}
