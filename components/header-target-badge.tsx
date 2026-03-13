"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function HeaderTargetBadge() {
  const searchParams = useSearchParams();
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    // URL の target パラメータ優先、なければ localStorage
    const urlTarget = searchParams.get("target");
    const target = urlTarget || localStorage.getItem("kyujin-target");

    if (target && target !== "all") {
      if (target === "mid") {
        setLabel("中途");
      } else {
        const y = Number(target);
        if (!isNaN(y)) {
          setLabel(`${String(y).slice(-2)}卒`);
        }
      }
    }
  }, [searchParams]);

  if (!label) return null;

  return (
    <Link
      href="/"
      className="hidden rounded-[6px] bg-[#ff3158] px-3 py-[5px] text-[12px] font-bold text-white hover:opacity-80 md:inline-block"
    >
      {label}
    </Link>
  );
}
