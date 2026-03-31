"use client";

import { isValidElement, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteJob, updateJob, withdrawJobSubmission, type JobSubmissionMode, type YouthYearStats } from "@/app/actions/company/jobs";
import { JobPreview, type JobPreviewData } from "@/components/job-preview";
import { ThumbnailUpload } from "@/components/thumbnail-upload";
import { getActiveGraduationYears, graduationYearLabel } from "@/lib/graduation-years";
import { AREA_OPTIONS, PREFECTURES_BY_AREA } from "@/lib/job-locations";
import {
  BENEFIT_OPTIONS as SHARED_BENEFIT_OPTIONS,
  CATEGORY_OPTIONS,
  EMPLOYMENT_OPTIONS,
  OTHER_CATEGORY_VALUE,
} from "@/lib/job-options";
import { JOB_REVIEW_STATUS_BADGE_CLASSES, JOB_REVIEW_STATUS_LABELS } from "@/lib/job-review";

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

const EMPLOYMENT_PERIOD_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "indefinite", label: "期間の定めなし" },
  { value: "fixed", label: "期間の定めあり" },
  { value: "trial", label: "試用期間あり" },
];

const DESCRIPTION_TEMPLATE = `【主な業務内容】
・

【職場環境】


【入社後の流れ】
入社後はOJTにて業務を覚えていただきます。`;

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
  trialPeriod?: string | null;
  fixedOvertime?: string | null;
  salaryRevision?: string | null;
  interviewCount?: string | null;
  selectionDuration?: string | null;
  joinTiming?: string | null;
};

export function JobEditForm({
  job,
  hasPublishedVersion,
  hasPendingVersion,
}: {
  job: Job;
  hasPublishedVersion: boolean;
  hasPendingVersion: boolean;
}) {
  const router = useRouter();
  const [currentReviewStatus, setCurrentReviewStatus] = useState(job.reviewStatus);
  const benefitOptions = SHARED_BENEFIT_OPTIONS as readonly string[];
  const [pendingAction, setPendingAction] = useState<"review" | "draft" | "withdraw" | "delete" | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isWidePreview, setIsWidePreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(job.tags.filter((tag) => TAG_OPTIONS.includes(tag)));
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    job.benefits.filter((benefit) => benefitOptions.includes(benefit)),
  );
  const [customTags, setCustomTags] = useState(job.tags.filter((tag) => !TAG_OPTIONS.includes(tag)).join("、"));
  const [customBenefits, setCustomBenefits] = useState(
    job.benefits.filter((benefit) => !benefitOptions.includes(benefit)).join("、"),
  );
  const gradYears = getActiveGraduationYears();
  const [targetType, setTargetType] = useState(job.targetType || "MID_CAREER");
  const [graduationYear, setGraduationYear] = useState(job.graduationYear || gradYears[0]);
  const [imageUrl, setImageUrl] = useState(job.imageUrl || "");
  const [categoryTag, setCategoryTag] = useState(job.categoryTag || "");
  const [categoryTagDetail, setCategoryTagDetail] = useState(job.categoryTagDetail || "");
  const [employmentType, setEmploymentType] = useState(job.employmentType || "FULL_TIME");
  const [employmentTypeDetail, setEmploymentTypeDetail] = useState(job.employmentTypeDetail || "");
  const [employmentPeriodType, setEmploymentPeriodType] = useState(job.employmentPeriodType || "");
  const [selectedRegion, setSelectedRegion] = useState(job.region || "");
  const [selectedLocation, setSelectedLocation] = useState(job.location || "");
  const workAddress = [job.officeDetail, job.officeName].find((value) => value && value.trim()) ?? "";
  const [description, setDescription] = useState(job.description);
  const [selectionProcess, setSelectionProcess] = useState(job.selectionProcess ?? "");
  const [officeDetail, setOfficeDetail] = useState(workAddress);
  const [postalCode, setPostalCode] = useState("");
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
  const [formValues, setFormValues] = useState<Record<string, string>>({
    title: job.title,
    description: job.description,
    requirements: job.requirements ?? "",
    desiredAptitude: job.desiredAptitude ?? "",
    recommendedFor: job.recommendedFor ?? "",
    officeDetail: workAddress,
    access: job.access ?? "",
    salaryMin: job.salaryMin ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax ? String(job.salaryMax) : "",
    monthlySalary: job.monthlySalary ?? "",
    annualSalary: job.annualSalary ?? "",
    workingHours: job.workingHours ?? "",
    selectionProcess: job.selectionProcess ?? "",
    closingDate: job.closingDate ? new Date(job.closingDate).toISOString().split("T")[0] : "",
    recruitmentBackground: job.recruitmentBackground ?? "",
    positionMission: job.positionMission ?? "",
    holidayPolicy: job.holidayPolicy ?? "",
    trialPeriod: job.trialPeriod ?? "",
    fixedOvertime: job.fixedOvertime ?? "",
    salaryRevision: job.salaryRevision ?? "",
    interviewCount: job.interviewCount ?? "",
    selectionDuration: job.selectionDuration ?? "",
    joinTiming: job.joinTiming ?? "",
  });
  const availablePrefectures = selectedRegion ? PREFECTURES_BY_AREA[selectedRegion] ?? [] : [];

  const parsedCustomTags = customTags
    .split(/[\n,、]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const parsedCustomBenefits = customBenefits
    .split(/[\n,、]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const mergedTags = Array.from(new Set([...selectedTags, ...parsedCustomTags]));
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
      salaryMin: formValues.salaryMin ?? "",
      salaryMax: formValues.salaryMax ?? "",
      monthlySalary: formValues.monthlySalary ?? "",
      annualSalary: formValues.annualSalary ?? "",
      workingHours: formValues.workingHours ?? "",
      selectionProcess,
      employmentPeriodType,
      tags: mergedTags,
      benefits: mergedBenefits,
      targetType,
      graduationYear,
      recruitmentBackground: formValues.recruitmentBackground ?? "",
      positionMission: formValues.positionMission ?? "",
      holidayPolicy: formValues.holidayPolicy ?? "",
      trialPeriod: formValues.trialPeriod ?? "",
      fixedOvertime: formValues.fixedOvertime ?? "",
      salaryRevision: formValues.salaryRevision ?? "",
      interviewCount: formValues.interviewCount ?? "",
      selectionDuration: formValues.selectionDuration ?? "",
      joinTiming: formValues.joinTiming ?? "",
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
      setValidationError("カテゴリ「その他」の詳細を入力してください");
      return;
    }

    if (employmentType === "OTHER" && !employmentTypeDetail.trim()) {
      setValidationError("雇用形態「その他」の詳細を入力してください");
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
      await updateJob(
        job.id,
        {
          title: fd.get("title") as string,
          description: fd.get("description") as string,
          employmentType,
          location: selectedLocation,
          salaryMin: fd.get("salaryMin") ? Number(fd.get("salaryMin")) : undefined,
          salaryMax: fd.get("salaryMax") ? Number(fd.get("salaryMax")) : undefined,
          categoryTag,
          tags: mergedTags,
          imageUrl,
          requirements: fd.get("requirements") as string,
          desiredAptitude: fd.get("desiredAptitude") as string,
          recommendedFor: fd.get("recommendedFor") as string,
          monthlySalary: fd.get("monthlySalary") as string,
          annualSalary: fd.get("annualSalary") as string,
          access: fd.get("access") as string,
          officeDetail: fd.get("officeDetail") as string,
          benefits: mergedBenefits,
          selectionProcess: fd.get("selectionProcess") as string,
          workingHours: fd.get("workingHours") as string,
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
          positionMission: fd.get("positionMission") as string,
          holidayPolicy: fd.get("holidayPolicy") as string,
          trialPeriod: fd.get("trialPeriod") as string,
          fixedOvertime: fd.get("fixedOvertime") as string,
          salaryRevision: fd.get("salaryRevision") as string,
          interviewCount: fd.get("interviewCount") as string,
          selectionDuration: fd.get("selectionDuration") as string,
          joinTiming: fd.get("joinTiming") as string,
        },
        submissionMode,
      );

      router.push("/company/jobs");
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

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${JOB_REVIEW_STATUS_BADGE_CLASSES[currentReviewStatus]}`}>
          {JOB_REVIEW_STATUS_LABELS[currentReviewStatus]}
        </span>
        {job.reviewComment ? <span className="text-[13px] text-[#a16207]">差し戻しコメント: {job.reviewComment}</span> : null}
        {hasPendingVersion ? (
          <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[12px] font-bold text-[#2563eb]">差し替え審査データあり</span>
        ) : null}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setShowPreview((prev) => !prev);
          }}
          className="inline-flex rounded-[14px] bg-[#2f6cff] px-6 py-3.5 text-[15px] font-bold text-white transition hover:opacity-90"
        >
          {isWidePreview ? (showPreview ? "プレビューを閉じる" : "プレビューを開く") : "プレビューを確認"}
        </button>
      </div>

      {validationError ? (
        <div className="mt-5 rounded-[14px] border border-[#ff5e7d] bg-[#fff5f7] px-4 py-3 text-[14px] text-[#ff3158]">
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
          onSubmit={handleSubmit}
          onChange={(event) => readFormValues(event.currentTarget)}
          className={`rounded-[24px] bg-white p-5 shadow-[0_2px_12px_rgba(27,52,90,0.06)] md:p-6 ${
            showPreview && isWidePreview ? "" : "max-w-[1120px]"
          }`}
        >
          <Section title="基本情報">
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

            <Field label="タイトル" required>
              <input name="title" required defaultValue={job.title} className={inputCls} placeholder="例：Webエンジニア（フロントエンド）／営業職（法人向け）" />
            </Field>

            <Field label="ターゲット" required>
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
          </Section>

          <Section title="仕事内容">
            <Field label="仕事内容" required>
              <div className="mb-2 flex items-center gap-2">
                {!description ? (
                  <button
                    type="button"
                    onClick={() => setDescription(DESCRIPTION_TEMPLATE)}
                    className="rounded-[10px] border border-[#2f6cff] bg-[#eef4ff] px-4 py-2 text-[13px] font-bold text-[#2f6cff] hover:bg-[#dde9ff] transition"
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
              <textarea name="requirements" rows={3} defaultValue={job.requirements ?? ""} className={textareaCls} placeholder="例：営業経験3年以上、コミュニケーション能力が高い方、普通自動車免許をお持ちの方" />
            </Field>
            <Field label="求める人物像">
              <textarea name="desiredAptitude" rows={3} defaultValue={job.desiredAptitude ?? ""} className={textareaCls} placeholder="例：主体的に動ける方、新しいことへの挑戦が好きな方、キャリアアップを目指したい方" />
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
                  onChange={(event) => setSelectedLocation(event.target.value)}
                  disabled={!selectedRegion}
                >
                  <option value="">選択してください</option>
                  {availablePrefectures.map((prefecture) => (
                    <option key={prefecture} value={prefecture}>
                      {prefecture}
                    </option>
                  ))}
                </select>
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
              <input name="access" defaultValue={job.access ?? ""} className={inputCls} placeholder="例：JR渋谷駅 徒歩3分 / 地下鉄表参道駅 徒歩5分" />
            </Field>
          </Section>

          <Section title="給与・勤務条件">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="最低年収（万円）">
                <input name="salaryMin" type="number" defaultValue={job.salaryMin ?? ""} className={inputCls} placeholder="例：300" />
              </Field>
              <Field label="最高年収（万円）">
                <input name="salaryMax" type="number" defaultValue={job.salaryMax ?? ""} className={inputCls} placeholder="例：500" />
              </Field>
            </div>
            <Field label="給与詳細">
              <input name="monthlySalary" defaultValue={job.monthlySalary ?? ""} className={inputCls} placeholder="例：月給25万円〜40万円 / 年収400万円〜600万円" />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="勤務時間">
                <input name="workingHours" defaultValue={job.workingHours ?? ""} className={inputCls} placeholder="例：9:00〜18:00（休憩60分）" />
              </Field>
              <Field label="雇用期間">
                <select
                  name="employmentPeriodType"
                  value={employmentPeriodType}
                  onChange={(event) => setEmploymentPeriodType(event.target.value)}
                  className={inputCls}
                >
                  {EMPLOYMENT_PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="休日・休暇">
              <input
                name="holidayPolicy"
                defaultValue={job.holidayPolicy ?? ""}
                className={inputCls}
                placeholder="例：完全週休2日制（土日祝）、年間休日120日、有給休暇（入社半年後10日付与）"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="試用期間">
                <input name="trialPeriod" defaultValue={job.trialPeriod ?? ""} className={inputCls} placeholder="例：3ヶ月（条件変更なし）" />
              </Field>
              <Field label="固定残業代">
                <input name="fixedOvertime" defaultValue={job.fixedOvertime ?? ""} className={inputCls} placeholder="例：月30h分・5万円含む" />
              </Field>
              <Field label="昇給・賞与">
                <input name="salaryRevision" defaultValue={job.salaryRevision ?? ""} className={inputCls} placeholder="例：昇給年1回、賞与年2回" />
              </Field>
            </div>
          </Section>

          <Section title="選考情報">
            <Field label="募集背景">
              <textarea
                name="recruitmentBackground"
                rows={2}
                defaultValue={job.recruitmentBackground ?? ""}
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
                    className="rounded-[10px] border border-[#2f6cff] bg-[#eef4ff] px-4 py-2 text-[13px] font-bold text-[#2f6cff] hover:bg-[#dde9ff] transition"
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
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="面接回数・方法">
                <input name="interviewCount" defaultValue={job.interviewCount ?? ""} className={inputCls} placeholder="例：2回（一次オンライン可）" />
              </Field>
              <Field label="選考期間の目安">
                <input name="selectionDuration" defaultValue={job.selectionDuration ?? ""} className={inputCls} placeholder="例：応募から2週間程度" />
              </Field>
              <Field label="入社時期">
                <input name="joinTiming" defaultValue={job.joinTiming ?? ""} className={inputCls} placeholder="例：即日〜3ヶ月以内" />
              </Field>
            </div>
          </Section>

          <Section title="タグ・福利厚生">
            <Field label="求人タグ">
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <label
                    key={tag}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                      selectedTags.includes(tag)
                        ? "border-[#2f6cff] bg-[#eef4ff] text-[#2f6cff]"
                        : "border-[#d7dce6] bg-white text-[#5f6977] hover:border-[#9fb6ff]"
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
              <textarea
                value={customTags}
                onChange={(event) => setCustomTags(event.target.value)}
                className={`${textareaCls} mt-3`}
                rows={2}
                placeholder="独自タグ（例：海外出張あり、インセンティブあり）カンマ・改行区切り"
              />
            </Field>
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
                      className="h-4 w-4 rounded border-[#c4cddd] text-[#2f6cff]"
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
                              className="w-full rounded-[8px] border border-[#d9dfec] px-2 py-1.5 text-[13px] outline-none focus:border-[#2f6cff] placeholder:text-[#c0c8d8]"
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

          <div className="flex flex-wrap items-center gap-3 pt-8">
            {!canWithdraw ? (
              <button
                type="submit"
                data-mode="review"
                disabled={isSubmitting}
                className="rounded-[14px] bg-[#2f6cff] px-8 py-3.5 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {pendingAction === "review" ? "送信中..." : "審査に提出"}
              </button>
            ) : null}
            {!canWithdraw ? (
              <button
                type="submit"
                data-mode="draft"
                disabled={isSubmitting}
                className="rounded-[14px] border border-[#c8d6f6] bg-white px-8 py-3.5 text-[15px] font-bold text-[#2f6cff] transition hover:bg-[#f7faff] disabled:opacity-50"
              >
                {pendingAction === "draft" ? "保存中..." : "下書き保存"}
              </button>
            ) : null}
            {canWithdraw ? (
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isSubmitting}
                className="rounded-[14px] border border-[#f5c36b] bg-[#fff8ea] px-6 py-3.5 text-[15px] font-bold text-[#b7791f] transition hover:bg-[#fff3d8] disabled:opacity-50"
              >
                {pendingAction === "withdraw" ? "取り下げ中..." : "審査を取り下げる"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-[14px] border border-[#d6dde9] bg-white px-8 py-3.5 text-[15px] font-medium text-[#5b6472] transition hover:bg-[#f6f8fb]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="ml-auto rounded-[14px] border border-[#ff3158] px-6 py-3.5 text-[15px] font-bold text-[#ff3158] transition hover:bg-[#fff5f7] disabled:opacity-50"
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
  "w-full rounded-[10px] border border-[#d9dfec] bg-white px-3 py-2.5 text-[14px] text-[#2b2f38] outline-none transition placeholder:text-[#c0c8d8] focus:border-[#2f6cff]";

const textareaCls = `${inputCls} min-h-[90px] resize-y`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#e8edf5] pb-6 last:border-b-0 last:pb-0">
      <h2 className="mb-4 text-[16px] font-bold text-[#2f6cff]">{title}</h2>
      <div className="space-y-4">{children}</div>
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
      <label className="mb-2 block text-[15px] font-semibold text-[#3d4552]">
        {label === "勤務地名称" ? "勤務地住所" : label === "勤務地詳細" ? "勤務地補足" : label}
        {required ? <span className="ml-1 text-[#ff3158]">必須</span> : null}
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
      className={`rounded-[10px] border px-5 py-3 text-[15px] font-semibold transition ${
        active ? "border-[#2f6cff] bg-[#eef4ff] text-[#2f6cff]" : "border-[#d7dce6] bg-white text-[#5f6977]"
      }`}
    >
      {children}
    </button>
  );
}
