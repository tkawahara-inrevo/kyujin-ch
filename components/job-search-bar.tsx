"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EMPLOYMENT_FILTER_OPTIONS } from "@/lib/job-options";

type Props = {
  defaultQ?: string;
  defaultLocation?: string;
  defaultCategory?: string;
  defaultEmploymentType?: string;
  defaultTarget?: string;
  defaultSort?: string;
  categories?: string[];
};

export function JobSearchBar({
  defaultQ = "",
  defaultLocation = "",
  defaultCategory = "",
  defaultEmploymentType = "",
  defaultTarget = "",
  defaultSort = "",
  categories = [],
}: Props) {
  const [q, setQ] = useState(defaultQ);
  const [location, setLocation] = useState(defaultLocation);
  const [category, setCategory] = useState(defaultCategory);
  const [empType, setEmpType] = useState(defaultEmploymentType);
  const router = useRouter();

  const hasFilters = defaultQ || defaultLocation || defaultCategory || defaultEmploymentType;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (location.trim()) params.set("location", location.trim());
    if (category) params.set("category", category);
    if (empType) params.set("employmentType", empType);
    if (defaultTarget) params.set("target", defaultTarget);
    if (defaultSort) params.set("sort", defaultSort);
    router.push(`/jobs?${params.toString()}`);
  }

  function handleClear() {
    setQ("");
    setLocation("");
    setCategory("");
    setEmpType("");
    const params = new URLSearchParams();
    if (defaultTarget) params.set("target", defaultTarget);
    if (defaultSort) params.set("sort", defaultSort);
    router.push(params.toString() ? `/jobs?${params.toString()}` : "/jobs");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[12px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
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

        <div>
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

        <div>
          <label className="mb-1 block text-[12px] font-semibold text-[#666]">
            カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-[8px] border border-[#d8d8d8] px-3 py-2 text-[13px] text-[#333] outline-none focus:border-[#2f6cff]"
          >
            <option value="">すべて</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-semibold text-[#666]">
            雇用形態
          </label>
          <select
            value={empType}
            onChange={(e) => setEmpType(e.target.value)}
            className="w-full rounded-[8px] border border-[#d8d8d8] px-3 py-2 text-[13px] text-[#333] outline-none focus:border-[#2f6cff]"
          >
            {EMPLOYMENT_FILTER_OPTIONS.map((et) => (
              <option key={et.value} value={et.value}>{et.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          className="rounded-[8px] bg-[#2f6cff] px-5 py-2 text-[13px] font-bold !text-white hover:opacity-90"
        >
          検索
        </button>
        {hasFilters && (
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
