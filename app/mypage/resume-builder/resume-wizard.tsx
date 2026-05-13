"use client";

import { useState } from "react";
import type { EducationEntry, WorkExperienceEntry, CertificationEntry } from "@/lib/resume/types";
import { StepFormat } from "./steps/step-format";
import { StepBasicInfo } from "./steps/step-basic-info";
import { StepEducation } from "./steps/step-education";
import { StepWorkExperience } from "./steps/step-work-experience";
import { StepCertification } from "./steps/step-certification";
import { StepPrText } from "./steps/step-pr-text";
import { StepPreferences } from "./steps/step-preferences";
import { StepConfirm } from "./steps/step-confirm";

export type WizardState = {
  docType: ("resume" | "career")[];
  outputFormat: ("pdf" | "xlsx")[];
  careerJobType: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  birthDate: string;
  gender: string;
  email: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  cityTown: string;
  addressLine: string;
  educations: EducationEntry[];
  workExperiences: WorkExperienceEntry[];
  certifications: CertificationEntry[];
  prText: string;
  jobPreference: string;
};

type Props = {
  user: {
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    birthDate: string;
    gender: string;
    email: string;
    phone: string;
    postalCode: string;
    prefecture: string;
    cityTown: string;
    addressLine: string;
  };
  savedEducations: EducationEntry[];
  savedWorkExperiences: WorkExperienceEntry[];
  savedCertifications: CertificationEntry[];
  savedPrText: string;
  savedJobPreference: string;
};

const STEPS = [
  "作成設定",
  "基本情報",
  "学歴",
  "職歴",
  "資格・免許",
  "自己PR",
  "希望条件",
  "確認・生成",
];

export function ResumeWizard({
  user,
  savedEducations,
  savedWorkExperiences,
  savedCertifications,
  savedPrText,
  savedJobPreference,
}: Props) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    docType: ["resume"],
    outputFormat: ["pdf"],
    careerJobType: "general",
    ...user,
    birthDate: user.birthDate || "2000-04-01",
    educations: savedEducations,
    workExperiences: savedWorkExperiences,
    certifications: savedCertifications,
    prText: savedPrText,
    jobPreference: savedJobPreference,
  });

  const update = (patch: Partial<WizardState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // 履歴書のみの場合は学歴・資格ステップをスキップしない（履歴書に必要）
  // 職務経歴書のみの場合は学歴ステップをスキップ可能だが、今は常に表示

  return (
    <div>
      {/* タイトル */}
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#1f2937]">AI書類作成</h1>
        <p className="mt-1 text-[13px] text-[#6b7280]">
          履歴書・職務経歴書をAIのサポートで自動作成します
        </p>
      </div>

      {/* ステップインジケーター */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition ${
                    i === step
                      ? "bg-[#2f6cff] text-white"
                      : i < step
                      ? "cursor-pointer bg-[#22c55e] text-white hover:opacity-80"
                      : "bg-[#e5e7eb] text-[#9ca3af]"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </button>
                <span
                  className={`mt-1 whitespace-nowrap text-[10px] ${
                    i === step ? "font-bold text-[#2f6cff]" : "text-[#9ca3af]"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mb-4 h-[2px] w-8 ${
                    i < step ? "bg-[#22c55e]" : "bg-[#e5e7eb]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ステップコンテンツ */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        {step === 0 && (
          <StepFormat state={state} update={update} onNext={next} />
        )}
        {step === 1 && (
          <StepBasicInfo state={state} update={update} onNext={next} onBack={back} />
        )}
        {step === 2 && (
          <StepEducation state={state} update={update} onNext={next} onBack={back} />
        )}
        {step === 3 && (
          <StepWorkExperience state={state} update={update} onNext={next} onBack={back} />
        )}
        {step === 4 && (
          <StepCertification state={state} update={update} onNext={next} onBack={back} />
        )}
        {step === 5 && (
          <StepPrText state={state} update={update} onNext={next} onBack={back} />
        )}
        {step === 6 && (
          <StepPreferences state={state} update={update} onNext={next} onBack={back} />
        )}
        {step === 7 && (
          <StepConfirm state={state} onBack={back} />
        )}
      </div>
    </div>
  );
}
