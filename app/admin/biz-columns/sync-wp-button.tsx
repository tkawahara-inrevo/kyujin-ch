"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncBizColumnsFromWp } from "@/app/actions/admin/biz-column-sync";

export function SyncWpButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleSync() {
    setMessage("");
    startTransition(async () => {
      const res = await syncBizColumnsFromWp();
      if (res.ok) {
        setMessage(`✓ WPから同期完了（新規 ${res.created}件 / 更新 ${res.updated}件）`);
        router.refresh();
      } else {
        setMessage(`× ${res.error}`);
      }
      setTimeout(() => setMessage(""), 8000);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        className="rounded-lg border border-[#1f2775] bg-white px-4 py-2.5 text-[13px] font-bold text-[#1f2775] hover:bg-[#f0f3ff] transition disabled:opacity-50"
      >
        {isPending ? "WP同期中..." : "WPから取り込み"}
      </button>
      {message && <p className="text-[11px] text-[#666]">{message}</p>}
    </div>
  );
}
