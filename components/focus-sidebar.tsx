"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type RankingItem = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
};

type Props = {
  allTags: string[];
  ranking?: RankingItem[];
};

export function FocusSidebar({ allTags, ranking = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) {
      params.set("q", keyword.trim());
    } else {
      params.delete("q");
    }
    router.push(`/focus?${params.toString()}`);
  }

  return (
    <div className="sticky top-[95px] rounded-[15px] bg-white/80 shadow-[0_2px_2px_rgba(0,0,0,0.1)] px-[10px] py-[20px] w-[211px] flex flex-col gap-[15px]">
      {/* タグ */}
      <p className="text-[12px] font-bold text-[#333]">タグから探す</p>
      <div className="flex flex-wrap gap-[8px_5px]">
        {allTags.map((tag) => (
          <Link
            key={tag}
            href={`/focus?tag=${encodeURIComponent(tag)}`}
            className="flex h-[20px] items-center rounded-full bg-[#333] px-[15px] text-[12px] font-semibold text-white opacity-90 hover:opacity-100 transition"
          >
            {tag}
          </Link>
        ))}
        {allTags.length === 0 && (
          <>
            <Link href="/focus?tag=注目" className="flex h-[20px] items-center rounded-full bg-[#333] px-[15px] text-[12px] font-semibold text-white opacity-90">注目</Link>
            <Link href="/focus?tag=新着" className="flex h-[20px] items-center rounded-full bg-[#333] px-[15px] text-[12px] font-semibold text-white opacity-90">新着</Link>
          </>
        )}
      </div>

      {/* キーワード検索 */}
      <p className="text-[12px] font-bold text-[#333]">キーワードから探す</p>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder=""
          className="h-[20px] w-[181px] rounded-[4px] border border-[#ccc] bg-[#fafafa] px-[5px] text-[12px] outline-none focus:border-[#1f2775]"
        />
      </form>

      {/* 記事ランキング */}
      {ranking.length > 0 && (
        <>
          <p className="text-[12px] font-bold text-[#333]">記事ランキング</p>
          <ol className="flex flex-col gap-[10px]">
            {ranking.map((item, i) => (
              <li key={item.id}>
                <Link
                  href={`/focus/${item.slug}`}
                  className="flex items-start gap-[8px] transition hover:opacity-80"
                >
                  <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#1f2775] text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="line-clamp-2 text-[12px] leading-[1.4] text-[#333]">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
