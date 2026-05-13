"use client";

import { useState, useTransition } from "react";
import type { WizardState } from "../resume-wizard";
import { saveResumeProfile } from "@/app/actions/resume-builder/resume-profile";

type Props = {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
};

const textareaCls = "w-full rounded-lg border border-[#d1d1d1] bg-white px-3 py-2.5 text-[14px] leading-relaxed outline-none focus:border-[#2f6cff]";

export function StepPrText({ state, update, onBack, onNext }: Props) {
  const [isPending, startTransition] = useTransition();
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSection, setAiSection] = useState<"pr_text" | "work_description" | null>(null);
  const [selectedWorkIdx, setSelectedWorkIdx] = useState<number | null>(null);

  const workContext = state.workExperiences
    .map((w) => `${w.companyName}${w.department ? ` ${w.department}` : ""}`)
    .join("、");

  const requestAI = async (section: "pr_text" | "work_description", currentText: string, context?: string) => {
    setAiLoading(true);
    setAiSuggestion("");
    setAiSection(section);
    try {
      const res = await fetch("/api/resume/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, currentText, context: context ?? workContext }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setAiSuggestion(text);
      }
    } catch {
      setAiSuggestion("AI提案の取得に失敗しました。もう一度お試しください。");
    } finally {
      setAiLoading(false);
    }
  };

  const applyPrSuggestion = () => {
    update({ prText: aiSuggestion });
    setAiSuggestion("");
    setAiSection(null);
  };

  const applyWorkSuggestion = () => {
    if (selectedWorkIdx === null) return;
    const updated = state.workExperiences.map((w, i) =>
      i === selectedWorkIdx ? { ...w, description: aiSuggestion } : w
    );
    update({ workExperiences: updated });
    setAiSuggestion("");
    setAiSection(null);
    setSelectedWorkIdx(null);
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
      <h2 className="mb-2 text-[18px] font-bold text-[#1f2937]">自己PR・アピールポイント</h2>
      <p className="mb-6 text-[13px] text-[#6b7280]">
        AIが文章の提案・添削をサポートします。「AI提案を生成」ボタンで改善案を取得できます。
      </p>

      {/* 自己PRテキスト */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[13px] font-bold text-[#444]">
            自己PR・特技・アピールポイント
          </label>
          <button
            type="button"
            onClick={() => requestAI("pr_text", state.prText)}
            disabled={aiLoading}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#2f6cff] px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {aiLoading && aiSection === "pr_text" ? (
              <span className="animate-pulse">✨ 生成中...</span>
            ) : (
              <>✨ AI提案を生成</>
            )}
          </button>
        </div>
        <textarea
          value={state.prText}
          onChange={(e) => update({ prText: e.target.value })}
          rows={6}
          className={textareaCls}
          placeholder="例）前職では営業職として新規顧客開拓を担当し、月間アポイントを20件以上達成してきました。粘り強く課題解決に取り組む姿勢が強みです..."
        />
        <div className="mt-1 text-right text-[11px] text-[#888]">{state.prText.length}文字</div>

        {/* AI提案結果（pr_text） */}
        {aiSection === "pr_text" && (aiSuggestion || aiLoading) && (
          <div className="mt-3 rounded-xl border border-[#7c3aed] bg-[#faf5ff] p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-[#7c3aed]">
              ✨ AI提案
            </div>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#374151]">
              {aiLoading && !aiSuggestion ? "生成中..." : aiSuggestion}
            </p>
            {!aiLoading && aiSuggestion && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={applyPrSuggestion}
                  className="rounded-lg bg-[#7c3aed] px-4 py-1.5 text-[12px] font-bold text-white hover:opacity-90 transition"
                >
                  この内容を使用
                </button>
                <button
                  onClick={() => { setAiSuggestion(""); setAiSection(null); }}
                  className="rounded-lg border border-[#d1d5db] px-4 py-1.5 text-[12px] text-[#555] hover:bg-[#f9fafb] transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => requestAI("pr_text", state.prText)}
                  className="rounded-lg border border-[#7c3aed] px-4 py-1.5 text-[12px] font-bold text-[#7c3aed] hover:bg-[#faf5ff] transition"
                >
                  再生成
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 職歴の業務内容添削 */}
      {state.workExperiences.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-[14px] font-bold text-[#444]">職歴の業務内容をAI添削</h3>
          <div className="space-y-3">
            {state.workExperiences.map((w, i) => (
              <div key={i} className="rounded-xl border border-[#e5e7eb] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#374151]">
                    {w.companyName}{w.department ? ` / ${w.department}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkIdx(i);
                      requestAI("work_description", w.description, `${w.companyName}${w.department ? ` ${w.department}` : ""}`);
                    }}
                    disabled={aiLoading}
                    className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#2f6cff] px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90 disabled:opacity-60 transition"
                  >
                    ✨ 業務内容を添削
                  </button>
                </div>
                <textarea
                  value={w.description}
                  onChange={(ev) => {
                    const updated = state.workExperiences.map((we, idx) =>
                      idx === i ? { ...we, description: ev.target.value } : we
                    );
                    update({ workExperiences: updated });
                  }}
                  rows={3}
                  className={textareaCls}
                  placeholder="業務内容を入力..."
                />

                {/* AI提案結果（work） */}
                {aiSection === "work_description" && selectedWorkIdx === i && (aiSuggestion || aiLoading) && (
                  <div className="mt-2 rounded-xl border border-[#7c3aed] bg-[#faf5ff] p-3">
                    <div className="mb-1.5 text-[11px] font-bold text-[#7c3aed]">✨ AI提案</div>
                    <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-[#374151]">
                      {aiLoading && !aiSuggestion ? "生成中..." : aiSuggestion}
                    </p>
                    {!aiLoading && aiSuggestion && (
                      <div className="mt-2 flex gap-2">
                        <button onClick={applyWorkSuggestion} className="rounded-lg bg-[#7c3aed] px-3 py-1 text-[11px] font-bold text-white hover:opacity-90 transition">
                          使用する
                        </button>
                        <button onClick={() => { setAiSuggestion(""); setAiSection(null); setSelectedWorkIdx(null); }}
                          className="rounded-lg border border-[#d1d5db] px-3 py-1 text-[11px] text-[#555] hover:bg-[#f9fafb] transition">
                          キャンセル
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
