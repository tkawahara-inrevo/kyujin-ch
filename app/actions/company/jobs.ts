"use server";

import { auth } from "@/auth";
import { OTHER_CATEGORY_VALUE } from "@/lib/job-options";
import { ALL_PREFECTURES, PREFECTURES_BY_AREA } from "@/lib/job-locations";
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

export async function toggleJobPublish(jobId: string, isPublished: boolean) {
  const companyId = await getCompanyId();
  await prisma.job.update({
    where: { id: jobId, companyId },
    data: { isPublished },
  });
  revalidatePath("/company/jobs");
}

type JobData = {
  title: string;
  description: string;
  employmentType: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  categoryTag?: string;
  tags?: string[];
  isPublished: boolean;
  imageUrl?: string;
  requirements?: string;
  desiredAptitude?: string;
  recommendedFor?: string;
  monthlySalary?: string;
  annualSalary?: string;
  access?: string;
  officeName?: string;
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

function toJobPrismaData(data: JobData) {
  const normalizedLocation = validateLocation(data);

  return {
    title: data.title,
    description: data.description,
    employmentType: data.employmentType as any,
    location: normalizedLocation.location,
    salaryMin: data.salaryMin || null,
    salaryMax: data.salaryMax || null,
    categoryTag: data.categoryTag || null,
    tags: data.tags || [],
    isPublished: data.isPublished,
    imageUrl: data.imageUrl || null,
    requirements: data.requirements || null,
    desiredAptitude: data.desiredAptitude || null,
    recommendedFor: data.recommendedFor || null,
    monthlySalary: data.monthlySalary || null,
    annualSalary: data.annualSalary || null,
    access: data.access || null,
    officeName: data.officeName || null,
    officeDetail: normalizeOfficeDetail(normalizedLocation.location ?? undefined, data.officeDetail),
    benefits: data.benefits || [],
    selectionProcess: data.selectionProcess || null,
    workingHours: data.workingHours || null,
    closingDate: data.closingDate ? new Date(data.closingDate) : null,
    employmentPeriodType: data.employmentPeriodType || null,
    region: normalizedLocation.region,
    categoryTagDetail: data.categoryTag === OTHER_CATEGORY_VALUE ? (data.categoryTagDetail || null) : null,
    employmentTypeDetail: data.employmentType === "OTHER" ? (data.employmentTypeDetail || null) : null,
    targetType: data.targetType || "MID_CAREER",
    graduationYear: data.targetType === "NEW_GRAD" && data.graduationYear ? data.graduationYear : null,
  };
}

export async function createJob(data: JobData) {
  const companyId = await getCompanyId();
  await prisma.job.create({
    data: { companyId, ...toJobPrismaData(data) },
  });
  revalidatePath("/company/jobs");
}

export async function updateJob(jobId: string, data: JobData) {
  const companyId = await getCompanyId();
  await prisma.job.update({
    where: { id: jobId, companyId },
    data: toJobPrismaData(data),
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
