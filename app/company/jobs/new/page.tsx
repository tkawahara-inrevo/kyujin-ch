"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createJob, type JobSubmissionMode } from "@/app/actions/company/jobs";
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

export default function CompanyJobNewPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
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
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const availablePrefectures = selectedRegion ? PREFECTURES_BY_AREA[selectedRegion] ?? [] : [];

  function toggleItem(list: string[], setList: (value: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]);
  }

  const refreshPreview = () => setPreviewKey((prev) => prev + 1);

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
      targetType,
      graduationYear,
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
    targetType,
    graduationYear,
  ]);

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

    setLoading(true);
    const fd = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const submissionMode = (submitter?.dataset.mode as JobSubmissionMode | undefined) ?? "review";

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
        salaryMin: fd.get("salaryMin") ? Number(fd.get("salaryMin")) : undefined,
        salaryMax: fd.get("salaryMax") ? Number(fd.get("salaryMax")) : undefined,
        monthlySalary: fd.get("monthlySalary") as string,
        annualSalary: fd.get("annualSalary") as string,
        requirements: fd.get("requirements") as string,
        desiredAptitude: fd.get("desiredAptitude") as string,
        recommendedFor: fd.get("recommendedFor") as string,
        access: fd.get("access") as string,
        officeName: fd.get("officeName") as string,
        officeDetail: fd.get("officeDetail") as string,
        workingHours: fd.get("workingHours") as string,
        selectionProcess: fd.get("selectionProcess") as string,
        closingDate: fd.get("closingDate") as string,
        employmentPeriodType: fd.get("employmentPeriodType") as string,
        imageUrl,
        tags: selectedTags,
        benefits: selectedBenefits,
        targetType,
        graduationYear: targetType === "NEW_GRAD" ? graduationYear : undefined,
      },
      submissionMode,
    );

    router.push("/company/jobs");
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 xl:px-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-[30px] font-bold leading-none tracking-tight text-[#2c2f36] md:text-[34px]">
          求人を作成する
        </h1>
        <button
          type="button"
          onClick={() => {
            setShowPreview((prev) => !prev);
            refreshPreview();
          }}
          className="inline-flex rounded-[14px] bg-[#2f6cff] px-6 py-3.5 text-[15px] font-bold text-white transition hover:opacity-90"
        >
          {showPreview ? "プレビューを閉じる" : "プレビューを開く"}
        </button>
      </div>

      {validationError ? (
        <div className="mt-5 rounded-[14px] border border-[#ff5e7d] bg-[#fff5f7] px-4 py-3 text-[14px] text-[#ff3158]">
          {validationError}
        </div>
      ) : null}

      <div
        className={`mt-6 grid items-start gap-6 xl:gap-8 ${
          showPreview ? "xl:grid-cols-[minmax(0,1fr)_minmax(460px,552px)]" : ""
        }`}
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onChange={refreshPreview}
          className={`rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(27,52,90,0.06)] md:p-8 ${
            showPreview ? "" : "max-w-[860px]"
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
                placeholder="例：フロントエンドエンジニア"
              />
            </Field>

            <Field label="メイン画像">
              <p className="mb-2 text-[13px] text-[#6b7280]">対応形式：jpg / png / webp（最大10MB）</p>
              <div className="rounded-[18px] border border-[#d9dfec] p-4">
                <ThumbnailUpload
                  name="imageUrl"
                  onUploaded={(url) => {
                    setImageUrl(url);
                    refreshPreview();
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
              <input name="closingDate" type="date" className={inputCls} />
            </Field>
          </Section>

          <Section title="仕事内容">
            <Field label="仕事内容" required>
              <textarea name="description" required rows={6} className={textareaCls} />
            </Field>
            <Field label="応募条件">
              <textarea name="requirements" rows={4} className={textareaCls} />
            </Field>
            <Field label="向いている人">
              <textarea name="desiredAptitude" rows={4} className={textareaCls} />
            </Field>
            <Field label="おすすめの人">
              <textarea name="recommendedFor" rows={4} className={textareaCls} />
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
              <input name="officeName" className={inputCls} />
            </Field>

            <Field label="勤務地詳細">
              <textarea name="officeDetail" rows={3} className={textareaCls} />
            </Field>

            <Field label="最寄り・アクセス">
              <input name="access" className={inputCls} />
            </Field>
          </Section>

          <Section title="給与">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="最低年収（万円）">
                <input name="salaryMin" type="number" className={inputCls} />
              </Field>
              <Field label="最高年収（万円）">
                <input name="salaryMax" type="number" className={inputCls} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="月給表記">
                <input name="monthlySalary" className={inputCls} />
              </Field>
              <Field label="年収表記">
                <input name="annualSalary" className={inputCls} />
              </Field>
            </div>
          </Section>

          <Section title="勤務条件">
            <Field label="勤務時間">
              <input name="workingHours" className={inputCls} />
            </Field>

            <Field label="雇用期間">
              <select name="employmentPeriodType" className={inputCls}>
                {EMPLOYMENT_PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="選考フロー">
              <textarea name="selectionProcess" rows={4} className={textareaCls} />
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
          </Section>

          <div className="flex flex-wrap gap-3 pt-8">
            <button
              type="submit"
              data-mode="review"
              disabled={loading}
              className="rounded-[14px] bg-[#2f6cff] px-8 py-3.5 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "送信中..." : "審査に提出"}
            </button>
            <button
              type="submit"
              data-mode="draft"
              disabled={loading}
              className="rounded-[14px] border border-[#c8d6f6] bg-white px-8 py-3.5 text-[15px] font-bold text-[#2f6cff] transition hover:bg-[#f7faff] disabled:opacity-50"
            >
              下書き保存
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-[14px] border border-[#d6dde9] bg-white px-8 py-3.5 text-[15px] font-medium text-[#5b6472] transition hover:bg-[#f6f8fb]"
            >
              キャンセル
            </button>
          </div>
        </form>

        {showPreview ? (
          <aside className="hidden xl:block">
            <div className="sticky top-6 h-[calc(100vh-72px)] rounded-[24px] bg-white p-5 shadow-[0_2px_12px_rgba(27,52,90,0.06)]">
              <JobPreview key={previewKey} data={getPreviewData()} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[15px] font-semibold text-[#3d4552]">
        {label}
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
