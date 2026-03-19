"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { approveJob, returnJob } from "@/app/actions/admin/jobs";

export function JobReviewActions({
  jobId,
  disabledApprove,
}: {
  jobId: string;
  disabledApprove: boolean;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      await approveJob(jobId);
      router.refresh();
    });
  }

  function handleReturn() {
    setError(null);
    if (!comment.trim()) {
      setError("差し戻し理由を入力してください");
      return;
    }

    startTransition(async () => {
      await returnJob(jobId, comment);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <p className="text-[12px] font-semibold text-[#888]">審査アクション</p>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={4}
        placeholder="差し戻し理由を入力..."
        className="mt-3 w-full rounded-lg border border-[#ddd] px-3 py-2 text-[13px] outline-none focus:border-[#2f6cff]"
      />
      {error ? <p className="mt-2 text-[12px] font-medium text-[#dc2626]">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending || disabledApprove}
          className="rounded-lg bg-[#16a34a] px-4 py-2 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          承認して公開
        </button>
        <button
          type="button"
          onClick={handleReturn}
          disabled={isPending}
          className="rounded-lg bg-[#ffedd5] px-4 py-2 text-[13px] font-bold text-[#c2410c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          差し戻し
        </button>
      </div>
    </div>
  );
}
