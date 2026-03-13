"use server";

import { auth } from "@/auth";
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
};

function toJobPrismaData(data: JobData) {
  return {
    title: data.title,
    description: data.description,
    employmentType: data.employmentType as any,
    location: data.location || null,
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
    officeDetail: data.officeDetail || null,
    benefits: data.benefits || [],
    selectionProcess: data.selectionProcess || null,
    workingHours: data.workingHours || null,
    closingDate: data.closingDate ? new Date(data.closingDate) : null,
    employmentPeriodType: data.employmentPeriodType || null,
    region: data.region || null,
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
