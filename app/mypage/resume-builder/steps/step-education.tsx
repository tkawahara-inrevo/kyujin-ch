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

// 学校種別ごとの標準在学年数
function getDuration(schoolType: string): number {
  const map: Record<string, number> = {
    "中学校": 3, "高等学校": 3,
    "短期大学": 2, "専門学校": 2, "大学院": 2,
    "大学": 4,
  };
  return map[schoolType] ?? 4;
}

// 入学エントリに対応する卒業エントリを生成
function createGradEntry(base: EducationEntry, sortOrder: number): EducationEntry {
  return {
    schoolType: base.schoolType,
    schoolName: base.schoolName,
    faculty: base.faculty,
    status: "卒業",
    year: base.year + getDuration(base.schoolType),
    month: 3,
    sortOrder,
  };
}

// 直後のエントリが「同校のペア行」かどうか判定
function isPaired(entry: EducationEntry, next: EducationEntry | undefined): boolean {
  if (!next) return false;
  return next.schoolName === entry.schoolName && next.schoolType === entry.schoolType;
}

function blankAdmissionEntry(sortOrder: number): EducationEntry {
  return {
    schoolType: "大学",
    schoolName: "",
    faculty: "",
    status: "入学",
    year: new Date().getFullYear() - 4,
    month: 4,
    sortOrder,
  };
}

export function StepEducation({ state, update, onBack, onNext }: Props) {
  const [isPending, startTransition] = useTransition();
  const entries = state.educations;

  const setEntries = (next: EducationEntry[]) =>
    update({ educations: next.map((e, i) => ({ ...e, sortOrder: i })) });

  // 追加：入学 + 卒業をペアで追加
  const addEntry = () => {
    const base = blankAdmissionEntry(entries.length);
    const grad = createGradEntry(base, entries.length + 1);
    setEntries([...entries, base, grad]);
  };

  const removeEntry = (i: number) => {
    setEntries(entries.filter((_, idx) => idx !== i));
  };

  const updateEntry = (i: number, patch: Partial<EducationEntry>) => {
    let updated = entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    const entry = updated[i];
    const next = updated[i + 1];

    if (entry.status === "入学" && isPaired(entry, next)) {
      // 学校名・学部変更 → ペア行に連動
      const pairPatch: Partial<EducationEntry> = {};
      if ("schoolName" in patch) pairPatch.schoolName = patch.schoolName;
      if ("faculty" in patch) pairPatch.faculty = patch.faculty;
      // 学校種別変更 → 卒業年を再計算
      if ("schoolType" in patch) {
        pairPatch.schoolType = patch.schoolType;
        pairPatch.year = entry.year + getDuration(patch.schoolType as string);
      }
      // 入学年変更 → 卒業年を再計算
      if ("year" in patch) {
        pairPatch.year = (patch.year as number) + getDuration(entry.schoolType);
      }
      if (Object.keys(pairPatch).length > 0) {
        updated = updated.map((e, idx) => (idx === i + 1 ? { ...e, ...pairPatch } : e));
      }
    }

    setEntries(updated);
  };

  // 中学校卒業を最初の行より前に自動追加
  const handleAutoFillJunior = () => {
    const first = entries[0];
    if (!first) return;
    const juniorGrad: EducationEntry = {
      schoolType: "中学校",
      schoolName: "（中学校名を入力）",
      faculty: "",
      status: "卒業",
      year: first.year - (first.status === "入学" ? getDuration(first.schoolType) : 0) - 1,
      month: 3,
      sortOrder: -1,
    };
    setEntries([juniorGrad, ...entries]);
  };

  const handleNext = () => {
    startTransition(async () => {
      try { await saveEducations(entries); } catch { /* non-blocking */ }
      onNext();
    });
  };

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold text-[#1f2937]">学歴</h2>
      <p className="mb-1 text-[13px] text-[#6b7280]">
        「学校を追加」で入学・卒業が自動でペア作成されます。内容は自由に編集できます。
      </p>

      {entries.length === 0 && (
        <div className="mb-4 rounded-lg bg-[#fff9c4] px-4 py-3 text-[13px] text-[#856404]">
          まだ学歴が登録されていません。「学校を追加」ボタンで入力してください。
        </div>
      )}

      {entries.length > 0 && !entries.some((e) => e.schoolType === "中学校") && (
        <button
          type="button"
          onClick={handleAutoFillJunior}
          className="mb-4 rounded-lg border border-[#2f6cff] px-4 py-2 text-[12px] font-bold text-[#2f6cff] hover:bg-[#f0f5ff] transition"
        >
          ＋ 中学校卒業を先頭に追加
        </button>
      )}

      <div className="space-y-2">
        {entries.map((e, i) => {
          const prev = entries[i - 1];
          const isLinked = e.status !== "入学" && prev && prev.status === "入学" && isPaired(prev, e);

          return (
            <div
              key={i}
              className={`rounded-xl border p-4 ${
                isLinked
                  ? "border-[#93c5fd] bg-[#f0f7ff] border-l-4 border-l-[#2f6cff]"
                  : "border-[#e5e7eb]"
              }`}
            >
              {/* ヘッダー */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#555]">
                    {e.status === "入学" ? "🏫 入学" : isLinked ? "🔗 卒業・修了（連動中）" : `学歴 ${i + 1}`}
                  </span>
                  {isLinked && (
                    <span className="rounded-full bg-[#dbeafe] px-2 py-0.5 text-[10px] text-[#1d4ed8]">
                      学校名・学部は入学行と連動
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(i)}
                  className="text-[12px] text-[#ef4444] hover:underline"
                >
                  削除
                </button>
              </div>

              {/* 年月・種別・状態 */}
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
                  className={`${selectCls} w-20`}
                >
                  {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
                </select>
                <select
                  value={e.schoolType}
                  onChange={(ev) => updateEntry(i, { schoolType: ev.target.value })}
                  className={selectCls}
                  disabled={isLinked}
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
                  className={isLinked ? `${inputCls} bg-[#f0f7ff]` : inputCls}
                  readOnly={isLinked}
                  placeholder={
                    e.schoolType === "大学" ? "○○大学" :
                    e.schoolType === "高等学校" ? "○○高等学校" :
                    e.schoolType === "専門学校" ? "○○専門学校" : "学校名"
                  }
                />
                {isLinked && (
                  <p className="mt-1 text-[10px] text-[#6b9bd2]">入学行の学校名に連動しています（入学行から変更可）</p>
                )}
              </div>

              {/* 学部・学科 */}
              {["大学", "大学院", "短期大学", "専門学校"].includes(e.schoolType) && (
                <input
                  value={e.faculty}
                  onChange={(ev) => updateEntry(i, { faculty: ev.target.value })}
                  className={isLinked ? `${inputCls} bg-[#f0f7ff]` : inputCls}
                  readOnly={isLinked}
                  placeholder="学部・学科・専攻（例：経済学部 経済学科）"
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="mt-4 w-full rounded-xl border-2 border-dashed border-[#d1d5db] py-3 text-[13px] font-bold text-[#6b7280] hover:border-[#2f6cff] hover:text-[#2f6cff] transition"
      >
        ＋ 学校を追加（入学・卒業を自動で作成）
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
