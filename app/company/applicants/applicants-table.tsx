"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "./status-badge";

export type ApplicantRow = {
  id: string;
  userName: string;
  userEmail: string;
  jobId: string;
  jobTitle: string;
  status: string;
  createdAt: string;
};

export function ApplicantsTable({ applications }: { applications: ApplicantRow[] }) {
  const [selectedApplication, setSelectedApplication] = useState<ApplicantRow | null>(null);

  return (
    <>
      <div className="mt-6 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="md:hidden">
          {applications.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#aaa]">
              応募者がまだいません
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_96px_72px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
                <span className="truncate">応募者</span>
                <span className="truncate">求人</span>
                <span className="text-center">状態</span>
              </div>
              <div>
                {applications.map((application) => (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() => setSelectedApplication(application)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_96px_72px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#333]">
                        {application.userName}
                      </p>
                      <p className="truncate text-[11px] text-[#999]">
                        {new Date(application.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <span className="truncate text-[12px] text-[#555]">
                      {application.jobTitle}
                    </span>
                    <span className="flex justify-center">
                      <StatusBadge status={application.status} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">氏名</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">応募求人</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">ステータス</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">応募日</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[#aaa]">
                    応募者がまだいません
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-[#f8f8f8] hover:bg-[#fafafa]"
                  >
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link
                        href={`/company/applicants/${application.id}`}
                        className="hover:text-[#2f6cff] hover:underline"
                      >
                        {application.userName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#555]">
                      <Link
                        href={`/company/jobs/${application.jobId}/edit`}
                        className="hover:text-[#2f6cff] hover:underline"
                      >
                        {application.jobTitle}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="px-5 py-3 text-[#888]">
                      {new Date(application.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden">
          <button
            type="button"
            aria-label="close"
            onClick={() => setSelectedApplication(null)}
            className="absolute inset-0"
          />
          <div className="relative max-h-[85vh] w-full rounded-t-[24px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.14)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d1d5db]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#888]">
                  {new Date(selectedApplication.createdAt).toLocaleDateString("ja-JP")}
                </p>
                <h3 className="mt-1 truncate text-[16px] font-bold text-[#1e3a5f]">
                  {selectedApplication.userName}
                </h3>
                <p className="truncate text-[12px] text-[#888]">
                  {selectedApplication.userEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]"
              >
                閉じる
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">応募求人</p>
                <p className="mt-1 text-[14px] font-medium text-[#333]">
                  {selectedApplication.jobTitle}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#888]">ステータス</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedApplication.status} />
                  </div>
                </div>
                <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#888]">応募日</p>
                  <p className="mt-1 text-[14px] font-medium text-[#333]">
                    {new Date(selectedApplication.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/company/applicants/${selectedApplication.id}`}
                  className="flex items-center justify-center rounded-[12px] bg-[#2f6cff] px-4 py-3 text-[13px] font-bold text-white"
                >
                  詳細を見る
                </Link>
                <Link
                  href={`/company/jobs/${selectedApplication.jobId}/edit`}
                  className="flex items-center justify-center rounded-[12px] border border-[#dbe4ff] bg-[#f3f6ff] px-4 py-3 text-[13px] font-bold text-[#2f6cff]"
                >
                  求人を見る
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
