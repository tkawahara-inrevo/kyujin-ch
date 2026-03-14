import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { JobPublishToggle } from "./job-publish-toggle";

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      applications: {
        include: { user: true, charge: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) notFound();

  const totalCharges = await prisma.charge.aggregate({
    where: { isValid: true, application: { jobId: id } },
    _sum: { amount: true },
    _count: true,
  });

  const employmentTypeLabels: Record<string, string> = {
    FULL_TIME: "正社員",
    PART_TIME: "パートタイム",
    CONTRACT: "契約社員",
    TEMPORARY: "派遣",
    INTERN: "インターン",
    OTHER: "その他",
  };

  const statusLabels: Record<string, string> = {
    APPLIED: "応募済",
    REVIEWING: "選考中",
    INTERVIEW: "面接",
    OFFER: "内定",
    REJECTED: "不採用",
    HIRED: "採用",
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center gap-2 text-[13px] text-[#888]">
        <Link href="/admin/jobs" className="hover:text-[#2f6cff]">求人一覧</Link>
        <span>/</span>
        <Link href={`/admin/companies/${job.companyId}`} className="hover:text-[#2f6cff]">{job.company.name}</Link>
        <span>/</span>
        <span className="text-[#555]">{job.title.length > 30 ? job.title.slice(0, 30) + "…" : job.title}</span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1e293b]">{job.title}</h1>
        <JobPublishToggle jobId={job.id} isPublished={job.isPublished} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 text-[16px] font-bold text-[#333]">求人情報</h2>
          <dl className="space-y-3 text-[14px]">
            <div className="flex gap-4">
              <dt className="w-[100px] shrink-0 font-semibold text-[#888]">企業</dt>
              <dd>
                <Link href={`/admin/companies/${job.companyId}`} className="font-medium text-[#2f6cff] hover:underline">
                  {job.company.name}
                </Link>
              </dd>
            </div>
            <InfoRow label="雇用形態" value={employmentTypeLabels[job.employmentType] || job.employmentType} />
            <InfoRow label="勤務地" value={job.location || "未設定"} />
            <InfoRow label="給与" value={
              job.salaryMin && job.salaryMax
                ? `${job.salaryMin.toLocaleString()}〜${job.salaryMax.toLocaleString()}万円`
                : "未設定"
            } />
            <InfoRow label="カテゴリ" value={job.categoryTag || "未設定"} />
            <InfoRow label="PV" value={String(job.viewCount)} />
            <InfoRow label="公開状態" value={job.isPublished ? "公開" : "非公開"} />
            <InfoRow label="作成日" value={job.createdAt.toLocaleDateString("ja-JP")} />
          </dl>
        </div>

        <div className="space-y-4">
          <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-[#888]">応募数</p>
            <p className="mt-2 text-[28px] font-bold text-[#2f6cff]">{job.applications.length}</p>
          </div>
          <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-[#888]">課金額合計</p>
            <p className="mt-2 text-[28px] font-bold text-[#10b981]">
              ¥{(totalCharges._sum.amount ?? 0).toLocaleString()}
            </p>
            <p className="mt-1 text-[12px] text-[#aaa]">{totalCharges._count} 件</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="mb-3 text-[16px] font-bold text-[#333]">求人詳細</h2>
        <p className="whitespace-pre-wrap text-[14px] leading-[1.8] text-[#555]">{job.description}</p>
      </div>

      {/* Applications */}
      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">応募者一覧</h2>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">応募者</th>
                <th className="px-5 py-3 font-semibold">ステータス</th>
                <th className="px-5 py-3 font-semibold">課金額</th>
                <th className="px-5 py-3 font-semibold">応募日</th>
              </tr>
            </thead>
            <tbody>
              {job.applications.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-[#aaa]">応募がありません</td></tr>
              ) : (
                job.applications.map((app) => (
                  <tr key={app.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link href={`/admin/jobseekers/${app.userId}`} className="hover:text-[#2f6cff] hover:underline">
                        {app.user.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#2f6cff]">
                        {statusLabels[app.status] || app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#555]">
                      {app.charge ? `¥${app.charge.amount.toLocaleString()}` : "—"}
                    </td>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-[100px] shrink-0 font-semibold text-[#888]">{label}</dt>
      <dd className="text-[#333]">{value}</dd>
    </div>
  );
}
