"use client";

import { useTransition } from "react";
import type { WorkExperienceEntry } from "@/lib/resume/types";
import type { WizardState } from "../resume-wizard";
import { saveWorkExperiences } from "@/app/actions/resume-builder/work-experience";

type Props = {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
};

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const selectCls = "h-[40px] rounded-lg border border-[#d1d1d1] bg-white px-2 text-[13px] outline-none focus:border-[#2f6cff]";
const inputCls = "h-[40px] w-full rounded-lg border border-[#d1d1d1] bg-white px-3 text-[13px] outline-none focus:border-[#2f6cff]";

function blankEntry(sortOrder: number): WorkExperienceEntry {
  const year = new Date().getFullYear();
  return {
    companyName: "",
    department: "",
    jobType: "",
    startYear: year - 2,
    startMonth: 4,
    endYear: null,
    endMonth: null,
    isCurrent: false,
    description: "",
    sortOrder,
  };
}

export function StepWorkExperience({ state, update, onBack, onNext }: Props) {
  const [isPending, startTransition] = useTransition();
  const entries = state.workExperiences;

  const setEntries = (next: WorkExperienceEntry[]) => update({ workExperiences: next });
  const addEntry = () => setEntries([...entries, blankEntry(entries.length)]);
  const removeEntry = (i: number) =>
    setEntries(entries.filter((_, idx) => idx !== i).map((e, idx) => ({ ...e, sortOrder: idx })));
  const updateEntry = (i: number, patch: Partial<WorkExperienceEntry>) =>
    setEntries(entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const handleNext = () => {
    startTransition(async () => {
      try {
        await saveWorkExperiences(entries);
      } catch {
        // non-blocking
      }
      onNext();
    });
  };

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold text-[#1f2937]">職歴</h2>
      <p className="mb-6 text-[13px] text-[#6b7280]">
        在職期間の古い順に入力してください。業務内容はAIが添削を提案します（次のステップ）。
      </p>

      {entries.length === 0 && (
        <div className="mb-4 rounded-lg bg-[#fff9c4] px-4 py-3 text-[13px] text-[#856404]">
          職歴がありません。新卒・初職の場合はスキップできます。
        </div>
      )}

      <div className="space-y-4">
        {entries.map((e, i) => (
          <div key={i} className="rounded-xl border border-[#e5e7eb] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#555]">職歴 {i + 1}</span>
              <button type="button" onClick={() => removeEntry(i)} className="text-[12px] text-[#ef4444] hover:underline">
                削除
              </button>
            </div>

            {/* 会社名 */}
            <div className="mb-3">
              <label className="mb-1 block text-[12px] font-bold text-[#555]">会社名</label>
              <input
                value={e.companyName}
                onChange={(ev) => updateEntry(i, { companyName: ev.target.value })}
                className={inputCls}
                placeholder="株式会社○○"
              />
            </div>

            {/* 部署・役職 */}
            <div className="mb-3">
              <label className="mb-1 block text-[12px] font-bold text-[#555]">部署・役職</label>
              <input
                value={e.department}
                onChange={(ev) => updateEntry(i, { department: ev.target.value })}
                className={inputCls}
                placeholder="営業部 主任（任意）"
              />
            </div>

            {/* 在籍期間 */}
            <div className="mb-3">
              <label className="mb-1 block text-[12px] font-bold text-[#555]">在籍期間</label>
              <div className="flex flex-wrap items-center gap-2">
                <select value={e.startYear} onChange={(ev) => updateEntry(i, { startYear: Number(ev.target.value) })} className={selectCls}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
                </select>
                <select value={e.startMonth} onChange={(ev) => updateEntry(i, { startMonth: Number(ev.target.value) })} className={`${selectCls} w-[80px]`}>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
                </select>
                <span className="text-[13px] text-[#555]">〜</span>
                {!e.isCurrent ? (
                  <>
                    <select
                      value={e.endYear ?? ""}
                      onChange={(ev) => updateEntry(i, { endYear: ev.target.value ? Number(ev.target.value) : null })}
                      className={selectCls}
                    >
                      <option value="">年</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
                    </select>
                    <select
                      value={e.endMonth ?? ""}
                      onChange={(ev) => updateEntry(i, { endMonth: ev.target.value ? Number(ev.target.value) : null })}
                      className={`${selectCls} w-[80px]`}
                    >
                      <option value="">月</option>
                      {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
                    </select>
                  </>
                ) : (
                  <span className="text-[13px] font-bold text-[#2f6cff]">現在</span>
                )}
                <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#555]">
                  <input
                    type="checkbox"
                    checked={e.isCurrent}
                    onChange={(ev) =>
                      updateEntry(i, {
                        isCurrent: ev.target.checked,
                        endYear: ev.target.checked ? null : e.endYear,
                        endMonth: ev.target.checked ? null : e.endMonth,
                      })
                    }
                  />
                  現在も在籍中
                </label>
              </div>
            </div>

            {/* 業務内容 */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[12px] font-bold text-[#555]">業務内容</label>
                <span className="text-[10px] text-[#888]">AIによる添削は次のステップで対応できます</span>
              </div>
              <textarea
                value={e.description}
                onChange={(ev) => updateEntry(i, { description: ev.target.value })}
                rows={4}
                className="w-full rounded-lg border border-[#d1d1d1] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2f6cff]"
                placeholder={`例）\n・法人向け新規開拓営業（月間アポイント20件）\n・既存顧客フォロー、年間売上○○万円達成\n・チームリーダーとして5名のマネジメント`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="mt-4 w-full rounded-xl border-2 border-dashed border-[#d1d5db] py-3 text-[13px] font-bold text-[#6b7280] hover:border-[#2f6cff] hover:text-[#2f6cff] transition"
      >
        ＋ 職歴を追加
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
