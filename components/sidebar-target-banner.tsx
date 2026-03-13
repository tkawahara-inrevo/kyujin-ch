"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Props {
  currentYear: number;
  nextYear: number;
}

export function SidebarTargetBanner({ currentYear, nextYear }: Props) {
  const searchParams = useSearchParams();
  const [activeTarget, setActiveTarget] = useState<string | null>(null);

  useEffect(() => {
    const urlTarget = searchParams.get("target");
    const target = urlTarget || localStorage.getItem("kyujin-target") || String(currentYear);
    setActiveTarget(target);
  }, [searchParams, currentYear]);

  if (!activeTarget) return null;

  // 現在のフィルタに応じてバナーの表示を変える
  const isCurrentYear = activeTarget === String(currentYear);
  const isNextYear = activeTarget === String(nextYear);
  const isMid = activeTarget === "mid";

  // メインバナーのラベル
  const mainLabel = isMid
    ? "転職活動中の方向け\n求人サイト"
    : isNextYear
      ? `${nextYear}年卒業\n新卒採用専用サイト`
      : `${currentYear}年卒業\n新卒採用専用サイト`;

  // メインバナーのボーダー色
  const mainBorderColor = isMid ? "border-[#2f6cff]" : "border-[#ff6a86]";
  const mainTextColor = isMid ? "text-[#2f6cff]" : "text-[#ff4d73]";

  // 他の2つのリンク先を決定
  type LinkItem = { href: string; label: string; bgColor: string };
  const otherLinks: LinkItem[] = [];

  if (!isCurrentYear) {
    otherLinks.push({
      href: `/?target=${currentYear}`,
      label: `${currentYear}年\n卒業予定の方は\nこちら`,
      bgColor: "bg-[#ff3158]",
    });
  }
  if (!isNextYear) {
    otherLinks.push({
      href: `/?target=${nextYear}`,
      label: `${nextYear}年\n卒業予定の方は\nこちら`,
      bgColor: "bg-[#ff3158]",
    });
  }
  if (!isMid) {
    otherLinks.push({
      href: "/?target=mid",
      label: "転職活動中の方\nは\nこちら",
      bgColor: "bg-[#2f6cff]",
    });
  }

  // 最大2つ表示
  const displayLinks = otherLinks.slice(0, 2);

  function handleClick(target: string) {
    localStorage.setItem("kyujin-target", target);
  }

  return (
    <div className="rounded-[14px] border border-[#ececec] bg-white p-4">
      <div className={`rounded-[8px] border ${mainBorderColor} px-3 py-3 text-center text-[12px] font-bold leading-[1.6] ${mainTextColor}`}>
        {mainLabel.split("\n").map((line, i) => (
          <span key={i}>{line}{i < mainLabel.split("\n").length - 1 && <br />}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {displayLinks.map((link) => {
          // target を href から抽出
          const targetValue = link.href.includes("mid") ? "mid" : link.href.split("target=")[1];
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => handleClick(targetValue)}
              className={`${link.bgColor} rounded-[8px] px-3 py-3 text-center text-[11px] font-bold leading-[1.6] text-white transition hover:opacity-90`}
            >
              {link.label.split("\n").map((line, i) => (
                <span key={i}>{line}{i < link.label.split("\n").length - 1 && <br />}</span>
              ))}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
