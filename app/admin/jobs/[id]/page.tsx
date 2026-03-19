import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { parsePendingContent } from "@/lib/job-pending";
import { JOB_REVIEW_STATUS_BADGE_CLASSES, JOB_REVIEW_STATUS_LABELS } from "@/lib/job-review";
import { prisma } from "@/lib/prisma";
import { JobReviewActions } from "./job-review-actions";

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

  const pendingContent = parsePendingContent(job.pendingContent);
  const displayJob = pendingContent ? { ...job, ...pendingContent } : job;

  const totalCharges = await prisma.charge.aggregate({
    where: { isValid: true, application: { jobId: id } },
    _sum: { amount: true },
    _count: true,
  });

  const employmentTypeLabels: Record<string, string> = {
    FULL_TIME: "正社員",
    PART_TIME: "パート・アルバイト",
    CONTRACT: "契約社員",
    TEMPORARY: "派遣",
    INTERN: "インターン",
    OTHER: "その他",
  };

  const applicationStatusLabels: Record<string, string> = {
    APPLIED: "応募済み",
    REVIEWING: "書類選考",
    INTERVIEW: "面接",
    OFFER: "内定",
    REJECTED: "不採用",
    HIRED: "採用",
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center gap-2 text-[13px] text-[#888]">
        <Link href="/admin/jobs" className="hover:text-[#2f6cff]">
          求人一覧
        </Link>
        <span>/</span>
        <Link href={`/admin/companies/${job.companyId}`} className="hover:text-[#2f6cff]">
          {job.company.name}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1e293b]">{displayJob.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${JOB_REVIEW_STATUS_BADGE_CLASSES[job.reviewStatus]}`}>
              {JOB_REVIEW_STATUS_LABELS[job.reviewStatus]}
            </span>
            {pendingContent ? (
              <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[12px] font-bold text-[#2563eb]">
                公開中の求人を差し替え審査中
              </span>
            ) : null}
            {job.reviewComment ? <span className="text-[13px] text-[#a16207]">差し戻し理由: {job.reviewComment}</span> : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 text-[16px] font-bold text-[#333]">審査対象の内容</h2>
          <dl className="space-y-3 text-[14px]">
            <InfoRow label="会社" value={job.company.name} href={`/admin/companies/${job.companyId}`} />
            <InfoRow label="雇用形態" value={employmentTypeLabels[displayJob.employmentType] || displayJob.employmentType} />
            <InfoRow label="勤務地" value={displayJob.location || "未設定"} />
            <InfoRow
              label="年収"
              value={
                displayJob.salaryMin && displayJob.salaryMax
                  ? `${displayJob.salaryMin.toLocaleString()}〜${displayJob.salaryMax.toLocaleString()}円`
                  : "未設定"
              }
            />
            <InfoRow label="カテゴリ" value={displayJob.categoryTag || "未設定"} />
            <InfoRow label="PV" value={String(job.viewCount)} />
            <InfoRow label="投稿日" value={job.createdAt.toLocaleDateString("ja-JP")} />
          </dl>
          {pendingContent ? (
            <p className="mt-4 rounded-[10px] border border-[#dbe4ff] bg-[#f5f8ff] px-4 py-3 text-[13px] leading-[1.7] text-[#587199]">
              この求人は公開を継続したまま差し替え審査に出されています。承認すると、現在公開中の内容がこの編集内容に置き換わります!
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-[#888]">応募数</p>
            <p className="mt-2 text-[28px] font-bold text-[#2f6cff]">{job.applications.length}</p>
          </div>
          <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-[#888]">有効請求額</p>
            <p className="mt-2 text-[28px] font-bold text-[#10b981]">¥{(totalCharges._sum.amount ?? 0).toLocaleString()}</p>
            <p className="mt-1 text-[12px] text-[#aaa]">{totalCharges._count}件</p>
          </div>
          <JobReviewActions jobId={job.id} disabledApprove={job.reviewStatus === "PUBLISHED" && !pendingContent} />
        </div>
      </div>

      <div className="mt-6 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="mb-3 text-[16px] font-bold text-[#333]">仕事内容</h2>
        <p className="whitespace-pre-wrap text-[14px] leading-[1.8] text-[#555]">{displayJob.description}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">応募一覧</h2>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">応募者</th>
                <th className="px-5 py-3 font-semibold">ステータス</th>
                <th className="px-5 py-3 font-semibold">請求額</th>
                <th className="px-5 py-3 font-semibold">応募日</th>
              </tr>
            </thead>
            <tbody>
              {job.applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[#aaa]">
                    応募はありません
                  </td>
                </tr>
              ) : (
                job.applications.map((application) => (
                  <tr key={application.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link href={`/admin/jobseekers/${application.userId}`} className="hover:text-[#2f6cff] hover:underline">
                        {application.user.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#2f6cff]">
                        {applicationStatusLabels[application.status] || application.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#555]">
                      {application.charge ? `¥${application.charge.amount.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-5 py-3 text-[#888]">{application.createdAt.toLocaleDateString("ja-JP")}</td>
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

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex gap-4">
      <dt className="w-[100px] shrink-0 font-semibold text-[#888]">{label}</dt>
      <dd className="text-[#333]">
        {href ? (
          <Link href={href} className="font-medium text-[#2f6cff] hover:underline">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
