"use server";

import { auth } from "@/auth";
import { EmploymentType, Prisma, type JobReviewStatus } from "@prisma/client";
import { parsePendingContent, toPendingContentJson, type JobPendingContent, type WorkingHoursDetail } from "@/lib/job-pending";
import { OTHER_CATEGORY_VALUE } from "@/lib/job-options";
import { ALL_PREFECTURES, PREFECTURES_BY_AREA } from "@/lib/job-locations";
import { isJobPublished } from "@/lib/job-review";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { postJobReviewSlack } from "@/lib/slack";

async function getCompany() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") throw new Error("Unauthorized");
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
    select: { id: true, name: true },
  });
  if (!company) throw new Error("Company not found");
  return company;
}

async function getCompanyId() {
  return (await getCompany()).id;
}

export type JobSubmissionMode = "draft" | "review";

type JobData = {
  title: string;
  description: string;
  employmentType: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  categoryTag?: string;
  tags?: string[];
  imageUrl?: string;
  requirements?: string;
  desiredAptitude?: string;
  recommendedFor?: string;
  monthlySalary?: string;
  annualSalary?: string;
  annualPaymentMethod?: string;
  annualPaymentNote?: string;
  access?: string;
  officeName?: string;
  officeDetail?: string;
  postalCode?: string;
  benefits?: string[];
  selectionProcess?: string;
  workingHours?: string;
  closingDate?: string;
  employmentPeriodType?: string;
  region?: string;
  categoryTagDetail?: string;
  employmentTypeDetail?: string;
  targetType?: string;
  graduationYear?: number;
  trainingInfo?: string;
  youthEmploymentStats?: YouthYearStats[];
  smokingPolicyIndoor?: string;
  smokingPolicyOutdoor?: string;
  smokingNote?: string;
  recruitmentBackground?: string;
  positionMission?: string;
  holidayPolicy?: string;
  holidayNote?: string;
  trialPeriod?: string;
  fixedOvertime?: string;
  salaryRevision?: string;
  interviewCount?: string;
  selectionDuration?: string;
  joinTiming?: string;
  salaryType?: string;
  hasFixedOvertime?: boolean;
  trialPeriodExists?: boolean;
  trialPeriodMonths?: number;
  trialPeriodWeeks?: number;
  trialPeriodDays?: number;
  trialEmploymentSame?: boolean;
  trialEmploymentType?: string;
  trialWorkingHours?: number;
  trialSalarySame?: boolean;
  holidayType?: string;
  holidayFeatures?: string[];
  annualHolidayCount?: number;
  bonus?: string;
  bonusNote?: string;
  salaryNote?: string;
  experienceType?: string;
  experienceYears?: number;
  trialSalaryType?: string;
  trialSalaryMin?: number;
  trialSalaryMax?: number;
  trialAnnualSalary?: string;
  workingHoursType?: string;
  workingHoursDetail?: WorkingHoursDetail;
  jobSubcategory?: string;
  benefitNote?: string;
};

export type YouthYearStats = {
  year: number;
  newGradHired: string;
  newGradLeft: string;
  avgAge: string;
  overtimeHours: string;
  paidLeaveAvg: string;
  parentalLeave: string;
  births: string;
};

function resolveReviewStatus(submissionMode: JobSubmissionMode): JobReviewStatus {
  return submissionMode === "review" ? "PENDING_REVIEW" : "DRAFT";
}

function normalizeOfficeDetail(location?: string, officeDetail?: string) {
  const prefecture = location?.trim() ?? "";
  const detail = officeDetail?.trim() ?? "";

  if (!detail) return null;
  if (!prefecture) return detail;
  if (detail === prefecture) return null;
  if (detail.startsWith(prefecture)) {
    return detail.slice(prefecture.length).trim() || null;
  }

  return detail;
}

function validateLocation(data: JobData) {
  const region = data.region?.trim() ?? "";
  const location = data.location?.trim() ?? "";

  if (!location) {
    return { region: region || null, location: null };
  }

  if (!ALL_PREFECTURES.includes(location)) {
    throw new Error("勤務地住所は都道府県を選択してください");
  }

  if (region && !(PREFECTURES_BY_AREA[region] ?? []).includes(location)) {
    throw new Error("勤務地エリアと都道府県の組み合わせが正しくありません");
  }

  return {
    region: region || null,
    location,
  };
}

function normalizeJobData(data: JobData): JobPendingContent {
  const normalizedLocation = validateLocation(data);

  return {
    title: data.title,
    description: data.description,
    employmentType: data.employmentType,
    location: normalizedLocation.location,
    salaryMin: data.salaryMin || null,
    salaryMax: data.salaryMax || null,
    categoryTag: data.categoryTag || null,
    tags: data.tags || [],
    imageUrl: data.imageUrl || null,
    requirements: data.requirements || null,
    desiredAptitude: data.desiredAptitude || null,
    recommendedFor: data.recommendedFor || null,
    monthlySalary: data.monthlySalary || null,
    annualSalary: data.annualSalary || null,
    annualPaymentMethod: data.annualPaymentMethod || null,
    annualPaymentNote: data.annualPaymentNote || null,
    access: data.access || null,
    officeName: data.officeName || null,
    officeDetail: normalizeOfficeDetail(normalizedLocation.location ?? undefined, data.officeDetail),
    postalCode: data.postalCode || null,
    benefits: data.benefits || [],
    benefitNote: data.benefitNote || null,
    selectionProcess: data.selectionProcess || null,
    workingHours: data.workingHours || null,
    closingDate: data.closingDate ? new Date(data.closingDate).toISOString() : null,
    employmentPeriodType: data.employmentPeriodType || null,
    region: normalizedLocation.region,
    categoryTagDetail: data.categoryTag === OTHER_CATEGORY_VALUE ? (data.categoryTagDetail || null) : null,
    employmentTypeDetail: data.employmentType === "OTHER" ? (data.employmentTypeDetail || null) : null,
    targetType: data.targetType || "MID_CAREER",
    graduationYear: data.targetType === "NEW_GRAD" && data.graduationYear ? data.graduationYear : null,
    trainingInfo: data.trainingInfo || null,
    youthEmploymentStats: data.youthEmploymentStats || null,
    smokingPolicyIndoor: data.smokingPolicyIndoor || null,
    smokingPolicyOutdoor: data.smokingPolicyOutdoor || null,
    smokingNote: data.smokingNote || null,
    recruitmentBackground: data.recruitmentBackground || null,
    positionMission: data.positionMission || null,
    holidayPolicy: data.holidayPolicy || null,
    holidayNote: data.holidayNote || null,
    bonus: data.bonus || null,
    bonusNote: data.bonusNote || null,
    salaryNote: data.salaryNote || null,
    experienceType: data.experienceType || null,
    experienceYears: data.experienceYears ?? null,
    trialPeriod: data.trialPeriod || null,
    fixedOvertime: data.fixedOvertime || null,
    salaryRevision: data.salaryRevision || null,
    interviewCount: data.interviewCount || null,
    selectionDuration: data.selectionDuration || null,
    joinTiming: data.joinTiming || null,
    salaryType: data.salaryType || null,
    hasFixedOvertime: data.hasFixedOvertime ?? null,
    trialPeriodExists: data.trialPeriodExists ?? null,
    trialPeriodMonths: data.trialPeriodMonths ?? null,
    trialPeriodWeeks: data.trialPeriodWeeks ?? null,
    trialPeriodDays: data.trialPeriodDays ?? null,
    trialEmploymentSame: data.trialEmploymentSame ?? null,
    trialEmploymentType: data.trialEmploymentType || null,
    trialWorkingHours: data.trialWorkingHours ?? null,
    trialSalarySame: data.trialSalarySame ?? null,
    holidayType: data.holidayType || null,
    holidayFeatures: data.holidayFeatures || [],
    annualHolidayCount: data.annualHolidayCount ?? null,
    trialSalaryType: data.trialSalaryType || null,
    trialSalaryMin: data.trialSalaryMin ?? null,
    trialSalaryMax: data.trialSalaryMax ?? null,
    trialAnnualSalary: data.trialAnnualSalary || null,
    workingHoursType: data.workingHoursType || null,
    workingHoursDetail: data.workingHoursDetail || null,
    jobSubcategory: data.jobSubcategory || null,
  };
}

function toLiveJobPrismaData(data: JobData, submissionMode: JobSubmissionMode) {
  const normalized = normalizeJobData(data);
  const reviewStatus = resolveReviewStatus(submissionMode);

  return {
    title: normalized.title,
    description: normalized.description,
    employmentType: normalized.employmentType as EmploymentType,
    location: normalized.location,
    salaryMin: normalized.salaryMin,
    salaryMax: normalized.salaryMax,
    categoryTag: normalized.categoryTag,
    tags: normalized.tags,
    isPublished: isJobPublished(reviewStatus),
    reviewStatus,
    reviewComment: submissionMode === "review" ? null : undefined,
    imageUrl: normalized.imageUrl,
    requirements: normalized.requirements,
    desiredAptitude: normalized.desiredAptitude,
    recommendedFor: normalized.recommendedFor,
    monthlySalary: normalized.monthlySalary,
    annualSalary: normalized.annualSalary,
    access: normalized.access,
    officeName: normalized.officeName,
    officeDetail: normalized.officeDetail,
    postalCode: normalized.postalCode,
    benefits: normalized.benefits,
    benefitNote: normalized.benefitNote,
    selectionProcess: normalized.selectionProcess,
    workingHours: normalized.workingHours,
    closingDate: normalized.closingDate ? new Date(normalized.closingDate) : null,
    employmentPeriodType: normalized.employmentPeriodType,
    region: normalized.region,
    categoryTagDetail: normalized.categoryTagDetail,
    employmentTypeDetail: normalized.employmentTypeDetail,
    targetType: normalized.targetType,
    graduationYear: normalized.graduationYear,
    trainingInfo: normalized.trainingInfo,
    youthEmploymentStats: normalized.youthEmploymentStats ? normalized.youthEmploymentStats as unknown as Prisma.InputJsonValue : Prisma.DbNull,
    smokingPolicyIndoor: normalized.smokingPolicyIndoor,
    smokingPolicyOutdoor: normalized.smokingPolicyOutdoor,
    smokingNote: normalized.smokingNote,
    recruitmentBackground: normalized.recruitmentBackground,
    positionMission: normalized.positionMission,
    holidayPolicy: normalized.holidayPolicy,
    holidayNote: normalized.holidayNote,
    bonus: normalized.bonus,
    bonusNote: normalized.bonusNote,
    salaryNote: normalized.salaryNote,
    experienceType: normalized.experienceType,
    experienceYears: normalized.experienceYears,
    trialPeriod: normalized.trialPeriod,
    fixedOvertime: normalized.fixedOvertime,
    salaryRevision: normalized.salaryRevision,
    interviewCount: normalized.interviewCount,
    selectionDuration: normalized.selectionDuration,
    joinTiming: normalized.joinTiming,
    salaryType: normalized.salaryType,
    hasFixedOvertime: normalized.hasFixedOvertime,
    annualPaymentMethod: normalized.annualPaymentMethod,
    annualPaymentNote: normalized.annualPaymentNote,
    trialPeriodExists: normalized.trialPeriodExists,
    trialPeriodMonths: normalized.trialPeriodMonths,
    trialPeriodWeeks: normalized.trialPeriodWeeks,
    trialPeriodDays: normalized.trialPeriodDays,
    trialEmploymentSame: normalized.trialEmploymentSame,
    trialEmploymentType: normalized.trialEmploymentType,
    trialWorkingHours: normalized.trialWorkingHours,
    trialSalarySame: normalized.trialSalarySame,
    holidayType: normalized.holidayType,
    holidayFeatures: normalized.holidayFeatures,
    annualHolidayCount: normalized.annualHolidayCount,
    trialSalaryType: normalized.trialSalaryType,
    trialSalaryMin: normalized.trialSalaryMin,
    trialSalaryMax: normalized.trialSalaryMax,
    trialAnnualSalary: normalized.trialAnnualSalary,
    workingHoursType: normalized.workingHoursType,
    workingHoursDetail: normalized.workingHoursDetail ? normalized.workingHoursDetail as unknown as Prisma.InputJsonValue : Prisma.DbNull,
    jobSubcategory: normalized.jobSubcategory,
    pendingContent: Prisma.DbNull,
  };
}

export async function createJob(data: JobData, submissionMode: JobSubmissionMode): Promise<string> {
  const company = await getCompany();
  const job = await prisma.job.create({
    data: { companyId: company.id, ...toLiveJobPrismaData(data, submissionMode) },
  });
  revalidatePath("/company/jobs");
  revalidatePath("/admin/jobs");

  if (submissionMode === "review") {
    await postJobReviewSlack(
      `📋 *審査申請が届きました*\n企業: ${company.name}\n求人: ${data.title}\nhttps://kyujin-ch.com/admin/jobs/${job.id}`
    );
  }

  return job.id;
}

export async function updateJob(
  jobId: string,
  data: JobData,
  submissionMode: JobSubmissionMode,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const company = await getCompany();
    const companyId = company.id;
    const job = await prisma.job.findFirst({
      where: { id: jobId, companyId, isDeleted: false },
      select: {
        id: true,
        reviewStatus: true,
        isPublished: true,
        pendingContent: true,
        reviewComment: true,
      },
    });
    if (!job) return { ok: false, error: "求人が見つかりません" };

    const normalized = normalizeJobData(data);
    const hasPendingVersion = !!parsePendingContent(job.pendingContent);
    const hasPublishedVersion = job.isPublished || job.reviewStatus === "PUBLISHED" || hasPendingVersion;

    if (hasPublishedVersion) {
      await prisma.job.update({
        where: { id: jobId, companyId },
        data: {
          pendingContent: toPendingContentJson(normalized),
          reviewStatus: submissionMode === "review" ? "PENDING_REVIEW" : job.reviewStatus,
          reviewComment: submissionMode === "review" ? null : job.reviewComment,
          isPublished: true,
        },
      });
    } else {
      await prisma.job.update({
        where: { id: jobId, companyId },
        data: toLiveJobPrismaData(data, submissionMode),
      });
    }

    revalidatePath("/company/jobs");
    revalidatePath(`/company/jobs/${jobId}/edit`);
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${jobId}`);
    revalidatePath("/");
    revalidatePath("/jobs");

    if (submissionMode === "review") {
      await postJobReviewSlack(
        `📋 *審査申請が届きました*\n企業: ${company.name}\n求人: ${data.title}\nhttps://kyujin-ch.com/admin/jobs/${jobId}`
      );
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラーが発生しました";
    console.error("[updateJob]", err);
    return { ok: false, error: message };
  }
}

export async function duplicateJob(jobId: string): Promise<string> {
  const companyId = await getCompanyId();
  const original = await prisma.job.findFirst({
    where: { id: jobId, companyId, isDeleted: false },
  });
  if (!original) throw new Error("Job not found");

  const { id, createdAt, updatedAt, viewCount, reviewComment, pendingContent, youthEmploymentStats, workingHoursDetail, ...rest } = original;
  const newJob = await prisma.job.create({
    data: {
      ...rest,
      title: `${original.title}（コピー）`,
      reviewStatus: "DRAFT",
      isPublished: false,
      pendingContent: Prisma.DbNull,
      reviewComment: null,
      viewCount: 0,
      youthEmploymentStats: youthEmploymentStats ?? Prisma.DbNull,
      workingHoursDetail: workingHoursDetail ?? Prisma.DbNull,
    },
  });

  revalidatePath("/company/jobs");
  return newJob.id;
}

export async function withdrawJobSubmission(jobId: string) {
  const companyId = await getCompanyId();
  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId, isDeleted: false },
    select: {
      id: true,
      reviewStatus: true,
      pendingContent: true,
      isPublished: true,
    },
  });

  if (!job) throw new Error("Job not found");
  if (job.reviewStatus !== "PENDING_REVIEW") throw new Error("Only pending jobs can be withdrawn");

  const hasPendingVersion = !!parsePendingContent(job.pendingContent);

  await prisma.job.update({
    where: { id: jobId, companyId },
    data: hasPendingVersion
      ? {
          reviewStatus: "PUBLISHED",
          reviewComment: null,
          isPublished: true,
          pendingContent: Prisma.DbNull,
        }
      : {
          reviewStatus: "DRAFT",
          reviewComment: null,
          isPublished: false,
        },
  });

  revalidatePath("/company/jobs");
  revalidatePath(`/company/jobs/${jobId}/edit`);
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/");
  revalidatePath("/jobs");
}

export async function toggleJobVisibility(jobId: string) {
  const companyId = await getCompanyId();
  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId, isDeleted: false },
    select: {
      id: true,
      isPublished: true,
      reviewStatus: true,
      pendingContent: true,
    },
  });

  if (!job) throw new Error("Job not found");

  const hasPendingVersion = !!parsePendingContent(job.pendingContent);
  const hasPublishedVersion = job.isPublished || job.reviewStatus === "PUBLISHED" || hasPendingVersion;

  if (job.reviewStatus === "PENDING_REVIEW" && !hasPublishedVersion) {
    throw new Error("審査中の新規求人は公開状態を変更できません");
  }

  await prisma.job.update({
    where: { id: jobId, companyId },
    data: {
      isPublished: !job.isPublished,
    },
  });

  revalidatePath("/company/jobs");
  revalidatePath(`/company/jobs/${jobId}/edit`);
  revalidatePath("/company/dashboard");
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/");
  revalidatePath("/jobs");
}

export async function updateJobNote(jobId: string, note: string) {
  const companyId = await getCompanyId();
  await prisma.job.update({
    where: { id: jobId, companyId },
    data: { note: note.trim() || null },
  });
  revalidatePath("/company/jobs");
}

export async function deleteJob(jobId: string) {
  const companyId = await getCompanyId();
  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId },
    include: { _count: { select: { applications: true } } },
  });
  if (!job) throw new Error("Job not found");

  if (job._count.applications > 0) {
    await prisma.job.update({ where: { id: jobId }, data: { isDeleted: true } });
  } else {
    await prisma.job.delete({ where: { id: jobId } });
  }
  revalidatePath("/company/jobs");
}
