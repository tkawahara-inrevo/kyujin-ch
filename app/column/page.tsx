import Link from "next/link";
import { Header } from "@/components/header";
import { RightSidebar } from "@/components/right-sidebar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ColumnListPage() {
  const posts = await prisma.columnPost.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <section>
            <h1 className="text-[28px] font-bold text-[#222]">就活最新情報（コラム一覧）</h1>
            <p className="mt-2 text-[13px] text-[#6b7280]">{posts.length}件</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {posts.length === 0 ? (
                <div className="rounded-xl bg-white p-8 text-center text-[#9aa3b2] shadow-sm sm:col-span-2">
                  公開中のコラムはまだありません
                </div>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/column/${post.id}`}
                    className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="text-[16px] font-bold leading-[1.5] text-[#1f2937]">{post.title}</p>
                    {post.summary ? (
                      <p className="mt-2 line-clamp-3 text-[13px] leading-[1.7] text-[#4b5563]">{post.summary}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#eef2f7] px-2 py-0.5 text-[11px] text-[#475467]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-[12px] text-[#98a2b3]">
                      {post.publishedAt?.toLocaleDateString("ja-JP") ?? post.createdAt.toLocaleDateString("ja-JP")}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
