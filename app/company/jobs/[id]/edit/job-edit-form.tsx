"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteJob, updateJob, withdrawJobSubmission, type JobSubmissionMode } from "@/app/actions/company/jobs";
import { JobPreview } from "@/components/job-preview";
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
  "駅チカ",
  "交通費支給",
  "大手企業",
  "ベンチャー",
  "中途採用",
  "副業OK",
  "土日祝休み",
];

const EMPLOYMENT_PERIOD_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "indefinite", label: "期間の定めなし" },
  { value: "fixed", label: "有期雇用" },
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
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(job.tags);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(job.benefits);
  const gradYears = getActiveGraduationYears();
  const [targetType, setTargetType] = useState(job.targetType || "MID_CAREER");
  const [graduationYear, setGraduationYear] = useState(job.graduationYear || gradYears[0]);
  const [imageUrl, setImageUrl] = useState(job.imageUrl || "");
  const [categoryTag, setCategoryTag] = useState(job.categoryTag || "");
  const [categoryTagDetail, setCategoryTagDetail] = useState(job.categoryTagDetail || "");
  const [employmentType, setEmploymentType] = useState(job.employmentType || "FULL_TIME");
  const [employmentTypeDetail, setEmploymentTypeDetail] = useState(job.employmentTypeDetail || "");
  const [selectedRegion, setSelectedRegion] = useState(job.region || "");
  const [selectedLocation, setSelectedLocation] = useState(job.location || "");
  const availablePrefectures = selectedRegion ? PREFECTURES_BY_AREA[selectedRegion] ?? [] : [];

  function toggleItem(list: string[], setList: (value: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]);
  }

  const getPreviewData = useCallback(() => {
    const fd = formRef.current ? new FormData(formRef.current) : null;
    return {
      title: (fd?.get("title") as string) || "",
      imageUrl,
      categoryTag,
      categoryTagDetail,
      employmentType,
      employmentTypeDetail,
      description: (fd?.get("description") as string) || "",
      requirements: (fd?.get("requirements") as string) || "",
      desiredAptitude: (fd?.get("desiredAptitude") as string) || "",
      recommendedFor: (fd?.get("recommendedFor") as string) || "",
      location: selectedLocation,
      region: selectedRegion,
      officeName: (fd?.get("officeName") as string) || "",
      officeDetail: (fd?.get("officeDetail") as string) || "",
      access: (fd?.get("access") as string) || "",
      salaryMin: (fd?.get("salaryMin") as string) || "",
      salaryMax: (fd?.get("salaryMax") as string) || "",
      monthlySalary: (fd?.get("monthlySalary") as string) || "",
      annualSalary: (fd?.get("annualSalary") as string) || "",
      workingHours: (fd?.get("workingHours") as string) || "",
      selectionProcess: (fd?.get("selectionProcess") as string) || "",
      tags: selectedTags,
      benefits: selectedBenefits,
    };
  }, [
    imageUrl,
    categoryTag,
    categoryTagDetail,
    employmentType,
    employmentTypeDetail,
    selectedLocation,
    selectedRegion,
    selectedTags,
    selectedBenefits,
  ]);

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
      setValidationError("都道府県を選択してください");
      return;
    }

    setLoading(true);
    const fd = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const submissionMode = (submitter?.dataset.mode as JobSubmissionMode | undefined) ?? "review";

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
        tags: selectedTags,
        imageUrl,
        requirements: fd.get("requirements") as string,
        desiredAptitude: fd.get("desiredAptitude") as string,
        recommendedFor: fd.get("recommendedFor") as string,
        monthlySalary: fd.get("monthlySalary") as string,
        annualSalary: fd.get("annualSalary") as string,
        access: fd.get("access") as string,
        officeName: fd.get("officeName") as string,
        officeDetail: fd.get("officeDetail") as string,
        benefits: selectedBenefits,
        selectionProcess: fd.get("selectionProcess") as string,
        workingHours: fd.get("workingHours") as string,
        closingDate: fd.get("closingDate") as string,
        employmentPeriodType: fd.get("employmentPeriodType") as string,
        region: selectedRegion,
        categoryTagDetail: categoryTag === OTHER_CATEGORY_VALUE ? categoryTagDetail : undefined,
        employmentTypeDetail: employmentType === "OTHER" ? employmentTypeDetail : undefined,
        targetType,
        graduationYear: targetType === "NEW_GRAD" ? graduationYear : undefined,
      },
      submissionMode,
    );

    router.push("/company/jobs");
  }

  async function handleDelete() {
    if (!confirm("この求人を削除しますか？")) return;
    setLoading(true);
    await deleteJob(job.id);
    router.push("/company/jobs");
  }

  async function handleWithdraw() {
    if (!confirm("審査申請を取り下げますか？")) return;
    setLoading(true);
    await withdrawJobSubmission(job.id);
    router.refresh();
    setLoading(false);
  }

  const closingDateStr = job.closingDate ? new Date(job.closingDate).toISOString().split("T")[0] : "";

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${JOB_REVIEW_STATUS_BADGE_CLASSES[job.reviewStatus]}`}>
          {JOB_REVIEW_STATUS_LABELS[job.reviewStatus]}
        </span>
        {job.reviewComment ? <span className="text-[13px] text-[#a16207]">差し戻しコメント: {job.reviewComment}</span> : null}
        {hasPendingVersion ? (
          <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[12px] font-bold text-[#2563eb]">差し替え申請データあり</span>
        ) : null}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setShowPreview((prev) => !prev);
            setPreviewKey((prev) => prev + 1);
          }}
          className="hidden items-center gap-2 rounded-[8px] border border-[#2f6cff] px-4 py-2 text-[13px] font-semibold text-[#2f6cff] transition hover:bg-[#2f6cff]/5 lg:flex"
        >
          {showPreview ? "プレビューを閉じる" : "プレビュー"}
        </button>
      </div>

      {validationError ? (
        <div className="mt-4 rounded-[8px] border border-[#ff3158] bg-[#fff5f7] px-4 py-3 text-[14px] text-[#ff3158]">
          {validationError}
        </div>
      ) : null}

      {hasPublishedVersion ? (
        <div className="mt-4 rounded-[12px] border border-[#dbe4ff] bg-[#f4f7ff] px-4 py-4 text-[13px] leading-[1.8] text-[#587199]">
          公開中の求人を編集して審査に提出すると、現在の掲載内容はそのまま公開されます。承認後に編集内容へ自動で差し替わります!
        </div>
      ) : null}

      <div className={`mt-4 ${showPreview ? "grid gap-8 lg:grid-cols-2" : ""}`}>
        <form ref={formRef} onSubmit={handleSubmit} className={`space-y-8 ${showPreview ? "" : "max-w-[720px]"}`}>
          <Section title="ターゲット">
            <Field label="対象" required>
              <div className="flex flex-wrap gap-3">
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

          <Section title="求人情報">
            <Field label="タイトル" required>
              <input name="title" required defaultValue={job.title} className={inputCls} />
            </Field>
            <Field label="メイン画像">
              <ThumbnailUpload
                name="imageUrl"
                defaultValue={job.imageUrl ?? undefined}
                onUploaded={(url) => {
                  setImageUrl(url);
                  setPreviewKey((prev) => prev + 1);
                }}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="カテゴリ">
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
                    required
                    className={`${inputCls} mt-2`}
                    placeholder="カテゴリの詳細"
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
                    required
                    className={`${inputCls} mt-2`}
                    placeholder="雇用形態の詳細"
                  />
                ) : null}
              </Field>
            </div>
            <Field label="応募締切">
              <input name="closingDate" type="date" defaultValue={closingDateStr} className={inputCls} />
            </Field>
          </Section>

          <Section title="仕事内容">
            <Field label="仕事内容" required>
              <textarea name="description" required rows={6} defaultValue={job.description} className={inputCls} />
            </Field>
            <Field label="応募条件">
              <textarea name="requirements" rows={4} defaultValue={job.requirements ?? ""} className={inputCls} />
            </Field>
            <Field label="向いている人">
              <textarea name="desiredAptitude" rows={4} defaultValue={job.desiredAptitude ?? ""} className={inputCls} />
            </Field>
            <Field label="おすすめの人">
              <textarea name="recommendedFor" rows={4} defaultValue={job.recommendedFor ?? ""} className={inputCls} />
            </Field>
          </Section>

          <Section title="勤務地">
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
            <Field label="都道府県">
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
            <Field label="勤務地名">
              <input name="officeName" defaultValue={job.officeName ?? ""} className={inputCls} />
            </Field>
            <Field label="勤務地詳細">
              <textarea name="officeDetail" rows={2} defaultValue={job.officeDetail ?? ""} className={inputCls} />
            </Field>
            <Field label="アクセス">
              <input name="access" defaultValue={job.access ?? ""} className={inputCls} />
            </Field>
          </Section>

          <Section title="給与">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="最低年収">
                <input name="salaryMin" type="number" defaultValue={job.salaryMin ?? ""} className={inputCls} />
              </Field>
              <Field label="最高年収">
                <input name="salaryMax" type="number" defaultValue={job.salaryMax ?? ""} className={inputCls} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <select name="employmentPeriodType" defaultValue={job.employmentPeriodType ?? ""} className={inputCls}>
                {EMPLOYMENT_PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="選考フロー">
              <textarea name="selectionProcess" rows={3} defaultValue={job.selectionProcess ?? ""} className={inputCls} />
            </Field>
          </Section>

          <Section title="求人タグ">
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <label
                  key={tag}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] transition ${
                    selectedTags.includes(tag)
                      ? "border-[#2f6cff] bg-[#2f6cff]/10 text-[#2f6cff]"
                      : "border-[#ddd] text-[#666] hover:border-[#aaa]"
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
          </Section>

          <Section title="福利厚生">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SHARED_BENEFIT_OPTIONS.map((benefit) => (
                <label key={benefit} className="flex items-center gap-2 text-[13px] text-[#444]">
                  <input
                    type="checkbox"
                    checked={selectedBenefits.includes(benefit)}
                    onChange={() => toggleItem(selectedBenefits, setSelectedBenefits, benefit)}
                    className="h-4 w-4 rounded border-[#ddd] text-[#2f6cff]"
                  />
                  {benefit}
                </label>
              ))}
            </div>
          </Section>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              data-mode="review"
              disabled={loading}
              className="rounded-[10px] bg-[#2f6cff] px-8 py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "保存中..." : "審査に提出"}
            </button>
            <button
              type="submit"
              data-mode="draft"
              disabled={loading}
              className="rounded-[10px] border border-[#c8d6f6] bg-white px-8 py-3 text-[14px] font-bold text-[#2f6cff] hover:bg-[#f7faff] disabled:opacity-50"
            >
              下書き保存
            </button>
            {job.reviewStatus === "PENDING_REVIEW" ? (
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={loading}
                className="rounded-[10px] border border-[#f5c36b] bg-[#fff8ea] px-6 py-3 text-[14px] font-bold text-[#b7791f] hover:bg-[#fff3d8] disabled:opacity-50"
              >
                審査を取り下げる
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-[10px] border border-[#ddd] px-8 py-3 text-[14px] font-medium text-[#666] hover:bg-[#f7f7f7]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="ml-auto rounded-[10px] border border-[#ff3158] px-6 py-3 text-[14px] font-bold text-[#ff3158] hover:bg-[#fff5f7] disabled:opacity-50"
            >
              削除
            </button>
          </div>
        </form>

        {showPreview ? (
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <JobPreview key={previewKey} data={getPreviewData()} />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

const inputCls = "w-full rounded-[8px] border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#2f6cff]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="border-b border-[#e5e5e5] pb-2 text-[16px] font-bold text-[#1e3a5f]">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">
        {label}
        {required ? <span className="ml-1 text-[#ff3158]">*</span> : null}
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
      className={`rounded-[8px] border px-5 py-3 text-[14px] font-semibold transition ${
        active ? "border-[#2f6cff] bg-[#2f6cff]/10 text-[#2f6cff]" : "border-[#ddd] text-[#666] hover:border-[#aaa]"
      }`}
    >
      {children}
    </button>
  );
}
