"use client";

import { useState } from "react";
import type { WizardState } from "../resume-wizard";
import type { ResumeData } from "@/lib/resume/types";
import { CAREER_JOB_TYPES } from "@/lib/resume/types";

type Props = {
  state: WizardState;
  onBack: () => void;
};

type DownloadStatus = "idle" | "loading" | "done" | "error";

async function downloadDoc(
  data: ResumeData,
  docType: "resume" | "career",
  format: "pdf" | "xlsx"
): Promise<boolean> {
  try {
    const res = await fetch("/api/resume/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, docType, format }),
    });
    if (!res.ok) return false;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = docType === "resume"
      ? `履歴書.${format}`
      : `職務経歴書.${format}`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export function StepConfirm({ state, onBack }: Props) {
  const [statuses, setStatuses] = useState<Record<string, DownloadStatus>>({});

  const setStatus = (key: string, s: DownloadStatus) =>
    setStatuses((prev) => ({ ...prev, [key]: s }));

  const data: ResumeData = {
    lastName: state.lastName,
    firstName: state.firstName,
    lastNameKana: state.lastNameKana,
    firstNameKana: state.firstNameKana,
    birthDate: state.birthDate,
    gender: state.gender,
    email: state.email,
    phone: state.phone,
    postalCode: state.postalCode,
    prefecture: state.prefecture,
    cityTown: state.cityTown,
    addressLine: state.addressLine,
    educations: state.educations,
    workExperiences: state.workExperiences,
    certifications: state.certifications,
    prText: state.prText,
    jobPreference: state.jobPreference,
    docType: state.docType.length === 1 ? state.docType[0] : "both",
    outputFormat: state.outputFormat,
    careerJobType: state.careerJobType,
  };

  const jobTypeLabel = CAREER_JOB_TYPES.find((t) => t.value === state.careerJobType)?.label;

  // 生成ボタンマトリクス: docType × format
  const generateButtons: { docType: "resume" | "career"; format: "pdf" | "xlsx"; label: string; key: string }[] = [];
  for (const dt of state.docType) {
    for (const fmt of state.outputFormat) {
      generateButtons.push({
        docType: dt,
        format: fmt,
        label: `${dt === "resume" ? "履歴書" : "職務経歴書"} (${fmt.toUpperCase()})`,
        key: `${dt}-${fmt}`,
      });
    }
  }

  const handleGenerate = async (docType: "resume" | "career", format: "pdf" | "xlsx", key: string) => {
    setStatus(key, "loading");
    const ok = await downloadDoc(data, docType, format);
    setStatus(key, ok ? "done" : "error");
  };

  const allDone = generateButtons.length > 0 && generateButtons.every((b) => statuses[b.key] === "done");

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold text-[#1f2937]">確認・ダウンロード</h2>
      <p className="mb-6 text-[13px] text-[#6b7280]">
        入力内容を確認し、下のボタンを押すと書類が生成されてすぐにダウンロードされます。
      </p>

      {/* 確認サマリー */}
      <div className="mb-6 space-y-3 rounded-xl bg-[#f8fafc] p-4">
        <div>
          <span className="text-[12px] font-bold text-[#888]">氏名</span>
          <p className="text-[14px] text-[#1f2937]">
            {state.lastName} {state.firstName}（{state.lastNameKana} {state.firstNameKana}）
          </p>
        </div>
        <div>
          <span className="text-[12px] font-bold text-[#888]">学歴</span>
          <p className="text-[13px] text-[#374151]">
            {state.educations.length > 0
              ? state.educations.map((e) => `${e.schoolName} ${e.status}`).join(" / ")
              : "なし"}
          </p>
        </div>
        <div>
          <span className="text-[12px] font-bold text-[#888]">職歴</span>
          <p className="text-[13px] text-[#374151]">
            {state.workExperiences.length > 0
              ? state.workExperiences.map((w) => w.companyName).join(" → ")
              : "なし（新卒・初職）"}
          </p>
        </div>
        <div>
          <span className="text-[12px] font-bold text-[#888]">資格</span>
          <p className="text-[13px] text-[#374151]">
            {state.certifications.length > 0
              ? state.certifications.map((c) => c.name).join(" / ")
              : "なし"}
          </p>
        </div>
        {state.docType.includes("career") && (
          <div>
            <span className="text-[12px] font-bold text-[#888]">職務経歴書フォーマット</span>
            <p className="text-[13px] text-[#374151]">{jobTypeLabel}</p>
          </div>
        )}
      </div>

      {/* 生成ボタン */}
      <div className="mb-6">
        <h3 className="mb-3 text-[14px] font-bold text-[#444]">ボタンを押してダウンロード</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {generateButtons.map(({ docType, format, label, key }) => {
            const status = statuses[key] ?? "idle";
            return (
              <button
                key={key}
                onClick={() => handleGenerate(docType, format, key)}
                disabled={status === "loading"}
                className={`relative flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-[14px] font-bold transition ${
                  status === "done"
                    ? "border-[#22c55e] bg-[#f0fdf4] text-[#16a34a]"
                    : status === "error"
                    ? "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]"
                    : status === "loading"
                    ? "border-[#93c5fd] bg-[#eff6ff] text-[#2f6cff] opacity-75"
                    : "border-[#2f6cff] bg-white text-[#2f6cff] hover:bg-[#f0f5ff]"
                }`}
              >
                {status === "done" && <span>✅</span>}
                {status === "error" && <span>⚠️</span>}
                {status === "loading" && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {status === "idle" && <span>⬇️</span>}
                {status === "loading" ? "生成中..." : status === "done" ? `${label} ダウンロード済み` : `${label} をダウンロード`}
              </button>
            );
          })}
        </div>
      </div>

      {allDone && (
        <div className="mb-6 rounded-xl bg-[#f0fdf4] border border-[#22c55e] px-4 py-3 text-[13px] text-[#15803d] font-bold">
          ✅ すべての書類が生成されました！ダウンロードしてご確認ください。
        </div>
      )}

      <p className="mb-6 text-[11px] text-[#888]">
        ※ 生成された書類は求職者様の端末にダウンロードされます。サーバーには保存されません。<br />
        ※ 内容を修正したい場合は「戻る」から各ステップを再編集してください。
      </p>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-[#d1d5db] px-6 py-2.5 text-[14px] text-[#555] hover:bg-[#f9fafb] transition"
        >
          ← 戻る（再編集）
        </button>
        <a
          href="/mypage"
          className="rounded-lg bg-[#f3f4f6] px-6 py-2.5 text-[14px] font-bold text-[#555] hover:bg-[#e5e7eb] transition"
        >
          マイページに戻る
        </a>
      </div>
    </div>
  );
}
