import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function KpiCard({
  label,
  value,
  href,
  colorClass,
  sub,
}: {
  label: string;
  value: string | number;
  href: string;
  colorClass: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[18px] bg-white p-6 shadow-[0_2px_10px_rgba(37,56,88,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,56,88,0.08)]"
    >
      <p className="text-[16px] font-bold text-[#2b2f38]">{label}</p>
      <p className={`mt-5 text-[18px] font-bold md:text-[24px] ${colorClass}`}>{value}</p>
      {sub ? <p className="mt-3 text-[13px] text-[#7f8795]">{sub}</p> : null}
    </Link>
  );
}

export default async function CompanyDashboardPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentBillingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [monthlyApps, publishedJobs, unreadMessages, recentApps, currentMonthCharges, lifetimeCharges] =
    await Promise.all([
      prisma.application.count({
        where: { job: { companyId: company.id }, createdAt: { gte: startOfMonth } },
      }),
      prisma.job.count({
        where: { companyId: company.id, reviewStatus: "PUBLISHED", isDeleted: false },
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
        take: 6,
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

  return (
    <div className="px-6 py-8 md:px-12 md:py-10">
      <h1 className="text-[34px] font-bold tracking-tight text-[#2b2f38]">ダッシュボード</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          label="当月応募数"
          value={monthlyApps}
          href="/company/applicants"
          colorClass="text-[#ff3158]"
        />
        <KpiCard
          label="掲載中求人"
          value={publishedJobs}
          href="/company/jobs"
          colorClass="text-[#2f6cff]"
        />
        <KpiCard
          label="概算費用"
          value={`¥ ${(lifetimeCharges._sum.amount ?? 0).toLocaleString()}`}
          href="/company/billing"
          colorClass="text-[#f59e0b]"
          sub={`当月 ¥ ${(currentMonthCharges._sum.amount ?? 0).toLocaleString()}`}
        />
        <KpiCard
          label="未読メッセージ"
          value={unreadMessages}
          href="/company/messages"
          colorClass="text-[#22c55e]"
        />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[24px] font-bold text-[#2b2f38]">最新の応募</h2>
          <Link href="/company/applicants" className="text-[15px] font-bold text-[#2b2f38] hover:opacity-70">
            すべて見る →
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-[18px] bg-white shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
          <div className="xl:hidden">
            {recentApps.length === 0 ? (
              <div className="px-4 py-10 text-center text-[#9aa3b2]">まだ応募はありません</div>
            ) : (
              <div className="divide-y divide-[#edf0f5]">
                {recentApps.map((application) => (
                  <Link
                    key={application.id}
                    href={`/company/applicants/${application.id}`}
                    className="block px-4 py-4 transition hover:bg-[#fafcff]"
                  >
                    <p className="truncate text-[15px] font-bold text-[#333]">{application.user.name}</p>
                    <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[1.6] text-[#475467]">
                      {application.job.title}
                    </p>
                    <p className="mt-3 text-[12px] text-[#98a2b3]">
                      応募日 {application.createdAt.toLocaleDateString("ja-JP")}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hidden xl:block">
            <table className="w-full table-fixed text-left text-[14px]">
              <thead>
                <tr className="border-b border-[#e8edf5] text-[#7f8795]">
                  <th className="w-[104px] whitespace-nowrap px-4 py-4 font-bold">氏名</th>
                  <th className="px-4 py-4 font-bold">応募求人</th>
                  <th className="w-[100px] whitespace-nowrap px-3 py-4 font-bold">応募日</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-[#9aa3b2]">
                      まだ応募はありません
                    </td>
                  </tr>
                ) : (
                  recentApps.map((application) => (
                    <tr key={application.id} className="border-b border-[#edf0f5] last:border-b-0">
                      <td className="px-4 py-4 font-bold text-[#333]">
                        <Link
                          href={`/company/applicants/${application.id}`}
                          className="block truncate hover:text-[#2f6cff]"
                          title={application.user.name ?? ""}
                        >
                          {application.user.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-[#333]">
                        <span className="block truncate" title={application.job.title}>
                          {application.job.title}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-[#666]">
                        {application.createdAt.toLocaleDateString("ja-JP")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
