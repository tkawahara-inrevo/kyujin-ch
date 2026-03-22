import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
    { label: "登録企業数", value: totalCompanies, color: "#2f6cff", href: "/admin/companies" },
    { label: "求職者数", value: totalUsers, color: "#10b981", href: "/admin/jobseekers" },
    { label: "当月応募数", value: monthlyApps, color: "#f59e0b", href: "/admin/jobs" },
    { label: "無効申請", value: pendingInvalid, color: "#ef4444", href: "/admin/invalid-requests" },
  ];

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">管理ダッシュボード</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="block rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-md"
          >
            <p className="text-[12px] font-semibold text-[#888]">{kpi.label}</p>
            <p className="mt-2 text-[28px] font-bold" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </Link>
        ))}
      </div>

      {pendingInvalid > 0 && (
        <div className="mt-6 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] p-4">
          <p className="text-[14px] font-semibold text-[#dc2626]">
            {pendingInvalid} 件の無効申請が確認待ちです
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

        <div className="mt-3 overflow-hidden rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="md:hidden">
            {recentCompanies.length === 0 ? (
              <div className="px-4 py-10 text-center text-[#9aa3b2]">まだ登録企業はありません</div>
            ) : (
              <div className="divide-y divide-[#edf0f5]">
                {recentCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/admin/companies/${company.id}`}
                    className="block px-4 py-4 transition hover:bg-[#fafcff]"
                  >
                    <p className="truncate text-[15px] font-bold text-[#333]">{company.name}</p>
                    <p className="mt-2 text-[12px] text-[#98a2b3]">
                      登録日 {company.createdAt.toLocaleDateString("ja-JP")}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <table className="w-full table-fixed text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[#888]">
                  <th className="px-5 py-3 font-semibold">企業名</th>
                  <th className="w-[112px] whitespace-nowrap px-5 py-3 font-semibold">登録日</th>
                </tr>
              </thead>
              <tbody>
                {recentCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-[#f8f8f8] last:border-b-0">
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link href={`/admin/companies/${company.id}`} className="block truncate hover:text-[#2f6cff] hover:underline">
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#888]">{company.createdAt.toLocaleDateString("ja-JP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
