"use client";

import { useTransition } from "react";
import type { WizardState } from "../resume-wizard";
import { saveResumeProfile } from "@/app/actions/resume-builder/resume-profile";

type Props = {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
};

const PRESET_PREFERENCES = [
  "勤務地は○○近辺を希望します",
  "週5日フルタイム勤務が可能です",
  "リモートワーク可能な職場を希望します",
  "給与については貴社規定に従います",
  "入社時期は相談可能です",
];

export function StepPreferences({ state, update, onBack, onNext }: Props) {
  const [isPending, startTransition] = useTransition();

  const appendPreset = (text: string) => {
    const current = state.jobPreference.trim();
    update({ jobPreference: current ? `${current}\n${text}` : text });
  };

  const handleNext = () => {
    startTransition(async () => {
      try {
        await saveResumeProfile({ prText: state.prText, jobPreference: state.jobPreference });
      } catch {
        // non-blocking
      }
      onNext();
    });
  };

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold text-[#1f2937]">本人希望欄</h2>
      <p className="mb-6 text-[13px] text-[#6b7280]">
        給与・職種・勤務時間・勤務地などの希望を記入できます。任意項目です。
      </p>

      {/* プリセット */}
      <div className="mb-4">
        <p className="mb-2 text-[12px] font-bold text-[#555]">よく使われる文例（クリックで追加）</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_PREFERENCES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => appendPreset(p)}
              className="rounded-full border border-[#d1d5db] bg-white px-3 py-1 text-[11px] text-[#555] hover:border-[#2f6cff] hover:text-[#2f6cff] transition"
            >
              ＋ {p}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={state.jobPreference}
        onChange={(e) => update({ jobPreference: e.target.value })}
        rows={5}
        className="w-full rounded-lg border border-[#d1d1d1] bg-white px-3 py-2.5 text-[14px] leading-relaxed outline-none focus:border-[#2f6cff]"
        placeholder="例）特に希望はありません。貴社規定に従います。&#10;勤務地は東京都内を希望します。"
      />
      <div className="mt-1 text-right text-[11px] text-[#888]">{state.jobPreference.length}文字</div>

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
