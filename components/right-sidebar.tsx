import Image from "next/image";
import Link from "next/link";
import { SidebarSearchForm } from "./sidebar-search-form";
import { SidebarAuthButtons } from "./sidebar-auth-buttons";
import { SidebarTargetBanner } from "./sidebar-target-banner";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveGraduationYears } from "@/lib/graduation-years";

const colorMap: Record<string, string> = {
  エンジニア: "bg-[#2f6cff] text-white",
  デザイナー: "bg-[#2f6cff] text-white",
  営業:       "bg-[#ff3158] text-white",
  急募:       "bg-[#ff3158] text-white",
};
const defaultTagClass = "bg-[#f1f1f1] text-[#555]";

const menuItems = [
  { href: "/mypage",        label: "マイページ", icon: "/assets/User_01_bl.png" },
  { href: "/applications",  label: "応募済み",   icon: "/assets/Checkbox_Check_bl.png" },
  { href: "/favorites",     label: "気になる",   icon: "/assets/Bookmark_bl.png" },
  { href: "/messages",      label: "メッセージ", icon: "/assets/Chat_Circle_bl.png" },
];

export async function RightSidebar() {
  const [session, jobs] = await Promise.all([
    auth(),
    prisma.job.findMany({ where: { isPublished: true }, select: { tags: true } }),
  ]);
  const isLoggedIn = !!session?.user;
  const allTags = [...new Set(jobs.flatMap((j) => j.tags))];
  const graduationYears = getActiveGraduationYears();

  return (
    <aside className="space-y-6">
      {/* タグから探す */}
      <div>
        <h3 className="mb-3 text-[13px] font-bold text-[#444]">タグから探す</h3>
        <div className="flex flex-wrap gap-[6px]">
          {allTags.map((label) => (
            <Link
              key={label}
              href={`/jobs?tag=${encodeURIComponent(label)}`}
              className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-bold transition hover:opacity-80 ${
                colorMap[label] ?? defaultTagClass
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* キーワードから探す */}
      <SidebarSearchForm />

      {/* メニューリンク or 認証ボタン */}
      {isLoggedIn ? (
        <div className="space-y-1 border-t border-[#ececec] pt-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-[8px] px-2 py-2.5 text-[13px] font-semibold text-[#333] transition hover:bg-[#f7f7f7]"
            >
              <Image src={item.icon} alt="" width={18} height={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      ) : (
        <SidebarAuthButtons />
      )}

      {/* 新卒/中途 切り替えバナー */}
      <SidebarTargetBanner currentYear={graduationYears[0]} nextYear={graduationYears[1]} />
    </aside>
  );
}
