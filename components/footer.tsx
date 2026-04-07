import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 bg-white pb-[120px] md:pb-0">
      <div className="mx-auto max-w-[1280px] border-t border-[#eaeaea] px-6 py-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Link href="/" className="flex items-center gap-1.5">
              <div className="relative h-[24px] w-[24px] shrink-0">
                <Image
                  src="/favicon-32.png"
                  alt=""
                  fill
                  className="object-contain"
                  sizes="24px"
                />
              </div>
              <span className="text-[15px] font-bold text-[#1a1a1a]">求人ちゃんねる</span>
            </Link>
            <p className="mt-4 text-[12px] text-[#666]">
              ぴったりな出会いを見つけるための求人探しをサポートします。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-16 text-[12px] text-[#666]">
            <div className="space-y-3">
              <p className="font-bold text-[#333]">求人情報</p>
              <Link href="/jobs" className="block hover:underline">
                求人一覧
              </Link>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-[#333]">サポート</p>
              <Link href="https://kyujin-ch.jp/contact_form/" className="block hover:underline" target="_blank" rel="noreferrer">
                お問い合わせ
              </Link>
              <Link href="https://kyujin-ch.jp/kiyaku" className="block hover:underline" target="_blank" rel="noreferrer">
                利用規約（求職者様）
              </Link>
              <Link href="/kiyaku-company" className="block hover:underline" target="_blank" rel="noreferrer">
                利用規約（企業様）
              </Link>
              <Link href="https://inrevo.co.jp/privacy-policy" className="block hover:underline" target="_blank" rel="noreferrer">
                プライバシーポリシー
              </Link>
              <Link href="https://inrevo.co.jp/about" className="block hover:underline" target="_blank" rel="noreferrer">
                会社概要
              </Link>
              <Link href="/company/login" className="block hover:underline">
                企業ログイン
              </Link>
              <Link href="https://kyujin-ch.jp/service" className="block hover:underline" target="_blank" rel="noreferrer">
                掲載を検討中の企業様へ
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2d2d2d] py-4 text-center text-[12px] text-white">
        © 2026 求人ちゃんねる all rights reserved.
      </div>
    </footer>
  );
}
