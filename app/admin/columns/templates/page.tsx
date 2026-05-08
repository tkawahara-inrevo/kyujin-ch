import Link from "next/link";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { deleteColumnTemplate } from "@/app/actions/admin/columns";

export default async function ColumnTemplatesPage() {
  await requireColumnEditor();
  const templates = await prisma.columnTemplate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-bold text-[#1e293b]">テンプレート管理</h1>
        <div className="flex gap-2">
          <Link href="/admin/columns" className="rounded-lg border border-[#d1d5db] px-4 py-2.5 text-[13px] font-bold text-[#4b5565] hover:bg-[#f8fafc]">
            ← コラム一覧
          </Link>
          <Link href="/admin/columns/templates/new" className="rounded-lg bg-[#2f6cff] px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90">
            新規テンプレート
          </Link>
        </div>
      </div>

      <div className="mt-6">
        {templates.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-[#9aa3b2] shadow-sm">テンプレートがまだありません</div>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="min-w-0">
                  <p className="font-bold text-[#1e293b]">{t.name}</p>
                  <p className="mt-1 truncate text-[12px] text-[#6b7280]">{t.body.replace(/<[^>]*>/g, "").slice(0, 80)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={`/admin/columns/templates/${t.id}/edit`}
                    className="rounded border border-[#d1d5db] px-3 py-1.5 text-[12px] font-bold text-[#374151] hover:bg-[#f8fafc]">
                    編集
                  </Link>
                  <form action={deleteColumnTemplate.bind(null, t.id)}>
                    <button type="submit" className="rounded border border-[#ef4444] px-3 py-1.5 text-[12px] font-bold text-[#ef4444] hover:bg-[#fff1f2]">
                      削除
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
