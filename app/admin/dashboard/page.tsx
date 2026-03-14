import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalCompanies, totalUsers, monthlyApps, pendingInvalid, recentCompanies] =
    await Promise.all([
      prisma.company.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.invalidRequest.count({ where: { status: "PENDING" } }),
      prisma.company.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  const kpiCards = [
    { label: "総企業数", value: totalCompanies, color: "#2f6cff", href: "/admin/companies" },
    { label: "総求職者数", value: totalUsers, color: "#10b981", href: "/admin/jobseekers" },
    { label: "当月総応募数", value: monthlyApps, color: "#f59e0b", href: "/admin/jobs" },
    { label: "承認待ち無効申請", value: pendingInvalid, color: "#ef4444", href: "/admin/invalid-requests" },
  ];

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">管理ダッシュボード</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Link key={kpi.label} href={kpi.href} className="block rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-md">
            <p className="text-[12px] font-semibold text-[#888]">{kpi.label}</p>
            <p className="mt-2 text-[28px] font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
          </Link>
        ))}
      </div>

      {pendingInvalid > 0 && (
        <div className="mt-6 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] p-4">
          <p className="text-[14px] font-semibold text-[#dc2626]">
            {pendingInvalid} 件の無効申請が承認待ちです
          </p>
          <Link href="/admin/invalid-requests" className="mt-1 inline-block text-[13px] text-[#dc2626] underline">
            無効申請管理へ →
          </Link>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#333]">直近登録企業</h2>
          <Link href="/admin/companies" className="text-[13px] font-semibold text-[#2f6cff] hover:underline">
            企業一覧へ →
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">企業名</th>
                <th className="px-5 py-3 font-semibold">登録日</th>
              </tr>
            </thead>
            <tbody>
              {recentCompanies.map((c) => (
                <tr key={c.id} className="border-b border-[#f8f8f8]">
                  <td className="px-5 py-3 font-medium text-[#333]">
                    <Link href={`/admin/companies/${c.id}`} className="hover:text-[#2f6cff] hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[#888]">{c.createdAt.toLocaleDateString("ja-JP")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
