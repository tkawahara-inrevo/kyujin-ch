"use client";

import { isValidElement, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteJob, updateJob, withdrawJobSubmission, type JobSubmissionMode } from "@/app/actions/company/jobs";
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

const EMPLOYMENT_PERIOD_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "indefinite", label: "期間の定めなし" },
  { value: "fixed", label: "期間の定めあり" },
  { value: "trial", label: "試用期間あり" },
];

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
      description: formValues.description ?? "",
      requirements: formValues.requirements ?? "",
      desiredAptitude: formValues.desiredAptitude ?? "",
      recommendedFor: formValues.recommendedFor ?? "",
      location: selectedLocation,
      region: selectedRegion,
      officeDetail: formValues.officeDetail ?? "",
      access: formValues.access ?? "",
      salaryMin: formValues.salaryMin ?? "",
      salaryMax: formValues.salaryMax ?? "",
      monthlySalary: formValues.monthlySalary ?? "",
      annualSalary: formValues.annualSalary ?? "",
      workingHours: formValues.workingHours ?? "",
      selectionProcess: formValues.selectionProcess ?? "",
      employmentPeriodType,
      tags: mergedTags,
      benefits: mergedBenefits,
      targetType,
      graduationYear,
    }),
    [
      formValues,
      imageUrl,
      categoryTag,
      categoryTagDetail,
      employmentType,
      employmentTypeDetail,
      selectedLocation,
      selectedRegion,
      employmentPeriodType,
      mergedTags,
      mergedBenefits,
      targetType,
      graduationYear,
    ],
  );

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
          closingDate: fd.get("closingDate") as string,
          employmentPeriodType,
          region: selectedRegion,
          categoryTagDetail: categoryTag === OTHER_CATEGORY_VALUE ? categoryTagDetail : undefined,
          employmentTypeDetail: employmentType === "OTHER" ? employmentTypeDetail : undefined,
          targetType,
          graduationYear: targetType === "NEW_GRAD" ? graduationYear : undefined,
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
          className={`rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(27,52,90,0.06)] md:p-8 ${
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
              <input name="title" required defaultValue={job.title} className={inputCls} />
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

            <Field label="掲載終了日">
              <input name="closingDate" type="date" defaultValue={closingDateStr} className={inputCls} />
            </Field>
          </Section>

          <Section title="仕事内容">
            <Field label="仕事内容" required>
              <textarea name="description" required rows={6} defaultValue={job.description} className={textareaCls} />
            </Field>
            <Field label="応募条件">
              <textarea name="requirements" rows={4} defaultValue={job.requirements ?? ""} className={textareaCls} />
            </Field>
            <Field label="向いている人">
              <textarea name="desiredAptitude" rows={4} defaultValue={job.desiredAptitude ?? ""} className={textareaCls} />
            </Field>
            <Field label="おすすめの人">
              <textarea name="recommendedFor" rows={4} defaultValue={job.recommendedFor ?? ""} className={textareaCls} />
            </Field>
          </Section>

          <Section title="勤務地">
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

              <Field label="勤務地">
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
                rows={3}
                defaultValue={workAddress}
                className={textareaCls}
                placeholder="例：渋谷スクランブルスクエア 12F / 千代田区丸の内1-1-1"
              />
            </Field>

            <Field label="勤務地詳細">
              <input type="hidden" name="officeName" value="" />
            </Field>

            <Field label="最寄り・アクセス">
              <input name="access" defaultValue={job.access ?? ""} className={inputCls} />
            </Field>
          </Section>

          <Section title="給与">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="最低年収（万円）">
                <input name="salaryMin" type="number" defaultValue={job.salaryMin ?? ""} className={inputCls} />
              </Field>
              <Field label="最高年収（万円）">
                <input name="salaryMax" type="number" defaultValue={job.salaryMax ?? ""} className={inputCls} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="月給表記">
                <input name="monthlySalary" defaultValue={job.monthlySalary ?? ""} className={inputCls} />
              </Field>
              <Field label="年収表記">
                <input name="annualSalary" defaultValue={job.annualSalary ?? ""} className={inputCls} />
              </Field>
            </div>
          </Section>

          <Section title="勤務条件">
            <Field label="勤務時間">
              <input name="workingHours" defaultValue={job.workingHours ?? ""} className={inputCls} />
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
            <Field label="選考フロー">
              <textarea
                name="selectionProcess"
                rows={4}
                defaultValue={job.selectionProcess ?? ""}
                className={textareaCls}
              />
            </Field>
          </Section>

          <Section title="求人タグ">
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
            <Field label="独自の求人タグ">
              <textarea
                value={customTags}
                onChange={(event) => setCustomTags(event.target.value)}
                className={textareaCls}
                rows={3}
                placeholder="例：海外出張あり、インセンティブあり"
              />
              <p className="mt-2 text-[12px] text-[#7b8797]">カンマ区切り、読点、改行で複数入力できます</p>
            </Field>
          </Section>

          <Section title="福利厚生">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
            <Field label="独自の福利厚生">
              <textarea
                value={customBenefits}
                onChange={(event) => setCustomBenefits(event.target.value)}
                className={textareaCls}
                rows={3}
                placeholder="例：ランチ補助、書籍購入補助、社内バー"
              />
              <p className="mt-2 text-[12px] text-[#7b8797]">カンマ区切り、読点、改行で複数入力できます</p>
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
  "w-full rounded-[12px] border border-[#d9dfec] bg-white px-4 py-3 text-[14px] text-[#2b2f38] outline-none transition placeholder:text-[#b2bac8] focus:border-[#2f6cff]";

const textareaCls = `${inputCls} min-h-[120px] resize-y`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#e8edf5] pb-8 last:border-b-0 last:pb-0">
      <h2 className="mb-5 text-[18px] font-bold text-[#2f6cff]">{title}</h2>
      <div className="space-y-5">{children}</div>
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

