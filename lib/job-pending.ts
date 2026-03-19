import type { Prisma } from "@prisma/client";

export type JobPendingContent = {
  title: string;
  description: string;
  employmentType: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  categoryTag: string | null;
  tags: string[];
  imageUrl: string | null;
  requirements: string | null;
  desiredAptitude: string | null;
  recommendedFor: string | null;
  monthlySalary: string | null;
  annualSalary: string | null;
  access: string | null;
  officeName: string | null;
  officeDetail: string | null;
  benefits: string[];
  selectionProcess: string | null;
  workingHours: string | null;
  closingDate: string | null;
  employmentPeriodType: string | null;
  region: string | null;
  categoryTagDetail: string | null;
  employmentTypeDetail: string | null;
  targetType: string;
  graduationYear: number | null;
};

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function toPendingContentJson(content: JobPendingContent): Prisma.InputJsonObject {
  return content as unknown as Prisma.InputJsonObject;
}

export function parsePendingContent(value: Prisma.JsonValue | null | undefined): JobPendingContent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  return {
    title: asString(record.title) ?? "",
    description: asString(record.description) ?? "",
    employmentType: asString(record.employmentType) ?? "FULL_TIME",
    location: asString(record.location),
    salaryMin: asNumber(record.salaryMin),
    salaryMax: asNumber(record.salaryMax),
    categoryTag: asString(record.categoryTag),
    tags: asStringArray(record.tags),
    imageUrl: asString(record.imageUrl),
    requirements: asString(record.requirements),
    desiredAptitude: asString(record.desiredAptitude),
    recommendedFor: asString(record.recommendedFor),
    monthlySalary: asString(record.monthlySalary),
    annualSalary: asString(record.annualSalary),
    access: asString(record.access),
    officeName: asString(record.officeName),
    officeDetail: asString(record.officeDetail),
    benefits: asStringArray(record.benefits),
    selectionProcess: asString(record.selectionProcess),
    workingHours: asString(record.workingHours),
    closingDate: asString(record.closingDate),
    employmentPeriodType: asString(record.employmentPeriodType),
    region: asString(record.region),
    categoryTagDetail: asString(record.categoryTagDetail),
    employmentTypeDetail: asString(record.employmentTypeDetail),
    targetType: asString(record.targetType) ?? "MID_CAREER",
    graduationYear: asNumber(record.graduationYear),
  };
}
