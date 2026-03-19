"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { withdrawJobSubmission } from "@/app/actions/company/jobs";

type JobRow = {
  id: string;
  title: string;
  reviewStatus: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "RETURNED";
  isPublished: boolean;
  applicationsCount: number;
  hasPublishedVersion: boolean;
};

const FILTER_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "DRAFT", label: "下書き" },
  { value: "PENDING_REVIEW", label: "審査中" },
  { value: "PUBLISHED", label: "審査済み" },
  { value: "RETURNED", label: "要修正" },
];

const REVIEW_LABELS: Record<JobRow["reviewStatus"], string> = {
  DRAFT: "下書き",
  PENDING_REVIEW: "審査中",
  PUBLISHED: "審査済み",
  RETURNED: "要修正",
};

const REVIEW_BADGES: Record<JobRow["reviewStatus"], string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_REVIEW: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  RETURNED: "bg-rose-100 text-rose-700",
};

export function CompanyJobsTable({
  jobs,
  currentStatus,
}: {
  jobs: JobRow[];
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [targetJob, setTargetJob] = useState<JobRow | null>(null);

  const filterValue = useMemo(
    () => FILTER_OPTIONS.some((option) => option.value === currentStatus) ? currentStatus : "all",
    [currentStatus],
  );

  function changeFilter(nextValue: string) {
    router.push(nextValue === "all" ? "/company/jobs" : `/company/jobs?status=${nextValue}`);
  }

  function handleWithdraw() {
    if (!targetJob) return;

    startTransition(async () => {
      await withdrawJobSubmission(targetJob.id);
      setTargetJob(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-[280px]">
          <label className="mb-2 block text-[14px] font-bold text-[#444]">絞り込み条件</label>
          <select
            value={filterValue}
            onChange={(event) => changeFilter(event.target.value)}
            className="w-full rounded-[10px] border border-[#d6dce8] bg-white px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[18px] bg-white shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#e8edf5] text-[#7f8795]">
              <th className="px-5 py-5 font-bold">応募求人</th>
              <th className="px-5 py-5 font-bold">応募数</th>
              <th className="px-5 py-5 font-bold">審査状況</th>
              <th className="px-5 py-5 text-right font-bold">公開</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-[#9aa3b2]">
                  条件に合う求人はありません
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const canWithdraw = job.reviewStatus === "PENDING_REVIEW";
                return (
                  <tr key={job.id} className="border-b border-[#edf0f5] last:border-b-0">
                    <td className="px-5 py-5 font-bold text-[#333]">
                      <Link href={`/company/jobs/${job.id}/edit`} className="hover:text-[#2f6cff]">
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-5 py-5 font-bold text-[#333]">{job.applicationsCount}</td>
                    <td className="px-5 py-5">
                      {canWithdraw ? (
                        <button
                          type="button"
                          onClick={() => setTargetJob(job)}
                          className={`rounded-full px-3 py-1 text-[12px] font-bold transition ${REVIEW_BADGES[job.reviewStatus]}`}
                        >
                          {REVIEW_LABELS[job.reviewStatus]}
                        </button>
                      ) : (
                        <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${REVIEW_BADGES[job.reviewStatus]}`}>
                          {REVIEW_LABELS[job.reviewStatus]}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-right">
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                          job.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {job.isPublished ? "公開" : "非公開"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {targetJob ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[420px] rounded-[20px] bg-white p-6 shadow-2xl">
            <h2 className="text-[20px] font-bold text-[#2b2f38]">審査を取り下げる</h2>
            <p className="mt-3 text-[14px] leading-[1.8] text-[#5f6775]">
              {targetJob.hasPublishedVersion
                ? "取り下げると、掲載中の求人はそのままで審査状況のみ審査済みに戻ります。"
                : "取り下げると、この求人は下書きの非公開状態に戻ります。"}
            </p>
            <div className="mt-5 rounded-[14px] bg-[#f7f9fc] px-4 py-3 text-[14px] font-semibold text-[#2b2f38]">
              {targetJob.title}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTargetJob(null)}
                className="rounded-[12px] border border-[#d7dce6] px-5 py-3 text-[14px] font-bold text-[#667085]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isPending}
                className="rounded-[12px] bg-[#f59e0b] px-5 py-3 text-[14px] font-bold text-white disabled:opacity-60"
              >
                {isPending ? "処理中..." : "取り下げる"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
