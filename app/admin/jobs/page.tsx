import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { JobsTable, type AdminJobRow } from "./jobs-table";

export default async function AdminJobsPage() {
  await requireAdmin();

  const jobs = await prisma.job.findMany({
    where: { isDeleted: false },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminJobRow[] = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    companyId: job.companyId,
    companyName: job.company.name,
    applicationsCount: job._count.applications,
    viewCount: job.viewCount,
    isPublished: job.isPublished,
    createdAt: job.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">求人一覧</h1>
      <JobsTable jobs={rows} />
    </div>
  );
}
