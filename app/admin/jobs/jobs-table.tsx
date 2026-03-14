"use client";

import Link from "next/link";
import { useState } from "react";

export type AdminJobRow = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  applicationsCount: number;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
};

function PublishBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
        isPublished ? "bg-[#d1fae5] text-[#059669]" : "bg-[#f3f4f6] text-[#888]"
      }`}
    >
      {isPublished ? "公開中" : "下書き"}
    </span>
  );
}

export function JobsTable({ jobs }: { jobs: AdminJobRow[] }) {
  const [selectedJob, setSelectedJob] = useState<AdminJobRow | null>(null);

  return (
    <>
      <div className="mt-6 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="md:hidden">
          {jobs.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#aaa]">求人がありません</div>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_54px_68px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
                <span className="truncate">求人</span>
                <span className="text-right">応募</span>
                <span className="text-center">公開</span>
              </div>
              <div>
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_54px_68px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#333]">{job.title}</p>
                      <p className="truncate text-[11px] text-[#999]">{job.companyName}</p>
                    </div>
                    <span className="text-right text-[13px] text-[#555]">
                      {job.applicationsCount}
                    </span>
                    <span className="flex justify-center">
                      <PublishBadge isPublished={job.isPublished} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">求人タイトル</th>
                <th className="px-5 py-3 font-semibold">企業</th>
                <th className="px-5 py-3 font-semibold">応募数</th>
                <th className="px-5 py-3 font-semibold">PV</th>
                <th className="px-5 py-3 font-semibold">公開</th>
                <th className="px-5 py-3 font-semibold">掲載日</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#aaa]">求人がありません</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="hover:text-[#2f6cff] hover:underline"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#555]">
                      <Link
                        href={`/admin/companies/${job.companyId}`}
                        className="hover:text-[#2f6cff] hover:underline"
                      >
                        {job.companyName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#555]">{job.applicationsCount}</td>
                    <td className="px-5 py-3 text-[#555]">{job.viewCount}</td>
                    <td className="px-5 py-3">
                      <PublishBadge isPublished={job.isPublished} />
                    </td>
                    <td className="px-5 py-3 text-[#888]">
                      {new Date(job.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden">
          <button type="button" aria-label="close" onClick={() => setSelectedJob(null)} className="absolute inset-0" />
          <div className="relative max-h-[85vh] w-full rounded-t-[24px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.14)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d1d5db]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#888]">{selectedJob.companyName}</p>
                <h3 className="mt-1 truncate text-[16px] font-bold text-[#1e3a5f]">{selectedJob.title}</h3>
              </div>
              <button type="button" onClick={() => setSelectedJob(null)} className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]">
                閉じる
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">応募数</p>
                <p className="mt-1 text-[16px] font-bold text-[#333]">{selectedJob.applicationsCount}</p>
              </div>
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">PV</p>
                <p className="mt-1 text-[16px] font-bold text-[#333]">{selectedJob.viewCount}</p>
              </div>
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">公開状態</p>
                <div className="mt-2">
                  <PublishBadge isPublished={selectedJob.isPublished} />
                </div>
              </div>
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">掲載日</p>
                <p className="mt-1 text-[14px] font-medium text-[#333]">
                  {new Date(selectedJob.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href={`/admin/jobs/${selectedJob.id}`} className="flex items-center justify-center rounded-[12px] bg-[#2f6cff] px-4 py-3 text-[13px] font-bold text-white">
                求人詳細を見る
              </Link>
              <Link href={`/admin/companies/${selectedJob.companyId}`} className="flex items-center justify-center rounded-[12px] border border-[#dbe4ff] bg-[#f3f6ff] px-4 py-3 text-[13px] font-bold text-[#2f6cff]">
                企業を見る
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
