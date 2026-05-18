import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminFocusPage() {
  await requireAdmin();

  const articles = await prisma.focusArticle.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, slug: true, companyName: true, title: true,
      isPublished: true, isHot: true, publishedAt: true, updatedAt: true,
    },
  });

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#1e293b]">Focus 記事管理</h1>
        <Link
          href="/admin/focus/new"
          className="rounded-lg bg-[#1f2775] px-5 py-2.5 text-[14px] font-bold text-white hover:opacity-90 transition"
        >
          ＋ 新規記事作成
        </Link>
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-[#4b5565]">企業名</th>
              <th className="px-4 py-3 text-left font-bold text-[#4b5565]">タイトル</th>
              <th className="px-4 py-3 text-left font-bold text-[#4b5565]">slug（法人番号）</th>
              <th className="px-4 py-3 text-center font-bold text-[#4b5565]">ステータス</th>
              <th className="px-4 py-3 text-center font-bold text-[#4b5565]">PICK UP</th>
              <th className="px-4 py-3 text-left font-bold text-[#4b5565]">更新日</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#888]">
                  記事がありません
                </td>
              </tr>
            )}
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition">
                <td className="px-4 py-3 font-medium text-[#333]">{a.companyName}</td>
                <td className="px-4 py-3 text-[#555] max-w-[280px] truncate">{a.title}</td>
                <td className="px-4 py-3 text-[#888] font-mono text-[11px]">{a.slug}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    a.isPublished
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {a.isPublished ? "公開中" : "非公開"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {a.isHot && (
                    <span className="rounded-full bg-[#1f2775]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1f2775]">
                      PICK UP
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#888]">
                  {new Date(a.updatedAt).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/focus/${a.id}/edit`}
                    className="rounded-lg border border-[#d1d5db] px-3 py-1.5 text-[12px] text-[#555] hover:bg-[#f8fafc] transition"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
