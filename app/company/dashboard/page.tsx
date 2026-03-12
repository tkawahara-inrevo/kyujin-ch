import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";

export default async function CompanyDashboardPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthlyApps, activeJobs, unreadMessages, recentApps] = await Promise.all([
    prisma.application.count({
      where: { job: { companyId: company.id }, createdAt: { gte: startOfMonth } },
    }),
    prisma.job.count({
      where: { companyId: company.id, isPublished: true, isDeleted: false },
    }),
    prisma.message.count({
      where: {
        isRead: false,
        senderType: "USER",
        conversation: { application: { job: { companyId: company.id } } },
      },
    }),
    prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: { user: true, job: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const charges = await prisma.charge.aggregate({
    where: {
      isValid: true,
      billingMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      application: { job: { companyId: company.id } },
    },
    _sum: { amount: true },
  });

  const kpiCards = [
    { label: "当月応募数", value: monthlyApps, color: "#2f6cff" },
    { label: "掲載中求人", value: activeJobs, color: "#10b981" },
    { label: "概算費用", value: `¥${(charges._sum.amount ?? 0).toLocaleString()}`, color: "#f59e0b" },
    { label: "未読メッセージ", value: unreadMessages, color: "#ef4444" },
  ];

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">ダッシュボード</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-[#888]">{kpi.label}</p>
            <p className="mt-2 text-[28px] font-bold" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#333]">最近の応募</h2>
          <Link href="/company/applicants" className="text-[13px] font-semibold text-[#2f6cff] hover:underline">
            すべて見る →
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">氏名</th>
                <th className="px-5 py-3 font-semibold">求人</th>
                <th className="px-5 py-3 font-semibold">応募日</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-[#aaa]">
                    応募はまだありません
                  </td>
                </tr>
              ) : (
                recentApps.map((app) => (
                  <tr key={app.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link href={`/company/applicants/${app.id}`} className="hover:text-[#2f6cff] hover:underline">
                        {app.user.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#555]">{app.job.title}</td>
                    <td className="px-5 py-3 text-[#888]">{app.createdAt.toLocaleDateString("ja-JP")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
