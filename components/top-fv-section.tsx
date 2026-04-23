"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AuthDialog } from "./auth-dialog";
import { TopHero } from "./top-hero";
import type { CategoryGroup } from "@/lib/price-categories";

type Tab = "news" | "search";

type Props = {
  hasSearchFilter: boolean;
  isLoggedIn: boolean;
  defaultQ?: string;
  defaultCategory?: string;
  defaultSubcategory?: string;
  defaultEmploymentType?: string;
  categoryGroups?: CategoryGroup[];
};

// 料金表の大項目名（PriceEntry.category）→ アイコン + 表示ラベルのマッピング
const CATEGORY_META: Record<string, { icon: string; label: string }> = {
  "IT/エンジニア":                              { icon: "/assets/Engineer.png",            label: "IT/エンジニア" },
  "クリエイター":                               { icon: "/assets/Design.png",              label: "クリエイター" },
  "営業":                                      { icon: "/assets/Bag.png",                 label: "営業" },
  "企画/マーケティング":                         { icon: "/assets/Graph.png",               label: "企画/マーケ" },
  "事務・管理・バックオフィス":                  { icon: "/assets/List.png",                label: "事務・管理" },
  "専門職（コンサル・金融・公務員・インストラクター）": { icon: "/assets/Professional.png",   label: "専門職" },
  "医療/福祉":                                  { icon: "/assets/Healthcare.png",          label: "医療/福祉" },
  "販売・サービス・飲食":                        { icon: "/assets/Talk_01.png",             label: "販売・サービス" },
  "建築・土木・設備":                            { icon: "/assets/Construction.png",        label: "建築・土木" },
  "機械/電気/電子製品":                          { icon: "/assets/Engineering.png",         label: "機械・電気" },
  "交通/運輸/物流":                              { icon: "/assets/Logistics.png",           label: "交通・物流" },
  "不動産":                                     { icon: "/assets/Realty.png",              label: "不動産" },
  "人材サービス":                               { icon: "/assets/Recruitment.png",         label: "人材サービス" },
};

export function TopFVSection({
  hasSearchFilter,
  isLoggedIn,
  defaultQ,
  defaultCategory,
  defaultSubcategory,
  defaultEmploymentType,
  categoryGroups = [],
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
          <div className="flex gap-[2px]">
            <Link
              href="https://kyujin-ch.jp/column/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-t-[10px] border-2 border-b-0 border-[#3b6ff6] bg-white py-2.5 text-center text-[13px] font-bold text-[#3b6ff6] transition hover:bg-[#f0f4ff]"
            >
              就職最新情報
            </Link>
            <button
              onClick={() => handleTab("search")}
              className="flex-1 rounded-t-[10px] border-2 border-b-0 border-[#ff5a78] bg-white py-2.5 text-[13px] font-bold text-[#ff5a78] transition hover:bg-[#fff0f3]"
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
                className="hidden object-cover md:block md:object-center"
                priority
              />
              <Image
                src="/assets/FV_fix-sp.png"
                alt=""
                fill
                className="object-cover object-center md:hidden"
                priority
              />
            </div>

            {/* オーバーレイカード（PCのみ表示） */}
            <div className="absolute right-3 top-3 hidden w-[145px] md:block md:right-8 md:top-5 md:w-[196px]">
              <div className="rounded-[10px] bg-white p-3 shadow-[0px_2px_20px_0px_rgba(0,0,0,0.08)] md:p-5">
                <p className="mb-2 text-[9px] font-bold text-[#333] md:text-[10px]">
                  ▼就活お役立ち・資格情報
                </p>
                <Link
                  href="https://kyujin-ch.jp/column/"
                  target="_blank"
                  rel="noreferrer"
                  className="mb-2 flex w-full items-center justify-center rounded-[5px] bg-[#1d63e3] py-2 font-bold !text-white transition hover:opacity-90"
                  style={{ fontSize: "11px", fontWeight: 700 }}
                >
                  最新情報更新中！
                </Link>
                <button
                  onClick={() => handleTab("search")}
                  className="flex w-full items-center justify-center rounded-[5px] bg-[#eb0937] py-2 font-bold text-white transition hover:opacity-90"
                  style={{ fontSize: "11px" }}
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
          defaultSubcategory={defaultSubcategory}
          defaultEmploymentType={defaultEmploymentType}
          categoryGroups={categoryGroups}
          searchPath="/jobs"
          includeSearchTabParam={false}
        />
      )}

      {/* カテゴリナビ（料金表の大項目に紐づく） */}
      <div className="mx-auto max-w-[1200px] px-4 py-4 md:px-6 md:py-6">
        <div className="flex flex-wrap justify-center gap-3 md:gap-6">
          {categoryGroups.map(({ category }) => {
            const meta = CATEGORY_META[category] ?? {
              icon: "/assets/Resume.png",
              label: category,
            };
            return (
              <Link
                key={category}
                href={`/jobs?category=${encodeURIComponent(category)}`}
                className="flex flex-col items-center gap-1.5 transition-opacity hover:opacity-70"
              >
                <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white shadow-sm md:h-[64px] md:w-[64px]">
                  <Image
                    src={meta.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="object-contain md:h-[34px] md:w-[34px]"
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#555] md:text-[11px]">
                  {meta.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {authOpen && (
        <AuthDialog initialMode="login" onClose={() => setAuthOpen(false)} />
      )}
    </>
  );
}
