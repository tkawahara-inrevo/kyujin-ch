import Link from "next/link";
import { deleteColumnPost, toggleColumnPublished } from "@/app/actions/admin/columns";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export default async function AdminColumnsPage() {
  await requireColumnEditor();

  const posts = await prisma.columnPost.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-bold text-[#1e293b]">コラム管理</h1>
        <Link
          href="/admin/columns/new"
          className="rounded-lg bg-[#2f6cff] px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90"
        >
          新規作成
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#e6ecf5] text-[#6b7280]">
              <th className="px-4 py-3 font-semibold">タイトル</th>
              <th className="px-4 py-3 font-semibold">タグ</th>
              <th className="px-4 py-3 font-semibold">状態</th>
              <th className="px-4 py-3 font-semibold">更新日</th>
              <th className="px-4 py-3 font-semibold">作成者</th>
              <th className="px-4 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#9aa3b2]">
                  コラム記事がまだありません
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-b border-[#eef2f8] last:border-b-0">
                  <td className="px-4 py-3 font-medium text-[#1f2937]">
                    <Link href={`/column/${post.id}`} className="hover:text-[#2f6cff]" target="_blank">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#4b5563]">
                    {post.tags.length ? post.tags.join(" / ") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-bold ${
                        post.isPublished ? "bg-[#dcfce7] text-[#166534]" : "bg-[#e5e7eb] text-[#4b5563]"
                      }`}
                    >
                      {post.isPublished ? "公開中" : "下書き"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#4b5563]">{post.updatedAt.toLocaleString("ja-JP")}</td>
                  <td className="px-4 py-3 text-[#4b5563]">{post.author?.name ?? post.author?.email ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/columns/${post.id}/edit`}
                        className="rounded border border-[#d1d5db] px-3 py-1.5 text-[12px] font-bold text-[#374151] hover:bg-[#f8fafc]"
                      >
                        編集
                      </Link>
                      <form action={toggleColumnPublished.bind(null, post.id)}>
                        <button
                          type="submit"
                          className="rounded border border-[#2f6cff] px-3 py-1.5 text-[12px] font-bold text-[#2f6cff] hover:bg-[#f0f5ff]"
                        >
                          {post.isPublished ? "非公開" : "公開"}
                        </button>
                      </form>
                      <form action={deleteColumnPost.bind(null, post.id)}>
                        <button
                          type="submit"
                          className="rounded border border-[#ef4444] px-3 py-1.5 text-[12px] font-bold text-[#ef4444] hover:bg-[#fff1f2]"
                        >
                          削除
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
