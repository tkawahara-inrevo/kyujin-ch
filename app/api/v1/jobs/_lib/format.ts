/**
 * Job -> モバイルAPI レスポンス変換
 */
import type { Job, Company } from "@prisma/client";

type JobWithCompany = Job & { company: Pick<Company, "id" | "name" | "description" | "websiteUrl"> };

export function toJobSummary(job: JobWithCompany, opts: { favoriteJobIds?: Set<string> } = {}) {
  return {
    id: job.id,
    title: job.title,
    companyName: job.company.name,
    location: job.location,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryType: job.salaryType,
    employmentType: job.employmentType,
    targetType: job.targetType,
    imageUrl: job.imageUrl,
    tags: job.tags,
    publishedAt: job.reviewStatusChangedAt?.toISOString() ?? job.createdAt.toISOString(),
    isFavorite: opts.favoriteJobIds?.has(job.id) ?? false,
  };
}

export function toJobDetail(
  job: JobWithCompany,
  opts: { favoriteJobIds?: Set<string>; hasApplied?: boolean } = {},
) {
  return {
    ...toJobSummary(job, opts),
    description: job.description,
    requirements: job.requirements,
    desiredAptitude: job.desiredAptitude,
    recommendedFor: job.recommendedFor,
    access: job.access,
    officeName: job.officeName,
    officeDetail: job.officeDetail,
    workingHours: job.workingHours,
    workingHoursType: job.workingHoursType,
    workingHoursDetail: job.workingHoursDetail,
    benefits: job.benefits,
    benefitNote: job.benefitNote,
    selectionProcess: job.selectionProcess,
    trialPeriod: job.trialPeriod,
    hasFixedOvertime: job.hasFixedOvertime,
    overtimeTreatment: job.overtimeTreatment,
    fixedOvertime: job.fixedOvertime,
    smokingPolicyIndoor: job.smokingPolicyIndoor,
    smokingPolicyOutdoor: job.smokingPolicyOutdoor,
    smokingNote: job.smokingNote,
    company: {
      id: job.company.id,
      name: job.company.name,
      description: job.company.description,
      websiteUrl: job.company.websiteUrl,
    },
    hasApplied: opts.hasApplied ?? false,
  };
}
