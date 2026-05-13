"use client";

import { useTransition, useState } from "react";
import { PRESET_CERTIFICATIONS } from "@/lib/resume/types";
import type { CertificationEntry } from "@/lib/resume/types";
import type { WizardState } from "../resume-wizard";
import { saveCertifications } from "@/app/actions/resume-builder/certification";

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

function blankEntry(sortOrder: number): CertificationEntry {
  return { name: "", year: new Date().getFullYear(), month: 1, sortOrder };
}

export function StepCertification({ state, update, onBack, onNext }: Props) {
  const [isPending, startTransition] = useTransition();
  const [presetOpen, setPresetOpen] = useState(false);
  const entries = state.certifications;

  const setEntries = (next: CertificationEntry[]) => update({ certifications: next });
  const addEntry = () => setEntries([...entries, blankEntry(entries.length)]);
  const removeEntry = (i: number) =>
    setEntries(entries.filter((_, idx) => idx !== i).map((e, idx) => ({ ...e, sortOrder: idx })));
  const updateEntry = (i: number, patch: Partial<CertificationEntry>) =>
    setEntries(entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const addPreset = (name: string) => {
    if (entries.some((e) => e.name === name)) return;
    setEntries([...entries, { name, year: new Date().getFullYear(), month: 1, sortOrder: entries.length }]);
    setPresetOpen(false);
  };

  const handleNext = () => {
    startTransition(async () => {
      try {
        await saveCertifications(entries);
      } catch {
        // non-blocking
      }
      onNext();
    });
  };

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold text-[#1f2937]">資格・免許</h2>
      <p className="mb-6 text-[13px] text-[#6b7280]">
        取得済みの資格・免許を入力してください。なければスキップ可能です。
      </p>

      {/* プリセット選択 */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setPresetOpen(!presetOpen)}
          className="rounded-lg border border-[#2f6cff] px-4 py-2 text-[12px] font-bold text-[#2f6cff] hover:bg-[#f0f5ff] transition"
        >
          {presetOpen ? "▲ プリセットを閉じる" : "▼ よくある資格から選ぶ"}
        </button>
        {presetOpen && (
          <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-3 sm:grid-cols-3">
            {PRESET_CERTIFICATIONS.map((name) => {
              const already = entries.some((e) => e.name === name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => addPreset(name)}
                  disabled={already}
                  className={`rounded-lg border px-3 py-1.5 text-left text-[11px] transition ${
                    already
                      ? "border-[#22c55e] bg-[#f0fdf4] text-[#16a34a] cursor-default"
                      : "border-[#e5e7eb] bg-white hover:border-[#2f6cff] hover:text-[#2f6cff]"
                  }`}
                >
                  {already ? "✓ " : "＋ "}{name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] p-3">
            <select value={e.year} onChange={(ev) => updateEntry(i, { year: Number(ev.target.value) })} className={`${selectCls} w-[90px]`}>
              {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
            </select>
            <select value={e.month} onChange={(ev) => updateEntry(i, { month: Number(ev.target.value) })} className={`${selectCls} w-[70px]`}>
              {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
            </select>
            <div className="flex-1">
              <input
                value={e.name}
                onChange={(ev) => updateEntry(i, { name: ev.target.value })}
                className={inputCls}
                placeholder="資格・免許名"
              />
            </div>
            <button type="button" onClick={() => removeEntry(i)} className="shrink-0 text-[12px] text-[#ef4444] hover:underline">
              削除
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="mt-4 w-full rounded-xl border-2 border-dashed border-[#d1d5db] py-3 text-[13px] font-bold text-[#6b7280] hover:border-[#2f6cff] hover:text-[#2f6cff] transition"
      >
        ＋ 資格を追加（手入力）
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
