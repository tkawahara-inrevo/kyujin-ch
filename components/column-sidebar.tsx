import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ColumnSearchForm } from "./column-search-form";
import { SidebarAuthButtons } from "./sidebar-auth-buttons";

// Figmaに合わせた固定タグ分類
const DARK_TAGS = ["就活ノウハウ", "新卒向け", "学生向け", "管理職向け"];

export async function ColumnSidebar() {
  const [session, posts] = await Promise.all([
    auth(),
    prisma.columnPost.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { tags: true },
    }),
  ]);

  const isLoggedIn = !!session?.user;
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  const darkTags = allTags.filter((t) => DARK_TAGS.includes(t));
  const grayTags = allTags.filter((t) => !DARK_TAGS.includes(t));

  return (
    <aside className="sticky top-6 space-y-4">
      <div className="rounded-[15px] bg-white/80 px-[10px] py-[20px] shadow-sm space-y-4">
        {/* タグから探す */}
        <div>
          <h3 className="mb-3 text-[12px] font-bold text-[#333]">タグから探す</h3>
          {darkTags.length > 0 && (
            <div className="flex flex-wrap gap-[5px] mb-2">
              {darkTags.map((tag) => (
                <span
                  key={tag}
                  className="cursor-pointer rounded-full bg-[#333] px-[15px] py-[3px] text-[12px] font-semibold text-white transition hover:opacity-80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {grayTags.length > 0 && (
            <div className="flex flex-wrap gap-[5px]">
              {grayTags.map((tag) => (
                <span
                  key={tag}
                  className="cursor-pointer rounded-full bg-[#ccc] px-[15px] py-[3px] text-[12px] font-semibold text-[#333] transition hover:opacity-80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* キーワードから探す */}
        <div>
          <h3 className="mb-2 text-[12px] font-bold text-[#333]">キーワードから探す</h3>
          <ColumnSearchForm />
        </div>

        {/* 区切り線 + 認証ボタン */}
        <div className="border-t border-[#e5e5e5] pt-2">
          {isLoggedIn ? null : <SidebarAuthButtons />}
        </div>
      </div>
    </aside>
  );
}
