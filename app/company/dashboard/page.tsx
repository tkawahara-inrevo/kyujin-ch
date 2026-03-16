import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompanyDashboardPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentBillingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [
    monthlyApps,
    activeJobs,
    unreadMessages,
    recentApps,
    currentMonthCharges,
    lifetimeCharges,
  ] = await Promise.all([
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
    prisma.charge.aggregate({
      where: {
        isValid: true,
        billingMonth: currentBillingMonth,
        application: { job: { companyId: company.id } },
      },
      _sum: { amount: true },
    }),
    prisma.charge.aggregate({
      where: {
        isValid: true,
        application: { job: { companyId: company.id } },
      },
      _sum: { amount: true },
    }),
  ]);

  const kpiCards = [
    { label: "当月応募数", value: monthlyApps, color: "#2f6cff", href: "/company/applicants" },
    { label: "掲載中求人", value: activeJobs, color: "#10b981", href: "/company/jobs" },
    {
      label: "概算費用",
      value: `¥${(lifetimeCharges._sum.amount ?? 0).toLocaleString()}`,
      sub: `当月: ¥${(currentMonthCharges._sum.amount ?? 0).toLocaleString()}`,
      color: "#f59e0b",
      href: "/company/billing",
    },
    { label: "未読メッセージ", value: unreadMessages, color: "#ef4444", href: "/company/messages" },
  ];

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">ダッシュボード</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="block rounded-[12px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-md md:p-5"
          >
            <p className="text-[11px] font-semibold leading-[1.5] text-[#888] md:text-[12px]">
              {kpi.label}
            </p>
            <p
              className="mt-2 text-[22px] font-bold md:text-[28px]"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
            {"sub" in kpi && typeof kpi.sub === "string" ? (
              <p className="mt-1 text-[11px] text-[#aaa] md:text-[12px]">{kpi.sub}</p>
            ) : null}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#333]">最新の応募</h2>
          <Link
            href="/company/applicants"
            className="text-[13px] font-semibold text-[#2f6cff] hover:underline"
          >
            すべて見る »
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="min-w-[520px] w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">氏名</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">応募求人</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">応募日</th>
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
                      <Link
                        href={`/company/applicants/${app.id}`}
                        className="hover:text-[#2f6cff] hover:underline"
                      >
                        {app.user.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#555]">
                      <Link
                        href={`/company/jobs/${app.job.id}/edit`}
                        className="hover:text-[#2f6cff] hover:underline"
                      >
                        {app.job.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#888]">
                      {app.createdAt.toLocaleDateString("ja-JP")}
                    </td>
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
