"use client";

import { isValidElement, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createJob, type JobSubmissionMode } from "@/app/actions/company/jobs";
import { JobPreview, type JobPreviewData } from "@/components/job-preview";
import { ThumbnailUpload } from "@/components/thumbnail-upload";
import { getActiveGraduationYears, graduationYearLabel } from "@/lib/graduation-years";
import { ALL_PREFECTURES, AREA_OPTIONS, PREFECTURES_BY_AREA } from "@/lib/job-locations";
import {
  BENEFIT_OPTIONS as SHARED_BENEFIT_OPTIONS,
  CATEGORY_OPTIONS,
  EMPLOYMENT_OPTIONS,
  OTHER_CATEGORY_VALUE,
} from "@/lib/job-options";
import type { YouthYearStats } from "@/app/actions/company/jobs";

const TAG_OPTIONS = [
  "未経験歓迎",
  "リモートワーク",
  "新卒歓迎",
  "フレックスタイム",
  "急募",
  "中途採用",
  "資格取得支援",
  "大手企業",
  "ベンチャー",
  "年間休日120日以上",
  "副業OK",
  "土日祝休み",
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

const DESCRIPTION_TEMPLATE = `【主な業務内容】
・

【職場環境】


【入社後の流れ】
入社後はOJTにて業務を覚えていただきます。`;

const SELECTION_PROCESS_TEMPLATE = `書類選考 → 一次面接（オンライン可） → 最終面接 → 内定

※選考期間の目安：1〜2週間程度`;

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

const SALARY_PLACEHOLDER: Record<string, [string, string]> = {
  annual:  ["例：3000000", "例：5000000"],
  monthly: ["例：250000",  "例：350000"],
  daily:   ["例：10000",   "例：25000"],
  hourly:  ["例：1100",    "例：1500"],
};

export default function CompanyJobNewPage() {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<JobSubmissionMode | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const gradYears = getActiveGraduationYears();
  const [targetType, setTargetType] = useState("MID_CAREER");
  const [graduationYear, setGraduationYear] = useState(gradYears[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [categoryTag, setCategoryTag] = useState("");
  const [categoryTagDetail, setCategoryTagDetail] = useState("");
  const [employmentType, setEmploymentType] = useState("FULL_TIME");
  const [employmentTypeDetail, setEmploymentTypeDetail] = useState("");
  const [employmentPeriodType, setEmploymentPeriodType] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectionProcess, setSelectionProcess] = useState("");
  const [officeDetail, setOfficeDetail] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [postalLoading, setPostalLoading] = useState(false);
  const [trainingInfo, setTrainingInfo] = useState("");
  const [youthStats, setYouthStats] = useState<YouthYearStats[]>(EMPTY_YOUTH_STATS());
  const [smokingPolicyIndoor, setSmokingPolicyIndoor] = useState("");
  const [smokingPolicyOutdoor, setSmokingPolicyOutdoor] = useState("");
  const [smokingNote, setSmokingNote] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isWidePreview, setIsWidePreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [customBenefits, setCustomBenefits] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [salaryType, setSalaryType] = useState("annual");
  const [salaryMinVal, setSalaryMinVal] = useState("");
  const [salaryMaxVal, setSalaryMaxVal] = useState("");
  const [annualSalaryText, setAnnualSalaryText] = useState("");
  const [annualSalaryManual, setAnnualSalaryManual] = useState(false);
  const [hasFixedOvertime, setHasFixedOvertime] = useState<boolean | null>(null);
  const [trialPeriodExists, setTrialPeriodExists] = useState<boolean | null>(null);
  const [trialPeriodMonths, setTrialPeriodMonths] = useState(3);
  const [trialSalaryType, setTrialSalaryType] = useState("annual");
  const [trialSalaryMinVal, setTrialSalaryMinVal] = useState("");
  const [trialSalaryMaxVal, setTrialSalaryMaxVal] = useState("");
  const [trialAnnualSalary, setTrialAnnualSalary] = useState("");
  const [trialAnnualSalaryManual, setTrialAnnualSalaryManual] = useState(false);
  const [holidayType, setHolidayType] = useState("");
  const [holidayFeatures, setHolidayFeatures] = useState<string[]>([]);
  const [annualHolidayCount, setAnnualHolidayCount] = useState("");

  const availablePrefectures = selectedRegion ? PREFECTURES_BY_AREA[selectedRegion] ?? [] : ALL_PREFECTURES;
  const mergedTags = selectedTags;
  const parsedCustomBenefits = customBenefits
    .split(/[\n,、]/)
    .map((item: string) => item.trim())
    .filter(Boolean);
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
    if (!annualSalaryManual) {
      setAnnualSalaryText(calcAnnualSalary(salaryType, salaryMinVal, salaryMaxVal));
    }
  }, [salaryType, salaryMinVal, salaryMaxVal, annualSalaryManual]);

  useEffect(() => {
    if (!trialAnnualSalaryManual) {
      setTrialAnnualSalary(calcAnnualSalary(trialSalaryType, trialSalaryMinVal, trialSalaryMaxVal));
    }
  }, [trialSalaryType, trialSalaryMinVal, trialSalaryMaxVal, trialAnnualSalaryManual]);

  function toggleItem(list: string[], setList: (value: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]);
  }

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
      salaryMin: salaryMinVal,
      salaryMax: salaryMaxVal,
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
        const fullAddr = [address1, address2, address3].filter(Boolean).join("");
        setOfficeDetail((prev) => prev || fullAddr);
      }
    } catch {
      // ignore
    } finally {
      setPostalLoading(false);
    }
  }

  function readFormValues(form: HTMLFormElement) {
    setFormValues(
      Object.fromEntries(
        Array.from(new FormData(form).entries(), ([key, value]) => [key, typeof value === "string" ? value : ""]),
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    if (categoryTag === OTHER_CATEGORY_VALUE && !categoryTagDetail.trim()) {
      setValidationError("求人カテゴリの詳細を入力してください");
      return;
    }

    if (employmentType === "OTHER" && !employmentTypeDetail.trim()) {
      setValidationError("雇用形態の詳細を入力してください");
      return;
    }

    if (selectedRegion && !selectedLocation) {
      setValidationError("勤務地を選択してください");
      return;
    }

    const fd = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const submissionMode = (submitter?.dataset.mode as JobSubmissionMode | undefined) ?? "review";

    setPendingAction(submissionMode);

    try {
      await createJob(
        {
          title: fd.get("title") as string,
          description: fd.get("description") as string,
          employmentType,
          categoryTag,
          categoryTagDetail: categoryTag === OTHER_CATEGORY_VALUE ? categoryTagDetail : undefined,
          employmentTypeDetail: employmentType === "OTHER" ? employmentTypeDetail : undefined,
          region: selectedRegion,
          location: selectedLocation,
          requirements: fd.get("requirements") as string,
          desiredAptitude: fd.get("desiredAptitude") as string,
          recommendedFor: fd.get("recommendedFor") as string,
          access: fd.get("access") as string,
          officeDetail: fd.get("officeDetail") as string,
          selectionProcess: fd.get("selectionProcess") as string,
          imageUrl,
          tags: mergedTags,
          benefits: mergedBenefits,
          targetType,
          graduationYear: targetType === "NEW_GRAD" ? graduationYear : undefined,
          trainingInfo: trainingInfo || undefined,
          youthEmploymentStats: youthStats.some((s) => Object.values(s).slice(1).some(Boolean)) ? youthStats : undefined,
          smokingPolicyIndoor: smokingPolicyIndoor || undefined,
          smokingPolicyOutdoor: smokingPolicyOutdoor || undefined,
          smokingNote: smokingNote || undefined,
          recruitmentBackground: fd.get("recruitmentBackground") as string,
          salaryType,
          salaryMin: salaryMinVal ? Number(salaryMinVal) : undefined,
          salaryMax: salaryMaxVal ? Number(salaryMaxVal) : undefined,
          monthlySalary: annualSalaryText || undefined,
          salaryRevision: fd.get("salaryRevision") as string,
          bonus: salaryType !== "annual" ? fd.get("bonus") as string : undefined,
          hasFixedOvertime: hasFixedOvertime ?? undefined,
          fixedOvertime: hasFixedOvertime ? fd.get("fixedOvertime") as string : undefined,
          trialPeriodExists: trialPeriodExists ?? undefined,
          trialPeriodMonths: trialPeriodExists ? trialPeriodMonths : undefined,
          trialPeriod: trialPeriodExists ? fd.get("trialPeriod") as string : undefined,
          trialSalaryType: trialPeriodExists ? trialSalaryType : undefined,
          trialSalaryMin: trialPeriodExists && trialSalaryMinVal ? Number(trialSalaryMinVal) : undefined,
          trialSalaryMax: trialPeriodExists && trialSalaryMaxVal ? Number(trialSalaryMaxVal) : undefined,
          trialAnnualSalary: trialPeriodExists ? (trialAnnualSalary || undefined) : undefined,
          holidayType,
          holidayFeatures,
          annualHolidayCount: annualHolidayCount ? Number(annualHolidayCount) : undefined,
          holidayPolicy: fd.get("holidayPolicy") as string,
        },
        submissionMode,
      );

      router.push("/company/jobs");
    } finally {
      setPendingAction(null);
    }
  }

  const isSubmitting = pendingAction !== null;

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-8 md:px-6 md:py-10 xl:px-8 2xl:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-[30px] font-bold leading-none tracking-tight text-[#2c2f36] md:text-[34px]">
          求人を作成する
        </h1>
        <button
          type="button"
          onClick={() => {
            setShowPreview((prev) => !prev);
          }}
          className="inline-flex rounded-[10px] bg-[#1d63e3] px-6 py-3.5 text-[15px] font-bold text-white transition hover:opacity-90"
        >
          {isWidePreview ? (showPreview ? "プレビューを閉じる" : "プレビューを開く") : "プレビューを確認"}
        </button>
      </div>

      {validationError ? (
        <div className="mt-5 rounded-[10px] border border-[#ff5e7d] bg-[#fff5f7] px-4 py-3 text-[14px] text-[#ff3158]">
          {validationError}
        </div>
      ) : null}

      <div
        className={`mt-6 grid items-start gap-6 2xl:gap-8 ${
          showPreview && isWidePreview ? "2xl:grid-cols-[minmax(520px,0.78fr)_minmax(760px,1.22fr)]" : ""
        }`}
      >
        <form
          onSubmit={handleSubmit}
          onChange={(event) => readFormValues(event.currentTarget)}
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
                name="title"
                required
                className={inputCls}
                placeholder="例：Webエンジニア（フロントエンド）／営業職（法人向け）"
              />
            </Field>

            <Field label="メイン画像">
              <p className="mb-2 text-[13px] text-[#6b7280]">対応形式：jpg / png / webp（最大10MB）</p>
              <div className="rounded-[18px] border border-[#d9dfec] p-4">
                <ThumbnailUpload
                  name="imageUrl"
                  hint="推奨サイズ：横2 × 縦1（例：1600×800px）"
                  onUploaded={(url) => {
                    setImageUrl(url);
                  }}
                />
              </div>
            </Field>

            <Field label="求人カテゴリ">
              <select
                name="categoryTag"
                className={inputCls}
                value={categoryTag}
                onChange={(event) => {
                  setCategoryTag(event.target.value);
                  if (event.target.value !== OTHER_CATEGORY_VALUE) setCategoryTagDetail("");
                }}
              >
                <option value="">選択してください</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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

            <Field label="雇用形態" required>
              <select
                name="employmentType"
                required
                className={inputCls}
                value={employmentType}
                onChange={(event) => {
                  setEmploymentType(event.target.value);
                  if (event.target.value !== "OTHER") setEmploymentTypeDetail("");
                }}
              >
                {EMPLOYMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
              <div className="mb-2 flex items-center gap-2">
                {!description ? (
                  <button
                    type="button"
                    onClick={() => setDescription(DESCRIPTION_TEMPLATE)}
                    className="rounded-[5px] bg-[#1d63e3] px-[10px] py-[5px] text-[12px] font-bold text-white hover:opacity-90 transition"
                  >
                    テンプレートを使って素早く入力 →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { if (confirm("テンプレートで上書きしますか？")) setDescription(DESCRIPTION_TEMPLATE); }}
                    className="rounded-[8px] border border-[#d0d7e6] bg-[#f8fafd] px-3 py-1.5 text-[12px] text-[#7b8797] hover:bg-[#eef3fb] transition"
                  >
                    テンプレートに変更
                  </button>
                )}
              </div>
              <textarea
                name="description"
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={textareaCls}
                placeholder="例：営業企画・マーケティング施策の立案から実行まで担当していただきます。チームは少人数で、裁量を持って幅広い業務に携わることができます。"
              />
            </Field>
            <Field label="応募条件">
              <textarea name="requirements" rows={3} className={textareaCls} placeholder="例：営業経験3年以上、コミュニケーション能力が高い方、普通自動車免許をお持ちの方" />
            </Field>
            <Field label="求める人物像">
              <textarea name="desiredAptitude" rows={3} className={textareaCls} placeholder="例：主体的に動ける方、新しいことへの挑戦が好きな方、キャリアアップを目指したい方" />
            </Field>
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
            <Field label="郵便番号">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setPostalCode(val);
                    if (val.length === 7) handlePostalCode(val);
                  }}
                  className={`${inputCls} max-w-[180px]`}
                  placeholder="例：1500001"
                  maxLength={7}
                />
                {postalLoading && <span className="text-[13px] text-[#888]">検索中...</span>}
              </div>
              <p className="mt-1.5 text-[12px] text-[#7b8797]">7桁入力でエリア・都道府県を自動入力します</p>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="エリア">
                <select
                  name="region"
                  value={selectedRegion}
                  className={inputCls}
                  onChange={(event) => {
                    const nextRegion = event.target.value;
                    setSelectedRegion(nextRegion);
                    if (!(PREFECTURES_BY_AREA[nextRegion] ?? []).includes(selectedLocation)) {
                      setSelectedLocation("");
                    }
                  }}
                >
                  <option value="">選択してください</option>
                  {AREA_OPTIONS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="勤務地（都道府県）">
                <select
                  name="location"
                  value={selectedLocation}
                  className={inputCls}
                  onChange={(event) => {
                    const pref = event.target.value;
                    setSelectedLocation(pref);
                    if (pref && !selectedRegion) {
                      const area = Object.entries(PREFECTURES_BY_AREA).find(([, prefs]) => prefs.includes(pref))?.[0] ?? "";
                      if (area) setSelectedRegion(area);
                    }
                  }}
                >
                  <option value="">選択してください</option>
                  {availablePrefectures.map((prefecture) => (
                    <option key={prefecture} value={prefecture}>
                      {prefecture}
                    </option>
                  ))}
                </select>
                {!selectedRegion && <p className="mt-1 text-[12px] text-[#7b8797]">都道府県を選ぶとエリアが自動入力されます</p>}
              </Field>
            </div>

            <Field label="勤務地住所">
              <textarea
                name="officeDetail"
                rows={2}
                value={officeDetail}
                onChange={(e) => setOfficeDetail(e.target.value)}
                className={textareaCls}
                placeholder="例：渋谷スクランブルスクエア 12F / 千代田区丸の内1-1-1"
              />
            </Field>

            <Field label="最寄り・アクセス">
              <input name="access" className={inputCls} placeholder="例：JR渋谷駅 徒歩3分 / 地下鉄表参道駅 徒歩5分" />
            </Field>
          </Section>

          <Section title="給与">
            <Field label="給与タイプ" required>
              <div className="flex flex-wrap gap-4">
                {(["annual", "monthly", "daily", "hourly"] as const).map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-2 text-[14px]">
                    <input
                      type="radio"
                      name="salaryTypeRadio"
                      checked={salaryType === type}
                      onChange={() => { setSalaryType(type); setAnnualSalaryManual(false); }}
                      className="h-4 w-4 accent-[#1d63e3]"
                    />
                    {type === "monthly" ? "月給" : type === "annual" ? "年俸" : type === "daily" ? "日給" : "時給"}
                  </label>
                ))}
              </div>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={salaryType === "monthly" ? "月給（下限）" : salaryType === "annual" ? "年俸（下限）" : salaryType === "daily" ? "日給（下限）" : "時給（下限）"}>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={salaryMinVal}
                    onChange={(e) => setSalaryMinVal(e.target.value)}
                    className={inputCls}
                    placeholder={SALARY_PLACEHOLDER[salaryType]?.[0] ?? ""}
                  />
                  <span className="shrink-0 text-[13px] text-[#555]">円</span>
                </div>
              </Field>
              <Field label={salaryType === "monthly" ? "月給（上限）" : salaryType === "annual" ? "年俸（上限）" : salaryType === "daily" ? "日給（上限）" : "時給（上限）"}>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={salaryMaxVal}
                    onChange={(e) => setSalaryMaxVal(e.target.value)}
                    className={inputCls}
                    placeholder={SALARY_PLACEHOLDER[salaryType]?.[1] ?? ""}
                  />
                  <span className="shrink-0 text-[13px] text-[#555]">円</span>
                </div>
              </Field>
            </div>
            <Field label="想定年収（テキスト表記）">
              <input
                name="monthlySalary"
                value={annualSalaryText}
                onChange={(e) => { setAnnualSalaryText(e.target.value); setAnnualSalaryManual(true); }}
                className={inputCls}
                placeholder="例：400万円〜600万円（経験・スキルにより決定）"
              />
              {!annualSalaryManual && annualSalaryText && (
                <p className="mt-1 text-[12px] text-[#7b8797]">給与の下限・上限から自動計算されています</p>
              )}
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="昇給">
                <input name="salaryRevision" className={inputCls} placeholder="例：年1回（4月）" />
              </Field>
              {salaryType !== "annual" && (
                <Field label="賞与">
                  <input name="bonus" className={inputCls} placeholder="例：年2回（6月・12月）業績連動" />
                </Field>
              )}
            </div>
            <Field label="みなし残業制度">
              <div className="flex gap-6">
                {([true, false] as const).map((val) => (
                  <label key={String(val)} className="flex cursor-pointer items-center gap-2 text-[14px]">
                    <input
                      type="radio"
                      checked={hasFixedOvertime === val}
                      onChange={() => setHasFixedOvertime(val)}
                      className="h-4 w-4 accent-[#1d63e3]"
                    />
                    {val ? "あり" : "なし"}
                  </label>
                ))}
              </div>
            </Field>
            {hasFixedOvertime && (
              <Field label="みなし残業代の詳細">
                <input name="fixedOvertime" className={inputCls} placeholder="例：月30時間分・50,000円を含む（超過分別途支給）" />
              </Field>
            )}
          </Section>

          <Section title="試用期間">
            <Field label="試用期間">
              <div className="flex gap-4">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setTrialPeriodExists(val)}
                    className={`rounded-[10px] border px-5 py-2 text-[14px] font-medium transition ${
                      trialPeriodExists === val
                        ? "border-[#1d63e3] bg-[#eef2ff] text-[#1d63e3]"
                        : "border-[#ccc] bg-white text-[#333] hover:border-[#1d63e3]"
                    }`}
                  >
                    {val ? "あり" : "なし"}
                  </button>
                ))}
              </div>
            </Field>
            {trialPeriodExists && (
              <>
                <Field label="試用期間（月数）">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={trialPeriodMonths}
                      onChange={(e) => setTrialPeriodMonths(Number(e.target.value))}
                      className={`${inputCls} max-w-[100px]`}
                    />
                    <span className="text-[13px] text-[#555]">ヶ月</span>
                  </div>
                </Field>
                <Field label="試用期間中の給与タイプ">
                  <div className="flex flex-wrap gap-4">
                    {(["annual", "monthly", "daily", "hourly"] as const).map((type) => (
                      <label key={type} className="flex cursor-pointer items-center gap-2 text-[14px]">
                        <input
                          type="radio"
                          checked={trialSalaryType === type}
                          onChange={() => { setTrialSalaryType(type); setTrialAnnualSalaryManual(false); }}
                          className="h-4 w-4 accent-[#1d63e3]"
                        />
                        {type === "monthly" ? "月給" : type === "annual" ? "年俸" : type === "daily" ? "日給" : "時給"}
                      </label>
                    ))}
                  </div>
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={trialSalaryType === "monthly" ? "試用中の月給（下限）" : trialSalaryType === "annual" ? "試用中の年俸（下限）" : trialSalaryType === "daily" ? "試用中の日給（下限）" : "試用中の時給（下限）"}>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={trialSalaryMinVal}
                        onChange={(e) => setTrialSalaryMinVal(e.target.value)}
                        className={inputCls}
                        placeholder={SALARY_PLACEHOLDER[trialSalaryType]?.[0] ?? ""}
                      />
                      <span className="shrink-0 text-[13px] text-[#555]">円</span>
                    </div>
                  </Field>
                  <Field label={trialSalaryType === "monthly" ? "試用中の月給（上限）" : trialSalaryType === "annual" ? "試用中の年俸（上限）" : trialSalaryType === "daily" ? "試用中の日給（上限）" : "試用中の時給（上限）"}>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={trialSalaryMaxVal}
                        onChange={(e) => setTrialSalaryMaxVal(e.target.value)}
                        className={inputCls}
                        placeholder={SALARY_PLACEHOLDER[trialSalaryType]?.[1] ?? ""}
                      />
                      <span className="shrink-0 text-[13px] text-[#555]">円</span>
                    </div>
                  </Field>
                </div>
                <Field label="試用期間中の想定年収">
                  <input
                    value={trialAnnualSalary}
                    onChange={(e) => { setTrialAnnualSalary(e.target.value); setTrialAnnualSalaryManual(true); }}
                    className={inputCls}
                    placeholder="例：300万円〜400万円"
                  />
                  {!trialAnnualSalaryManual && trialAnnualSalary && (
                    <p className="mt-1 text-[12px] text-[#7b8797]">給与の下限・上限から自動計算されています</p>
                  )}
                </Field>
                <Field label="変更となる条件">
                  <textarea
                    name="trialPeriod"
                    rows={2}
                    className={textareaCls}
                    placeholder={`例：試用期間中は以下の条件が適用されます\n・社会保険：加入（同条件）\n・退職金：対象外`}
                  />
                </Field>
              </>
            )}
          </Section>

          <Section title="休日休暇">
            <Field label="休みの取り方" required>
              <select
                value={holidayType}
                onChange={(e) => setHolidayType(e.target.value)}
                className={inputCls}
              >
                <option value="">選択してください</option>
                {["完全週休2日制", "週休2日制（月1〜2回土曜出勤）", "週休2日制（その他）", "週休制（週1日）", "勤務▲休制", "週▲休制"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </Field>
            <Field label="年間休日">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={annualHolidayCount}
                  onChange={(e) => setAnnualHolidayCount(e.target.value)}
                  className={`${inputCls} max-w-[120px]`}
                  placeholder="120"
                />
                <span className="text-[13px] text-[#555]">日</span>
              </div>
            </Field>
            <Field label="休日休暇の特徴">
              <div className="flex flex-wrap gap-2">
                {["年間休日120日以上", "夏季休暇", "年末年始休暇"].map((feat) => (
                  <label key={feat} className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[#e6ebf5] px-3 py-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={holidayFeatures.includes(feat)}
                      onChange={() => setHolidayFeatures((prev) =>
                        prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
                      )}
                      className="h-4 w-4 accent-[#1d63e3]"
                    />
                    {feat}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="休日休暇の詳細">
              <textarea
                name="holidayPolicy"
                rows={3}
                className={textareaCls}
                placeholder="例：◇出産・育児休暇&#10;◇慶弔休暇&#10;◇有給休暇（入社半年後10日付与）"
              />
            </Field>
          </Section>

          <Section title="選考情報">
            <Field label="募集背景">
              <textarea
                name="recruitmentBackground"
                rows={2}
                className={textareaCls}
                placeholder="例：事業拡大に伴い、既存顧客対応と新規開拓を強化するため増員募集します。"
              />
            </Field>
            <Field label="選考フロー">
              <div className="mb-2 flex items-center gap-2">
                {!selectionProcess ? (
                  <button
                    type="button"
                    onClick={() => setSelectionProcess(SELECTION_PROCESS_TEMPLATE)}
                    className="rounded-[5px] bg-[#1d63e3] px-[10px] py-[5px] text-[12px] font-bold text-white hover:opacity-90 transition"
                  >
                    テンプレートを使って素早く入力 →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { if (confirm("テンプレートで上書きしますか？")) setSelectionProcess(SELECTION_PROCESS_TEMPLATE); }}
                    className="rounded-[8px] border border-[#d0d7e6] bg-[#f8fafd] px-3 py-1.5 text-[12px] text-[#7b8797] hover:bg-[#eef3fb] transition"
                  >
                    テンプレートに変更
                  </button>
                )}
              </div>
              <textarea
                name="selectionProcess"
                rows={3}
                value={selectionProcess}
                onChange={(e) => setSelectionProcess(e.target.value)}
                className={textareaCls}
                placeholder="例：書類選考 → 一次面接（オンライン可） → 最終面接 → 内定&#10;※選考期間の目安：1〜2週間程度"
              />
            </Field>
          </Section>

          <Section title="福利厚生">
            <Field label="福利厚生">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {SHARED_BENEFIT_OPTIONS.map((benefit) => (
                  <label
                    key={benefit}
                    className="flex items-center gap-2 rounded-[12px] border border-[#e6ebf5] px-3 py-2 text-[13px] text-[#445063]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBenefits.includes(benefit)}
                      onChange={() => toggleItem(selectedBenefits, setSelectedBenefits, benefit)}
                      className="h-4 w-4 rounded border-[#c4cddd] text-[#1d63e3]"
                    />
                    {benefit}
                  </label>
                ))}
              </div>
              <textarea
                value={customBenefits}
                onChange={(event) => setCustomBenefits(event.target.value)}
                className={`${textareaCls} mt-3`}
                rows={2}
                placeholder="独自の福利厚生（例：ランチ補助、書籍購入補助）カンマ・改行区切り"
              />
            </Field>
          </Section>

          <Section title="詳細情報（任意）">
            <Field label="青少年雇用情報（若者雇用促進法）">
              <p className="mb-3 text-[12px] text-[#6b7280]">任意。新卒採用がある場合は入力を推奨します。</p>
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
                        { key: "births", label: "出産者数" },
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
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="屋内の受動喫煙対策">
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
              <Field label="屋外の受動喫煙対策">
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

          <div className="flex flex-wrap gap-3 pt-8">
            <button
              type="submit"
              data-mode="review"
              disabled={isSubmitting}
              className="rounded-[10px] bg-[#1d63e3] px-8 py-3.5 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {pendingAction === "review" ? "送信中..." : "審査に提出"}
            </button>
            <button
              type="submit"
              data-mode="draft"
              disabled={isSubmitting}
              className="rounded-[10px] border border-[#ccc] bg-white px-8 py-3.5 text-[15px] font-bold text-[#1d63e3] transition hover:bg-[#f7faff] disabled:opacity-50"
            >
              {pendingAction === "draft" ? "保存中..." : "下書き保存"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-[10px] border border-[#d6dde9] bg-white px-8 py-3.5 text-[15px] font-medium text-[#5b6472] transition hover:bg-[#f6f8fb]"
            >
              キャンセル
            </button>
          </div>
        </form>

        {showPreview && isWidePreview ? (
          <aside className="hidden self-start 2xl:block">
            <div className="sticky top-6 rounded-[24px] bg-white p-5 shadow-[0_2px_12px_rgba(27,52,90,0.06)]">
              <div className="max-h-[calc(100vh-72px)] overflow-y-auto">
                <JobPreview data={previewData} />
              </div>
            </div>
          </aside>
        ) : null}
      </div>
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
    </div>
  );
}

const inputCls =
  "w-full rounded-[5px] border border-[#ccc] bg-[#fafafa] px-[10px] py-[5px] text-[14px] text-[#333] outline-none transition placeholder:text-[#ccc] focus:border-[#1d63e3]";

const textareaCls = `${inputCls} min-h-[100px] resize-y`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#ccc] pb-5 last:border-b-0 last:pb-0">
      <h2 className="mb-3 text-[20px] font-semibold leading-[1.2] tracking-[-0.4px] text-[#1d63e3]">{title}</h2>
      <div className="space-y-[10px]">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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
