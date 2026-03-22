"use client";

import { useState } from "react";
import ApplicationChart from "./application-chart";

type JobRow = {
  id: string;
  title: string;
  pvTotal: number;
  pvRecent: number;
  appsTotal: number;
  appsRecent: number;
  rateTotal: string;
  rateRecent: string;
};

export default function AnalyticsTable({ jobs }: { jobs: JobRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobRow | null>(null);

  return (
    <>
      <div className="mt-6 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="xl:hidden">
          {jobs.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#aaa]">
              {"\u6c42\u4eba\u304c\u307e\u3060\u3042\u308a\u307e\u305b\u3093"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_64px_64px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
                <span className="truncate">{"\u6c42\u4eba"}</span>
                <span className="whitespace-nowrap text-right">PV</span>
                <span className="whitespace-nowrap text-right">
                  {"\u5fdc\u52df"}
                </span>
              </div>
              <div>
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                  >
                    <span className="truncate text-[13px] font-medium text-[#555]">
                      {job.title}
                    </span>
                    <span className="whitespace-nowrap text-right text-[13px] text-[#555]">
                      {job.pvTotal}
                    </span>
                    <span className="whitespace-nowrap text-right text-[13px] font-bold text-[#333]">
                      {job.appsTotal}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u6c42\u4eba"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"PV\uff08\u7d2f\u8a08\uff09"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"PV\uff087\u65e5\uff09"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u5fdc\u52df\u6570"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u5fdc\u52df\u7387\uff08\u30e6\u30cb\u30fc\u30af\u95b2\u89a7\uff09"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u5fdc\u52df\u7387\uff087\u65e5\u30fb\u30e6\u30cb\u30fc\u30af\uff09"}
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#aaa]">
                    {"\u6c42\u4eba\u304c\u307e\u3060\u3042\u308a\u307e\u305b\u3093"}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <Row
                    key={job.id}
                    job={job}
                    expanded={expandedId === job.id}
                    onToggle={() =>
                      setExpandedId(expandedId === job.id ? null : job.id)
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 xl:hidden">
          <button
            type="button"
            aria-label="close"
            onClick={() => setSelectedJob(null)}
            className="absolute inset-0"
          />
          <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-[24px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.14)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d1d5db]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#888]">
                  {"\u5206\u6790\u8a73\u7d30"}
                </p>
                <h3 className="mt-1 text-[16px] font-bold text-[#1e3a5f]">
                  {selectedJob.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]"
              >
                {"\u9589\u3058\u308b"}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MetricCard label={"PV\uff08\u7d2f\u8a08\uff09"} value={String(selectedJob.pvTotal)} />
              <MetricCard label={"PV\uff087\u65e5\uff09"} value={String(selectedJob.pvRecent)} />
              <MetricCard label={"\u5fdc\u52df\u6570"} value={String(selectedJob.appsTotal)} />
              <MetricCard label={"\u76f4\u8fd17\u65e5\u5fdc\u52df"} value={String(selectedJob.appsRecent)} />
              <MetricCard label={"\u5fdc\u52df\u7387\uff08\u30e6\u30cb\u30fc\u30af\u95b2\u89a7\uff09"} value={selectedJob.rateTotal} />
              <MetricCard label={"\u5fdc\u52df\u7387\uff087\u65e5\u30fb\u30e6\u30cb\u30fc\u30af\uff09"} value={selectedJob.rateRecent} />
            </div>

            <div className="mt-4 rounded-[16px] border border-[#e5e7eb] bg-[#fcfdff] px-3 py-2">
              <ApplicationChart jobId={selectedJob.id} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({
  job,
  expanded,
  onToggle,
}: {
  job: JobRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
        <td className="px-5 py-3">
          <button
            onClick={onToggle}
            className="text-left font-medium text-[#2f6cff] hover:underline"
          >
            {job.title}
          </button>
        </td>
        <td className="px-5 py-3 text-[#555]">{job.pvTotal}</td>
        <td className="px-5 py-3 text-[#555]">{job.pvRecent}</td>
        <td className="px-5 py-3 text-[#555]">{job.appsTotal}</td>
        <td className="px-5 py-3 text-[#555]">{job.rateTotal}</td>
        <td className="px-5 py-3 text-[#555]">{job.rateRecent}</td>
      </tr>
      {expanded && (
        <tr className="border-b border-[#f0f0f0] bg-[#fafbff]">
          <td colSpan={6} className="px-5 py-2">
            <ApplicationChart jobId={job.id} />
          </td>
        </tr>
      )}
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
      <p className="text-[11px] font-semibold text-[#888]">{label}</p>
      <p className="mt-1 text-[16px] font-bold text-[#333]">{value}</p>
    </div>
  );
}
