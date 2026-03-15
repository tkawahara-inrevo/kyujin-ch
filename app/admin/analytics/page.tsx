import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  AnalyticsRankings,
  type TopCompanyRevenueRow,
  type TopJobRow,
} from "./analytics-rankings";
import { AnalyticsOverview } from "./analytics-overview";
import { countUniqueViews } from "@/lib/view-metrics";

export const dynamic = "force-dynamic";

function formatPercent(numerator: number, denominator: number) {
  if (denominator === 0) return "-";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [
    jobs,
    companies,
    totalApps,
    monthlyApps,
    totalViews,
    monthlyViews,
    charges,
    recentViews,
    recentApplications,
  ] =
    await Promise.all([
      prisma.job.findMany({
        where: { isDeleted: false },
        include: {
          company: true,
          _count: {
            select: {
              applications: true,
            },
          },
          jobViews: {
            select: { sessionId: true, viewedAt: true },
          },
          applications: {
            select: { id: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.company.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.application.count(),
      prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.jobView.count(),
      prisma.jobView.count({ where: { viewedAt: { gte: startOfMonth } } }),
      prisma.charge.findMany({
        where: { isValid: true },
        select: {
          amount: true,
          billingMonth: true,
          application: {
            select: {
              job: {
                select: {
                  companyId: true,
                },
              },
            },
          },
        },
      }),
      prisma.jobView.findMany({
        where: { viewedAt: { gte: thirtyDaysAgo } },
        select: { viewedAt: true },
      }),
      prisma.application.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

  const totalJobs = jobs.length;
  const totalChargeAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);
  const monthlyChargeRows = charges.filter((charge) => charge.billingMonth === thisMonth);
  const monthlyChargeAmount = monthlyChargeRows.reduce(
    (sum, charge) => sum + charge.amount,
    0,
  );

  const trends = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(thirtyDaysAgo);
    date.setDate(thirtyDaysAgo.getDate() + index);
    const dateKey = date.toISOString().slice(0, 10);

    return {
      date: dateKey,
      views: 0,
      applications: 0,
    };
  });

  const trendByDate = new Map(trends.map((row) => [row.date, row]));
  for (const view of recentViews) {
    const key = view.viewedAt.toISOString().slice(0, 10);
    const row = trendByDate.get(key);
    if (row) row.views += 1;
  }
  for (const application of recentApplications) {
    const key = application.createdAt.toISOString().slice(0, 10);
    const row = trendByDate.get(key);
    if (row) row.applications += 1;
  }

  const topJobsByPv: TopJobRow[] = [...jobs]
    .sort((a, b) => {
      const totalDiff = countUniqueViews(b.jobViews) - countUniqueViews(a.jobViews);
      if (totalDiff !== 0) return totalDiff;

      const recentDiff =
        countUniqueViews(b.jobViews.filter((view) => view.viewedAt >= startOfMonth)) -
        countUniqueViews(a.jobViews.filter((view) => view.viewedAt >= startOfMonth));
      if (recentDiff !== 0) return recentDiff;

      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, 10)
    .map((job, index) => {
      const totalUniqueViews = countUniqueViews(job.jobViews);
      const monthlyUniqueViews = countUniqueViews(
        job.jobViews.filter((view) => view.viewedAt >= startOfMonth),
      );
      const monthlyApplicationsCount = job.applications.filter(
        (application) => application.createdAt >= startOfMonth,
      ).length;

      return {
        id: job.id,
        rank: index + 1,
        title: job.title,
        companyName: job.company.name,
        viewCount: totalUniqueViews,
        monthlyViewCount: monthlyUniqueViews,
        applicationsCount: job._count.applications,
        monthlyApplicationsCount,
        cvrLabel: formatPercent(job._count.applications, totalUniqueViews),
      };
    });

  const topJobsByApps: TopJobRow[] = [...jobs]
    .filter((job) => job._count.applications > 0)
    .sort((a, b) => {
      const totalDiff = b._count.applications - a._count.applications;
      if (totalDiff !== 0) return totalDiff;

      const recentDiff =
        b.applications.filter((application) => application.createdAt >= startOfMonth).length -
        a.applications.filter((application) => application.createdAt >= startOfMonth).length;
      if (recentDiff !== 0) return recentDiff;

      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, 10)
    .map((job, index) => {
      const totalUniqueViews = countUniqueViews(job.jobViews);
      const monthlyUniqueViews = countUniqueViews(
        job.jobViews.filter((view) => view.viewedAt >= startOfMonth),
      );
      const monthlyApplicationsCount = job.applications.filter(
        (application) => application.createdAt >= startOfMonth,
      ).length;

      return {
        id: job.id,
        rank: index + 1,
        title: job.title,
        companyName: job.company.name,
        viewCount: totalUniqueViews,
        monthlyViewCount: monthlyUniqueViews,
        applicationsCount: job._count.applications,
        monthlyApplicationsCount,
        cvrLabel: formatPercent(job._count.applications, totalUniqueViews),
      };
    });

  const companyStats = new Map(
    companies.map((company) => [
      company.id,
      {
        id: company.id,
        name: company.name,
        jobsCount: 0,
        totalViews: 0,
        monthlyViewsForCompany: 0,
        applicationsCount: 0,
        totalCharge: 0,
      },
    ]),
  );

  for (const job of jobs) {
    const stats = companyStats.get(job.companyId);
    if (!stats) continue;

    stats.jobsCount += 1;
    stats.totalViews += countUniqueViews(job.jobViews);
    stats.monthlyViewsForCompany += countUniqueViews(
      job.jobViews.filter((view) => view.viewedAt >= startOfMonth),
    );
    stats.applicationsCount += job._count.applications;
  }

  for (const charge of charges) {
    const companyId = charge.application.job.companyId;
    const stats = companyStats.get(companyId);
    if (!stats) continue;

    stats.totalCharge += charge.amount;
  }

  const topCompanyRows: TopCompanyRevenueRow[] = [...companyStats.values()]
    .sort((a, b) => {
      const chargeDiff = b.totalCharge - a.totalCharge;
      if (chargeDiff !== 0) return chargeDiff;

      const pvDiff = b.totalViews - a.totalViews;
      if (pvDiff !== 0) return pvDiff;

      return b.applicationsCount - a.applicationsCount;
    })
    .slice(0, 10)
    .map((company, index) => ({
      id: company.id,
      rank: index + 1,
      name: company.name,
      jobsCount: company.jobsCount,
      totalViews: company.totalViews,
      monthlyViews: company.monthlyViewsForCompany,
      applicationsCount: company.applicationsCount,
      totalCharge: company.totalCharge,
    }));

  const categoryStats = new Map<
    string,
    { category: string; jobsCount: number; views: number; applications: number }
  >();

  for (const job of jobs) {
    const category = job.categoryTag?.trim() || "未設定";
    const current = categoryStats.get(category) ?? {
      category,
      jobsCount: 0,
      views: 0,
      applications: 0,
    };

    current.jobsCount += 1;
    current.views += countUniqueViews(job.jobViews);
    current.applications += job._count.applications;
    categoryStats.set(category, current);
  }

  const categoryRows = [...categoryStats.values()]
    .sort((a, b) => {
      const viewsDiff = b.views - a.views;
      if (viewsDiff !== 0) return viewsDiff;
      return b.applications - a.applications;
    })
    .map((row) => ({
      ...row,
      cvrLabel: formatPercent(row.applications, row.views),
    }));

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">分析</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <KpiCard label="総求人数" value={totalJobs} color="#2f6cff" />
        <KpiCard
          label="総応募数"
          value={totalApps}
          sub={`今月: ${monthlyApps}`}
          color="#10b981"
        />
        <KpiCard
          label="総PV"
          value={totalViews.toLocaleString()}
          sub={`今月: ${monthlyViews.toLocaleString()}`}
          color="#8b5cf6"
        />
        <KpiCard
          label="総課金額"
          value={`¥${totalChargeAmount.toLocaleString()}`}
          sub={`今月: ¥${monthlyChargeAmount.toLocaleString()} (${monthlyChargeRows.length}件)`}
          color="#f59e0b"
        />
      </div>

      <AnalyticsOverview trends={trends} categoryRows={categoryRows} />

      <AnalyticsRankings
        topJobs={topJobsByPv}
        topJobsByApps={topJobsByApps}
        topCompanies={topCompanyRows}
      />
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
