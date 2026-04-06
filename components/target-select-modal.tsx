"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  currentYear: number;
  nextYear: number;
}

export function TargetSelectModal({ currentYear, nextYear }: Props) {
  const [show, setShow] = useState(
    () => typeof window !== "undefined" && !localStorage.getItem("kyujin-target"),
  );
  const router = useRouter();

  if (!show) return null;

  function select(target: string) {
    localStorage.setItem("kyujin-target", target);
    setShow(false);
    router.push(`/?target=${target}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-[600px] rounded-[16px] bg-white px-6 py-8 text-center sm:px-10 sm:py-10">
        {/* ロゴ */}
        <div className="flex items-center justify-center gap-2">
          <Image src="/favicon-32.png" alt="" width={28} height={28} />
          <span className="text-[16px] font-bold text-[#1a1a1a] sm:text-[18px]">求人ちゃんねる</span>
        </div>

        <h2 className="mt-4 text-[17px] font-bold text-[#1a1a1a] sm:mt-6 sm:text-[20px]">
          ご自身の就活状況を教えてください
        </h2>
        <p className="mt-2 text-[12px] text-[#888] sm:text-[13px]">
          あとから変更することも可能です
        </p>

        {/* 選択ボタン */}
        <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
          <button
            onClick={() => select(String(currentYear))}
            className="flex flex-col items-center justify-center rounded-[12px] bg-[#ff3158] px-2 py-6 text-white transition hover:opacity-90 sm:px-4 sm:py-8"
          >
            <span className="text-[13px] font-bold sm:text-[18px]">新卒採用</span>
            <span className="mt-1 text-[12px] font-bold sm:text-[16px]">{currentYear}年卒業予定</span>
          </button>

          <button
            onClick={() => select(String(nextYear))}
            className="flex flex-col items-center justify-center rounded-[12px] bg-[#9b59b6] px-2 py-6 text-white transition hover:opacity-90 sm:px-4 sm:py-8"
          >
            <span className="text-[13px] font-bold sm:text-[18px]">新卒採用</span>
            <span className="mt-1 text-[12px] font-bold sm:text-[16px]">{nextYear}年卒業予定</span>
          </button>

          <button
            onClick={() => select("mid")}
            className="flex flex-col items-center justify-center rounded-[12px] bg-[#2f6cff] px-2 py-6 text-white transition hover:opacity-90 sm:px-4 sm:py-8"
          >
            <span className="text-[13px] font-bold sm:text-[18px]">転職活動中</span>
          </button>
        </div>

        <a
          href="/service"
          className="mt-5 inline-flex items-center rounded-full border-2 border-[#ff3158] bg-white px-6 py-2 text-[13px] font-bold text-[#ff3158] sm:mt-6"
        >
          求人掲載を検討中の企業様はこちら
        </a>
      </div>
    </div>
  );
}
