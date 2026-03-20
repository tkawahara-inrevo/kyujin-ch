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
      <div className="mx-4 w-full max-w-[600px] rounded-[16px] bg-white px-8 py-10 text-center">
        {/* ロゴ */}
        <div className="flex items-center justify-center gap-2">
          <Image src="/assets/Person.png" alt="" width={28} height={28} />
          <span className="text-[18px] font-bold text-[#1a1a1a]">求人ちゃんねる</span>
        </div>

        <h2 className="mt-6 text-[20px] font-bold text-[#1a1a1a]">
          ご自身の就活状況を教えてください
        </h2>
        <p className="mt-2 text-[13px] text-[#888]">
          あとから変更することも可能です
        </p>

        {/* 選択ボタン */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <button
            onClick={() => select(String(currentYear))}
            className="flex flex-col items-center justify-center rounded-[12px] bg-[#ff3158] px-4 py-8 text-white transition hover:opacity-90"
          >
            <span className="text-[18px] font-bold">新卒採用</span>
            <span className="mt-1 text-[16px] font-bold">{currentYear}年卒業予定</span>
          </button>

          <button
            onClick={() => select(String(nextYear))}
            className="flex flex-col items-center justify-center rounded-[12px] bg-[#9b59b6] px-4 py-8 text-white transition hover:opacity-90"
          >
            <span className="text-[18px] font-bold">新卒採用</span>
            <span className="mt-1 text-[16px] font-bold">{nextYear}年卒業予定</span>
          </button>

          <button
            onClick={() => select("mid")}
            className="flex flex-col items-center justify-center rounded-[12px] bg-[#2f6cff] px-4 py-8 text-white transition hover:opacity-90"
          >
            <span className="text-[18px] font-bold">転職活動中</span>
          </button>
        </div>

        <a
          href="/company/login"
          className="mt-6 inline-block text-[12px] text-[#2f6cff] hover:underline"
        >
          求人掲載を検討中の企業様はこちら
        </a>
      </div>
    </div>
  );
}
