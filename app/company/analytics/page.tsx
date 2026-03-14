import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth-helpers";
import AnalyticsTable from "./analytics-table";

export default async function CompanyAnalyticsPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id, isDeleted: false },
    include: {
      _count: { select: { applications: true, jobViews: true } },
      jobViews: {
        where: { viewedAt: { gte: sevenDaysAgo } },
        select: { id: true },
      },
      applications: {
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = jobs.map((job) => {
    const pvTotal = job._count.jobViews;
    const pvRecent = job.jobViews.length;
    const appsTotal = job._count.applications;
    const appsRecent = job.applications.length;
    const rateTotal = pvTotal > 0 ? ((appsTotal / pvTotal) * 100).toFixed(1) + "%" : "-";
    const rateRecent = pvRecent > 0 ? ((appsRecent / pvRecent) * 100).toFixed(1) + "%" : "-";
    return {
      id: job.id,
      title: job.title,
      pvTotal,
      pvRecent,
      appsTotal,
      appsRecent,
      rateTotal,
      rateRecent,
    };
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">分析</h1>
      <AnalyticsTable jobs={rows} />
    </div>
  );
}
