"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Props {
  currentYear: number;
  nextYear: number;
}

export function HeaderTargetBadge({ currentYear, nextYear }: Props) {
  const searchParams = useSearchParams();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const urlTarget = searchParams.get("target");
    const t = urlTarget || localStorage.getItem("kyujin-target");
    setTarget(t);
  }, [searchParams]);

  if (!target || target === "all") return null;

  const isMid = target === "mid";
  const isCurrentYear = target === String(currentYear);
  const isNextYear = target === String(nextYear);

  // メインバッジのラベルと色
  const badgeLabel = isMid ? "中途採用" : isNextYear ? `${String(nextYear).slice(-2)}卒` : `${String(currentYear).slice(-2)}卒`;
  const badgeBg = isMid ? "bg-[#2f6cff]" : "bg-[#ff3158]";

  // サブリンク（他の2つ）
  type SubLink = { href: string; label: string };
  const subLinks: SubLink[] = [];

  if (!isCurrentYear) {
    subLinks.push({ href: `/?target=${currentYear}`, label: `${String(currentYear).slice(-2)}卒` });
  }
  if (!isNextYear) {
    subLinks.push({ href: `/?target=${nextYear}`, label: `${String(nextYear).slice(-2)}卒` });
  }
  if (!isMid) {
    subLinks.push({ href: "/?target=mid", label: "転職" });
  }

  function handleSubClick(t: string) {
    const val = t.includes("mid") ? "mid" : t.split("target=")[1];
    localStorage.setItem("kyujin-target", val);
  }

  return (
    <div className="flex flex-col items-start">
      {/* メインバッジ */}
      <span className={`${badgeBg} rounded-[6px] px-3 py-[4px] text-[12px] font-bold text-white`}>
        {badgeLabel}
      </span>
      {/* サブリンク */}
      <div className="mt-0.5 flex items-center gap-2">
        {subLinks.slice(0, 2).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => handleSubClick(link.href)}
            className="flex items-center gap-0.5 text-[10px] font-medium text-[#ff3158] hover:underline md:text-[11px]"
          >
            {link.label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
