"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function getSwitchImageSrc(target: string, currentYear: number, nextYear: number) {
  const cy = String(currentYear).slice(-2);
  const ny = String(nextYear).slice(-2);
  if (target === "mid") return `/assets/${cy}卒-${ny}卒.png`;
  if (target === String(currentYear)) return `/assets/${ny}卒-中途.png`;
  return `/assets/${cy}卒-中途.png`;
}

export function MobileTargetSwitchButton({ currentYear, nextYear }: Props) {
  const searchParams = useSearchParams();
  const [storedTarget, setStoredTarget] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const target = searchParams.get("target") || storedTarget;

  useEffect(() => {
    setStoredTarget(localStorage.getItem("kyujin-target"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  if (!target || target === "all") return null;

  const isMid = target === "mid";
  const isCurrentYear = target === String(currentYear);
  const isNextYear = target === String(nextYear);

  const options = [];
  if (!isCurrentYear) options.push({ href: `/?target=${currentYear}`, label: `${String(currentYear).slice(-2)}卒`, value: String(currentYear), color: "text-[#eb0937]" });
  if (!isNextYear) options.push({ href: `/?target=${nextYear}`, label: `${String(nextYear).slice(-2)}卒`, value: String(nextYear), color: "text-[#eb0937]" });
  if (!isMid) options.push({ href: "/?target=mid", label: "中途", value: "mid", color: "text-[#2f6cff]" });

  function handleSwitch(value: string) {
    localStorage.setItem("kyujin-target", value);
    setStoredTarget(value);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center"
        aria-label="切り替え"
      >
        <Image
          src={getSwitchImageSrc(target, currentYear, nextYear)}
          alt="切り替え"
          width={40}
          height={33}
          className="object-contain"
          unoptimized
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-[10px] border border-[#e8e8e8] bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
          {options.map((opt) => (
            <Link
              key={opt.value}
              href={opt.href}
              onClick={() => handleSwitch(opt.value)}
              className={`block px-4 py-2.5 text-[12px] font-bold ${opt.color} transition hover:bg-[#f7f7f7]`}
            >
              {opt.label}に切替
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  currentYear: number;
  nextYear: number;
}

export function HeaderTargetBadge({ currentYear, nextYear }: Props) {
  const searchParams = useSearchParams();
  const [storedTarget, setStoredTarget] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const target = searchParams.get("target") || storedTarget;

  // hydration後にlocalStorageを読む（SSRとの不一致を防ぐ）
  useEffect(() => {
    setStoredTarget(localStorage.getItem("kyujin-target"));
  }, []);

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  if (!target || target === "all") return null;

  const isMid = target === "mid";
  const isCurrentYear = target === String(currentYear);
  const isNextYear = target === String(nextYear);

  const badgeLabel = isMid
    ? "中途"
    : isNextYear
      ? `${String(nextYear).slice(-2)}卒`
      : `${String(currentYear).slice(-2)}卒`;
  const badgeBg = isMid ? "bg-[#2f6cff]" : "bg-[#ff3158]";

  type Option = { href: string; label: string; value: string; color: string };
  const options: Option[] = [];

  if (!isCurrentYear) {
    options.push({
      href: `/?target=${currentYear}`,
      label: `${String(currentYear).slice(-2)}卒`,
      value: String(currentYear),
      color: "text-[#ff3158]",
    });
  }
  if (!isNextYear) {
    options.push({
      href: `/?target=${nextYear}`,
      label: `${String(nextYear).slice(-2)}卒`,
      value: String(nextYear),
      color: "text-[#ff3158]",
    });
  }
  if (!isMid) {
    options.push({
      href: "/?target=mid",
      label: "中途",
      value: "mid",
      color: "text-[#2f6cff]",
    });
  }

  function handleSwitch(value: string) {
    localStorage.setItem("kyujin-target", value);
    setStoredTarget(value);
    setOpen(false);
  }

  return (
    <div className="relative">
      {/* メインバッジ（クリックでドロップダウン） */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`${badgeBg} flex items-center gap-1 rounded-full px-3 py-[5px] text-[11px] font-bold text-white transition hover:opacity-90 md:px-4 md:text-[12px]`}
      >
        {badgeLabel}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ドロップダウン */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[120px] rounded-[10px] border border-[#e8e8e8] bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
          {options.map((opt) => (
            <Link
              key={opt.value}
              href={opt.href}
              onClick={() => handleSwitch(opt.value)}
              className={`block px-4 py-2.5 text-[12px] font-bold ${opt.color} transition hover:bg-[#f7f7f7]`}
            >
              {opt.label}に切替
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
