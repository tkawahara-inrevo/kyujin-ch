"use client";

import { CAREER_JOB_TYPES } from "@/lib/resume/types";
import type { WizardState } from "../resume-wizard";

type Props = {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
};

const DOC_OPTIONS = [
  { value: "resume", label: "履歴書", desc: "氏名・住所・学歴・職歴・資格・自己PRをまとめた書類" },
  { value: "career", label: "職務経歴書", desc: "職歴の詳細・スキル・実績をまとめた書類（職種別フォーマット対応）" },
] as const;

const FORMAT_OPTIONS = [
  { value: "pdf", label: "PDF", desc: "印刷・メール添付に最適" },
  { value: "xlsx", label: "Excel", desc: "後から手動で編集したい場合" },
] as const;

export function StepFormat({ state, update, onNext }: Props) {
  const toggleDocType = (v: "resume" | "career") => {
    const current = state.docType;
    if (current.includes(v)) {
      if (current.length === 1) return; // 最低1つ選択
      update({ docType: current.filter((x) => x !== v) });
    } else {
      update({ docType: [...current, v] });
    }
  };

  const toggleFormat = (v: "pdf" | "xlsx") => {
    const current = state.outputFormat;
    if (current.includes(v)) {
      if (current.length === 1) return;
      update({ outputFormat: current.filter((x) => x !== v) });
    } else {
      update({ outputFormat: [...current, v] });
    }
  };

  const showJobType = state.docType.includes("career");

  return (
    <div>
      <h2 className="mb-6 text-[18px] font-bold text-[#1f2937]">作成する書類を選択</h2>

      {/* 書類種別 */}
      <div className="mb-6">
        <p className="mb-3 text-[13px] font-bold text-[#444]">
          書類の種類 <span className="text-[#eb0937]">*</span>
          <span className="ml-2 text-[11px] font-normal text-[#888]">複数選択可</span>
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DOC_OPTIONS.map((opt) => {
            const selected = state.docType.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleDocType(opt.value)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  selected
                    ? "border-[#2f6cff] bg-[#f0f5ff]"
                    : "border-[#e5e7eb] hover:border-[#93c5fd]"
                }`}
              >
                <div className={`text-[15px] font-bold ${selected ? "text-[#2f6cff]" : "text-[#374151]"}`}>
                  {selected && <span className="mr-1">✓ </span>}
                  {opt.label}
                </div>
                <div className="mt-1 text-[12px] text-[#6b7280]">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 職種選択（職務経歴書が選ばれている場合） */}
      {showJobType && (
        <div className="mb-6">
          <label className="mb-2 block text-[13px] font-bold text-[#444]">
            職種カテゴリ（職務経歴書のフォーマット選択）
          </label>
          <select
            value={state.careerJobType}
            onChange={(e) => update({ careerJobType: e.target.value })}
            className="h-[44px] w-full rounded-lg border border-[#d1d1d1] bg-white px-3 text-[14px] outline-none focus:border-[#2f6cff]"
          >
            {CAREER_JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-[#888]">
            職種によって職務経歴書のレイアウトが変わります
          </p>
        </div>
      )}

      {/* 出力形式 */}
      <div className="mb-8">
        <p className="mb-3 text-[13px] font-bold text-[#444]">
          出力形式 <span className="text-[#eb0937]">*</span>
          <span className="ml-2 text-[11px] font-normal text-[#888]">複数選択可</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {FORMAT_OPTIONS.map((opt) => {
            const selected = state.outputFormat.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleFormat(opt.value)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  selected
                    ? "border-[#2f6cff] bg-[#f0f5ff]"
                    : "border-[#e5e7eb] hover:border-[#93c5fd]"
                }`}
              >
                <div className={`text-[15px] font-bold ${selected ? "text-[#2f6cff]" : "text-[#374151]"}`}>
                  {selected && <span className="mr-1">✓ </span>}
                  {opt.label}
                </div>
                <div className="mt-1 text-[12px] text-[#6b7280]">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="rounded-lg bg-[#2f6cff] px-8 py-3 text-[15px] font-bold text-white transition hover:opacity-90"
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
