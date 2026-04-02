import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { RightSidebar } from "@/components/right-sidebar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ id: string }>;

export default async function ColumnDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const post = await prisma.columnPost.findFirst({
    where: { id, isPublished: true },
  });

  if (!post) notFound();

  const lines = post.body.split(/\r?\n/).filter((line) => line.trim().length > 0);

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <article className="rounded-xl bg-white p-6 shadow-sm md:p-8">
            <h1 className="text-[28px] font-bold leading-[1.45] text-[#1f2937]">{post.title}</h1>
            <p className="mt-3 text-[12px] text-[#98a2b3]">
              {post.publishedAt?.toLocaleDateString("ja-JP") ?? post.createdAt.toLocaleDateString("ja-JP")}
            </p>

            {post.tags.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#eef2f7] px-2 py-0.5 text-[11px] text-[#475467]">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            {post.summary ? (
              <p className="mt-6 rounded-lg bg-[#f8fafc] p-4 text-[14px] leading-[1.8] text-[#475467]">{post.summary}</p>
            ) : null}

            <div className="mt-8 space-y-4 text-[15px] leading-[1.95] text-[#374151]">
              {lines.map((line, idx) => (
                <p key={`${idx}-${line.slice(0, 16)}`}>{line}</p>
              ))}
            </div>
          </article>

          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
