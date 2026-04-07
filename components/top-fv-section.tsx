"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AuthDialog } from "./auth-dialog";
import { TopHero } from "./top-hero";

type Tab = "news" | "search";

type Props = {
  hasSearchFilter: boolean;
  isLoggedIn: boolean;
  defaultQ?: string;
  defaultCategory?: string;
  defaultEmploymentType?: string;
  defaultLocation?: string;
};

const CATEGORY_NAV = [
  { label: "IT",         icon: "/assets/Engineer.png",  category: "IT" },
  { label: "デザイナー",  icon: "/assets/Design.png",    category: "デザイナー" },
  { label: "営業",        icon: "/assets/List.png",      category: "営業" },
  { label: "企画/マーケ", icon: "/assets/Graph.png",     category: "企画/マーケティング" },
  { label: "事務・管理",  icon: "/assets/Bag.png",       category: "コーポレートスタッフ" },
  { label: "経理",        icon: "/assets/Paper.png",     category: "経理" },
  { label: "販売/サービス", icon: "/assets/Talk_01.png", category: "販売/サービス" },
  { label: "クリエイティブ", icon: "/assets/Online.png", category: "クリエイティブ" },
  { label: "その他",      icon: "/assets/Resume.png",    category: "その他" },
];

export function TopFVSection({
  hasSearchFilter,
  isLoggedIn,
  defaultQ,
  defaultCategory,
  defaultEmploymentType,
  defaultLocation,
}: Props) {
  const [showFV, setShowFV] = useState(!hasSearchFilter);
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [authOpen, setAuthOpen] = useState(false);

  function handleTab(tab: Tab) {
    setActiveTab(tab);
    setShowFV(false);
  }

  return (
    <>
      {showFV ? (
        <div className="mx-auto max-w-[1200px] px-4 pt-3 pb-0 md:px-6">
          {/* タブ */}
          <div className="grid grid-cols-2">
            <Link
              href="https://kyujin-ch.jp/column/"
              target="_blank"
              rel="noreferrer"
              className="rounded-tl-[10px] border-2 border-b-0 border-r-0 border-[#3b6ff6] bg-white py-2.5 text-center text-[13px] font-bold text-[#3b6ff6] transition hover:bg-[#f0f4ff]"
            >
              就職最新情報
            </Link>
            <button
              onClick={() => handleTab("search")}
              className="rounded-tr-[10px] border-2 border-b-0 border-[#ff5a78] bg-white py-2.5 text-[13px] font-bold text-[#ff5a78] transition hover:bg-[#fff0f3]"
            >
              求人を探す
            </button>
          </div>

          {/* FV画像エリア */}
          <div className="relative overflow-hidden rounded-b-[16px]">
            <div className="relative aspect-[2/1] w-full sm:aspect-[5/2] md:aspect-auto md:h-[290px]">
              <Image
                src="/assets/FV_fix.png"
                alt=""
                fill
                className="object-cover object-[30%_center] md:object-center"
                priority
              />
            </div>

            {/* オーバーレイカード */}
            <div className="absolute right-3 top-3 w-[145px] md:right-8 md:top-5 md:w-[196px]">
              <div className="rounded-[10px] bg-white p-3 shadow-[0px_2px_20px_0px_rgba(0,0,0,0.08)] md:p-5">
                <p className="mb-2 text-[9px] font-bold text-[#333] md:text-[10px]">
                  ▼就活お役立ち・資格情報
                </p>
                <Link
                  href="https://kyujin-ch.jp/column/"
                  target="_blank"
                  rel="noreferrer"
                  className="mb-2 flex w-full items-center justify-center rounded-[5px] bg-[#1d63e3] py-2 text-[11px] font-bold !text-white transition hover:opacity-90 md:text-[12px]"
                >
                  最新情報更新中！
                </Link>
                <button
                  onClick={() => handleTab("search")}
                  className="flex w-full items-center justify-center rounded-[5px] bg-[#eb0937] py-2 text-[11px] font-bold text-white transition hover:opacity-90 md:text-[12px]"
                >
                  今すぐ求人を探す
                </button>
              </div>
              {!isLoggedIn && (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="mt-1.5 w-full text-right text-[10px] text-white underline opacity-90 hover:opacity-100"
                >
                  ログインはこちら
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <TopHero
          activeTab={activeTab}
          defaultQ={defaultQ}
          defaultCategory={defaultCategory}
          defaultEmploymentType={defaultEmploymentType}
          defaultLocation={defaultLocation}
          searchPath="/jobs"
          includeSearchTabParam={false}
        />
      )}

      {/* カテゴリナビ */}
      <div className="mx-auto max-w-[1200px] px-4 py-4 md:px-6 md:py-6">
        <div className="flex flex-wrap justify-center gap-3 md:gap-6">
          {CATEGORY_NAV.map(({ label, icon, category }) => (
            <Link
              key={label}
              href={`/jobs?category=${encodeURIComponent(category)}`}
              className="flex flex-col items-center gap-1.5 transition-opacity hover:opacity-70"
            >
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white shadow-sm md:h-[64px] md:w-[64px]">
                <Image
                  src={icon}
                  alt=""
                  width={28}
                  height={28}
                  className="object-contain md:h-[34px] md:w-[34px]"
                />
              </div>
              <span className="text-[10px] font-semibold text-[#555] md:text-[11px]">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {authOpen && (
        <AuthDialog initialMode="login" onClose={() => setAuthOpen(false)} />
      )}
    </>
  );
}
