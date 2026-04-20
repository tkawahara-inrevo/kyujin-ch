"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { approveJob, returnJob } from "@/app/actions/admin/jobs";

const RETURN_FIELDS: { key: string; label: string }[] = [
  { key: "title",          label: "タイトル" },
  { key: "image",          label: "メイン画像" },
  { key: "category",       label: "求人カテゴリ" },
  { key: "employmentType", label: "雇用形態" },
  { key: "description",    label: "仕事内容" },
  { key: "requirements",   label: "応募条件" },
  { key: "salary",         label: "給与" },
  { key: "fixedOvertime",  label: "みなし残業" },
  { key: "workingHours",   label: "勤務時間" },
  { key: "trialPeriod",    label: "試用期間" },
  { key: "holiday",        label: "休日・休暇" },
  { key: "benefits",       label: "福利厚生" },
  { key: "location",       label: "勤務地" },
  { key: "selectionProcess", label: "選考フロー" },
  { key: "smoking",        label: "受動喫煙対策" },
  { key: "other",          label: "その他" },
];

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
  const [showReturnForm, setShowReturnForm] = useState(false);

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
    return <p className="mt-4 text-[15px] font-bold text-[#c2410c]">差し戻し済み。</p>;
  }
  if (done === "approved") {
    return <p className="mt-4 text-[15px] font-bold text-[#16a34a]">承認して公開済み。</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      {/* 承認ボタン（公開済みは非表示） */}
      {!isPublished && (
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="rounded-lg bg-[#16a34a] px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
        >
          承認して公開
        </button>
      )}

      {/* 公開中バッジ + 差し戻しトグル */}
      {isPublished && !showReturnForm && (
        <div className="flex items-center gap-4">
          <span className="text-[15px] font-bold text-[#16a34a]">公開中</span>
          <button
            type="button"
            onClick={() => setShowReturnForm(true)}
            className="rounded-lg border border-[#c2410c] px-4 py-2 text-[13px] font-bold text-[#c2410c] hover:bg-[#fff5f0] transition"
          >
            差し戻す（公開停止）
          </button>
        </div>
      )}

      {/* 差し戻しフォーム */}
      {(!isPublished || showReturnForm) && (
        <div className="rounded-[12px] border border-[#fde8d8] bg-[#fff8f5] p-4 space-y-3">
          {isPublished && (
            <p className="text-[13px] font-semibold text-[#c2410c]">
              ⚠️ 差し戻しすると求人は非公開になります。
            </p>
          )}
          <p className="text-[13px] font-bold text-[#333]">修正依頼コメント（項目ごとに入力）</p>
          <div className="space-y-3">
            {RETURN_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block text-[12px] font-semibold text-[#555]">{label}</label>
                <textarea
                  rows={2}
                  value={comments[key] ?? ""}
                  onChange={(e) =>
                    setComments((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={`${label}に関する修正コメント（任意）`}
                  className="w-full rounded-[8px] border border-[#e0d8d0] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#c2410c] resize-none placeholder:text-[#ccc]"
                />
              </div>
            ))}
          </div>
          {error && <p className="text-[12px] font-medium text-[#dc2626]">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleReturn}
              disabled={isPending}
              className="rounded-lg bg-[#c2410c] px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
            >
              {isPending ? "送信中..." : "差し戻し確定"}
            </button>
            {isPublished && (
              <button
                type="button"
                onClick={() => setShowReturnForm(false)}
                className="rounded-lg border border-[#ccc] px-4 py-2 text-[13px] font-medium text-[#555] hover:bg-[#f5f5f5] transition"
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
