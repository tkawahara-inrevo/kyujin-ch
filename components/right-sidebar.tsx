import Image from "next/image";
import Link from "next/link";

const tags = [
  "エンジニア",
  "営業",
  "デザイナー",
  "事務",
  "急募",
  "新卒",
  "経験者優遇",
  "福利厚生充実",
  "家賃補助",
  "年間休日130日",
  "中途",
  "未経験歓迎",
  "カジュアル面談",
  "フルリモート",
  "リモート",
];

const menuItems = [
  { href: "/mypage", label: "マイページ", icon: "/assets/User_01_bl.png" },
  { href: "/applications", label: "応募済み", icon: "/assets/Checkbox_Check_bl.png" },
  { href: "/favorites", label: "気になる", icon: "/assets/Bookmark_bl.png" },
  { href: "/messages", label: "メッセージ", icon: "/assets/Chat_Circle_bl.png" },
];

export function RightSidebar() {
  return (
    <aside className="space-y-8">
      <div>
        <h3 className="mb-4 text-[13px] font-bold text-[#444]">タグから探す</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="rounded-full bg-[#f1f1f1] px-3 py-1 text-[11px] font-bold text-[#666]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-bold text-[#444]">キーワードから探す</h3>
        <input
          className="w-full rounded-[4px] border border-[#d8d8d8] px-3 py-2 text-[12px] text-[#666] outline-none"
          placeholder="キッチン、エンジニア"
        />
      </div>

      <div className="space-y-4 border-t border-[#ececec] pt-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 text-[13px] font-semibold text-[#444]"
          >
            <Image src={item.icon} alt="" width={18} height={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-[14px] border border-[#ececec] bg-white p-4">
        <div className="rounded-[8px] border border-[#ff6a86] px-3 py-3 text-center text-[12px] font-bold leading-[1.5] text-[#ff4d73]">
          2027年卒業
          <br />
          新卒採用専用サイト
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-[8px] bg-[#ff3158] px-3 py-3 text-center text-[11px] font-bold leading-[1.5] text-white">
            2028卒
            <br />
            卒業予定の方はこちら
          </div>
          <div className="rounded-[8px] bg-[#2f6cff] px-3 py-3 text-center text-[11px] font-bold leading-[1.5] text-white">
            転職活動中の方は
            <br />
            こちら
          </div>
        </div>
      </div>
    </aside>
  );
}