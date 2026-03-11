"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_OPTIONS = ["すべて", "エンジニア", "デザイナー", "営業", "マーケター", "その他"];
const EMPLOYMENT_OPTIONS = [
  { label: "すべて", value: "" },
  { label: "正社員", value: "FULL_TIME" },
  { label: "パート・アルバイト", value: "PART_TIME" },
  { label: "契約社員", value: "CONTRACT" },
  { label: "派遣社員", value: "TEMPORARY" },
  { label: "インターン", value: "INTERN" },
];
const AREA_OPTIONS = ["すべて", "北海道・東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"];
const PREF_OPTIONS = ["すべて", "東京都", "大阪府", "愛知県", "神奈川県", "福岡県", "北海道", "京都府", "その他"];

type Props = {
  activeTab?: "news" | "search";
  defaultQ?: string;
  defaultCategory?: string;
  defaultEmploymentType?: string;
  defaultLocation?: string;
};

export function TopHero({
  activeTab = "news",
  defaultQ = "",
  defaultCategory = "",
  defaultEmploymentType = "",
  defaultLocation = "",
}: Props) {
  const [q, setQ] = useState(defaultQ);
  const [category, setCategory] = useState(defaultCategory);
  const [employmentType, setEmploymentType] = useState(defaultEmploymentType);
  const [location, setLocation] = useState(defaultLocation);
  const router = useRouter();

  const borderColor = activeTab === "news" ? "border-[#3b6ff6]" : "border-[#ff5a78]";
  const bgColor     = activeTab === "news" ? "bg-[#3b6ff6]"     : "bg-[#ff5a78]";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ tab: "search" });
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (employmentType) params.set("employmentType", employmentType);
    if (location) params.set("location", location);
    router.push(`/?${params.toString()}`);
  }

  function handleNewsSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ tab: "search" });
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    router.push(`/?${params.toString()}`);
  }

  function handleReset() {
    setQ(""); setCategory(""); setEmploymentType(""); setLocation("");
    router.push("/?tab=search");
  }

  return (
    /* ページ背景の上にコンテナを乗せる */
    <div className="mx-auto max-w-[1200px] px-4 pt-3 pb-6 md:px-6">
      {/* 角丸ボーダーの一体型コンテナ */}
      <div className={`overflow-hidden rounded-[16px] border-2 ${borderColor}`}>

        {/* タブ行 */}
        <div className="grid grid-cols-2">
          {/* 就職最新情報は常に別タブで /news を開く */}
          <a
            href="/news"
            target="_blank"
            rel="noopener noreferrer"
            className={`block py-3 text-center text-[14px] font-bold transition ${
              activeTab === "news"
                ? "bg-white text-[#3b6ff6]"
                : "bg-[#f5f5f5] text-[#aaa]"
            }`}
          >
            就職最新情報
          </a>
          <button
            onClick={() => router.push("/?tab=search")}
            className={`py-3 text-[14px] font-bold transition ${
              activeTab === "search"
                ? "bg-white text-[#ff5a78]"
                : "bg-[#f5f5f5] text-[#aaa]"
            }`}
          >
            求人を探す
          </button>
        </div>

        {/* 検索フォームエリア（色帯）*/}
        <div className={`${bgColor} px-6 py-5`}>
          {activeTab === "news" ? (
            <form onSubmit={handleNewsSearch}>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-[11px] font-bold text-white">キーワードから探す</label>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="キッチン、エンジニア"
                    className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                  />
                </div>
                <div className="min-w-[140px]">
                  <label className="mb-1 block text-[11px] font-bold text-white">カテゴリ</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value === "すべて" ? "" : e.target.value)}
                    className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c === "すべて" ? "" : c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="rounded-[8px] bg-white px-8 py-2 text-[13px] font-bold text-[#3b6ff6] hover:opacity-90">検索</button>
                  <button type="button" onClick={() => { setQ(""); setCategory(""); }} className="rounded-[8px] border-2 border-white px-8 py-2 text-[13px] font-bold text-white hover:bg-white hover:text-[#3b6ff6]">リセット</button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="mb-1 block text-[11px] font-bold text-white">キーワードから探す</label>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="キッチン、エンジニア"
                    className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-white">カテゴリ</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value === "すべて" ? "" : e.target.value)} className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none">
                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c === "すべて" ? "" : c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-white">雇用形態</label>
                  <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none">
                    {EMPLOYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-white">エリア</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value === "すべて" ? "" : e.target.value)} className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none">
                    {AREA_OPTIONS.map((a) => <option key={a} value={a === "すべて" ? "" : a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-white">都道府県</label>
                  <select className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none">
                    {PREF_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-3">
                <button type="submit" className="rounded-[8px] bg-white px-10 py-2.5 text-[14px] font-bold text-[#ff5a78] hover:opacity-90">検索</button>
                <button type="button" onClick={handleReset} className="rounded-[8px] border-2 border-white px-10 py-2.5 text-[14px] font-bold text-white hover:bg-white hover:text-[#ff5a78]">リセット</button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
