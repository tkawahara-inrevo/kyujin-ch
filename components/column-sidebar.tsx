import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function ColumnSidebar() {
  const posts = await prisma.columnPost.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, title: true, tags: true, publishedAt: true, createdAt: true },
    take: 20,
  });

  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  const recentPosts = posts.slice(0, 5);

  return (
    <aside className="sticky top-6 space-y-6">
      {/* タグから探す */}
      {allTags.length > 0 && (
        <div>
          <h3 className="mb-3 text-[13px] font-bold text-[#444]">タグから探す</h3>
          <div className="flex flex-wrap gap-[6px]">
            {allTags.map((tag) => (
              <span
                key={tag}
                className="cursor-pointer rounded-full bg-[#f1f1f1] px-3 py-1 text-[11px] font-bold text-[#555] transition hover:opacity-80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 新着コラム */}
      <div>
        <h3 className="mb-3 text-[13px] font-bold text-[#444]">新着コラム</h3>
        <ul className="space-y-3">
          {recentPosts.map((post) => {
            const date = (post.publishedAt ?? post.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            return (
              <li key={post.id}>
                <Link
                  href={`/column-preview/${post.id}`}
                  className="block text-[12px] leading-[1.6] text-[#333] hover:text-[#2f6cff] hover:underline"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 text-[11px] text-[#aaa]">{date}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
