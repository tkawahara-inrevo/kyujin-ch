"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_OPTIONS, EMPLOYMENT_FILTER_OPTIONS } from "@/lib/job-options";

const AREA_OPTIONS = ["すべて", "北海道・東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"];
const PREFECTURES_BY_AREA: Record<string, string[]> = {
  "北海道・東北": ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  "関東": ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"],
  "中部": ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  "近畿": ["大阪府", "京都府", "兵庫県", "滋賀県", "奈良県", "和歌山県", "三重県"],
  "中国・四国": ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"],
  "九州・沖縄": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
};

type Props = {
  activeTab?: "news" | "search";
  defaultQ?: string;
  defaultCategory?: string;
  defaultEmploymentType?: string;
  defaultLocation?: string;
  searchPath?: string;
  includeSearchTabParam?: boolean;
  showTabs?: boolean;
};

export function TopHero({
  activeTab = "news",
  defaultQ = "",
  defaultCategory = "",
  defaultEmploymentType = "",
  defaultLocation = "",
  searchPath = "/",
  includeSearchTabParam = true,
  showTabs = true,
}: Props) {
  const [q, setQ] = useState(defaultQ);
  const [category, setCategory] = useState(defaultCategory);
  const [employmentType, setEmploymentType] = useState(defaultEmploymentType);
  const [area, setArea] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!defaultLocation) return;

    const matchedArea = AREA_OPTIONS.find((option) => option !== "すべて" && option === defaultLocation);
    if (matchedArea) {
      setArea(matchedArea);
      setPrefecture("");
      return;
    }

    const matchedEntry = Object.entries(PREFECTURES_BY_AREA).find(([, prefectures]) =>
      prefectures.includes(defaultLocation),
    );
    if (matchedEntry) {
      setArea(matchedEntry[0]);
      setPrefecture(defaultLocation);
      return;
    }

    setArea("");
    setPrefecture("");
  }, [defaultLocation]);

  const prefectureOptions = useMemo(
    () => (area ? PREFECTURES_BY_AREA[area] ?? [] : []),
    [area],
  );

  const location = prefecture || area;

  const borderColor = activeTab === "news" ? "border-[#3b6ff6]" : "border-[#ff5a78]";
  const bgColor     = activeTab === "news" ? "bg-[#3b6ff6]"     : "bg-[#ff5a78]";

  // 現在のtargetを維持する
  function getTarget(): string | null {
    if (typeof window === "undefined") return null;
    const url = new URLSearchParams(window.location.search);
    return url.get("target") || localStorage.getItem("kyujin-target");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (includeSearchTabParam) params.set("tab", "search");
    const target = getTarget();
    if (target) params.set("target", target);
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (employmentType) params.set("employmentType", employmentType);
    if (location) params.set("location", location);
    router.push(params.toString() ? `${searchPath}?${params.toString()}` : searchPath);
  }

  function handleNewsSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (includeSearchTabParam) params.set("tab", "search");
    const target = getTarget();
    if (target) params.set("target", target);
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    router.push(params.toString() ? `${searchPath}?${params.toString()}` : searchPath);
  }

  function handleReset() {
    setQ(""); setCategory(""); setEmploymentType(""); setArea(""); setPrefecture("");
    const target = getTarget();
    const params = new URLSearchParams();
    if (includeSearchTabParam) params.set("tab", "search");
    if (target) params.set("target", target);
    router.push(params.toString() ? `${searchPath}?${params.toString()}` : searchPath);
  }

  return (
    /* ページ背景の上にコンテナを乗せる */
    <div className="mx-auto max-w-[1200px] px-4 pt-3 pb-6 md:px-6">
      {/* 角丸ボーダーの一体型コンテナ */}
      <div className={`overflow-hidden rounded-[16px] border-2 ${borderColor}`}>

        {/* タブ行 */}
        {showTabs && (
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
        )}

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
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                  >
                    <option value="">すべて</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
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
              {/* モバイル: キーワードのみ */}
              <div className="md:hidden">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="キッチン、エンジニア"
                  className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none"
                />
                <div className="mt-3 flex justify-center">
                  <button type="submit" className="w-full rounded-[8px] bg-white py-2.5 text-[13px] font-bold text-[#ff5a78]">検索</button>
                </div>
              </div>
              {/* デスクトップ: フル検索 */}
              <div className="hidden md:block">
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-2">
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
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none">
                      <option value="">すべて</option>
                      {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">雇用形態</label>
                    <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none">
                      {EMPLOYMENT_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">エリア</label>
                    <select
                      value={area}
                      onChange={(e) => {
                        const nextArea = e.target.value === "すべて" ? "" : e.target.value;
                        setArea(nextArea);
                        if (!nextArea || !(PREFECTURES_BY_AREA[nextArea] ?? []).includes(prefecture)) {
                          setPrefecture("");
                        }
                      }}
                      className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                    >
                      {AREA_OPTIONS.map((a) => <option key={a} value={a === "すべて" ? "" : a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">都道府県</label>
                    <select
                      value={prefecture}
                      onChange={(e) => setPrefecture(e.target.value)}
                      disabled={!area}
                      className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none disabled:cursor-not-allowed disabled:bg-[#f2f2f2] disabled:text-[#999]"
                    >
                      <option value="">すべて</option>
                      {prefectureOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-3">
                  <button type="submit" className="rounded-[8px] bg-white px-10 py-2.5 text-[14px] font-bold text-[#ff5a78] hover:opacity-90">検索</button>
                  <button type="button" onClick={handleReset} className="rounded-[8px] border-2 border-white px-10 py-2.5 text-[14px] font-bold text-white hover:bg-white hover:text-[#ff5a78]">リセット</button>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
