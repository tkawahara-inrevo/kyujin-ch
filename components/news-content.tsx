import Image from "next/image";
import Link from "next/link";

const events = [
  { id: 1, title: "就活相談会in福岡", image: "/assets/Talk_01.png", tags: ["#オフライン", "#九州"] },
  { id: 2, title: "就活相談会in東京", image: "/assets/Online.png", tags: ["#オフライン", "#首都圏"] },
  { id: 3, title: "無料相談会", image: "/assets/Resume.png", tags: ["#オンライン"] },
  { id: 4, title: "就活セミナー", image: "/assets/Paper.png", tags: ["#オフライン", "#全国"] },
  { id: 5, title: "オンラインインターン", image: "/assets/Online.png", tags: ["#オンライン"] },
];

const columns = [
  {
    id: 1,
    tags: ["就活ノウハウ", "面接対策", "チェックリスト"],
    title: "今動くべき！企業が本当にみているポイント10選",
    body: "就活で気を付けるポイントを採用担当者が解説！今日使えるチェックリストを含めて、10選をご紹介。",
    date: "2026/02/20",
  },
  {
    id: 2,
    tags: ["就活ノウハウ", "面接対策", "チェックリスト"],
    title: "今動くべき！企業が本当にみているポイント10選",
    body: "就活で気を付けるポイントを採用担当者が解説！今日使えるチェックリストを含めて、10選をご紹介。",
    date: "2026/02/20",
  },
  {
    id: 3,
    tags: ["就活ノウハウ", "面接対策", "チェックリスト"],
    title: "今動くべき！企業が本当にみているポイント10選",
    body: "就活で気を付けるポイントを採用担当者が解説！今日使えるチェックリストを含めて、10選をご紹介。",
    date: "2026/02/20",
  },
  {
    id: 4,
    tags: ["就活ノウハウ", "面接対策", "チェックリスト"],
    title: "今動くべき！企業が本当にみているポイント10選",
    body: "就活で気を付けるポイントを採用担当者が解説！今日使えるチェックリストを含めて、10選をご紹介。",
    date: "2026/02/20",
  },
];

export function NewsContent() {
  return (
    <div>
      <h1 className="text-[22px] font-bold text-[#222]">今知りたい！最新就職情報</h1>

      {/* イベント情報 */}
      <section className="mt-8">
        <h2 className="mb-4 text-[15px] font-bold text-[#333]">▼イベント情報</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {events.map((ev) => (
            <div key={ev.id} className="min-w-[160px] shrink-0">
              <div className="relative h-[100px] w-[160px] overflow-hidden rounded-[8px] bg-[#efefef]">
                <Image src={ev.image} alt={ev.title} fill className="object-cover" sizes="160px" />
              </div>
              <p className="mt-2 text-[12px] font-bold text-[#333]">{ev.title}</p>
              <p className="mt-1 text-[11px] text-[#888]">{ev.tags.join("　")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* コラム */}
      <section className="mt-10">
        <h2 className="mb-4 text-[15px] font-bold text-[#333]">▼コラム</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {columns.map((col) => (
            <Link key={col.id} href="#" className="block rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md transition">
              <div className="relative h-[140px] w-full overflow-hidden rounded-t-[12px] bg-[#efefef]">
                <span className="absolute right-2 top-2 rounded-full bg-[#2f6cff] px-2 py-0.5 text-[10px] font-bold text-white">新着</span>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1">
                  {col.tags.map((t) => (
                    <span key={t} className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[10px] text-[#555]">{t}</span>
                  ))}
                </div>
                <p className="mt-2 text-[14px] font-bold leading-[1.5] text-[#222]">{col.title}</p>
                <p className="mt-1 text-[12px] leading-[1.6] text-[#777]">{col.body}</p>
                <p className="mt-2 text-[11px] text-[#aaa]">掲載日 {col.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
