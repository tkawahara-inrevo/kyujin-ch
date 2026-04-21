"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";
import { approveJob, returnJob } from "@/app/actions/admin/jobs";

const RETURN_FIELDS: { key: string; label: string; anchorId?: string }[] = [
  { key: "title",           label: "タイトル",      anchorId: "section-title" },
  { key: "image",           label: "メイン画像",     anchorId: "section-title" },
  { key: "category",        label: "求人カテゴリ",   anchorId: "section-employment" },
  { key: "employmentType",  label: "雇用形態",       anchorId: "section-employment" },
  { key: "description",     label: "仕事内容",       anchorId: "section-description" },
  { key: "requirements",    label: "応募条件",       anchorId: "section-description" },
  { key: "salary",          label: "給与",           anchorId: "section-salary" },
  { key: "fixedOvertime",   label: "みなし残業",     anchorId: "section-salary" },
  { key: "workingHours",    label: "勤務時間",       anchorId: "section-employment" },
  { key: "trialPeriod",     label: "試用期間",       anchorId: "section-trial" },
  { key: "holiday",         label: "休日・休暇",     anchorId: "section-holiday" },
  { key: "benefits",        label: "福利厚生",       anchorId: "section-benefits" },
  { key: "location",        label: "勤務地",         anchorId: "section-employment" },
  { key: "selectionProcess",label: "選考フロー",     anchorId: "section-selection" },
  { key: "smoking",         label: "受動喫煙対策",   anchorId: "section-smoking" },
  { key: "other",           label: "その他" },
];

function scrollToSection(id?: string) {
  if (!id) return;
  const panel = document.getElementById("left-panel");
  const target = document.getElementById(id);
  if (!panel || !target) return;
  const panelRect = panel.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  panel.scrollBy({ top: targetRect.top - panelRect.top - 16, behavior: "smooth" });
}

export function JobReviewActions({
  jobId,
  isPublished,
}: {
  jobId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"approved" | "returned" | null>(null);
  const [showReturnForm, setShowReturnForm] = useState(!isPublished);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (selectedKey && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedKey]);

  function handleFieldClick(key: string, anchorId?: string) {
    setSelectedKey((prev) => (prev === key ? null : key));
    scrollToSection(anchorId);
  }

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      await approveJob(jobId);
      setDone("approved");
      router.refresh();
    });
  }

  function handleReturn() {
    setError(null);
    const hasAny = Object.values(comments).some((v) => v.trim());
    if (!hasAny) {
      setError("少なくとも1つの項目にコメントを入力してください");
      return;
    }
    startTransition(async () => {
      await returnJob(jobId, comments);
      setDone("returned");
      router.refresh();
    });
  }

  if (done === "returned") {
    return <p className="mt-3 text-[14px] font-bold text-[#c2410c]">差し戻し済み。</p>;
  }
  if (done === "approved") {
    return <p className="mt-3 text-[14px] font-bold text-[#16a34a]">承認して公開済み。</p>;
  }

  const filledCount = Object.values(comments).filter((v) => v.trim()).length;

  return (
    <div className="mt-3 space-y-3">
      {/* 承認ボタン */}
      {!isPublished && (
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="w-full rounded-[8px] bg-[#16a34a] py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
        >
          承認して公開
        </button>
      )}

      {/* 公開中 + 差し戻しトグル */}
      {isPublished && !showReturnForm && (
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#16a34a]">公開中</span>
          <button
            type="button"
            onClick={() => setShowReturnForm(true)}
            className="rounded-[8px] border border-[#c2410c] px-3 py-1.5 text-[12px] font-bold text-[#c2410c] hover:bg-[#fff5f0] transition"
          >
            差し戻す（公開停止）
          </button>
        </div>
      )}

      {/* 差し戻しフォーム */}
      {showReturnForm && (
        <div className="space-y-2">
          {isPublished && (
            <p className="text-[12px] font-semibold text-[#c2410c]">
              ⚠️ 差し戻しすると非公開になります
            </p>
          )}

          {/* フィールドリスト */}
          <div className="rounded-[10px] border border-[#e8e8e8] overflow-hidden">
            {RETURN_FIELDS.map(({ key, label, anchorId }, i) => {
              const isSelected = selectedKey === key;
              const hasComment = !!comments[key]?.trim();
              return (
                <div key={key} className={i > 0 ? "border-t border-[#f0f0f0]" : ""}>
                  <button
                    type="button"
                    onClick={() => handleFieldClick(key, anchorId)}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "bg-[#fff5f0]"
                        : "bg-white hover:bg-[#fafafa]"
                    }`}
                  >
                    <span className={`text-[12px] font-semibold ${isSelected ? "text-[#c2410c]" : "text-[#444]"}`}>
                      {label}
                      {anchorId && (
                        <span className="ml-1 text-[10px] text-[#2f6cff]">↗</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {hasComment && (
                        <span className="rounded-full bg-[#c2410c] px-1.5 py-0.5 text-[9px] font-bold text-white">
                          入力済
                        </span>
                      )}
                      <span className={`text-[10px] transition-transform ${isSelected ? "rotate-180 text-[#c2410c]" : "text-[#bbb]"}`}>
                        ▼
                      </span>
                    </span>
                  </button>

                  {isSelected && (
                    <div className="border-t border-[#f0e8e4] bg-[#fff8f5] px-3 pb-3 pt-2">
                      <textarea
                        ref={textareaRef}
                        rows={4}
                        value={comments[key] ?? ""}
                        onChange={(e) =>
                          setComments((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder="修正コメントを入力（任意）"
                        className="w-full resize-none rounded-[6px] border border-[#e0d0c8] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#c2410c] placeholder:text-[#ccc]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filledCount > 0 && (
            <p className="text-right text-[11px] text-[#888]">{filledCount}項目にコメント入力済み</p>
          )}

          {error && <p className="text-[12px] font-medium text-[#dc2626]">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleReturn}
              disabled={isPending}
              className="flex-1 rounded-[8px] bg-[#c2410c] py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
            >
              {isPending ? "送信中..." : "差し戻し確定"}
            </button>
            {isPublished && (
              <button
                type="button"
                onClick={() => { setShowReturnForm(false); setSelectedKey(null); }}
                className="rounded-[8px] border border-[#ccc] px-3 py-2 text-[12px] text-[#555] hover:bg-[#f5f5f5] transition"
              >
                戻す
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
