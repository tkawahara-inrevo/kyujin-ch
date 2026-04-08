"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ColumnSearchForm() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/column-preview?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-1">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="flex-1 rounded-[4px] border border-[#ccc] bg-[#fafafa] px-2 py-1 text-[12px] text-[#666] outline-none focus:border-[#2f6cff]"
        placeholder="キッチン、エンジニア"
      />
    </form>
  );
}
