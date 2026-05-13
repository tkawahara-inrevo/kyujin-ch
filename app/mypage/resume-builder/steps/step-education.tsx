"use client";

import { useTransition } from "react";
import { SCHOOL_TYPES, EDUCATION_STATUSES } from "@/lib/resume/types";
import type { EducationEntry } from "@/lib/resume/types";
import type { WizardState } from "../resume-wizard";
import { saveEducations } from "@/app/actions/resume-builder/education";

type Props = {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
};

const YEARS = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const selectCls = "h-[40px] rounded-lg border border-[#d1d1d1] bg-white px-2 text-[13px] outline-none focus:border-[#2f6cff]";
const inputCls = "h-[40px] w-full rounded-lg border border-[#d1d1d1] bg-white px-3 text-[13px] outline-none focus:border-[#2f6cff]";

function blankEntry(sortOrder: number): EducationEntry {
  return {
    schoolType: "高等学校",
    schoolName: "",
    faculty: "",
    status: "卒業",
    year: new Date().getFullYear() - 4,
    month: 3,
    sortOrder,
  };
}

// 中学・高校卒業を自動補完
function autoComplete(entries: EducationEntry[]): EducationEntry[] {
  if (entries.length === 0) return entries;
  // 最初に高校が入っている場合、中学卒業を自動挿入するか確認
  return entries;
}

export function StepEducation({ state, update, onBack, onNext }: Props) {
  const [isPending, startTransition] = useTransition();
  const entries = state.educations;

  const setEntries = (next: EducationEntry[]) => update({ educations: next });

  const addEntry = () => {
    setEntries([...entries, blankEntry(entries.length)]);
  };

  const removeEntry = (i: number) => {
    setEntries(entries.filter((_, idx) => idx !== i).map((e, idx) => ({ ...e, sortOrder: idx })));
  };

  const updateEntry = (i: number, patch: Partial<EducationEntry>) => {
    setEntries(entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };

  const handleAutoFillJunior = () => {
    const firstEntry = entries[0];
    if (!firstEntry) return;
    // 中学卒業を最初のエントリの3年前に自動追加
    const juniorYear = firstEntry.year - 3;
    const junior: EducationEntry = {
      schoolType: "中学校",
      schoolName: "（中学校名を入力）",
      faculty: "",
      status: "卒業",
      year: juniorYear,
      month: 3,
      sortOrder: -1,
    };
    const newEntries = [junior, ...entries].map((e, idx) => ({ ...e, sortOrder: idx }));
    setEntries(newEntries);
  };

  const handleNext = () => {
    startTransition(async () => {
      try {
        await saveEducations(entries);
      } catch {
        // save errors are non-blocking
      }
      onNext();
    });
  };

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold text-[#1f2937]">学歴</h2>
      <p className="mb-1 text-[13px] text-[#6b7280]">
        学歴を入力してください。古い順（中学校→高校→大学）に並べてください。
      </p>

      {entries.length === 0 && (
        <div className="mb-4 rounded-lg bg-[#fff9c4] px-4 py-3 text-[13px] text-[#856404]">
          学歴が登録されていません。「追加」ボタンで入力してください。
        </div>
      )}

      {entries.length > 0 && !entries.some((e) => e.schoolType === "中学校") && (
        <button
          type="button"
          onClick={handleAutoFillJunior}
          className="mb-4 rounded-lg border border-[#2f6cff] px-4 py-2 text-[12px] font-bold text-[#2f6cff] hover:bg-[#f0f5ff] transition"
        >
          ＋ 中学校卒業を自動追加
        </button>
      )}

      <div className="space-y-4">
        {entries.map((e, i) => (
          <div key={i} className="rounded-xl border border-[#e5e7eb] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#555]">学歴 {i + 1}</span>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="text-[12px] text-[#ef4444] hover:underline"
              >
                削除
              </button>
            </div>

            {/* 年月・学校種別 */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select
                value={e.year}
                onChange={(ev) => updateEntry(i, { year: Number(ev.target.value) })}
                className={selectCls}
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
              </select>
              <select
                value={e.month}
                onChange={(ev) => updateEntry(i, { month: Number(ev.target.value) })}
                className={`${selectCls} w-[80px]`}
              >
                {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
              </select>
              <select
                value={e.schoolType}
                onChange={(ev) => updateEntry(i, { schoolType: ev.target.value })}
                className={selectCls}
              >
                {SCHOOL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={e.status}
                onChange={(ev) => updateEntry(i, { status: ev.target.value })}
                className={selectCls}
              >
                {EDUCATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* 学校名 */}
            <div className="mb-2">
              <input
                value={e.schoolName}
                onChange={(ev) => updateEntry(i, { schoolName: ev.target.value })}
                className={inputCls}
                placeholder={
                  e.schoolType === "大学" ? "○○大学" :
                  e.schoolType === "高等学校" ? "○○高等学校" :
                  e.schoolType === "専門学校" ? "○○専門学校" : "学校名"
                }
              />
            </div>

            {/* 学部・学科（大学・大学院・短大・専門の場合） */}
            {["大学", "大学院", "短期大学", "専門学校"].includes(e.schoolType) && (
              <input
                value={e.faculty}
                onChange={(ev) => updateEntry(i, { faculty: ev.target.value })}
                className={inputCls}
                placeholder="学部・学科・専攻（例：経済学部 経済学科）"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="mt-4 w-full rounded-xl border-2 border-dashed border-[#d1d5db] py-3 text-[13px] font-bold text-[#6b7280] hover:border-[#2f6cff] hover:text-[#2f6cff] transition"
      >
        ＋ 学歴を追加
      </button>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-[#d1d5db] px-6 py-2.5 text-[14px] text-[#555] hover:bg-[#f9fafb] transition">
          ← 戻る
        </button>
        <button
          onClick={handleNext}
          disabled={isPending}
          className="rounded-lg bg-[#2f6cff] px-8 py-3 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "保存中..." : "次へ →"}
        </button>
      </div>
    </div>
  );
}
