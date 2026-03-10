import Image from "next/image";

type CompanyStoryProps = {
  companyName: string;
};

export function CompanyStory({
  companyName,
}: CompanyStoryProps) {
  return (
    <section className="mt-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
        <div>
          <div className="relative aspect-[1.62/1] overflow-hidden rounded-[10px] bg-[#ececec]">
            <Image
              src="/assets/Resume.png"
              alt={companyName}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 760px"
            />
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-[22px] font-bold leading-[1.5] text-[#333]">
              日本の再興
              <br />
              -変革の旗手であれ-
            </h2>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#4b4b4b] px-3 py-1 text-[10px] font-bold text-white">
              営業
            </span>
            <span className="rounded-full bg-[#4b4b4b] px-3 py-1 text-[10px] font-bold text-white">
              マーケター
            </span>
            <span className="rounded-full bg-[#efefef] px-3 py-1 text-[10px] font-bold text-[#666]">
              未経験歓迎
            </span>
            <span className="rounded-full bg-[#efefef] px-3 py-1 text-[10px] font-bold text-[#666]">
              中途採用
            </span>
          </div>

          <div className="mt-6 space-y-8 text-[13px] leading-[1.95] text-[#444]">
            <div>
              <p className="font-bold">【Mission】</p>
              <p>
                日本の再興-変革の旗手であれ-
                <br />
                Be a pioneer of REVOLUTION
              </p>
              <p className="mt-3">
                私たちは、確かな地方にある事業から、革新的な挑戦によって世に新たな問いと価値を与えたいと考えています。
                本質的価値が正しく伝わり、信頼をもとに関係がひろがること。
                その積み重ねが産業を再構築し、日本を前進させる原動力になると信じています。
              </p>
            </div>

            <div>
              <p className="font-bold">【Vision】</p>
              <p>再進歩</p>
              <p className="mt-3">
                全ての個人・法人にとって、最善のある選択肢しか存在しない市場。
                “持っている価値”が正しく届き、正当に評価される世界。
                当たり前に捉えられるものを、我々が解きほぐし、出口戦略や事業にビジネスにひり直す営みを、次世代にもつなげます。
              </p>
            </div>

            <div>
              <p className="font-bold">【Value】</p>
              <p>「誠実」と「信頼」</p>
              <p className="mt-3">
                売上成果を追求しながらも、決して相手を無視してこそ、先に価値が伝播しよりビジネスを前進してこそ、市場を育てる思想を持つ。
              </p>
            </div>

            <div>
              <p className="font-bold">【Culture】</p>
              <p>
                まっすぐ、やろう
                <br />
                できることは質問にせずに、-歩踏み込もう。
                <br />
                まず、言う。
                <br />
                今の自分に可能だと思うことは素直にしよう。
                <br />
                打て、正もう。
                <br />
                お客様にバリュー/コンフィデンスを送ろう。
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-[13px] leading-[1.9] text-[#4b4b4b]">
            <p className="font-bold text-[#2f6cff]">メッセージ</p>
            <ul className="mt-2 space-y-1">
              <li>→ 会社概要</li>
              <li>→ 創業背景</li>
              <li>→ ビジョン</li>
              <li>→ 使命</li>
              <li>→ 事業内容</li>
              <li>→ 採用・育成</li>
              <li>→ 社風</li>
              <li>→ 平均年齢</li>
            </ul>
          </div>

          <div className="rounded-[12px] border border-[#dddddd] bg-white p-4">
            <p className="text-[16px] font-bold text-[#333]">{companyName}</p>

            <div className="mt-3 flex items-center gap-2 text-[13px] text-[#444]">
              <Image src="/assets/Map_Pin.png" alt="" width={14} height={14} />
              <span>福岡県</span>
            </div>

            <div className="relative mt-4 h-[140px] overflow-hidden rounded-[8px] bg-[#efefef]">
              <Image
                src="/assets/Paper.png"
                alt={companyName}
                fill
                className="object-cover"
                sizes="220px"
              />
            </div>

            <p className="mt-4 text-[12px] leading-[1.8] text-[#555]">
              企画、開発、制作、販売及び保守（ウェブサイト、ウェブコンテンツの企画、制作、保守及び管理）、人材育成のための教育コンテンツ作成、研修及び指導
            </p>

            <a
              href="#"
              className="mt-3 inline-block text-[12px] font-bold text-[#2f6cff] underline underline-offset-2"
            >
              公式サイト
            </a>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-[8px] bg-[#2f6cff] px-3 py-1 text-[11px] font-bold text-white">
                求人数　4件
              </span>
              <span className="rounded-[8px] bg-[#ff3158] px-3 py-1 text-[11px] font-bold text-white">
                クチコミ　10件
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}