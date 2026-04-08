"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ColumnHero({ defaultQ = "" }: { defaultQ?: string }) {
  const [q, setQ] = useState(defaultQ);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/column-preview?${params.toString()}`);
  }

  function handleReset() {
    setQ("");
    router.push("/column-preview");
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-6 pt-3 md:px-6">
      <div className="rounded-[16px] border-2 border-[#1d63e3]">
        {/* タブ */}
        <div className="grid grid-cols-2 overflow-hidden rounded-t-[14px]">
          <div className="bg-[#1d63e3] py-3 text-center text-[14px] font-bold text-white">
            就職最新情報
          </div>
          <Link
            href="/?tab=search"
            className="bg-[#f5f5f5] py-3 text-center text-[14px] font-bold text-[#eb0937] transition hover:bg-[#fff0f2]"
          >
            求人を探す
          </Link>
        </div>

        {/* 検索エリア */}
        <div className="rounded-b-[14px] bg-[#1d63e3] px-6 py-4">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-[12px] font-bold text-white">キーワードから探す</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-[8px] bg-white px-8 py-2 text-[13px] font-bold text-[#1d63e3] hover:opacity-90"
                >
                  検索
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-[8px] border-2 border-white px-8 py-2 text-[13px] font-bold text-white hover:bg-white hover:text-[#1d63e3]"
                >
                  リセット
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
