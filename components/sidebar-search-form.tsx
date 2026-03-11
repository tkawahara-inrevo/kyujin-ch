"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SidebarSearchForm() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <div>
      <h3 className="mb-2 text-[13px] font-bold text-[#444]">キーワードから探す</h3>
      <form onSubmit={handleSubmit} className="flex gap-1">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 rounded-[6px] border border-[#d8d8d8] px-3 py-2 text-[12px] text-[#666] outline-none focus:border-[#2f6cff]"
          placeholder="キッチン、エンジニア"
        />
        <button
          type="submit"
          className="rounded-[6px] bg-[#2f6cff] px-3 py-2 text-[12px] font-bold text-white hover:opacity-90"
        >
          検索
        </button>
      </form>
    </div>
  );
}
