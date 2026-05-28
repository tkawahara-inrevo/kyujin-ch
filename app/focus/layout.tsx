import Image from "next/image";
import type { Metadata } from "next";
import { FocusHeader } from "@/components/focus-header";

export const metadata: Metadata = {
  title: {
    default: "Focus｜企業の魅力を伝えるインタビューメディア",
    template: "%s | Focus",
  },
  description:
    "『Focus』は一社一社の魅力やストーリーにスポットライトを当て、想いを紡ぐインタビューを通じてその価値を発信します。",
};

export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <FocusHeader />
      {children}
      <footer className="mt-12 border-t border-[#eee]">
        <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Image
                src="/assets/Focus_ロゴ@2x.png"
                alt="Focus"
                height={28}
                width={105}
                className="h-7 w-auto"
              />
              <p className="mt-3 text-[14px] text-[#333] leading-relaxed">
                『Focus』は一社一社の魅力やストーリーにスポットライトを当て、<br />
                想いを紡ぐインタビューを通じてその価値を発信します。
              </p>
            </div>
            <div className="flex gap-10 text-[10px] text-[#333]">
              <div className="flex flex-col gap-3">
                <p className="font-bold text-[12px]">求人情報</p>
                <a href="/jobs" className="underline hover:text-[#1f2775]">求人一覧</a>
                <a href="https://kyujin-ch.jp/service" className="underline hover:text-[#1f2775]" target="_blank" rel="noreferrer">会社概要</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-bold text-[12px]">サポート</p>
                <a href="/focus/contact" className="underline hover:text-[#1f2775]">お問い合わせ</a>
                <a href="https://inrevo.co.jp/privacy-policy" className="underline hover:text-[#1f2775]" target="_blank" rel="noreferrer">プライバシーポリシー</a>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#333] py-3 text-center text-[12px] text-white">
          © 2026 求人ちゃんねる. all rights reserved.
        </div>
      </footer>
    </div>
  );
}
