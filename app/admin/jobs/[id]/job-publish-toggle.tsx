"use client";

import { useTransition } from "react";

export function JobPublishToggle({
  jobId,
  isPublished,
}: {
  jobId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleToggle() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/jobs/${jobId}/toggle-publish`, {
        method: "POST",
      });
      if (res.ok) {
        window.location.reload();
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-lg px-4 py-2 text-[13px] font-bold transition ${
        isPublished
          ? "bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca]"
          : "bg-[#d1fae5] text-[#059669] hover:bg-[#a7f3d0]"
      } disabled:opacity-50`}
    >
      {isPending ? "処理中..." : isPublished ? "公開停止する" : "公開する"}
    </button>
  );
}
