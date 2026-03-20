"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AREA_OPTIONS, PREFECTURES_BY_AREA } from "@/lib/job-locations";
import { CATEGORY_OPTIONS, EMPLOYMENT_FILTER_OPTIONS } from "@/lib/job-options";

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
  const router = useRouter();
  const [q, setQ] = useState(defaultQ);
  const [category, setCategory] = useState(defaultCategory);
  const [employmentType, setEmploymentType] = useState(defaultEmploymentType);
  const [area, setArea] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(
    Boolean(defaultCategory || defaultEmploymentType || defaultLocation),
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setQ(defaultQ);
      setCategory(defaultCategory);
      setEmploymentType(defaultEmploymentType);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [defaultQ, defaultCategory, defaultEmploymentType]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!defaultLocation) {
        setArea("");
        setPrefecture("");
        return;
      }

      if (AREA_OPTIONS.includes(defaultLocation)) {
        setArea(defaultLocation);
        setPrefecture("");
        return;
      }

      const matchedArea = Object.entries(PREFECTURES_BY_AREA).find(([, prefectures]) =>
        prefectures.includes(defaultLocation),
      );

      if (matchedArea) {
        setArea(matchedArea[0]);
        setPrefecture(defaultLocation);
        return;
      }

      setArea("");
      setPrefecture("");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [defaultLocation]);

  const prefectureOptions = useMemo(
    () => (area ? PREFECTURES_BY_AREA[area] ?? [] : []),
    [area],
  );

  const location = prefecture || area;
  const hasAdvancedFilters = Boolean(category || employmentType || location);
  const borderColor = activeTab === "news" ? "border-[#3b6ff6]" : "border-[#ff5a78]";
  const backgroundColor = activeTab === "news" ? "bg-[#3b6ff6]" : "bg-[#ff5a78]";
  const actionTextColor = activeTab === "news" ? "text-[#3b6ff6]" : "text-[#ff5a78]";
  const hoverTextColor = activeTab === "news" ? "hover:text-[#3b6ff6]" : "hover:text-[#ff5a78]";

  function getTarget(): string | null {
    if (typeof window === "undefined") return null;
    const url = new URLSearchParams(window.location.search);
    return url.get("target") || localStorage.getItem("kyujin-target");
  }

  function buildSearchParams(includeAllFilters: boolean) {
    const params = new URLSearchParams();
    if (includeSearchTabParam) {
      params.set("tab", "search");
    }

    const target = getTarget();
    if (target) {
      params.set("target", target);
    }
    if (q.trim()) {
      params.set("q", q.trim());
    }
    if (category) {
      params.set("category", category);
    }

    if (includeAllFilters) {
      if (employmentType) {
        params.set("employmentType", employmentType);
      }
      if (location) {
        params.set("location", location);
      }
    }

    return params;
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = buildSearchParams(true);
    router.push(params.toString() ? `${searchPath}?${params.toString()}` : searchPath);
  }

  function handleNewsSearch(e: FormEvent) {
    e.preventDefault();
    const params = buildSearchParams(false);
    router.push(params.toString() ? `${searchPath}?${params.toString()}` : searchPath);
  }

  function handleReset() {
    setQ("");
    setCategory("");
    setEmploymentType("");
    setArea("");
    setPrefecture("");
    setMobileFiltersOpen(false);

    const params = new URLSearchParams();
    if (includeSearchTabParam) {
      params.set("tab", "search");
    }

    const target = getTarget();
    if (target) {
      params.set("target", target);
    }

    router.push(params.toString() ? `${searchPath}?${params.toString()}` : searchPath);
  }

  function renderAreaSelect() {
    return (
      <div>
        <label className="mb-1 block text-[11px] font-bold text-white">エリア</label>
        <select
          value={area}
          onChange={(e) => {
            const nextArea = e.target.value;
            setArea(nextArea);
            if (!nextArea || !(PREFECTURES_BY_AREA[nextArea] ?? []).includes(prefecture)) {
              setPrefecture("");
            }
          }}
          className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none"
        >
          <option value="">すべて</option>
          {AREA_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function renderPrefectureSelect() {
    return (
      <div>
        <label className="mb-1 block text-[11px] font-bold text-white">都道府県</label>
        <select
          value={prefecture}
          onChange={(e) => setPrefecture(e.target.value)}
          disabled={!area}
          className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none disabled:cursor-not-allowed disabled:bg-[#f2f2f2] disabled:text-[#999]"
        >
          <option value="">すべて</option>
          {prefectureOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-6 pt-3 md:px-6">
      <div className={`overflow-hidden rounded-[16px] border-2 ${borderColor}`}>
        {showTabs && (
          <div className="grid grid-cols-2">
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

        <div className={`${backgroundColor} px-4 py-4 md:px-6 md:py-5`}>
          {activeTab === "news" ? (
            <form onSubmit={handleNewsSearch}>
              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
                <div className="min-w-[180px] flex-1">
                  <label className="mb-1 block text-[11px] font-bold text-white">
                    キーワードから探す
                  </label>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="キッチン、エンジニア"
                    className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none"
                  />
                </div>
                <div className="min-w-[140px]">
                  <label className="mb-1 block text-[11px] font-bold text-white">カテゴリ</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none"
                  >
                    <option value="">すべて</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`rounded-[8px] bg-white px-8 py-2.5 text-[13px] font-bold ${actionTextColor} hover:opacity-90`}
                  >
                    検索
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      setCategory("");
                    }}
                    className={`rounded-[8px] border-2 border-white px-8 py-2.5 text-[13px] font-bold text-white hover:bg-white ${hoverTextColor}`}
                  >
                    リセット
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSearch}>
              <div className="space-y-4 md:hidden">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-white">
                    キーワードから探す
                  </label>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="キッチン、エンジニア"
                    className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-[8px] border border-white/70 bg-white/10 px-3 py-2.5 text-[13px] font-bold text-white"
                >
                  <span>{hasAdvancedFilters ? "条件を変更する" : "条件を追加する"}</span>
                  <span className="text-[16px] leading-none">
                    {mobileFiltersOpen ? "−" : "+"}
                  </span>
                </button>

                {mobileFiltersOpen && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-white">
                        カテゴリ
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none"
                      >
                        <option value="">すべて</option>
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-white">
                        雇用形態
                      </label>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none"
                      >
                        {EMPLOYMENT_FILTER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {renderAreaSelect()}
                    {renderPrefectureSelect()}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    className={`rounded-[8px] bg-white py-2.5 text-[13px] font-bold ${actionTextColor}`}
                  >
                    検索
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`rounded-[8px] border-2 border-white py-2.5 text-[13px] font-bold text-white hover:bg-white ${hoverTextColor}`}
                  >
                    リセット
                  </button>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1 block text-[11px] font-bold text-white">
                      キーワードから探す
                    </label>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="キッチン、エンジニア"
                      className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">カテゴリ</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                    >
                      <option value="">すべて</option>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">雇用形態</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                    >
                      {EMPLOYMENT_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {renderAreaSelect()}
                  {renderPrefectureSelect()}
                </div>

                <div className="mt-4 flex justify-center gap-3">
                  <button
                    type="submit"
                    className={`rounded-[8px] bg-white px-10 py-2.5 text-[14px] font-bold ${actionTextColor} hover:opacity-90`}
                  >
                    検索
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`rounded-[8px] border-2 border-white px-10 py-2.5 text-[14px] font-bold text-white hover:bg-white ${hoverTextColor}`}
                  >
                    リセット
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
