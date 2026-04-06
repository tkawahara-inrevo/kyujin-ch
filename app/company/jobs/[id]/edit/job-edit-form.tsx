"use client";

import { isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteJob, updateJob, withdrawJobSubmission, type JobSubmissionMode, type YouthYearStats } from "@/app/actions/company/jobs";
import { JobPreview, type JobPreviewData } from "@/components/job-preview";
import { ThumbnailUpload } from "@/components/thumbnail-upload";
import { SelectDown } from "@/components/select-down";
import { getActiveGraduationYears, graduationYearLabel } from "@/lib/graduation-years";
import { ALL_PREFECTURES, AREA_OPTIONS, PREFECTURES_BY_AREA } from "@/lib/job-locations";
import {
  BENEFIT_OPTIONS as SHARED_BENEFIT_OPTIONS,
  PRIMARY_BENEFIT_OPTIONS,
  CATEGORY_OPTIONS,
  EMPLOYMENT_OPTIONS,
  OTHER_CATEGORY_VALUE,
} from "@/lib/job-options";
import { JOB_REVIEW_STATUS_BADGE_CLASSES, JOB_REVIEW_STATUS_LABELS } from "@/lib/job-review";
import {
  WorkingHoursSection,
  workingHoursStateFromDetail,
  workingHoursStateToData,
  DEFAULT_WORKING_HOURS_STATE,
  type WorkingHoursState,
} from "@/app/company/jobs/_components/working-hours-section";
import type { WorkingHoursDetail } from "@/lib/job-pending";

const HOLIDAY_TAGS = ["完全週休2日制", "年間休日120日以上", "土日祝休み"] as const;
const LOCATION_TAGS = ["転勤なし"] as const;
const REQUIREMENT_TAGS = ["職種未経験OK", "業種未経験OK", "学歴不問"] as const;
const SELECTION_TAGS = ["オンライン面談可"] as const;

const TAG_OPTIONS = [
  "未経験歓迎",
  "リモート可",
  "新卒歓迎",
  "フレックス可",
  "急募",
  "資格取得支援",
  "上場企業",
  "ベンチャー",
  "副業OK",
  "産休・育休取得実績あり",
  "服装自由",
];

const CURRENT_YEARS = [new Date().getFullYear() + 1, new Date().getFullYear(), new Date().getFullYear() - 1];

const EMPTY_YOUTH_STATS = (): YouthYearStats[] =>
  CURRENT_YEARS.map((year) => ({
    year,
    newGradHired: "",
    newGradLeft: "",
    avgAge: "",
    overtimeHours: "",
    paidLeaveAvg: "",
    parentalLeave: "",
    births: "",
  }));

const SMOKING_INDOOR_OPTIONS = [
  "敷地内禁煙",
  "屋内全面禁煙",
  "喫煙室あり（分煙）",
  "喫煙可",
  "その他",
];

const SMOKING_OUTDOOR_OPTIONS = [
  "屋外喫煙所あり",
  "屋外全面禁煙",
  "その他",
];

function calcAnnualSalary(type: string, min: string, max: string): string {
  const minN = Number(min) || 0;
  const maxN = Number(max) || 0;
  if (!minN && !maxN) return "";
  let minA: number, maxA: number;
  if (type === "annual") { minA = minN; maxA = maxN; }
  else if (type === "monthly") { minA = minN * 12; maxA = maxN * 12; }
  else if (type === "daily") { minA = minN * 240; maxA = maxN * 240; }
  else { minA = minN * 8 * 240; maxA = maxN * 8 * 240; }
  const fmt = (n: number) => n >= 10000 ? `${Math.round(n / 10000)}万円` : `${n.toLocaleString()}円`;
  if (minN && maxN) return `${fmt(minA)}〜${fmt(maxA)}`;
  if (minN) return `${fmt(minA)}〜`;
  return `〜${fmt(maxA)}`;
}

function computeAnnualNum(type: string, val: string): string {
  const n = Number(val) || 0;
  if (!n) return "";
  if (type === "annual") return String(n);
  if (type === "monthly") return String(n * 12);
  if (type === "daily") return String(n * 240);
  return String(n * 8 * 240);
}

const SALARY_PLACEHOLDER: Record<string, [string, string]> = {
  annual:  ["例：3000000", "例：5000000"],
  monthly: ["例：250000",  "例：350000"],
  daily:   ["例：10000",   "例：25000"],
  hourly:  ["例：1100",    "例：1500"],
};

const DESCRIPTION_TEMPLATE = `【仕事概要】
○○（会社名、部署名、店舗名など）にて、○○（職種）のお仕事をお任せします。●●●●を商材として扱い、顧客層は主に△△△です。□□□□な価値を提供し、やりがいに繋がる仕事です。

【仕事の流れ】
＜仕事の流れ＞
▼●●●●から●●●●が割り振られます
▼●●●●を確認し、●●●●から●●●●●●をします
▼●●●●●●●●した情報をフォーマットに従って登録

※1日の担当件数は●●件程度。1件のヒアリング・作成はいずれも●●分～●●分程度です。
※業務はマニュアルに沿って行なうため、未経験の方もご安心ください。

【一緒に働くメンバー】
部署には●●名が所属しており、男女比は●：●。平均年齢層は●●～●●代です。先輩たちの前職は△△△や△△△など様々。□□□□のお仕事が初めてだったメンバーもたくさん活躍中です。

【入社後の独り立ちまでの流れ】
入社後は●●●●の習得はもちろん、●●●●●●や、●●●●など、●●●●●●の基礎から教えていきます。未経験の方もご安心ください。`;

const SELECTION_PROCESS_TEMPLATE = `書類選考 → 一次面接（オンライン可） → 最終面接 → 内定

※選考期間の目安：1〜2週間程度`;

type Job = {
  id: string;
  title: string;
  description: string;
  employmentType: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  categoryTag: string | null;
  tags: string[];
  reviewStatus: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "RETURNED";
  reviewComment?: string | null;
  imageUrl: string | null;
  requirements: string | null;
  desiredAptitude: string | null;
  recommendedFor: string | null;
  monthlySalary: string | null;
  annualSalary: string | null;
  access: string | null;
  officeName: string | null;
  officeDetail: string | null;
  postalCode?: string | null;
  benefits: string[];
  selectionProcess: string | null;
  workingHours: string | null;
  closingDate: Date | null;
  employmentPeriodType: string | null;
  region: string | null;
  targetType: string;
  graduationYear: number | null;
  categoryTagDetail?: string | null;
  employmentTypeDetail?: string | null;
  trainingInfo?: string | null;
  youthEmploymentStats?: YouthYearStats[] | null;
  smokingPolicyIndoor?: string | null;
  smokingPolicyOutdoor?: string | null;
  smokingNote?: string | null;
  recruitmentBackground?: string | null;
  positionMission?: string | null;
  holidayPolicy?: string | null;
  holidayNote?: string | null;
  trialPeriod?: string | null;
  fixedOvertime?: string | null;
  salaryRevision?: string | null;
  interviewCount?: string | null;
  selectionDuration?: string | null;
  joinTiming?: string | null;
  salaryType?: string | null;
  hasFixedOvertime?: boolean | null;
  annualPaymentMethod?: string | null;
  annualPaymentNote?: string | null;
  trialPeriodExists?: boolean | null;
  trialPeriodMonths?: number | null;
  trialPeriodWeeks?: number | null;
  holidayType?: string | null;
  holidayFeatures?: string[];
  annualHolidayCount?: number | null;
  bonus?: string | null;
  bonusNote?: string | null;
  salaryNote?: string | null;
  experienceType?: string | null;
  experienceYears?: number | null;
  trialSalaryType?: string | null;
  trialSalaryMin?: number | null;
  trialSalaryMax?: number | null;
  trialAnnualSalary?: string | null;
  trialPeriodDays?: number | null;
  trialEmploymentSame?: boolean | null;
  trialEmploymentType?: string | null;
  trialWorkingHours?: number | null;
  trialSalarySame?: boolean | null;
  workingHoursType?: string | null;
  workingHoursDetail?: WorkingHoursDetail | null;
  jobSubcategory?: string | null;
};

export function JobEditForm({
  job,
  hasPublishedVersion,
  hasPendingVersion,
  subcategoryMap,
}: {
  job: Job;
  hasPublishedVersion: boolean;
  hasPendingVersion: boolean;
  subcategoryMap: Record<string, string[]>;
}) {
  const categoryOptions = Object.keys(subcategoryMap).length > 0 ? Object.keys(subcategoryMap) : [...CATEGORY_OPTIONS];
  const router = useRouter();
  const [currentReviewStatus, setCurrentReviewStatus] = useState(job.reviewStatus);
  const benefitOptions = SHARED_BENEFIT_OPTIONS as readonly string[];
  const [pendingAction, setPendingAction] = useState<"review" | "draft" | "withdraw" | "delete" | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isWidePreview, setIsWidePreview] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const ALL_TAG_OPTIONS = [...TAG_OPTIONS, ...HOLIDAY_TAGS, ...LOCATION_TAGS, ...REQUIREMENT_TAGS, ...SELECTION_TAGS];
  const [selectedTags, setSelectedTags] = useState<string[]>(job.tags.filter((tag) => ALL_TAG_OPTIONS.includes(tag)));
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    job.benefits.filter((benefit) => benefitOptions.includes(benefit)),
  );
  const [customBenefits, setCustomBenefits] = useState(
    job.benefits.filter((benefit) => !benefitOptions.includes(benefit)).join("、"),
  );
  const gradYears = getActiveGraduationYears();
  const [targetType, setTargetType] = useState(job.targetType || "MID_CAREER");
  const [graduationYear, setGraduationYear] = useState(job.graduationYear || gradYears[0]);
  const [imageUrl, setImageUrl] = useState(job.imageUrl || "");
  const [categoryTag, setCategoryTag] = useState(job.categoryTag || "");
  const [categoryTagDetail, setCategoryTagDetail] = useState(job.categoryTagDetail || "");
  const [jobSubcategory, setJobSubcategory] = useState(job.jobSubcategory || "");
  const [employmentType, setEmploymentType] = useState(job.employmentType || "FULL_TIME");
  const [employmentTypeDetail, setEmploymentTypeDetail] = useState(job.employmentTypeDetail || "");
  const [employmentPeriodType, setEmploymentPeriodType] = useState(job.employmentPeriodType || "");
  const [selectedRegion, setSelectedRegion] = useState(job.region || "");
  const [selectedLocation, setSelectedLocation] = useState(job.location || "");
  const [titleVal, setTitleVal] = useState(job.title);
  const titleRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState(job.description);
  const [selectionProcess, setSelectionProcess] = useState(job.selectionProcess ?? "");
  const [officeDetail, setOfficeDetail] = useState(job.officeDetail ?? "");
  const [streetAddrVal, setStreetAddrVal] = useState("");
  const [postalCode, setPostalCode] = useState(job.postalCode ?? "");
  const [postalLoading, setPostalLoading] = useState(false);
  const [trainingInfo, setTrainingInfo] = useState(job.trainingInfo ?? "");
  const [youthStats, setYouthStats] = useState<YouthYearStats[]>(
    (job.youthEmploymentStats && job.youthEmploymentStats.length > 0)
      ? job.youthEmploymentStats
      : EMPTY_YOUTH_STATS()
  );
  const [smokingPolicyIndoor, setSmokingPolicyIndoor] = useState(job.smokingPolicyIndoor ?? "");
  const [smokingPolicyOutdoor, setSmokingPolicyOutdoor] = useState(job.smokingPolicyOutdoor ?? "");
  const [smokingNote, setSmokingNote] = useState(job.smokingNote ?? "");
  const [salaryType, setSalaryType] = useState(job.salaryType || "annual");
  const [salaryMinVal, setSalaryMinVal] = useState(job.salaryMin ? String(job.salaryMin) : "");
  const [salaryMaxVal, setSalaryMaxVal] = useState(job.salaryMax ? String(job.salaryMax) : "");
  const [annualSalaryMinNum, setAnnualSalaryMinNum] = useState(() => computeAnnualNum(job.salaryType || "annual", job.salaryMin ? String(job.salaryMin) : ""));
  const [annualSalaryMaxNum, setAnnualSalaryMaxNum] = useState(() => computeAnnualNum(job.salaryType || "annual", job.salaryMax ? String(job.salaryMax) : ""));
  const [annualNumManual, setAnnualNumManual] = useState(false);
  const [hasFixedOvertime, setHasFixedOvertime] = useState<boolean | null>(job.hasFixedOvertime ?? null);
  const [bonusExists, setBonusExists] = useState<boolean | null>(
    job.bonus === "あり" ? true : job.bonus === "なし" ? false : null
  );
  const [bonusNote, setBonusNote] = useState(job.bonusNote ?? "");
  const [salaryNote, setSalaryNote] = useState(job.salaryNote ?? "");
  const [experienceType, setExperienceType] = useState(job.experienceType ?? "");
  const [experienceYears, setExperienceYears] = useState(job.experienceYears != null ? String(job.experienceYears) : "");
  const [annualPaymentMethod, setAnnualPaymentMethod] = useState(job.annualPaymentMethod ?? "monthly");
  const [annualPaymentNote, setAnnualPaymentNote] = useState(job.annualPaymentNote ?? "");
  const parsedFO = (() => { try { return job.fixedOvertime ? JSON.parse(job.fixedOvertime) : null; } catch { return null; } })();
  const [fixedOvertimePayType, setFixedOvertimePayType] = useState<"fixed"|"range"|"minimum">(parsedFO?.payType ?? "fixed");
  const [fixedOvertimePayFixed, setFixedOvertimePayFixed] = useState(parsedFO?.payFixed ? String(parsedFO.payFixed) : "");
  const [fixedOvertimePayMin, setFixedOvertimePayMin] = useState(parsedFO?.payMin ? String(parsedFO.payMin) : "");
  const [fixedOvertimePayMax, setFixedOvertimePayMax] = useState(parsedFO?.payMax ? String(parsedFO.payMax) : "");
  const [fixedOvertimePayFloor, setFixedOvertimePayFloor] = useState(parsedFO?.payFloor ? String(parsedFO.payFloor) : "");
  const [fixedOvertimeHoursType, setFixedOvertimeHoursType] = useState<"fixed"|"range">(parsedFO?.hoursType ?? "fixed");
  const [fixedOvertimeHoursFixed, setFixedOvertimeHoursFixed] = useState(parsedFO?.hoursFixed ? String(parsedFO.hoursFixed) : "");
  const [fixedOvertimeHoursMin, setFixedOvertimeHoursMin] = useState(parsedFO?.hoursMin ? String(parsedFO.hoursMin) : "");
  const [fixedOvertimeHoursMax, setFixedOvertimeHoursMax] = useState(parsedFO?.hoursMax ? String(parsedFO.hoursMax) : "");
  const [overtimeExcessPaid, setOvertimeExcessPaid] = useState(parsedFO?.excessPaid ?? false);
  const [trialPeriodExists, setTrialPeriodExists] = useState<boolean | null>(job.trialPeriodExists ?? null);
  const [trialPeriodMonths, setTrialPeriodMonths] = useState(job.trialPeriodMonths ?? 3);
  const [trialPeriodDays, setTrialPeriodDays] = useState(job.trialPeriodDays ?? 0);
  const [trialEmploymentSame, setTrialEmploymentSame] = useState<boolean | null>(job.trialEmploymentSame ?? null);
  const [trialEmploymentType, setTrialEmploymentType] = useState(job.trialEmploymentType ?? "");
  const [trialWorkingHours, setTrialWorkingHours] = useState(job.trialWorkingHours ? String(job.trialWorkingHours) : "");
  const [trialSalarySame, setTrialSalarySame] = useState<boolean | null>(job.trialSalarySame ?? null);
  const [trialSalaryType, setTrialSalaryType] = useState(job.trialSalaryType || "annual");
  const [trialSalaryMinVal, setTrialSalaryMinVal] = useState(job.trialSalaryMin ? String(job.trialSalaryMin) : "");
  const [trialSalaryMaxVal, setTrialSalaryMaxVal] = useState(job.trialSalaryMax ? String(job.trialSalaryMax) : "");
  const [trialAnnualSalaryMinNum, setTrialAnnualSalaryMinNum] = useState(() => computeAnnualNum(job.trialSalaryType || "annual", job.trialSalaryMin ? String(job.trialSalaryMin) : ""));
  const [trialAnnualSalaryMaxNum, setTrialAnnualSalaryMaxNum] = useState(() => computeAnnualNum(job.trialSalaryType || "annual", job.trialSalaryMax ? String(job.trialSalaryMax) : ""));
  const [trialAnnualNumManual, setTrialAnnualNumManual] = useState(!!job.trialAnnualSalary);
  const [workingHours, setWorkingHours] = useState<WorkingHoursState>(() =>
    workingHoursStateFromDetail(job.workingHoursType, job.workingHoursDetail as WorkingHoursDetail | null ?? null)
  );
  const [holidayType, setHolidayType] = useState(job.holidayType ?? "");
  const [holidayNote, setHolidayNote] = useState(job.holidayNote ?? "");
  const [formValues, setFormValues] = useState<Record<string, string>>({
    title: job.title,
    description: job.description,
    requirements: job.requirements ?? "",
    desiredAptitude: job.desiredAptitude ?? "",
    recommendedFor: job.recommendedFor ?? "",
    officeDetail: job.officeDetail ?? "",
    access: job.access ?? "",
    selectionProcess: job.selectionProcess ?? "",
    closingDate: job.closingDate ? new Date(job.closingDate).toISOString().split("T")[0] : "",
    recruitmentBackground: job.recruitmentBackground ?? "",
    holidayPolicy: job.holidayPolicy ?? "",
    trialPeriod: job.trialPeriod ?? "",
    fixedOvertime: job.fixedOvertime ?? "",
    salaryRevision: job.salaryRevision ?? "",
    bonus: job.bonus ?? "",
  });
  const availablePrefectures = selectedRegion ? PREFECTURES_BY_AREA[selectedRegion] ?? [] : ALL_PREFECTURES;

  const parsedCustomBenefits = customBenefits
    .split(/[\n,、]/)
    .map((item: string) => item.trim())
    .filter(Boolean);
  const mergedTags = selectedTags;
  const mergedBenefits = Array.from(new Set([...selectedBenefits, ...parsedCustomBenefits]));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1536px)");
    const sync = () => setIsWidePreview(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!showPreview || isWidePreview) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showPreview, isWidePreview]);

  useEffect(() => {
    if (!annualNumManual) {
      setAnnualSalaryMinNum(computeAnnualNum(salaryType, salaryMinVal));
      setAnnualSalaryMaxNum(computeAnnualNum(salaryType, salaryMaxVal));
    }
  }, [salaryType, salaryMinVal, salaryMaxVal, annualNumManual]);

  useEffect(() => {
    if (!trialAnnualNumManual) {
      setTrialAnnualSalaryMinNum(computeAnnualNum(trialSalaryType, trialSalaryMinVal));
      setTrialAnnualSalaryMaxNum(computeAnnualNum(trialSalaryType, trialSalaryMaxVal));
    }
  }, [trialSalaryType, trialSalaryMinVal, trialSalaryMaxVal, trialAnnualNumManual]);

  // Mark dirty when any UI-driven state changes (after mount)
  useEffect(() => { markDirty(); }, [
    titleVal, description, targetType, graduationYear, imageUrl, categoryTag, categoryTagDetail,
    employmentType, employmentTypeDetail, employmentPeriodType, selectedLocation, selectedRegion,
    officeDetail, streetAddrVal, salaryType, salaryMinVal, salaryMaxVal, annualSalaryMinNum,
    annualSalaryMaxNum, annualPaymentMethod, annualPaymentNote, hasFixedOvertime,
    fixedOvertimePayType, fixedOvertimePayFixed, fixedOvertimePayMin, fixedOvertimePayMax,
    fixedOvertimePayFloor, fixedOvertimeHoursType, fixedOvertimeHoursFixed, fixedOvertimeHoursMin,
    fixedOvertimeHoursMax, overtimeExcessPaid, trialPeriodExists, trialPeriodMonths, trialPeriodDays,
    trialEmploymentSame, trialEmploymentType, trialWorkingHours, trialSalarySame, trialSalaryType,
    trialSalaryMinVal, trialSalaryMaxVal, holidayType, smokingPolicyIndoor, smokingPolicyOutdoor,
    smokingNote, trainingInfo, selectedBenefits, customBenefits, selectedTags, selectionProcess,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleItem(list: string[], setList: (value: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]);
    markDirty();
  }

  const fmtAnnual = (n: string) => {
    const num = Number(n);
    if (!num) return "";
    return num >= 10000 ? `${Math.round(num / 10000)}万円` : `${num.toLocaleString()}円`;
  };

  const annualSalaryText = useMemo(() => {
    if (!annualSalaryMinNum && !annualSalaryMaxNum) return "";
    if (annualSalaryMinNum && annualSalaryMaxNum) return `${fmtAnnual(annualSalaryMinNum)}〜${fmtAnnual(annualSalaryMaxNum)}`;
    if (annualSalaryMinNum) return `${fmtAnnual(annualSalaryMinNum)}〜`;
    return `〜${fmtAnnual(annualSalaryMaxNum)}`;
  }, [annualSalaryMinNum, annualSalaryMaxNum]);

  const trialAnnualSalaryText = useMemo(() => {
    if (!trialAnnualSalaryMinNum && !trialAnnualSalaryMaxNum) return "";
    if (trialAnnualSalaryMinNum && trialAnnualSalaryMaxNum) return `${fmtAnnual(trialAnnualSalaryMinNum)}〜${fmtAnnual(trialAnnualSalaryMaxNum)}`;
    if (trialAnnualSalaryMinNum) return `${fmtAnnual(trialAnnualSalaryMinNum)}〜`;
    return `〜${fmtAnnual(trialAnnualSalaryMaxNum)}`;
  }, [trialAnnualSalaryMinNum, trialAnnualSalaryMaxNum]);

  const previewData = useMemo<JobPreviewData>(
    () => ({
      title: formValues.title ?? "",
      imageUrl,
      categoryTag,
      categoryTagDetail,
      employmentType,
      employmentTypeDetail,
      description,
      requirements: formValues.requirements ?? "",
      desiredAptitude: formValues.desiredAptitude ?? "",
      recommendedFor: formValues.recommendedFor ?? "",
      location: selectedLocation,
      region: selectedRegion,
      officeDetail,
      access: formValues.access ?? "",
      salaryMin: salaryMinVal ? String(Math.round(Number(salaryMinVal) / 10000)) : "",
      salaryMax: salaryMaxVal ? String(Math.round(Number(salaryMaxVal) / 10000)) : "",
      monthlySalary: annualSalaryText,
      selectionProcess,
      employmentPeriodType,
      tags: mergedTags,
      benefits: mergedBenefits,
      targetType,
      graduationYear,
      recruitmentBackground: formValues.recruitmentBackground ?? "",
      holidayPolicy: formValues.holidayPolicy ?? "",
      trialPeriod: formValues.trialPeriod ?? "",
      fixedOvertime: formValues.fixedOvertime ?? "",
      salaryRevision: formValues.salaryRevision ?? "",
    }),
    [
      formValues,
      imageUrl,
      categoryTag,
      categoryTagDetail,
      employmentType,
      employmentTypeDetail,
      description,
      officeDetail,
      selectionProcess,
      selectedLocation,
      selectedRegion,
      employmentPeriodType,
      mergedTags,
      mergedBenefits,
      targetType,
      graduationYear,
    ],
  );

  async function handlePostalCode(code: string) {
    setPostalLoading(true);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
      const json = await res.json();
      if (json.results?.[0]) {
        const { address1, address2, address3 } = json.results[0] as { address1: string; address2: string; address3: string };
        const area = Object.entries(PREFECTURES_BY_AREA).find(([, prefs]) => prefs.includes(address1))?.[0] ?? "";
        if (area) setSelectedRegion(area);
        setSelectedLocation(address1);
        const cityPart = [address2, address3].filter(Boolean).join("");
        setOfficeDetail((prev) => prev || cityPart);
      }
    } catch {
      // ignore
    } finally {
      setPostalLoading(false);
    }
  }

  const formRef = useRef<HTMLFormElement>(null);
  const validationErrorRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const justSavedRef = useRef(false);
  useEffect(() => {
    const id = setTimeout(() => { mountedRef.current = true; }, 0);
    return () => clearTimeout(id);
  }, []);

  function markDirty() {
    if (!mountedRef.current) return;
    if (justSavedRef.current) {
      justSavedRef.current = false;
      return;
    }
    setIsDirty(true);
    setDraftSaved(false);
  }

  function parseServerError(err: unknown): string {
    if (!(err instanceof Error)) return "予期せぬエラーが発生しました。時間をおいて再度お試しください。";
    const msg = err.message;
    if (msg.includes("omitted in production") || msg.includes("Server Components render") || msg.includes("digest")) {
      return "サーバーエラーが発生しました。入力内容を確認し、時間をおいて再度お試しください。";
    }
    return msg;
  }

  function showError(msg: string) {
    setValidationError(msg);
    setTimeout(() => {
      validationErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  function readFormValues(form: HTMLFormElement) {
    setFormValues(
      Object.fromEntries(
        Array.from(new FormData(form).entries(), ([key, value]) => [key, typeof value === "string" ? value : ""]),
      ),
    );
  }

  function buildJobData(fd: FormData) {
    return {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      employmentType,
      location: selectedLocation,
      salaryMin: salaryMinVal ? Number(salaryMinVal) : undefined,
      salaryMax: salaryMaxVal ? Number(salaryMaxVal) : undefined,
      categoryTag,
      tags: mergedTags,
      imageUrl,
      requirements: fd.get("requirements") as string,
      desiredAptitude: fd.get("desiredAptitude") as string,
      recommendedFor: fd.get("recommendedFor") as string,
      monthlySalary: annualSalaryText || undefined,
      access: fd.get("access") as string,
      officeName: fd.get("officeName") as string || undefined,
      officeDetail: [officeDetail, streetAddrVal].filter(Boolean).join(" ") || undefined,
      postalCode: postalCode || undefined,
      benefits: mergedBenefits,
      selectionProcess: fd.get("selectionProcess") as string,
      employmentPeriodType,
      region: selectedRegion,
      categoryTagDetail: categoryTag === OTHER_CATEGORY_VALUE ? categoryTagDetail : undefined,
      employmentTypeDetail: employmentType === "OTHER" ? employmentTypeDetail : undefined,
      targetType,
      graduationYear: targetType === "NEW_GRAD" ? graduationYear : undefined,
      trainingInfo: trainingInfo || undefined,
      youthEmploymentStats: youthStats.some((s) => Object.values(s).slice(1).some(Boolean)) ? youthStats : undefined,
      smokingPolicyIndoor: smokingPolicyIndoor || undefined,
      smokingPolicyOutdoor: smokingPolicyOutdoor || undefined,
      smokingNote: smokingNote || undefined,
      recruitmentBackground: fd.get("recruitmentBackground") as string,
      salaryType,
      salaryRevision: fd.get("salaryRevision") as string,
      bonus: salaryType !== "annual" ? (bonusExists === null ? undefined : bonusExists ? "あり" : "なし") : undefined,
      bonusNote: salaryType !== "annual" && bonusExists ? (bonusNote || undefined) : undefined,
      salaryNote: salaryNote || undefined,
      experienceType: experienceType || undefined,
      experienceYears: (experienceType === "経験者のみ" || experienceType === "経験者歓迎") && experienceYears ? Number(experienceYears) : undefined,
      annualPaymentMethod: salaryType === "annual" ? annualPaymentMethod : undefined,
      annualPaymentNote: salaryType === "annual" ? annualPaymentNote || undefined : undefined,
      hasFixedOvertime: (salaryType === "annual" || salaryType === "monthly") ? (hasFixedOvertime ?? undefined) : undefined,
      fixedOvertime: (salaryType === "annual" || salaryType === "monthly") && hasFixedOvertime ? JSON.stringify({
        payType: fixedOvertimePayType,
        payFixed: fixedOvertimePayFixed ? Number(fixedOvertimePayFixed) : null,
        payMin: fixedOvertimePayMin ? Number(fixedOvertimePayMin) : null,
        payMax: fixedOvertimePayMax ? Number(fixedOvertimePayMax) : null,
        payFloor: fixedOvertimePayFloor ? Number(fixedOvertimePayFloor) : null,
        hoursType: fixedOvertimeHoursType,
        hoursFixed: fixedOvertimeHoursFixed ? Number(fixedOvertimeHoursFixed) : null,
        hoursMin: fixedOvertimeHoursMin ? Number(fixedOvertimeHoursMin) : null,
        hoursMax: fixedOvertimeHoursMax ? Number(fixedOvertimeHoursMax) : null,
        excessPaid: overtimeExcessPaid,
      }) : undefined,
      trialPeriodExists: trialPeriodExists ?? undefined,
      trialPeriodMonths: trialPeriodExists ? trialPeriodMonths : undefined,
      trialPeriodDays: trialPeriodExists && trialPeriodDays ? trialPeriodDays : undefined,
      trialEmploymentSame: trialPeriodExists ? (trialEmploymentSame ?? undefined) : undefined,
      trialEmploymentType: trialPeriodExists && trialEmploymentSame === false ? trialEmploymentType || undefined : undefined,
      trialWorkingHours: trialPeriodExists && trialWorkingHours ? Number(trialWorkingHours) : undefined,
      trialSalarySame: trialPeriodExists ? (trialSalarySame ?? undefined) : undefined,
      trialSalaryType: trialPeriodExists && trialSalarySame === false ? trialSalaryType : undefined,
      trialSalaryMin: trialPeriodExists && trialSalarySame === false && trialSalaryMinVal ? Number(trialSalaryMinVal) : undefined,
      trialSalaryMax: trialPeriodExists && trialSalarySame === false && trialSalaryMaxVal ? Number(trialSalaryMaxVal) : undefined,
      trialAnnualSalary: trialPeriodExists && trialSalarySame === false ? (trialAnnualSalaryText || undefined) : undefined,
      trialPeriod: trialPeriodExists ? fd.get("trialPeriod") as string : undefined,
      holidayType,
      holidayPolicy: holidayType === "そのほか" ? (fd.get("holidayPolicy") as string) : undefined,
      holidayNote: holidayNote || undefined,
      jobSubcategory: jobSubcategory || undefined,
      ...workingHoursStateToData(workingHours),
    };
  }

  async function handleDraftSave() {
    setValidationError(null);
    if (!titleVal.trim()) {
      setValidationError("タイトルの入力は必須です");
      titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleRef.current?.focus();
      return;
    }
    const fd = new FormData(formRef.current!);
    setPendingAction("draft");
    try {
      const result = await updateJob(job.id, buildJobData(fd), "draft");
      if (!result.ok) {
        showError(`下書き保存に失敗しました：${result.error}`);
        return;
      }
      justSavedRef.current = true;
      setDraftSaved(true);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      showError(`下書き保存に失敗しました：${parseServerError(err)}`);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const fd = new FormData(event.currentTarget);

    if (!titleVal.trim()) {
      setValidationError("タイトルの入力は必須です");
      titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleRef.current?.focus();
      return;
    }

    if (!categoryTag) {
      showError("求人カテゴリを選択してください");
      return;
    }

    if (categoryTag === OTHER_CATEGORY_VALUE && !categoryTagDetail.trim()) {
      showError("カテゴリ「その他」の詳細を入力してください");
      return;
    }

    if (subcategoryMap[categoryTag]?.length > 0 && !jobSubcategory) {
      showError("職種を選択してください");
      return;
    }

    if (description.length < 200) {
      showError("仕事内容は200文字以上入力してください");
      return;
    }

    if (employmentType === "OTHER" && !employmentTypeDetail.trim()) {
      showError("雇用形態「その他」の詳細を入力してください");
      return;
    }

    if (!selectionProcess.trim()) {
      showError("選考フローを入力してください");
      return;
    }

    if (trialPeriodExists === null) {
      showError("試用期間のあり・なしを選択してください");
      return;
    }

    if (trialPeriodExists && trialEmploymentSame === null) {
      showError("試用期間中の雇用形態を選択してください");
      return;
    }

    if (trialPeriodExists && trialSalarySame === null) {
      showError("試用期間中の給与を選択してください");
      return;
    }

    if (mergedBenefits.length === 0) {
      showError("福利厚生を1つ以上選択してください");
      return;
    }

    if (selectedRegion && !selectedLocation) {
      showError("勤務地を選択してください");
      return;
    }

    if (!smokingPolicyIndoor) {
      showError("屋内の受動喫煙対策を選択してください");
      return;
    }

    if (!smokingPolicyOutdoor) {
      showError("屋外の受動喫煙対策を選択してください");
      return;
    }

    setPendingAction("review");

    try {
      const result = await updateJob(job.id, buildJobData(fd), "review");
      if (!result.ok) {
        showError(`送信に失敗しました：${result.error}`);
        return;
      }
      router.push("/company/jobs");
    } catch (err) {
      console.error(err);
      showError(`送信に失敗しました：${parseServerError(err)}`);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete() {
    if (!confirm("この求人を削除しますか？")) return;
    setPendingAction("delete");
    try {
      await deleteJob(job.id);
      router.push("/company/jobs");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleWithdraw() {
    if (!confirm("審査申請を取り下げますか？")) return;
    setPendingAction("withdraw");
    try {
      await withdrawJobSubmission(job.id);
      setCurrentReviewStatus(hasPublishedVersion ? "PUBLISHED" : "DRAFT");
      router.refresh();
    } finally {
      setPendingAction(null);
    }
  }

  const closingDateStr = job.closingDate ? new Date(job.closingDate).toISOString().split("T")[0] : "";

  const isSubmitting = pendingAction !== null;
  const canWithdraw = currentReviewStatus === "PENDING_REVIEW";
  const showDraftSave = !canWithdraw && !hasPublishedVersion;

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${JOB_REVIEW_STATUS_BADGE_CLASSES[currentReviewStatus]}`}>
          {JOB_REVIEW_STATUS_LABELS[currentReviewStatus]}
        </span>
        {job.reviewComment ? <span className="whitespace-pre-line text-[13px] text-[#a16207]">差し戻しコメント: {job.reviewComment}</span> : null}
        {hasPendingVersion ? (
          <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[12px] font-bold text-[#2563eb]">差し替え審査データあり</span>
        ) : null}
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={() => {
            setShowPreview((prev) => !prev);
          }}
          className="inline-flex rounded-[10px] bg-[#1d63e3] px-6 py-3 text-[15px] font-bold text-white shadow-[0_4px_16px_rgba(29,99,227,0.4)] transition hover:opacity-90"
        >
          {isWidePreview ? (showPreview ? "プレビューを閉じる" : "プレビューを開く") : "プレビューを確認"}
        </button>
      </div>

      {validationError ? (
        <div ref={validationErrorRef} className="mt-5 rounded-[10px] border border-[#ff5e7d] bg-[#fff5f7] px-4 py-3 text-[14px] text-[#ff3158]">
          {validationError}
        </div>
      ) : null}

      {hasPublishedVersion ? (
        <div className="mt-4 rounded-[12px] border border-[#dbe4ff] bg-[#f4f7ff] px-4 py-4 text-[13px] leading-[1.8] text-[#587199]">
          公開中の求人を編集して審査に提出すると、現在の掲載内容はそのまま残り、審査完了後に新しい内容へ自動で差し替わります。
        </div>
      ) : null}

      <div
        className={`mt-6 grid items-start gap-6 2xl:gap-8 ${
          showPreview && isWidePreview ? "2xl:grid-cols-[minmax(520px,0.78fr)_minmax(760px,1.22fr)]" : ""
        }`}
      >
        <form
          ref={formRef}
          noValidate
          onSubmit={handleSubmit}
          onChange={(event) => { readFormValues(event.currentTarget); markDirty(); }}
          className={`rounded-[10px] bg-white p-[30px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col gap-5 ${
            showPreview && isWidePreview ? "" : "max-w-[1120px]"
          }`}
        >
          <Section title="ターゲット">
            <Field label="対象" required>
              <div className="flex flex-wrap gap-2.5">
                <TargetButton active={targetType === "MID_CAREER"} onClick={() => setTargetType("MID_CAREER")}>
                  中途
                </TargetButton>
                {gradYears.map((year) => (
                  <TargetButton
                    key={year}
                    active={targetType === "NEW_GRAD" && graduationYear === year}
                    onClick={() => {
                      setTargetType("NEW_GRAD");
                      setGraduationYear(year);
                    }}
                  >
                    {graduationYearLabel(year)}
                  </TargetButton>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="基本情報">
            <Field label="タイトル" required>
              <input
                ref={titleRef}
                name="title"
                maxLength={50}
                value={titleVal}
                onChange={(e) => setTitleVal(e.target.value)}
                className={inputCls}
                placeholder="例：Webエンジニア（フロントエンド）／営業職（法人向け）"
              />
              <p className={`mt-1 text-right text-[12px] ${titleVal.length >= 50 ? "text-[#eb0937]" : "text-[#aaa]"}`}>
                {titleVal.length}/50
              </p>
            </Field>

            <Field label="メイン画像">
              <p className="mb-2 text-[13px] text-[#6b7280]">対応形式：jpg / png / webp（最大10MB）</p>
              <div className="rounded-[18px] border border-[#d9dfec] p-4">
                <ThumbnailUpload
                  name="imageUrl"
                  defaultValue={job.imageUrl ?? undefined}
                  hint="推奨サイズ：横2 × 縦1（例：1600×800px）"
                  onUploaded={(url) => {
                    setImageUrl(url);
                  }}
                />
              </div>
            </Field>

            <Field label="求人カテゴリ" required>
              <SelectDown
                name="categoryTag"
                className={inputCls}
                value={categoryTag}
                onChange={(val) => {
                  setCategoryTag(val);
                  setJobSubcategory("");
                  if (val !== OTHER_CATEGORY_VALUE) setCategoryTagDetail("");
                }}
                options={categoryOptions.map((c) => ({ value: c, label: c }))}
              />
              {categoryTag === OTHER_CATEGORY_VALUE ? (
                <input
                  name="categoryTagDetail"
                  value={categoryTagDetail}
                  onChange={(event) => setCategoryTagDetail(event.target.value)}
                  className={`${inputCls} mt-3`}
                  placeholder="カテゴリの詳細を入力"
                />
              ) : null}
            </Field>

            {categoryTag && subcategoryMap[categoryTag]?.length > 0 ? (
              <Field label="職種" required>
                <SelectDown
                  name="jobSubcategory"
                  className={inputCls}
                  value={jobSubcategory}
                  onChange={setJobSubcategory}
                  options={subcategoryMap[categoryTag].map((s) => ({ value: s, label: s }))}
                />
              </Field>
            ) : null}

            <Field label="雇用形態" required>
              <SelectDown
                name="employmentType"
                className={inputCls}
                value={employmentType}
                onChange={(val) => {
                  setEmploymentType(val);
                  if (val !== "OTHER") setEmploymentTypeDetail("");
                }}
                options={EMPLOYMENT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                placeholder=""
              />
              {employmentType === "OTHER" ? (
                <input
                  name="employmentTypeDetail"
                  value={employmentTypeDetail}
                  onChange={(event) => setEmploymentTypeDetail(event.target.value)}
                  className={`${inputCls} mt-3`}
                  placeholder="雇用形態の詳細を入力"
                />
              ) : null}
            </Field>
          </Section>

          <Section title="仕事内容">
            <Field label="仕事内容" required>
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!description || confirm("テンプレートで上書きしますか？")) setDescription(DESCRIPTION_TEMPLATE);
                  }}
                  className="rounded-[5px] bg-[#1d63e3] px-2 py-1 text-[11px] font-bold text-white hover:opacity-90 transition"
                >
                  テンプレート入力
                </button>
              </div>
              <div className="relative">
                <textarea
                  name="description"
                  required
                  rows={8}
                  maxLength={750}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={textareaCls}
                  placeholder="仕事の内容を入力してください（200文字以上）"
                />
                <p className={`pointer-events-none absolute bottom-2 right-3 text-[12px] ${description.length >= 750 ? "text-[#eb0937]" : description.length >= 200 ? "text-[#aaa]" : "text-[#ccc]"}`}>
                  {description.length} / 750文字
                </p>
              </div>
              {description.length > 0 && description.length < 200 && (
                <p className="mt-1 text-[12px] text-[#eb0937]">あと{200 - description.length}文字以上入力してください</p>
              )}
            </Field>
            <Field label="応募条件" required>
              <textarea name="requirements" required rows={3} defaultValue={job.requirements ?? ""} className={textareaCls} placeholder="例：営業経験3年以上、コミュニケーション能力が高い方、普通自動車免許をお持ちの方" />
            </Field>
            <Field label="経験要件">
              <div className="flex flex-wrap gap-5">
                {(["未経験者歓迎", "経験者歓迎", "経験者のみ"] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-[15px]">
                    <input
                      type="radio"
                      checked={experienceType === opt}
                      onChange={() => setExperienceType(opt)}
                      className="h-[18px] w-[18px] accent-[#1d63e3]"
                    />
                    {opt}
                  </label>
                ))}
                {experienceType && (
                  <label className="flex cursor-pointer items-center gap-2 text-[15px] text-[#999]">
                    <input
                      type="radio"
                      checked={experienceType === ""}
                      onChange={() => setExperienceType("")}
                      className="h-[18px] w-[18px] accent-[#aaa]"
                    />
                    指定しない
                  </label>
                )}
              </div>
              {(experienceType === "経験者のみ" || experienceType === "経験者歓迎") && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    min={0}
                    max={30}
                    className="w-[80px] rounded-[8px] border border-[#d3dae8] px-3 py-2 text-[14px] focus:border-[#1d63e3] focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-[14px] text-[#555]">年以上の経験</span>
                  {experienceType === "経験者歓迎" && (
                    <span className="text-[12px] text-[#888]">（任意）</span>
                  )}
                </div>
              )}
            </Field>
            <Field label="求める人物像" required>
              <textarea name="desiredAptitude" required rows={3} defaultValue={job.desiredAptitude ?? ""} className={textareaCls} placeholder="例：主体的に動ける方、新しいことへの挑戦が好きな方、キャリアアップを目指したい方" />
            </Field>
            <SectionTags label="応募要件の特徴" tags={REQUIREMENT_TAGS} selectedTags={selectedTags} onToggle={(tag) => toggleItem(selectedTags, setSelectedTags, tag)} />
            <Field label="求人タグ">
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <label
                    key={tag}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                      selectedTags.includes(tag)
                        ? "border-[#1d63e3] bg-[#eef2ff] text-[#1d63e3]"
                        : "border-[#ccc] bg-white text-[#333] hover:border-[#1d63e3]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleItem(selectedTags, setSelectedTags, tag)}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="勤務地">
            <Field label="郵便番号" required>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9-]/g, "");
                    setPostalCode(val);
                    const digits = val.replace(/-/g, "");
                    if (digits.length === 7) handlePostalCode(digits);
                  }}
                  className={inputCls}
                  placeholder="例）123-4568"
                  maxLength={8}
                />
                <button
                  type="button"
                  onClick={() => {
                    const digits = postalCode.replace(/-/g, "");
                    if (digits.length === 7) handlePostalCode(digits);
                  }}
                  className="shrink-0 rounded-[5px] bg-[#1d63e3] px-3 py-[5px] text-[13px] font-bold text-white hover:opacity-90 transition"
                >
                  {postalLoading ? "検索中..." : "自動入力"}
                </button>
              </div>
            </Field>

            <Field label="都道府県" required>
              <select
                name="location"
                value={selectedLocation}
                className={inputCls}
                onChange={(event) => {
                  const pref = event.target.value;
                  setSelectedLocation(pref);
                  const area = Object.entries(PREFECTURES_BY_AREA).find(([, prefs]) => prefs.includes(pref))?.[0] ?? "";
                  if (area) setSelectedRegion(area);
                }}
              >
                <option value="">選択してください</option>
                {ALL_PREFECTURES.map((prefecture) => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="市町村" required>
              <input
                type="text"
                value={officeDetail}
                onChange={(e) => setOfficeDetail(e.target.value)}
                className={inputCls}
                placeholder="例）福岡県福岡市博多区"
              />
            </Field>

            <Field label="以降の住所">
              <input
                type="text"
                value={streetAddrVal}
                onChange={(e) => setStreetAddrVal(e.target.value)}
                className={inputCls}
                placeholder="例）1-1-1 渋谷スクランブルスクエア 12F"
              />
            </Field>

            <Field label="アクセス">
              <input name="access" defaultValue={job.access ?? ""} className={inputCls} placeholder="JR渋谷駅 徒歩5分" />
            </Field>
            <SectionTags tags={LOCATION_TAGS} selectedTags={selectedTags} onToggle={(tag) => toggleItem(selectedTags, setSelectedTags, tag)} />
          </Section>

          <Section title="給与">
            <div className="space-y-0.5 text-[14px] text-[#eb0937]">
              <p>最低賃金を下回る時給は法令によって禁止されています。</p>
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/minimumichiran/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                地域別最低賃金の全国一覧（厚生労働省）
                <svg xmlns="http://www.w3.org/2000/svg" className="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>

            <div className="flex flex-wrap gap-6">
              {(["annual", "monthly", "daily", "hourly"] as const).map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-2 text-[15px]">
                  <input type="radio" name="salaryTypeRadio" checked={salaryType === type} onChange={() => { setSalaryType(type); setAnnualNumManual(false); setHasFixedOvertime(null); }} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                  {type === "annual" ? "年俸" : type === "monthly" ? "月給" : type === "daily" ? "日給" : "時給"}
                </label>
              ))}
            </div>

            <Field label={salaryType === "annual" ? "年俸" : salaryType === "monthly" ? "月給" : salaryType === "daily" ? "日給" : "時給"} required>
              {salaryType === "monthly" && (
                <p className="mb-1.5 text-[12px] text-[#eb0937]">みなし残業代を含んだ金額を記載ください</p>
              )}
              <div className="flex items-center gap-2">
                <input type="number" value={salaryMinVal} onChange={(e) => setSalaryMinVal(e.target.value)} className={inputCls} placeholder={SALARY_PLACEHOLDER[salaryType]?.[0] ?? ""} />
                <span className="shrink-0 text-[14px] text-[#555]">円〜</span>
                <input type="number" value={salaryMaxVal} onChange={(e) => setSalaryMaxVal(e.target.value)} className={inputCls} placeholder={SALARY_PLACEHOLDER[salaryType]?.[1] ?? ""} />
                <span className="shrink-0 text-[14px] text-[#555]">円</span>
              </div>
              {(salaryMinVal || salaryMaxVal) && (
                <p className="mt-1 text-[12px] text-[#7b8797]">
                  万円換算：{salaryMinVal ? `${Math.round(Number(salaryMinVal) / 10000)}万円` : ""}〜{salaryMaxVal ? `${Math.round(Number(salaryMaxVal) / 10000)}万円` : ""}
                </p>
              )}
            </Field>

            {salaryType === "annual" && (
              <Field label="支払い方法" required>
                <div className="space-y-2">
                  {(["monthly", "other"] as const).map((method) => (
                    <label key={method} className="flex cursor-pointer items-center gap-2 text-[14px]">
                      <input type="radio" checked={annualPaymentMethod === method} onChange={() => setAnnualPaymentMethod(method)} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                      {method === "monthly" ? "年俸の1/12を毎月支給" : "そのほか"}
                    </label>
                  ))}
                  <textarea value={annualPaymentNote} onChange={(e) => setAnnualPaymentNote(e.target.value)} rows={3} className={textareaCls} placeholder="支払い方法の詳細を入力してください" />
                </div>
              </Field>
            )}

            {salaryType === "monthly" && (
              <Field label="想定年収" required>
                <div className="flex items-center gap-2">
                  <input type="number" value={annualSalaryMinNum} onChange={(e) => { setAnnualSalaryMinNum(e.target.value); setAnnualNumManual(true); }} className={inputCls} placeholder="例：4200000" />
                  <span className="shrink-0 text-[14px] text-[#555]">円〜</span>
                  <input type="number" value={annualSalaryMaxNum} onChange={(e) => { setAnnualSalaryMaxNum(e.target.value); setAnnualNumManual(true); }} className={inputCls} placeholder="例：4800000" />
                  <span className="shrink-0 text-[14px] text-[#555]">円</span>
                </div>
              </Field>
            )}

            {(salaryType === "annual" || salaryType === "monthly") && (
              <Field label="みなし残業制度" required>
                <div className="flex gap-6">
                  {([true, false] as const).map((val) => (
                    <label key={String(val)} className="flex cursor-pointer items-center gap-2 text-[15px]">
                      <input type="radio" checked={hasFixedOvertime === val} onChange={() => setHasFixedOvertime(val)} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                      {val ? "あり" : "なし"}
                    </label>
                  ))}
                </div>
              </Field>
            )}

            {(salaryType === "annual" || salaryType === "monthly") && hasFixedOvertime && (
              <div className="rounded-[8px] border border-[#d0d7e6] bg-[#f8fafd] p-4 space-y-5">
                <div className="space-y-1 text-[13px] text-[#eb0937]">
                  <p>1日の実働時間が8時間以上の場合、みなし残業代は以下の式を満たす必要があります。</p>
                  <p>みなし残業代÷（固定残業時間×1.25）≥最低賃金額(時間額)</p>
                </div>
                <div>
                  <p className="mb-2 text-[14px] font-bold text-[#333]">みなし残業代<span className="ml-1 text-[#eb0937]">*必須</span></p>
                  <div className="space-y-3">
                    <div>
                      <label className="flex cursor-pointer items-center gap-2 text-[14px]"><input type="radio" checked={fixedOvertimePayType === "fixed"} onChange={() => setFixedOvertimePayType("fixed")} className="h-[16px] w-[16px] accent-[#1d63e3]" />固定額を表示</label>
                      <div className={`mt-1.5 flex items-center gap-2 pl-6 ${fixedOvertimePayType !== "fixed" ? "opacity-40 pointer-events-none" : ""}`}>
                        <input type="number" value={fixedOvertimePayFixed} onChange={(e) => setFixedOvertimePayFixed(e.target.value)} disabled={fixedOvertimePayType !== "fixed"} className={inputCls} placeholder="30000" /><span className="shrink-0 text-[13px] text-[#555]">円/月</span>
                      </div>
                    </div>
                    <div>
                      <label className="flex cursor-pointer items-center gap-2 text-[14px]"><input type="radio" checked={fixedOvertimePayType === "range"} onChange={() => setFixedOvertimePayType("range")} className="h-[16px] w-[16px] accent-[#1d63e3]" />範囲を指定</label>
                      <div className={`mt-1.5 flex items-center gap-2 pl-6 ${fixedOvertimePayType !== "range" ? "opacity-40 pointer-events-none" : ""}`}>
                        <input type="number" value={fixedOvertimePayMin} onChange={(e) => setFixedOvertimePayMin(e.target.value)} disabled={fixedOvertimePayType !== "range"} className={inputCls} placeholder="30000" /><span className="shrink-0 text-[13px] text-[#555]">円〜</span>
                        <input type="number" value={fixedOvertimePayMax} onChange={(e) => setFixedOvertimePayMax(e.target.value)} disabled={fixedOvertimePayType !== "range"} className={inputCls} placeholder="60000" /><span className="shrink-0 text-[13px] text-[#555]">円</span>
                      </div>
                    </div>
                    <div>
                      <label className="flex cursor-pointer items-center gap-2 text-[14px]"><input type="radio" checked={fixedOvertimePayType === "minimum"} onChange={() => setFixedOvertimePayType("minimum")} className="h-[16px] w-[16px] accent-[#1d63e3]" />最低額を表示</label>
                      <div className={`mt-1.5 flex items-center gap-2 pl-6 ${fixedOvertimePayType !== "minimum" ? "opacity-40 pointer-events-none" : ""}`}>
                        <input type="number" value={fixedOvertimePayFloor} onChange={(e) => setFixedOvertimePayFloor(e.target.value)} disabled={fixedOvertimePayType !== "minimum"} className={inputCls} placeholder="30000" /><span className="shrink-0 text-[13px] text-[#555]">円以上/月</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[14px] font-bold text-[#333]">みなし残業時間<span className="ml-1 text-[#eb0937]">*必須</span></p>
                  <div className="space-y-3">
                    <div>
                      <label className="flex cursor-pointer items-center gap-2 text-[14px]"><input type="radio" checked={fixedOvertimeHoursType === "fixed"} onChange={() => setFixedOvertimeHoursType("fixed")} className="h-[16px] w-[16px] accent-[#1d63e3]" />固定時間を表示</label>
                      <div className={`mt-1.5 flex items-center gap-2 pl-6 ${fixedOvertimeHoursType !== "fixed" ? "opacity-40 pointer-events-none" : ""}`}>
                        <input type="number" value={fixedOvertimeHoursFixed} onChange={(e) => setFixedOvertimeHoursFixed(e.target.value)} disabled={fixedOvertimeHoursType !== "fixed"} className={inputCls} placeholder="10" /><span className="shrink-0 text-[13px] text-[#555]">時間/月</span>
                      </div>
                    </div>
                    <div>
                      <label className="flex cursor-pointer items-center gap-2 text-[14px]"><input type="radio" checked={fixedOvertimeHoursType === "range"} onChange={() => setFixedOvertimeHoursType("range")} className="h-[16px] w-[16px] accent-[#1d63e3]" />範囲を指定</label>
                      <div className={`mt-1.5 flex items-center gap-2 pl-6 ${fixedOvertimeHoursType !== "range" ? "opacity-40 pointer-events-none" : ""}`}>
                        <input type="number" value={fixedOvertimeHoursMin} onChange={(e) => setFixedOvertimeHoursMin(e.target.value)} disabled={fixedOvertimeHoursType !== "range"} className={inputCls} placeholder="10" /><span className="shrink-0 text-[13px] text-[#555]">時間〜</span>
                        <input type="number" value={fixedOvertimeHoursMax} onChange={(e) => setFixedOvertimeHoursMax(e.target.value)} disabled={fixedOvertimeHoursType !== "range"} className={inputCls} placeholder="20" /><span className="shrink-0 text-[13px] text-[#555]">時間/月</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[14px] font-bold text-[#333]">超過分の全支給について<span className="ml-1 text-[#eb0937]">*必須</span></p>
                  <p className="mb-2 text-[13px] text-[#eb0937]">みなし時間分を超過して勤務した分の給与は全額支払う義務があります。</p>
                  <label className="flex cursor-pointer items-center gap-2 text-[14px]">
                    <input type="checkbox" checked={overtimeExcessPaid} onChange={(e) => setOvertimeExcessPaid(e.target.checked)} className="h-4 w-4 accent-[#1d63e3]" />
                    みなし残業時間を超過した分は全額支給する
                  </label>
                </div>
              </div>
            )}

            {/* 賞与（年俸以外） */}
            {salaryType !== "annual" && (
              <Field label="賞与" required>
                <div className="flex gap-6">
                  {([true, false] as const).map((val) => (
                    <label key={String(val)} className="flex cursor-pointer items-center gap-2 text-[15px]">
                      <input type="radio" checked={bonusExists === val} onChange={() => setBonusExists(val)} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                      {val ? "あり" : "なし"}
                    </label>
                  ))}
                </div>
                {bonusExists === true && (
                  <div className="mt-3">
                    <p className="mb-1 text-[13px] font-semibold text-[#555]">備考（任意）</p>
                    <textarea
                      value={bonusNote}
                      onChange={(e) => setBonusNote(e.target.value)}
                      rows={2}
                      maxLength={200}
                      className={textareaCls}
                      placeholder="例：年2回（7月・12月）、業績に応じて支給"
                    />
                    <p className="mt-0.5 text-right text-[11px] text-[#aaa]">{bonusNote.length} / 200</p>
                  </div>
                )}
              </Field>
            )}

            <Field label="給与の備考">
              <textarea
                value={salaryNote}
                onChange={(e) => setSalaryNote(e.target.value)}
                rows={3}
                maxLength={200}
                className={textareaCls}
                placeholder="例：経験・スキルに応じて優遇、入社後3ヶ月は試用期間として基本給の90%"
              />
              <p className="mt-0.5 text-right text-[11px] text-[#aaa]">{salaryNote.length} / 200</p>
            </Field>
          </Section>

          <Section title="勤務時間">
            <Field label="勤務時間" required>
              <WorkingHoursSection
                value={workingHours}
                onChange={(updates) => { setWorkingHours((prev) => ({ ...prev, ...updates })); markDirty(); }}
              />
            </Field>
          </Section>

          <Section title="試用期間">
            <Field label="試用期間" required>
              <div className="flex gap-6">
                {([true, false] as const).map((val) => (
                  <label key={String(val)} className="flex cursor-pointer items-center gap-2 text-[15px]">
                    <input type="radio" checked={trialPeriodExists === val} onChange={() => setTrialPeriodExists(val)} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                    {val ? "あり" : "なし"}
                  </label>
                ))}
              </div>
            </Field>
            {trialPeriodExists && (
              <>
                <Field label="試用期間の長さ">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={24}
                      value={trialPeriodMonths}
                      onChange={(e) => setTrialPeriodMonths(Number(e.target.value))}
                      className={`${inputCls} max-w-[80px]`}
                    />
                    <span className="shrink-0 text-[14px] text-[#555]">か月</span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={trialPeriodDays || ""}
                      onChange={(e) => setTrialPeriodDays(Number(e.target.value))}
                      className={`${inputCls} max-w-[80px]`}
                    />
                    <span className="shrink-0 text-[14px] text-[#555]">日</span>
                  </div>
                </Field>

                <Field label="試用期間中の雇用形態" required>
                  <div className="flex gap-6">
                    {([true, false] as const).map((val) => (
                      <label key={String(val)} className="flex cursor-pointer items-center gap-2 text-[15px]">
                        <input type="radio" checked={trialEmploymentSame === val} onChange={() => setTrialEmploymentSame(val)} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                        {val ? "本採用時と同じ" : "異なる"}
                      </label>
                    ))}
                  </div>
                  {trialEmploymentSame === false && (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {EMPLOYMENT_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-[14px]">
                          <input type="radio" checked={trialEmploymentType === opt.value} onChange={() => setTrialEmploymentType(opt.value)} className="h-[16px] w-[16px] accent-[#1d63e3]" />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  )}
                </Field>

                <Field label="試用期間中の想定労働時間" required>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[14px] text-[#555]">1か月あたり</span>
                    <input
                      type="number"
                      min={0}
                      value={trialWorkingHours}
                      onChange={(e) => setTrialWorkingHours(e.target.value)}
                      className={`${inputCls} max-w-[100px]`}
                      placeholder="160"
                    />
                    <span className="shrink-0 text-[14px] text-[#555]">時間</span>
                  </div>
                  {hasFixedOvertime && (
                    <p className="mt-1 text-[12px] text-[#eb0937]">みなし残業制度がある場合は想定労働時間の入力が必要です</p>
                  )}
                </Field>

                <Field label="試用期間中の給与" required>
                  <div className="flex gap-6">
                    {([true, false] as const).map((val) => (
                      <label key={String(val)} className="flex cursor-pointer items-center gap-2 text-[15px]">
                        <input type="radio" checked={trialSalarySame === val} onChange={() => setTrialSalarySame(val)} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                        {val ? "本採用時と同じ" : "異なる"}
                      </label>
                    ))}
                  </div>
                  {trialSalarySame === false && (
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-wrap gap-6">
                        {(["annual", "monthly", "daily", "hourly"] as const).map((type) => (
                          <label key={type} className="flex cursor-pointer items-center gap-2 text-[15px]">
                            <input type="radio" checked={trialSalaryType === type} onChange={() => { setTrialSalaryType(type); setTrialAnnualNumManual(false); }} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                            {type === "annual" ? "年俸" : type === "monthly" ? "月給" : type === "daily" ? "日給" : "時給"}
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" value={trialSalaryMinVal} onChange={(e) => setTrialSalaryMinVal(e.target.value)} className={inputCls} placeholder={SALARY_PLACEHOLDER[trialSalaryType]?.[0] ?? ""} />
                        <span className="shrink-0 text-[14px] text-[#555]">円〜</span>
                        <input type="number" value={trialSalaryMaxVal} onChange={(e) => setTrialSalaryMaxVal(e.target.value)} className={inputCls} placeholder={SALARY_PLACEHOLDER[trialSalaryType]?.[1] ?? ""} />
                        <span className="shrink-0 text-[14px] text-[#555]">円</span>
                      </div>
                      {trialSalaryType === "monthly" && (
                        <div>
                          <p className="mb-1 text-[13px] font-medium text-[#333]">試用期間中の想定年収</p>
                          <div className="flex items-center gap-2">
                            <input type="number" value={trialAnnualSalaryMinNum} onChange={(e) => { setTrialAnnualSalaryMinNum(e.target.value); setTrialAnnualNumManual(true); }} className={inputCls} placeholder="例：4200000" />
                            <span className="shrink-0 text-[14px] text-[#555]">円〜</span>
                            <input type="number" value={trialAnnualSalaryMaxNum} onChange={(e) => { setTrialAnnualSalaryMaxNum(e.target.value); setTrialAnnualNumManual(true); }} className={inputCls} placeholder="例：4800000" />
                            <span className="shrink-0 text-[14px] text-[#555]">円</span>
                          </div>
                          {!trialAnnualNumManual && trialAnnualSalaryText && (
                            <p className="mt-1 text-[12px] text-[#7b8797]">給与の下限・上限から自動計算: {trialAnnualSalaryText}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Field>

                <Field label="そのほか変更となる条件">
                  <textarea
                    name="trialPeriod"
                    rows={2}
                    defaultValue={job.trialPeriod ?? ""}
                    className={textareaCls}
                    placeholder={`例：試用期間中は以下の条件が適用されます\n・社会保険：加入（同条件）\n・退職金：対象外`}
                  />
                </Field>
              </>
            )}
          </Section>

          <Section title="休日・休暇">
            <div className="text-[14px] text-[#eb0937]">週1日以上の休日休暇が法律で決まっています。</div>
            <Field label="休みの取り方" required>
              <div className="flex flex-wrap gap-6">
                {(["完全週休2日制", "週休2日制", "そのほか"] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-[15px]">
                    <input type="radio" checked={holidayType === opt} onChange={() => setHolidayType(opt)} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                    {opt}
                  </label>
                ))}
              </div>
            </Field>
            {holidayType === "そのほか" && (
              <Field label="休日・休暇の詳細">
                <textarea
                  name="holidayPolicy"
                  rows={3}
                  defaultValue={job.holidayPolicy ?? ""}
                  className={textareaCls}
                  placeholder="例：◇出産・育児休暇&#10;◇慶弔休暇&#10;◇有給休暇（入社半年後10日付与）"
                />
              </Field>
            )}
            <SectionTags tags={HOLIDAY_TAGS} selectedTags={selectedTags} onToggle={(tag) => toggleItem(selectedTags, setSelectedTags, tag)} />
            <Field label="備考">
              <textarea
                rows={3}
                value={holidayNote}
                onChange={(e) => setHolidayNote(e.target.value)}
                maxLength={200}
                className={textareaCls}
                placeholder="休日・休暇に関する補足事項があれば入力してください"
              />
              <p className="mt-0.5 text-right text-[11px] text-[#aaa]">{holidayNote.length} / 200</p>
            </Field>
          </Section>

          <Section title="選考情報">
            <Field label="選考フロー" required>
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectionProcess || confirm("テンプレートで上書きしますか？")) setSelectionProcess(SELECTION_PROCESS_TEMPLATE);
                  }}
                  className="rounded-[5px] bg-[#1d63e3] px-2 py-1 text-[11px] font-bold text-white hover:opacity-90 transition"
                >
                  テンプレート入力
                </button>
              </div>
              <textarea
                name="selectionProcess"
                required
                rows={3}
                value={selectionProcess}
                onChange={(e) => setSelectionProcess(e.target.value)}
                className={textareaCls}
                placeholder="例：書類選考 → 一次面接（オンライン可） → 最終面接 → 内定&#10;※選考期間の目安：1〜2週間程度"
              />
            </Field>
            <SectionTags tags={SELECTION_TAGS} selectedTags={selectedTags} onToggle={(tag) => toggleItem(selectedTags, setSelectedTags, tag)} />
          </Section>

          <Section title="福利厚生">
            <Field label="福利厚生" required>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {(PRIMARY_BENEFIT_OPTIONS as readonly string[]).map((benefit) => (
                  <label
                    key={benefit}
                    className="flex items-center gap-2 rounded-[12px] border border-[#e6ebf5] px-3 py-2 text-[13px] text-[#445063]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBenefits.includes(benefit)}
                      onChange={() => toggleItem(selectedBenefits, setSelectedBenefits, benefit)}
                      className="h-4 w-4 rounded border-[#c4cddd] accent-[#1d63e3]"
                    />
                    {benefit}
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowBenefitModal(true)}
                  className="rounded-[8px] border border-[#1d63e3] px-4 py-2 text-[13px] font-medium text-[#1d63e3] hover:bg-[#eef2ff] transition"
                >
                  その他の福利厚生を選ぶ
                  {mergedBenefits.filter((b) => !(PRIMARY_BENEFIT_OPTIONS as readonly string[]).includes(b) && (SHARED_BENEFIT_OPTIONS as readonly string[]).includes(b)).length > 0 && (
                    <span className="ml-2 rounded-full bg-[#1d63e3] px-2 py-0.5 text-[11px] text-white">
                      {mergedBenefits.filter((b) => !(PRIMARY_BENEFIT_OPTIONS as readonly string[]).includes(b) && (SHARED_BENEFIT_OPTIONS as readonly string[]).includes(b)).length}件
                    </span>
                  )}
                </button>
              </div>
            </Field>
          </Section>

          {targetType === "NEW_GRAD" && <Section title="青少年雇用情報（若者雇用促進法）">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#f4f7ff]">
                    <th className="w-[160px] border border-[#e0e7f0] px-3 py-2 text-left font-semibold text-[#3d4552]">項目</th>
                    {youthStats.map((s) => (
                      <th key={s.year} className="border border-[#e0e7f0] px-3 py-2 text-center font-semibold text-[#3d4552]">{s.year}年度</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      { key: "newGradHired", label: "新卒採用人数" },
                      { key: "newGradLeft", label: "新卒離職者人数" },
                      { key: "avgAge", label: "平均年齢" },
                      { key: "overtimeHours", label: "平均所定外労働時間数" },
                      { key: "paidLeaveAvg", label: "有給休暇の平均取得日数" },
                      { key: "parentalLeave", label: "育児休業取得者数" },
                    ] as { key: keyof Omit<YouthYearStats, "year">; label: string }[]
                  ).map(({ key, label }) => (
                    <tr key={key} className="odd:bg-white even:bg-[#fafbfd]">
                      <td className="border border-[#e0e7f0] px-3 py-2 font-medium text-[#4b5563]">{label}</td>
                      {youthStats.map((s, i) => (
                        <td key={s.year} className="border border-[#e0e7f0] px-2 py-1.5">
                          <input
                            type="text"
                            value={s[key]}
                            onChange={(e) => {
                              const next = [...youthStats];
                              next[i] = { ...next[i], [key]: e.target.value };
                              setYouthStats(next);
                            }}
                            className="w-full rounded-[8px] border border-[#d9dfec] px-2 py-1.5 text-[13px] outline-none focus:border-[#1d63e3] placeholder:text-[#c0c8d8]"
                            placeholder="—"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>}

          <Section title="受動喫煙対策">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="屋内の受動喫煙対策" required>
                <select
                  value={smokingPolicyIndoor}
                  onChange={(e) => setSmokingPolicyIndoor(e.target.value)}
                  className={inputCls}
                >
                  <option value="">選択してください</option>
                  {SMOKING_INDOOR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </Field>
              <Field label="屋外の受動喫煙対策" required>
                <select
                  value={smokingPolicyOutdoor}
                  onChange={(e) => setSmokingPolicyOutdoor(e.target.value)}
                  className={inputCls}
                >
                  <option value="">選択してください</option>
                  {SMOKING_OUTDOOR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="受動喫煙対策・特記事項">
              <textarea
                rows={2}
                value={smokingNote}
                onChange={(e) => setSmokingNote(e.target.value)}
                className={textareaCls}
                placeholder="例：2025年4月より全館禁煙予定"
              />
            </Field>
          </Section>

          <div className="flex flex-wrap items-center gap-3 pt-8">
            {!canWithdraw ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[10px] bg-[#1d63e3] px-8 py-3.5 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {pendingAction === "review" ? "送信中..." : "審査に提出"}
              </button>
            ) : null}
            {showDraftSave ? (
              <button
                type="button"
                onClick={handleDraftSave}
                disabled={isSubmitting || (draftSaved && !isDirty)}
                className={`rounded-[10px] border px-8 py-3.5 text-[15px] font-bold transition ${
                  draftSaved && !isDirty
                    ? "border-[#a8d5a2] bg-[#f0faf0] text-[#4a9e3f] cursor-default"
                    : "border-[#ccc] bg-white text-[#1d63e3] hover:bg-[#f7faff] disabled:opacity-50"
                }`}
              >
                {pendingAction === "draft" ? "保存中..." : draftSaved && !isDirty ? "下書き保存済み" : "下書き保存"}
              </button>
            ) : null}
            {canWithdraw ? (
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isSubmitting}
                className="rounded-[10px] border border-[#f5c36b] bg-[#fff8ea] px-6 py-3.5 text-[15px] font-bold text-[#b7791f] transition hover:bg-[#fff3d8] disabled:opacity-50"
              >
                {pendingAction === "withdraw" ? "取り下げ中..." : "審査を取り下げる"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-[10px] border border-[#d6dde9] bg-white px-8 py-3.5 text-[15px] font-medium text-[#5b6472] transition hover:bg-[#f6f8fb]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="ml-auto rounded-[10px] border border-[#ff3158] px-6 py-3.5 text-[15px] font-bold text-[#ff3158] transition hover:bg-[#fff5f7] disabled:opacity-50"
            >
              {pendingAction === "delete" ? "削除中..." : "削除"}
            </button>
          </div>
        </form>

        {showPreview && isWidePreview ? (
          <div className="hidden self-start 2xl:block">
            <div className="sticky top-6 rounded-[24px] bg-white p-5 shadow-[0_2px_12px_rgba(27,52,90,0.06)]">
              <div className="max-h-[calc(100vh-72px)] overflow-y-auto">
                <JobPreview data={previewData} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {showBenefitModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-4">
          <div className="flex w-full max-w-[640px] flex-col rounded-[16px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]" style={{ maxHeight: "85vh" }}>
            <div className="flex items-center justify-between border-b border-[#e8edf5] px-5 py-4">
              <p className="text-[16px] font-bold text-[#2c2f36]">福利厚生を選択</p>
              <button type="button" onClick={() => setShowBenefitModal(false)} className="rounded-[8px] border border-[#d7deeb] px-3 py-1.5 text-[13px] font-bold text-[#4b5563] hover:bg-[#f8fbff] transition">閉じる</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {(SHARED_BENEFIT_OPTIONS as readonly string[]).map((benefit) => (
                  <label key={benefit} className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[#e6ebf5] px-3 py-2 text-[13px] text-[#445063] hover:border-[#1d63e3]">
                    <input
                      type="checkbox"
                      checked={selectedBenefits.includes(benefit)}
                      onChange={() => toggleItem(selectedBenefits, setSelectedBenefits, benefit)}
                      className="h-4 w-4 rounded border-[#c4cddd] accent-[#1d63e3]"
                    />
                    {benefit}
                  </label>
                ))}
              </div>
              <div>
                <p className="mb-1 text-[13px] font-bold text-[#333]">独自の福利厚生</p>
                <textarea
                  value={customBenefits}
                  onChange={(event) => setCustomBenefits(event.target.value)}
                  className={textareaCls}
                  rows={2}
                  placeholder="例：ランチ補助、書籍購入補助（カンマ・改行区切り）"
                />
              </div>
            </div>
            <div className="border-t border-[#e8edf5] px-5 py-4">
              <button type="button" onClick={() => setShowBenefitModal(false)} className="w-full rounded-[10px] bg-[#1d63e3] py-3 text-[15px] font-bold text-white hover:opacity-90 transition">
                確定する（{mergedBenefits.length}件）
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && !isWidePreview ? (
        <div className="fixed inset-0 z-[70] bg-[rgba(15,23,42,0.45)] p-4 md:p-6">
          <div className="mx-auto flex h-full w-full max-w-[1120px] flex-col rounded-[24px] bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.28)] md:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-[16px] font-bold text-[#2c2f36]">プレビューを確認</p>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="inline-flex rounded-[12px] border border-[#d7deeb] px-4 py-2 text-[14px] font-bold text-[#4b5563] transition hover:bg-[#f8fbff]"
              >
                閉じる
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-[20px] bg-[#f8fbff]">
              <div className="h-full overflow-y-auto p-3 md:p-4">
                <JobPreview data={previewData} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const inputCls =
  "w-full rounded-[5px] border border-[#ccc] bg-[#fafafa] px-[10px] py-[5px] text-[14px] text-[#333] outline-none transition placeholder:text-[#ccc] focus:border-[#1d63e3]";

const textareaCls = `${inputCls} min-h-[100px] resize-y`;

function SectionTags({
  label = "特徴",
  tags,
  selectedTags,
  onToggle,
}: {
  label?: string;
  tags: readonly string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}) {
  return (
    <div className="mt-1">
      <p className="mb-1.5 text-[13px] font-bold text-[#333]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <label
            key={tag}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
              selectedTags.includes(tag)
                ? "border-[#1d63e3] bg-[#eef2ff] text-[#1d63e3]"
                : "border-[#ccc] bg-white text-[#333] hover:border-[#1d63e3]"
            }`}
          >
            <input type="checkbox" className="hidden" checked={selectedTags.includes(tag)} onChange={() => onToggle(tag)} />
            {tag}
          </label>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#ccc] pb-5 last:border-b-0 last:pb-0">
      <h2 className="mb-3 text-[20px] font-semibold leading-[1.2] tracking-[-0.4px] text-[#1d63e3]">{title}</h2>
      <div className="space-y-[10px]">{children}</div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  if (
    isValidElement<{ type?: string }>(children) &&
    children.type === "input" &&
    children.props.type === "hidden"
  ) {
    return children;
  }

  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-bold text-[#333]">
        {label === "勤務地名称" ? "勤務地住所" : label === "勤務地詳細" ? "勤務地補足" : label}
        {required ? <span className="ml-1 text-[#eb0937]">*必須</span> : <span className="ml-1 text-[#999] text-[12px] font-normal">任意</span>}
      </label>
      {children}
    </div>
  );
}

function TargetButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[5px] border px-4 py-2 text-[14px] font-semibold transition ${
        active ? "border-[#1d63e3] bg-[#1d63e3] text-white" : "border-[#ccc] bg-[#fafafa] text-[#333] hover:border-[#1d63e3]"
      }`}
    >
      {children}
    </button>
  );
}
