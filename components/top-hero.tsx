"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ALL_PREFECTURES, PREFECTURES_BY_AREA } from "@/lib/job-locations";
import { EMPLOYMENT_FILTER_OPTIONS, EXPERIENCE_FILTER_OPTIONS, SALARY_FILTER_OPTIONS } from "@/lib/job-options";
import type { CategoryGroup } from "@/lib/price-categories";

type Props = {
  activeTab?: "news" | "search";
  defaultQ?: string;
  defaultCategory?: string;
  defaultEmploymentType?: string;
  defaultPrefectures?: string[];
  defaultExperience?: string;
  defaultSalary?: string;
  categoryGroups?: CategoryGroup[];
  searchPath?: string;
  includeSearchTabParam?: boolean;
  showTabs?: boolean;
};

function findGroupForCategory(cat: string, groups: CategoryGroup[]): string {
  for (const g of groups) {
    if (g.subcategories.includes(cat)) return g.category;
  }
  return "";
}

// 都道府県マルチセレクト（クリックで下にドロップダウン）
function PrefectureMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(pref: string) {
    onChange(selected.includes(pref) ? selected.filter((p) => p !== pref) : [...selected, pref]);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-[6px] bg-white px-2 py-2 text-left text-[12px] outline-none"
      >
        <span className={selected.length > 0 ? "text-[#333]" : "text-[#999]"}>
          {selected.length > 0 ? `${selected.length}都道府県選択中` : "都道府県を選択"}
        </span>
        <span className="text-[10px] text-[#666]">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[200px] overflow-hidden rounded-[10px] border border-[#e0e0e0] bg-white shadow-xl">
          <div className="max-h-[360px] overflow-y-auto py-1">
            {ALL_PREFECTURES.map((pref) => (
              <label key={pref} className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5]">
                <input
                  type="checkbox"
                  checked={selected.includes(pref)}
                  onChange={() => toggle(pref)}
                  className="h-4 w-4 shrink-0 accent-[#ff5a78]"
                />
                <span className="text-[14px] text-[#333]">{pref}</span>
              </label>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-[#eee] px-3 py-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-center text-[11px] text-[#888] hover:text-[#333]"
              >
                クリア（{selected.length}件）
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TopHero({
  activeTab = "news",
  defaultQ = "",
  defaultCategory = "",
  defaultEmploymentType = "",
  defaultPrefectures = [],
  defaultExperience = "",
  defaultSalary = "",
  categoryGroups = [],
  searchPath = "/",
  includeSearchTabParam = true,
  showTabs = true,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQ);
  const [categoryGroup, setCategoryGroup] = useState(() => findGroupForCategory(defaultCategory, categoryGroups));
  const [category, setCategory] = useState(defaultCategory);
  const [employmentType, setEmploymentType] = useState(defaultEmploymentType);
  const [experience, setExperience] = useState(defaultExperience);
  const [salary, setSalary] = useState(defaultSalary);
  const [prefectures, setPrefectures] = useState<string[]>(defaultPrefectures);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(
    Boolean(defaultCategory || defaultEmploymentType || defaultPrefectures.length || defaultExperience || defaultSalary),
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setQ(defaultQ);
      setCategory(defaultCategory);
      setCategoryGroup(findGroupForCategory(defaultCategory, categoryGroups));
      setEmploymentType(defaultEmploymentType);
      setExperience(defaultExperience);
      setSalary(defaultSalary);
      setPrefectures(defaultPrefectures);
    });
    return () => window.cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultQ, defaultCategory, defaultEmploymentType, defaultExperience, defaultSalary]);

  const subcategoryOptions = useMemo(
    () => categoryGroups.find((g) => g.category === categoryGroup)?.subcategories ?? [],
    [categoryGroup, categoryGroups],
  );

  const hasAdvancedFilters = Boolean(category || employmentType || experience || salary || prefectures.length > 0);
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
    if (includeSearchTabParam) params.set("tab", "search");

    const target = getTarget();
    if (target) params.set("target", target);
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);

    if (includeAllFilters) {
      if (employmentType) params.set("employmentType", employmentType);
      if (experience) params.set("experience", experience);
      if (salary) params.set("salary", salary);
      if (prefectures.length > 0) params.set("prefectures", prefectures.join(","));
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
    setCategoryGroup("");
    setCategory("");
    setEmploymentType("");
    setExperience("");
    setSalary("");
    setPrefectures([]);
    setMobileFiltersOpen(false);

    const params = new URLSearchParams();
    if (includeSearchTabParam) params.set("tab", "search");
    const target = getTarget();
    if (target) params.set("target", target);
    router.push(params.toString() ? `${searchPath}?${params.toString()}` : searchPath);
  }

  const selectClass = "w-full rounded-[6px] bg-white px-2 py-2 text-[12px] text-[#333] outline-none";

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-6 pt-3 md:px-6">
      <div className={`rounded-[16px] border-2 ${borderColor}`}>
        {showTabs && (
          <div className="grid grid-cols-2 overflow-hidden rounded-t-[14px]">
            <Link
              href="https://kyujin-ch.jp/column/"
              target="_blank"
              rel="noreferrer"
              className={`block py-3 text-center text-[14px] font-bold transition ${
                activeTab === "news" ? "bg-white text-[#3b6ff6]" : "bg-[#f5f5f5] text-[#aaa]"
              }`}
            >
              最新情報
            </Link>
            <button
              onClick={() => router.push("/?tab=search")}
              className={`py-3 text-[14px] font-bold transition ${
                activeTab === "search" ? "bg-white text-[#ff5a78]" : "bg-[#f5f5f5] text-[#aaa]"
              }`}
            >
              仕事を探す
            </button>
          </div>
        )}

        <div className={`${backgroundColor} px-4 py-4 md:px-6 md:py-5`}>
          {activeTab === "news" ? (
            <form onSubmit={handleNewsSearch}>
              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
                <div className="min-w-[180px] flex-1">
                  <label className="mb-1 block text-[11px] font-bold text-white">キーワードで探す</label>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="キッチン、エンジニア"
                    className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className={`rounded-[8px] bg-white px-8 py-2.5 text-[13px] font-bold ${actionTextColor} hover:opacity-90`}>
                    検索
                  </button>
                  <button type="button" onClick={() => { setQ(""); setCategory(""); }} className={`rounded-[8px] border-2 border-white px-8 py-2.5 text-[13px] font-bold text-white hover:bg-white ${hoverTextColor}`}>
                    リセット
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSearch}>
              {/* Mobile */}
              <div className="space-y-4 md:hidden">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-white">キーワードで探す</label>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="キッチン、エンジニア、会社名など"
                    className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-[8px] border border-white/70 bg-white/10 px-3 py-2.5 text-[13px] font-bold text-white"
                >
                  <span>{hasAdvancedFilters ? "条件を変更する" : "条件を追加する"}</span>
                  <span className="text-[16px] leading-none">{mobileFiltersOpen ? "−" : "+"}</span>
                </button>
                {mobileFiltersOpen && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-white">カテゴリ</label>
                      <select value={categoryGroup} onChange={(e) => { setCategoryGroup(e.target.value); setCategory(""); }} className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none">
                        <option value="">すべて</option>
                        {categoryGroups.map((g) => <option key={g.category} value={g.category}>{g.category}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-white">職種</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none" disabled={!categoryGroup}>
                        <option value="">すべて</option>
                        {subcategoryOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-white">雇用形態</label>
                      <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none">
                        {EMPLOYMENT_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-white">経験</label>
                      <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none">
                        {EXPERIENCE_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-white">給与帯</label>
                      <select value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full rounded-[6px] bg-white px-3 py-2.5 text-[13px] text-[#333] outline-none">
                        {SALARY_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-white">都道府県</label>
                      <div className="max-h-[160px] overflow-y-auto rounded-[6px] bg-white p-2">
                        {Object.entries(PREFECTURES_BY_AREA).map(([area, prefs]) => (
                          <div key={area} className="mb-2">
                            <p className="text-[9px] font-bold text-[#888]">{area}</p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                              {prefs.map((pref) => (
                                <label key={pref} className="flex cursor-pointer items-center gap-1">
                                  <input type="checkbox" checked={prefectures.includes(pref)} onChange={() => setPrefectures((prev) => prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref])} className="h-3 w-3 accent-[#ff5a78]" />
                                  <span className="text-[11px] text-[#333]">{pref.replace(/[都道府県]$/, "")}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button type="submit" className={`rounded-[8px] bg-white py-2.5 text-[13px] font-bold ${actionTextColor}`}>検索</button>
                  <button type="button" onClick={handleReset} className={`rounded-[8px] border-2 border-white py-2.5 text-[13px] font-bold text-white hover:bg-white ${hoverTextColor}`}>リセット</button>
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden md:block">
                {/* Row 1: filters */}
                <div className="grid grid-cols-6 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">カテゴリ</label>
                    <select
                      value={categoryGroup}
                      onChange={(e) => { setCategoryGroup(e.target.value); setCategory(""); }}
                      className={selectClass}
                    >
                      <option value="">カテゴリ（すべて）</option>
                      {categoryGroups.map((g) => (
                        <option key={g.category} value={g.category}>{g.category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">職種</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={!categoryGroup}
                      className={`${selectClass} disabled:cursor-not-allowed disabled:bg-[#f2f2f2] disabled:text-[#999]`}
                    >
                      <option value="">職種（すべて）</option>
                      {subcategoryOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">雇用形態</label>
                    <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={selectClass}>
                      {EMPLOYMENT_FILTER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">経験</label>
                    <select value={experience} onChange={(e) => setExperience(e.target.value)} className={selectClass}>
                      {EXPERIENCE_FILTER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">給与帯</label>
                    <select value={salary} onChange={(e) => setSalary(e.target.value)} className={selectClass}>
                      {SALARY_FILTER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-white">都道府県</label>
                    <PrefectureMultiSelect selected={prefectures} onChange={setPrefectures} />
                  </div>
                </div>
                {/* Row 2: keyword + buttons */}
                <div className="mt-3 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] font-bold text-white">キーワードで探す</label>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="キッチン、エンジニア、会社名など"
                      className="w-full rounded-[6px] bg-white px-3 py-2 text-[13px] text-[#333] outline-none"
                    />
                  </div>
                  <button type="submit" className={`rounded-[8px] bg-white px-8 py-2 text-[13px] font-bold ${actionTextColor} hover:opacity-90`}>
                    検索
                  </button>
                  <button type="button" onClick={handleReset} className={`rounded-[8px] border-2 border-white px-8 py-2 text-[13px] font-bold text-white hover:bg-white ${hoverTextColor}`}>
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
