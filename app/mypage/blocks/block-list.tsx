"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unblockUser } from "@/app/actions/user/blocks";

type Item = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  blockedAt: string;
};

export function BlockList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (items.length === 0) {
    return <p className="mt-6 text-[14px] text-[#888]">ブロック中のユーザーはいません。</p>;
  }

  function handleUnblock(userId: string, name: string) {
    if (!confirm(`${name} のブロックを解除しますか？`)) return;
    setError("");
    startTransition(async () => {
      const res = await unblockUser(userId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#dc2626]">{error}</div>
      )}
      <ul className="divide-y divide-[#eef0f5] rounded-xl border border-[#eef0f5]">
        {items.map((item) => (
          <li key={item.userId} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-[14px] font-bold text-[#333]">{item.name}</p>
              <p className="text-[11px] text-[#888]">
                {new Date(item.blockedAt).toLocaleString("ja-JP")} にブロック
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleUnblock(item.userId, item.name)}
              disabled={busy}
              className="rounded-full border border-[#d0d7e6] px-4 py-1.5 text-[12px] font-bold text-[#445063] hover:bg-[#f4f7fb] disabled:opacity-50"
            >
              ブロック解除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
