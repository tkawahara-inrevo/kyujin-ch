import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CompanyActiveToggle } from "./company-active-toggle";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminCompaniesPage() {
  await requireAdmin();
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { jobs: true } },
      companyUser: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1e293b]">企業一覧</h1>
        <Link href="/admin/companies/new" className="rounded-[10px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:opacity-90">
          企業アカウント発行
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0f0] text-[#888]">
              <th className="px-5 py-3 font-semibold">企業名</th>
              <th className="px-5 py-3 font-semibold">担当者</th>
              <th className="px-5 py-3 font-semibold">求人数</th>
              <th className="px-5 py-3 font-semibold">ステータス</th>
              <th className="px-5 py-3 font-semibold">登録日</th>
              <th className="px-5 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                <td className="px-5 py-3 font-medium text-[#333]">
                  <Link href={`/admin/companies/${c.id}`} className="hover:text-[#2f6cff] hover:underline">{c.name}</Link>
                </td>
                <td className="px-5 py-3 text-[#555]">{c.companyUser?.email ?? "-"}</td>
                <td className="px-5 py-3 text-[#555]">{c._count.jobs}</td>
                <td className="px-5 py-3">
                  <CompanyActiveToggle companyId={c.id} isActive={c.isActive} />
                </td>
                <td className="px-5 py-3 text-[#888]">{c.createdAt.toLocaleDateString("ja-JP")}</td>
                <td className="px-5 py-3">
                  <Link href={`/admin/companies/${c.id}`} className="text-[#2f6cff] hover:underline">詳細</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
