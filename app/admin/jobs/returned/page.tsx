import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { JOB_REVIEW_STATUS_BADGE_CLASSES, JOB_REVIEW_STATUS_LABELS, formatReviewComment } from "@/lib/job-review";

export const dynamic = "force-dynamic";

export default async function ReturnedJobsPage() {
  await requireAdmin();

  // 過去に1回でも RETURNED ログがある求人を、最新差戻し日時の降順で
  const logs = await prisma.jobReviewLog.findMany({
    where: { status: "RETURNED" },
    orderBy: { changedAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          reviewStatus: true,
          company: { select: { id: true, name: true } },
        },
      },
    },
  });

  // 求人ごとに 1 件にまとめる（最新の差戻しを表示、件数を集計）
  const byJob = new Map<string, {
    jobId: string;
    title: string;
    companyName: string;
    currentStatus: typeof logs[number]["status"];
    latestChangedAt: Date;
    latestComment: string | null;
    returnedCount: number;
  }>();

  for (const log of logs) {
    if (!log.job) continue;
    const existing = byJob.get(log.jobId);
    if (existing) {
      existing.returnedCount += 1;
    } else {
      byJob.set(log.jobId, {
        jobId: log.jobId,
        title: log.job.title,
        companyName: log.job.company.name,
        currentStatus: log.job.reviewStatus,
        latestChangedAt: log.changedAt,
        latestComment: log.comment,
        returnedCount: 1,
      });
    }
  }

  const rows = Array.from(byJob.values());

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[24px] font-bold text-[#1e293b]">差し戻し履歴</h1>
        <Link href="/admin/jobs" className="text-[13px] text-[#2f6cff] hover:underline">
          求人一覧に戻る
        </Link>
      </div>
      <p className="mt-2 text-[13px] text-[#888]">過去に1回でも差し戻された求人の一覧です（{rows.length}件）</p>

      <div className="mt-6 overflow-x-auto rounded-[12px] border border-[#e5e7eb] bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#f8fafc] text-[#6b7280]">
            <tr>
              <th className="px-4 py-3 font-bold">企業</th>
              <th className="px-4 py-3 font-bold">求人タイトル</th>
              <th className="px-4 py-3 font-bold text-center">現ステータス</th>
              <th className="px-4 py-3 font-bold text-center">差戻回数</th>
              <th className="px-4 py-3 font-bold">最新の差戻し理由</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap">最終差戻日時</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#9aa3b2]">差し戻し履歴のある求人はありません</td>
              </tr>
            ) : rows.map((r) => (
              <tr key={r.jobId} className="border-t border-[#eef0f5] hover:bg-[#fafbfd]">
                <td className="px-4 py-3 align-top text-[#333]">{r.companyName}</td>
                <td className="px-4 py-3 align-top">
                  <Link href={`/admin/jobs/${r.jobId}`} className="font-semibold text-[#1d63e3] hover:underline">{r.title}</Link>
                </td>
                <td className="px-4 py-3 align-top text-center">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${JOB_REVIEW_STATUS_BADGE_CLASSES[r.currentStatus]}`}>
                    {JOB_REVIEW_STATUS_LABELS[r.currentStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-center font-bold text-[#dc2626]">{r.returnedCount}</td>
                <td className="px-4 py-3 align-top text-[12px] text-[#92400e]">
                  {r.latestComment ? formatReviewComment(r.latestComment) : "—"}
                </td>
                <td className="px-4 py-3 align-top text-[12px] whitespace-nowrap text-[#666]">
                  {new Date(r.latestChangedAt).toLocaleString("ja-JP")}
                </td>
                <td className="px-4 py-3 align-top">
                  <Link href={`/admin/jobs/${r.jobId}`} className="rounded-[8px] border border-[#d0d7e6] px-3 py-1 text-[12px] font-medium text-[#445063] hover:bg-[#f4f7fb] transition">
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
