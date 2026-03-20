"use server";

import { auth } from "@/auth";
import { Prisma, type JobReviewStatus } from "@prisma/client";
import { parsePendingContent, toPendingContentJson, type JobPendingContent } from "@/lib/job-pending";
import { OTHER_CATEGORY_VALUE } from "@/lib/job-options";
import { ALL_PREFECTURES, PREFECTURES_BY_AREA } from "@/lib/job-locations";
import { isJobPublished } from "@/lib/job-review";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getCompanyId() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") throw new Error("Unauthorized");
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) throw new Error("Company not found");
  return company.id;
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
  access?: string;
  officeDetail?: string;
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
    access: data.access || null,
    officeName: null,
    officeDetail: normalizeOfficeDetail(normalizedLocation.location ?? undefined, data.officeDetail),
    benefits: data.benefits || [],
    selectionProcess: data.selectionProcess || null,
    workingHours: data.workingHours || null,
    closingDate: data.closingDate ? new Date(data.closingDate).toISOString() : null,
    employmentPeriodType: data.employmentPeriodType || null,
    region: normalizedLocation.region,
    categoryTagDetail: data.categoryTag === OTHER_CATEGORY_VALUE ? (data.categoryTagDetail || null) : null,
    employmentTypeDetail: data.employmentType === "OTHER" ? (data.employmentTypeDetail || null) : null,
    targetType: data.targetType || "MID_CAREER",
    graduationYear: data.targetType === "NEW_GRAD" && data.graduationYear ? data.graduationYear : null,
  };
}

function toLiveJobPrismaData(data: JobData, submissionMode: JobSubmissionMode) {
  const normalized = normalizeJobData(data);
  const reviewStatus = resolveReviewStatus(submissionMode);

  return {
    title: normalized.title,
    description: normalized.description,
    employmentType: normalized.employmentType as any,
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
    benefits: normalized.benefits,
    selectionProcess: normalized.selectionProcess,
    workingHours: normalized.workingHours,
    closingDate: normalized.closingDate ? new Date(normalized.closingDate) : null,
    employmentPeriodType: normalized.employmentPeriodType,
    region: normalized.region,
    categoryTagDetail: normalized.categoryTagDetail,
    employmentTypeDetail: normalized.employmentTypeDetail,
    targetType: normalized.targetType,
    graduationYear: normalized.graduationYear,
    pendingContent: Prisma.DbNull,
  };
}

export async function createJob(data: JobData, submissionMode: JobSubmissionMode) {
  const companyId = await getCompanyId();
  await prisma.job.create({
    data: { companyId, ...toLiveJobPrismaData(data, submissionMode) },
  });
  revalidatePath("/company/jobs");
  revalidatePath("/admin/jobs");
}

export async function updateJob(jobId: string, data: JobData, submissionMode: JobSubmissionMode) {
  const companyId = await getCompanyId();
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
  if (!job) throw new Error("Job not found");

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
