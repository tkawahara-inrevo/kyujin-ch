import { EmploymentType, Prisma } from "@prisma/client";
import { CATEGORY_OPTIONS, EMPLOYMENT_OPTIONS } from "@/lib/job-options";
import { PREFECTURES_BY_AREA } from "@/lib/job-locations";

const EMPLOYMENT_TYPE_VALUES = new Set(
  EMPLOYMENT_OPTIONS.map((option) => option.value),
);

const CATEGORY_VALUES = new Set(CATEGORY_OPTIONS);

export type JobSearchInput = {
  q?: string;
  category?: string;
  employmentType?: string;
  location?: string;
  target?: string;
  experience?: string;
  salary?: string;
};

export function normalizeTextParam(value?: string): string {
  return value?.trim() ?? "";
}

export function normalizeCategoryParam(value?: string): string {
  const category = normalizeTextParam(value);
  return CATEGORY_VALUES.has(category as (typeof CATEGORY_OPTIONS)[number])
    ? category
    : "";
}

export function normalizeEmploymentTypeParam(value?: string): EmploymentType | "" {
  const employmentType = normalizeTextParam(value);
  return EMPLOYMENT_TYPE_VALUES.has(
    employmentType as (typeof EMPLOYMENT_OPTIONS)[number]["value"],
  )
    ? (employmentType as EmploymentType)
    : "";
}

export function buildTargetFilter(target?: string): Prisma.JobWhereInput {
  const normalizedTarget = normalizeTextParam(target);

  if (!normalizedTarget || normalizedTarget === "all") {
    return {};
  }

  if (normalizedTarget === "mid") {
    return { targetType: "MID_CAREER" };
  }

  const year = Number(normalizedTarget);
  if (Number.isFinite(year)) {
    return { targetType: "NEW_GRAD", graduationYear: year };
  }

  return {};
}

function buildSalaryFilter(salary?: string): Prisma.JobWhereInput | null {
  switch (salary) {
    case "to300":
      return {
        OR: [
          { salaryMax: { lte: 300 } },
          { salaryMax: null, salaryMin: { lte: 300 } },
        ],
      };
    case "301to400":
      return {
        salaryMin: { lte: 400 },
        OR: [{ salaryMax: { gte: 301 } }, { salaryMax: null }],
      };
    case "401to500":
      return {
        salaryMin: { lte: 500 },
        OR: [{ salaryMax: { gte: 401 } }, { salaryMax: null }],
      };
    case "501to600":
      return {
        salaryMin: { lte: 600 },
        OR: [{ salaryMax: { gte: 501 } }, { salaryMax: null }],
      };
    case "601plus":
      return {
        OR: [
          { salaryMax: { gte: 601 } },
          { salaryMax: null, salaryMin: { gte: 601 } },
        ],
      };
    default:
      return null;
  }
}

export function buildPublishedJobSearchWhere(
  input: JobSearchInput,
): Prisma.JobWhereInput {
  const q = normalizeTextParam(input.q);
  const category = normalizeCategoryParam(input.category);
  const employmentType = normalizeEmploymentTypeParam(input.employmentType);
  const location = normalizeTextParam(input.location);
  const experience = normalizeTextParam(input.experience);
  const salary = normalizeTextParam(input.salary);
  const areaPrefectures = location ? PREFECTURES_BY_AREA[location] ?? [] : [];
  const andConditions: Prisma.JobWhereInput[] = [];

  if (q) {
    andConditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
        { categoryTag: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    });
  }

  if (location) {
    if (areaPrefectures.length > 0) {
      andConditions.push({
        OR: areaPrefectures.map((prefecture) => ({
          location: { contains: prefecture, mode: "insensitive" },
        })),
      });
    } else {
      andConditions.push({
        location: { contains: location, mode: "insensitive" },
      });
    }
  }

  if (experience === "inexperienced") {
    andConditions.push({ experienceType: "未経験者歓迎" });
  } else if (experience === "experienced") {
    andConditions.push({ experienceType: { in: ["経験者歓迎", "経験者のみ"] } });
  }

  const salaryFilter = buildSalaryFilter(salary);
  if (salaryFilter) andConditions.push(salaryFilter);

  return {
    isPublished: true,
    reviewStatus: "PUBLISHED",
    isDeleted: false,
    ...buildTargetFilter(input.target),
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    ...(category && {
      categoryTag: { equals: category, mode: "insensitive" },
    }),
    ...(employmentType && { employmentType }),
  };
}
