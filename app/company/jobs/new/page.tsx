"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/app/actions/company/jobs";
import { getActiveGraduationYears, graduationYearLabel } from "@/lib/graduation-years";
import {
  CATEGORY_OPTIONS,
  EMPLOYMENT_OPTIONS,
  OTHER_CATEGORY_VALUE,
} from "@/lib/job-options";
import { AREA_OPTIONS, PREFECTURES_BY_AREA } from "@/lib/job-locations";
import { ThumbnailUpload } from "@/components/thumbnail-upload";
import { JobPreview } from "@/components/job-preview";

const TAG_OPTIONS = [
  "完全週休2日制",
  "リモートワーク",
  "未経験歓迎",
  "フレックスタイム",
  "残業なし",
  "昇格昇給",
  "交通費支給",
  "大手企業",
  "ベンチャー",
  "中途採用",
  "新卒歓迎",
  "急募",
];

const BENEFIT_OPTIONS = [
  "通勤交通費全額支給",
  "通勤交通費一部支給",
  "健康保険",
  "介護保険",
  "社宅有り又は家賃補助",
  "教育制度",
  "財形制度",
  "社員旅行",
  "退職金",
  "育児休暇",
  "その他（年末調整他）",
];

const EMPLOYMENT_PERIOD_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "indefinite", label: "無期雇用（正社員等）" },
  { value: "fixed", label: "有期雇用（契約期間あり）" },
  { value: "trial", label: "試用期間あり" },
];

export default function CompanyJobNewPage() {
  const router = useRouter();
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
  const [showPreview, setShowPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const availablePrefectures = selectedRegion ? PREFECTURES_BY_AREA[selectedRegion] ?? [] : [];

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((t) => t !== item) : [...list, item]);
  }

  const getPreviewData = useCallback(() => {
    const fd = formRef.current ? new FormData(formRef.current) : null;
    return {
      title: fd?.get("title") as string || "",
      imageUrl,
      categoryTag,
      categoryTagDetail,
      employmentType,
      employmentTypeDetail,
      description: fd?.get("description") as string || "",
      requirements: fd?.get("requirements") as string || "",
      desiredAptitude: fd?.get("desiredAptitude") as string || "",
      recommendedFor: fd?.get("recommendedFor") as string || "",
      location: selectedLocation,
      region: selectedRegion,
      officeName: fd?.get("officeName") as string || "",
      officeDetail: fd?.get("officeDetail") as string || "",
      access: fd?.get("access") as string || "",
      salaryMin: fd?.get("salaryMin") as string || "",
      salaryMax: fd?.get("salaryMax") as string || "",
      monthlySalary: fd?.get("monthlySalary") as string || "",
      annualSalary: fd?.get("annualSalary") as string || "",
      workingHours: fd?.get("workingHours") as string || "",
      selectionProcess: fd?.get("selectionProcess") as string || "",
      tags: selectedTags,
      benefits: selectedBenefits,
    };
  }, [imageUrl, categoryTag, categoryTagDetail, employmentType, employmentTypeDetail, selectedLocation, selectedRegion, selectedTags, selectedBenefits]);

  // Force preview re-render
  const [previewKey, setPreviewKey] = useState(0);
  const refreshPreview = () => setPreviewKey((k) => k + 1);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    // Validate "other" detail fields
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
    const fd = new FormData(e.currentTarget);

    await createJob({
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
      isPublished: fd.get("isPublished") === "true",
      targetType,
      graduationYear: targetType === "NEW_GRAD" ? graduationYear : undefined,
    });

    router.push("/company/jobs");
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1e3a5f]">求人を作成する</h1>
        <button
          type="button"
          onClick={() => { setShowPreview(!showPreview); refreshPreview(); }}
          className="hidden items-center gap-2 rounded-[8px] border border-[#2f6cff] px-4 py-2 text-[13px] font-semibold text-[#2f6cff] transition hover:bg-[#2f6cff]/5 lg:flex"
        >
          {showPreview ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              プレビューを閉じる
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              プレビュー
            </>
          )}
        </button>
      </div>

      {validationError && (
        <div className="mt-4 rounded-[8px] border border-[#ff3158] bg-[#fff5f7] px-4 py-3 text-[14px] text-[#ff3158]">
          {validationError}
        </div>
      )}

      <div className={`mt-6 ${showPreview ? "grid gap-8 lg:grid-cols-2" : ""}`}>
        <form ref={formRef} onSubmit={handleSubmit} className={`space-y-8 ${showPreview ? "" : "max-w-[720px]"}`} onChange={refreshPreview}>
          {/* === ターゲット === */}
          <Section title="ターゲット">
            <Field label="対象" required>
              <div className="flex flex-wrap gap-3">
                <TargetButton
                  active={targetType === "MID_CAREER"}
                  onClick={() => setTargetType("MID_CAREER")}
                >
                  中途
                </TargetButton>
                {gradYears.map((y) => (
                  <TargetButton
                    key={y}
                    active={targetType === "NEW_GRAD" && graduationYear === y}
                    onClick={() => { setTargetType("NEW_GRAD"); setGraduationYear(y); }}
                  >
                    {graduationYearLabel(y)}
                  </TargetButton>
                ))}
              </div>
            </Field>
          </Section>

          {/* === 基本情報 === */}
          <Section title="基本情報">
            <Field label="タイトル" required>
              <input name="title" required className={inputCls} placeholder="例: フロントエンドエンジニア" />
            </Field>

            <Field label="メイン画像">
              <ThumbnailUpload name="imageUrl" onUploaded={(url) => { setImageUrl(url); refreshPreview(); }} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="求人カテゴリ">
                <select
                  name="categoryTag"
                  className={inputCls}
                  value={categoryTag}
                  onChange={(e) => { setCategoryTag(e.target.value); if (e.target.value !== OTHER_CATEGORY_VALUE) setCategoryTagDetail(""); }}
                >
                  <option value="">選択してください</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {categoryTag === OTHER_CATEGORY_VALUE && (
                  <input
                    name="categoryTagDetail"
                    value={categoryTagDetail}
                    onChange={(e) => setCategoryTagDetail(e.target.value)}
                    required
                    className={`${inputCls} mt-2`}
                    placeholder="カテゴリの詳細を入力"
                  />
                )}
              </Field>
              <Field label="雇用形態" required>
                <select
                  name="employmentType"
                  required
                  className={inputCls}
                  value={employmentType}
                  onChange={(e) => { setEmploymentType(e.target.value); if (e.target.value !== "OTHER") setEmploymentTypeDetail(""); }}
                >
                  {EMPLOYMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {employmentType === "OTHER" && (
                  <input
                    name="employmentTypeDetail"
                    value={employmentTypeDetail}
                    onChange={(e) => setEmploymentTypeDetail(e.target.value)}
                    required
                    className={`${inputCls} mt-2`}
                    placeholder="雇用形態の詳細を入力"
                  />
                )}
              </Field>
            </div>

            <Field label="掲載終了日">
              <input name="closingDate" type="date" className={inputCls} />
            </Field>

            <Field label="公開設定">
              <select name="isPublished" className={inputCls}>
                <option value="true">即時公開</option>
                <option value="false">下書き保存</option>
              </select>
            </Field>
          </Section>

          {/* === 仕事内容 === */}
          <Section title="仕事内容">
            <Field label="仕事内容" required>
              <textarea name="description" required rows={6} className={inputCls} placeholder="仕事内容の詳細を記載してください" />
            </Field>

            <Field label="応募条件">
              <textarea name="requirements" rows={4} className={inputCls} placeholder="必要な経験・スキル等" />
            </Field>

            <Field label="求む適性">
              <textarea name="desiredAptitude" rows={4} className={inputCls} placeholder="こんな方に向いています" />
            </Field>

            <Field label="おすすめしたい方へ">
              <textarea name="recommendedFor" rows={4} className={inputCls} placeholder="おすすめポイント" />
            </Field>
          </Section>

          {/* === 勤務地 === */}
          <Section title="勤務地">
            <Field label="勤務地エリア">
              <select
                name="region"
                className={inputCls}
                value={selectedRegion}
                onChange={(e) => {
                  const nextRegion = e.target.value;
                  setSelectedRegion(nextRegion);
                  if (!(PREFECTURES_BY_AREA[nextRegion] ?? []).includes(selectedLocation)) {
                    setSelectedLocation("");
                  }
                }}
              >
                <option value="">選択してください</option>
                {AREA_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>

            <Field label="都道府県">
              <select
                name="location"
                className={inputCls}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={!selectedRegion}
              >
                <option value="">選択してください</option>
                {availablePrefectures.map((prefecture) => (
                  <option key={prefecture} value={prefecture}>{prefecture}</option>
                ))}
              </select>
            </Field>

            <Field label="勤務地名称">
              <input name="officeName" className={inputCls} placeholder="例: 本社 / 渋谷オフィス" />
            </Field>

            <Field label="勤務地名称詳細">
              <textarea name="officeDetail" rows={2} className={inputCls} placeholder="例: 仙台市青葉区中央1-2-3 ○○ビル5F" />
            </Field>

            <Field label="アクセス">
              <input name="access" className={inputCls} placeholder="例: JR渋谷駅 徒歩5分" />
            </Field>
          </Section>

          {/* === 給与 === */}
          <Section title="給与">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="給与下限 (万円/年)">
                <input name="salaryMin" type="number" className={inputCls} placeholder="300" />
              </Field>
              <Field label="給与上限 (万円/年)">
                <input name="salaryMax" type="number" className={inputCls} placeholder="600" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="給与（税込月給）">
                <input name="monthlySalary" className={inputCls} placeholder="例: 25万円〜40万円" />
              </Field>
              <Field label="給与（税込年収）">
                <input name="annualSalary" className={inputCls} placeholder="例: 400万円〜600万円" />
              </Field>
            </div>
          </Section>

          {/* === 勤務条件 === */}
          <Section title="勤務条件">
            <Field label="勤務時間">
              <input name="workingHours" className={inputCls} placeholder="例: 9:00〜18:00（実働8時間）" />
            </Field>

            <Field label="有期/無期雇用区分">
              <select name="employmentPeriodType" className={inputCls}>
                {EMPLOYMENT_PERIOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="選考プロセス">
              <textarea name="selectionProcess" rows={3} className={inputCls} placeholder="例: 書類選考 → 一次面接 → 最終面接 → 内定" />
            </Field>
          </Section>

          {/* === 求人タグ === */}
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

          {/* === 福利厚生 === */}
          <Section title="福利厚生">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BENEFIT_OPTIONS.map((b) => (
                <label key={b} className="flex items-center gap-2 text-[13px] text-[#444]">
                  <input
                    type="checkbox"
                    checked={selectedBenefits.includes(b)}
                    onChange={() => toggleItem(selectedBenefits, setSelectedBenefits, b)}
                    className="h-4 w-4 rounded border-[#ddd] text-[#2f6cff]"
                  />
                  {b}
                </label>
              ))}
            </div>
          </Section>

          {/* === 送信 === */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-[10px] bg-[#2f6cff] px-8 py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "保存中..." : "作成する"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-[10px] border border-[#ddd] px-8 py-3 text-[14px] font-medium text-[#666] hover:bg-[#f7f7f7]"
            >
              キャンセル
            </button>
          </div>
        </form>

        {showPreview && (
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <JobPreview key={previewKey} data={getPreviewData()} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#2f6cff]";

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
        {required && <span className="ml-1 text-[#ff3158]">*</span>}
      </label>
      {children}
    </div>
  );
}

function TargetButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[8px] border px-5 py-3 text-[14px] font-semibold transition ${
        active
          ? "border-[#2f6cff] bg-[#2f6cff]/10 text-[#2f6cff]"
          : "border-[#ddd] text-[#666] hover:border-[#aaa]"
      }`}
    >
      {children}
    </button>
  );
}
