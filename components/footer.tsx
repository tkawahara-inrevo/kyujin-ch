import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 bg-white">
      <div className="mx-auto max-w-[1280px] border-t border-[#eaeaea] px-6 py-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <div className="relative h-[38px] w-[180px]">
              <Image
                src="/assets/Person.png"
                alt="求人ちゃんねる"
                fill
                className="object-contain object-left"
                sizes="180px"
              />
            </div>
            <p className="mt-4 text-[12px] text-[#666]">
              最適な仕事を見つけるためのお手伝いをします。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-16 text-[12px] text-[#666]">
            <div className="space-y-3">
              <p className="font-bold text-[#333]">求人情報</p>
              <Link href="/jobs" className="block hover:underline">求人一覧</Link>
              <Link href="/prices" className="block hover:underline">料金表</Link>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-[#333]">サポート</p>
              <p>お問い合わせ</p>
              <p>利用規約（求職者）</p>
              <p>利用規約（企業）</p>
              <p>プライバシーポリシー</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2d2d2d] py-4 text-center text-[12px] text-white">
        © 2026 求人ちゃんねる.all rights reserved.
      </div>
    </footer>
  );
}