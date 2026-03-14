import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  AnalyticsRankings,
  type TopCompanyRevenueRow,
  type TopJobRow,
} from "./analytics-rankings";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [
    totalJobs,
    totalApps,
    monthlyApps,
    totalCharges,
    monthlyCharges,
    totalViews,
    monthlyViews,
    topJobsByPv,
    topJobsByApps,
  ] = await Promise.all([
    prisma.job.count({ where: { isDeleted: false } }),
    prisma.application.count(),
    prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.charge.aggregate({ where: { isValid: true }, _sum: { amount: true } }),
    prisma.charge.aggregate({
      where: { isValid: true, billingMonth: thisMonth },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.jobView.count(),
    prisma.jobView.count({ where: { viewedAt: { gte: startOfMonth } } }),
    prisma.job.findMany({
      where: { isDeleted: false },
      include: { company: true, _count: { select: { applications: true } } },
      orderBy: { viewCount: "desc" },
      take: 10,
    }),
    // 応募数ランキング用
    prisma.job.findMany({
      where: { isDeleted: false },
      include: { company: true, _count: { select: { applications: true } } },
      orderBy: { applications: { _count: "desc" } },
      take: 10,
    }),
  ]);

  // 企業別売上ランキング: 全企業のchargeを集計してTOP10を算出
  const allCompanies = await prisma.company.findMany({
    include: { _count: { select: { jobs: true } } },
  });

  const companyCharges = await Promise.all(
    allCompanies.map(async (company) => {
      const charges = await prisma.charge.aggregate({
        where: { isValid: true, application: { job: { companyId: company.id } } },
        _sum: { amount: true },
      });
      return { ...company, totalCharge: charges._sum.amount ?? 0 };
    })
  );

  // 売上順でソートしてTOP10
  companyCharges.sort((a, b) => b.totalCharge - a.totalCharge);
  const topCompanyCharges = companyCharges.slice(0, 10);

  const topJobRows: TopJobRow[] = topJobsByPv.map((job, index) => {
    const cvr =
      job.viewCount > 0
        ? ((job._count.applications / job.viewCount) * 100).toFixed(1)
        : "-";

    return {
      id: job.id,
      rank: index + 1,
      title: job.title,
      companyName: job.company.name,
      viewCount: job.viewCount,
      applicationsCount: job._count.applications,
      cvrLabel: cvr === "-" ? cvr : `${cvr}%`,
    };
  });

  const topJobByAppsRows: TopJobRow[] = topJobsByApps
    .filter((job) => job._count.applications > 0)
    .map((job, index) => {
      const cvr =
        job.viewCount > 0
          ? ((job._count.applications / job.viewCount) * 100).toFixed(1)
          : "-";
      return {
        id: job.id,
        rank: index + 1,
        title: job.title,
        companyName: job.company.name,
        viewCount: job.viewCount,
        applicationsCount: job._count.applications,
        cvrLabel: cvr === "-" ? cvr : `${cvr}%`,
      };
    });

  const topCompanyRows: TopCompanyRevenueRow[] = topCompanyCharges.map((company, index) => ({
    id: company.id,
    rank: index + 1,
    name: company.name,
    jobsCount: company._count.jobs,
    totalCharge: company.totalCharge,
  }));

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">分析</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <KpiCard label="総求人数" value={totalJobs} color="#2f6cff" />
        <KpiCard label="総応募数" value={totalApps} sub={`今月: ${monthlyApps}`} color="#10b981" />
        <KpiCard
          label="総PV"
          value={totalViews.toLocaleString()}
          sub={`今月: ${monthlyViews.toLocaleString()}`}
          color="#8b5cf6"
        />
        <KpiCard
          label="総請求額"
          value={`¥${(totalCharges._sum.amount ?? 0).toLocaleString()}`}
          sub={`今月: ¥${(monthlyCharges._sum.amount ?? 0).toLocaleString()} (${monthlyCharges._count}件)`}
          color="#f59e0b"
        />
      </div>

      <AnalyticsRankings topJobs={topJobRows} topJobsByApps={topJobByAppsRows} topCompanies={topCompanyRows} />
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <p className="text-[12px] font-semibold text-[#888]">{label}</p>
      <p className="mt-2 text-[28px] font-bold" style={{ color }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[12px] text-[#aaa]">{sub}</p>}
    </div>
  );
}
