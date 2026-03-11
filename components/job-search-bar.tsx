"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  defaultQ?: string;
  defaultLocation?: string;
};

export function JobSearchBar({ defaultQ = "", defaultLocation = "" }: Props) {
  const [q, setQ] = useState(defaultQ);
  const [location, setLocation] = useState(defaultLocation);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs?${params.toString()}`);
  }

  function handleClear() {
    setQ("");
    setLocation("");
    router.push("/jobs");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-[12px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-[12px] font-semibold text-[#666]">
          キーワード
        </label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-[8px] border border-[#d8d8d8] px-3 py-2 text-[13px] text-[#333] outline-none focus:border-[#2f6cff]"
          placeholder="職種、会社名など"
        />
      </div>

      <div className="flex-1">
        <label className="mb-1 block text-[12px] font-semibold text-[#666]">
          勤務地
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-[8px] border border-[#d8d8d8] px-3 py-2 text-[13px] text-[#333] outline-none focus:border-[#2f6cff]"
          placeholder="東京都、大阪府など"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-[8px] bg-[#2f6cff] px-5 py-2 text-[13px] font-bold text-white hover:opacity-90"
        >
          検索
        </button>
        {(defaultQ || defaultLocation) && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-[8px] border border-[#d8d8d8] px-4 py-2 text-[13px] font-semibold text-[#666] hover:bg-[#f5f5f5]"
          >
            クリア
          </button>
        )}
      </div>
    </form>
  );
}
