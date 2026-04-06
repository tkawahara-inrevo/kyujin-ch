import type { Prisma } from "@prisma/client";

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

export type WorkingHoursDetail = {
  // 固定時間制: 想定勤務時間
  scheduledStartHour: number | null;
  scheduledStartMin: number | null;
  scheduledEndHour: number | null;
  scheduledEndMin: number | null;
  // 固定時間制 + シフト制: 実働時間 / 裁量労働制: みなし労働時間
  maxWorkHour: number | null;
  maxWorkMin: number | null;
  separateContract: boolean;
  // フレックスタイム制: コアタイム
  hasCoretime: boolean | null;
  coretimeStartHour: number | null;
  coretimeStartMin: number | null;
  coretimeEndHour: number | null;
  coretimeEndMin: number | null;
  // フレックスタイム制: 標準労働時間
  standardWorkPeriod: string | null;
  standardWorkHour: number | null;
  standardWorkMin: number | null;
  // 裁量労働制: 制度
  discretionaryType: string | null;
  // 変形労働制: 平均労働時間
  variablePeriod: string | null;
  variableWorkHour: number | null;
  variableWorkMin: number | null;
  // 備考（全タイプ共通）
  note: string;
};

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
  annualPaymentMethod: string | null;
  annualPaymentNote: string | null;
  access: string | null;
  officeName: string | null;
  officeDetail: string | null;
  postalCode: string | null;
  benefits: string[];
  benefitNote: string | null;
  selectionProcess: string | null;
  workingHours: string | null;
  closingDate: string | null;
  employmentPeriodType: string | null;
  region: string | null;
  categoryTagDetail: string | null;
  employmentTypeDetail: string | null;
  targetType: string;
  graduationYear: number | null;
  trainingInfo: string | null;
  youthEmploymentStats: YouthYearStats[] | null;
  smokingPolicyIndoor: string | null;
  smokingPolicyOutdoor: string | null;
  smokingNote: string | null;
  recruitmentBackground: string | null;
  positionMission: string | null;
  holidayPolicy: string | null;
  holidayNote: string | null;
  bonus: string | null;
  bonusNote: string | null;
  salaryNote: string | null;
  experienceType: string | null;
  experienceYears: number | null;
  trialPeriod: string | null;
  fixedOvertime: string | null;
  salaryRevision: string | null;
  interviewCount: string | null;
  selectionDuration: string | null;
  joinTiming: string | null;
  salaryType: string | null;
  hasFixedOvertime: boolean | null;
  trialPeriodExists: boolean | null;
  trialPeriodMonths: number | null;
  trialPeriodWeeks: number | null;
  trialPeriodDays: number | null;
  trialEmploymentSame: boolean | null;
  trialEmploymentType: string | null;
  trialWorkingHours: number | null;
  trialSalarySame: boolean | null;
  holidayType: string | null;
  holidayFeatures: string[];
  annualHolidayCount: number | null;
  trialSalaryType: string | null;
  trialSalaryMin: number | null;
  trialSalaryMax: number | null;
  trialAnnualSalary: string | null;
  workingHoursType: string | null;
  workingHoursDetail: WorkingHoursDetail | null;
  jobSubcategory: string | null;
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
    annualPaymentMethod: asString(record.annualPaymentMethod),
    annualPaymentNote: asString(record.annualPaymentNote),
    access: asString(record.access),
    officeName: asString(record.officeName),
    officeDetail: asString(record.officeDetail),
    postalCode: asString(record.postalCode),
    benefits: asStringArray(record.benefits),
    benefitNote: asString(record.benefitNote),
    selectionProcess: asString(record.selectionProcess),
    workingHours: asString(record.workingHours),
    closingDate: asString(record.closingDate),
    employmentPeriodType: asString(record.employmentPeriodType),
    region: asString(record.region),
    categoryTagDetail: asString(record.categoryTagDetail),
    employmentTypeDetail: asString(record.employmentTypeDetail),
    targetType: asString(record.targetType) ?? "MID_CAREER",
    graduationYear: asNumber(record.graduationYear),
    trainingInfo: asString(record.trainingInfo),
    youthEmploymentStats: Array.isArray(record.youthEmploymentStats) ? record.youthEmploymentStats as YouthYearStats[] : null,
    smokingPolicyIndoor: asString(record.smokingPolicyIndoor),
    smokingPolicyOutdoor: asString(record.smokingPolicyOutdoor),
    smokingNote: asString(record.smokingNote),
    recruitmentBackground: asString(record.recruitmentBackground),
    positionMission: asString(record.positionMission),
    holidayPolicy: asString(record.holidayPolicy),
    holidayNote: asString(record.holidayNote),
    bonus: asString(record.bonus),
    bonusNote: asString(record.bonusNote),
    salaryNote: asString(record.salaryNote),
    experienceType: asString(record.experienceType),
    experienceYears: asNumber(record.experienceYears),
    trialPeriod: asString(record.trialPeriod),
    fixedOvertime: asString(record.fixedOvertime),
    salaryRevision: asString(record.salaryRevision),
    interviewCount: asString(record.interviewCount),
    selectionDuration: asString(record.selectionDuration),
    joinTiming: asString(record.joinTiming),
    salaryType: asString(record.salaryType),
    hasFixedOvertime: typeof record.hasFixedOvertime === "boolean" ? record.hasFixedOvertime : null,
    trialPeriodExists: typeof record.trialPeriodExists === "boolean" ? record.trialPeriodExists : null,
    trialPeriodMonths: asNumber(record.trialPeriodMonths),
    trialPeriodWeeks: asNumber(record.trialPeriodWeeks),
    trialPeriodDays: asNumber(record.trialPeriodDays),
    trialEmploymentSame: typeof record.trialEmploymentSame === "boolean" ? record.trialEmploymentSame : null,
    trialEmploymentType: asString(record.trialEmploymentType),
    trialWorkingHours: asNumber(record.trialWorkingHours),
    trialSalarySame: typeof record.trialSalarySame === "boolean" ? record.trialSalarySame : null,
    holidayType: asString(record.holidayType),
    holidayFeatures: asStringArray(record.holidayFeatures),
    annualHolidayCount: asNumber(record.annualHolidayCount),
    trialSalaryType: asString(record.trialSalaryType),
    trialSalaryMin: asNumber(record.trialSalaryMin),
    trialSalaryMax: asNumber(record.trialSalaryMax),
    trialAnnualSalary: asString(record.trialAnnualSalary),
    workingHoursType: asString(record.workingHoursType),
    jobSubcategory: asString(record.jobSubcategory),
    workingHoursDetail: (() => {
      const d = record.workingHoursDetail;
      if (!d || typeof d !== "object" || Array.isArray(d)) return null;
      const r = d as Record<string, unknown>;
      return {
        scheduledStartHour: asNumber(r.scheduledStartHour),
        scheduledStartMin: asNumber(r.scheduledStartMin),
        scheduledEndHour: asNumber(r.scheduledEndHour),
        scheduledEndMin: asNumber(r.scheduledEndMin),
        maxWorkHour: asNumber(r.maxWorkHour),
        maxWorkMin: asNumber(r.maxWorkMin),
        separateContract: typeof r.separateContract === "boolean" ? r.separateContract : false,
        hasCoretime: typeof r.hasCoretime === "boolean" ? r.hasCoretime : null,
        coretimeStartHour: asNumber(r.coretimeStartHour),
        coretimeStartMin: asNumber(r.coretimeStartMin),
        coretimeEndHour: asNumber(r.coretimeEndHour),
        coretimeEndMin: asNumber(r.coretimeEndMin),
        standardWorkPeriod: asString(r.standardWorkPeriod),
        standardWorkHour: asNumber(r.standardWorkHour),
        standardWorkMin: asNumber(r.standardWorkMin),
        discretionaryType: asString(r.discretionaryType),
        variablePeriod: asString(r.variablePeriod),
        variableWorkHour: asNumber(r.variableWorkHour),
        variableWorkMin: asNumber(r.variableWorkMin),
        note: asString(r.note) ?? "",
      } satisfies WorkingHoursDetail;
    })(),
  };
}
