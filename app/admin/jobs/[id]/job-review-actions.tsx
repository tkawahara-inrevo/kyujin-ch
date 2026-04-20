"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

function scrollTo(id?: string) {
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

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
          <p className="text-[11px] text-[#888]">
            各項目のラベルをクリックするとその箇所にジャンプします
          </p>

          <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">
            {RETURN_FIELDS.map(({ key, label, anchorId }) => (
              <div key={key} className={`rounded-[8px] border p-2 transition ${focusedKey === key ? "border-[#c2410c] bg-[#fff8f5]" : "border-[#e8e8e8] bg-[#fafafa]"}`}>
                <button
                  type="button"
                  onClick={() => scrollTo(anchorId)}
                  className={`mb-1 block text-left text-[11px] font-bold transition ${anchorId ? "text-[#2f6cff] hover:underline cursor-pointer" : "text-[#555] cursor-default"}`}
                >
                  {label}{anchorId ? " ↗" : ""}
                </button>
                <textarea
                  rows={2}
                  value={comments[key] ?? ""}
                  onFocus={() => {
                    setFocusedKey(key);
                    scrollTo(anchorId);
                  }}
                  onBlur={() => setFocusedKey(null)}
                  onChange={(e) => setComments((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder="修正コメント（任意）"
                  className="w-full resize-none rounded-[6px] border border-[#e0d8d0] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#c2410c] placeholder:text-[#d0d0d0]"
                />
              </div>
            ))}
          </div>

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
                onClick={() => setShowReturnForm(false)}
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
