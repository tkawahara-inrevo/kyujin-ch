"use client";

import { useState } from "react";

export type TopJobRow = {
  id: string;
  rank: number;
  title: string;
  companyName: string;
  viewCount: number;
  monthlyViewCount: number;
  applicationsCount: number;
  monthlyApplicationsCount: number;
  cvrLabel: string;
};

export type TopCompanyRevenueRow = {
  id: string;
  rank: number;
  name: string;
  jobsCount: number;
  totalViews: number;
  monthlyViews: number;
  applicationsCount: number;
  totalCharge: number;
};

export function AnalyticsRankings({
  topJobs,
  topJobsByApps,
  topCompanies,
}: {
  topJobs: TopJobRow[];
  topJobsByApps: TopJobRow[];
  topCompanies: TopCompanyRevenueRow[];
}) {
  const [selectedJob, setSelectedJob] = useState<TopJobRow | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<TopCompanyRevenueRow | null>(null);

  return (
    <>
      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">PVランキング（求人TOP10）</h2>
        <div className="mt-3 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="md:hidden">
            <div className="grid grid-cols-[36px_minmax(0,1fr)_60px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
              <span>#</span>
              <span className="truncate">求人</span>
              <span className="text-right">PV</span>
            </div>
            <div>
              {topJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJob(job)}
                  className="grid w-full grid-cols-[36px_minmax(0,1fr)_60px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                >
                  <span className="text-[13px] font-bold text-[#888]">{job.rank}</span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#333]">{job.title}</p>
                    <p className="truncate text-[11px] text-[#999]">{job.companyName}</p>
                  </div>
                  <span className="text-right text-[13px] font-bold text-[#2f6cff]">
                    {job.viewCount.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[#888]">
                  <th className="w-[40px] px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">求人タイトル</th>
                  <th className="px-5 py-3 font-semibold">企業</th>
                  <th className="px-5 py-3 font-semibold">累計PV</th>
                  <th className="px-5 py-3 font-semibold">今月PV</th>
                  <th className="px-5 py-3 font-semibold">累計応募</th>
                  <th className="px-5 py-3 font-semibold">今月応募</th>
                  <th className="px-5 py-3 font-semibold">CVR(ユニーク閲覧)</th>
                </tr>
              </thead>
              <tbody>
                {topJobs.map((job) => (
                  <tr key={job.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-bold text-[#888]">{job.rank}</td>
                    <td className="px-5 py-3 font-medium text-[#333]">{job.title}</td>
                    <td className="px-5 py-3 text-[#555]">{job.companyName}</td>
                    <td className="px-5 py-3 font-medium text-[#2f6cff]">
                      {job.viewCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-[#555]">{job.monthlyViewCount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#555]">{job.applicationsCount}</td>
                    <td className="px-5 py-3 text-[#555]">{job.monthlyApplicationsCount}</td>
                    <td className="px-5 py-3 text-[#555]">{job.cvrLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">応募ランキング（求人TOP10）</h2>
        <div className="mt-3 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="md:hidden">
            <div className="grid grid-cols-[36px_minmax(0,1fr)_60px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
              <span>#</span>
              <span className="truncate">求人</span>
              <span className="text-right">応募</span>
            </div>
            <div>
              {topJobsByApps.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJob(job)}
                  className="grid w-full grid-cols-[36px_minmax(0,1fr)_60px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                >
                  <span className="text-[13px] font-bold text-[#888]">{job.rank}</span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#333]">{job.title}</p>
                    <p className="truncate text-[11px] text-[#999]">{job.companyName}</p>
                  </div>
                  <span className="text-right text-[13px] font-bold text-[#10b981]">
                    {job.applicationsCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[#888]">
                  <th className="w-[40px] px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">求人タイトル</th>
                  <th className="px-5 py-3 font-semibold">企業</th>
                  <th className="px-5 py-3 font-semibold">累計応募</th>
                  <th className="px-5 py-3 font-semibold">今月応募</th>
                  <th className="px-5 py-3 font-semibold">累計PV</th>
                  <th className="px-5 py-3 font-semibold">今月PV</th>
                  <th className="px-5 py-3 font-semibold">CVR(ユニーク閲覧)</th>
                </tr>
              </thead>
              <tbody>
                {topJobsByApps.map((job) => (
                  <tr key={job.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-bold text-[#888]">{job.rank}</td>
                    <td className="px-5 py-3 font-medium text-[#333]">{job.title}</td>
                    <td className="px-5 py-3 text-[#555]">{job.companyName}</td>
                    <td className="px-5 py-3 font-medium text-[#10b981]">{job.applicationsCount}</td>
                    <td className="px-5 py-3 text-[#555]">{job.monthlyApplicationsCount}</td>
                    <td className="px-5 py-3 text-[#555]">{job.viewCount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#555]">{job.monthlyViewCount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#555]">{job.cvrLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">企業ランキング</h2>
        <div className="mt-3 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="md:hidden">
            <div className="grid grid-cols-[36px_minmax(0,1fr)_92px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
              <span>#</span>
              <span className="truncate">企業</span>
              <span className="text-right">売上</span>
            </div>
            <div>
              {topCompanies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => setSelectedCompany(company)}
                  className="grid w-full grid-cols-[36px_minmax(0,1fr)_92px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                >
                  <span className="text-[13px] font-bold text-[#888]">{company.rank}</span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#333]">{company.name}</p>
                    <p className="truncate text-[11px] text-[#999]">
                      求人 {company.jobsCount} / PV {company.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-right text-[13px] font-bold text-[#f59e0b]">
                    ¥{company.totalCharge.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[#888]">
                  <th className="w-[40px] px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">企業名</th>
                  <th className="px-5 py-3 font-semibold">求人数</th>
                  <th className="px-5 py-3 font-semibold">累計PV</th>
                  <th className="px-5 py-3 font-semibold">今月PV</th>
                  <th className="px-5 py-3 font-semibold">累計応募</th>
                  <th className="px-5 py-3 font-semibold">累計売上</th>
                </tr>
              </thead>
              <tbody>
                {topCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-bold text-[#888]">{company.rank}</td>
                    <td className="px-5 py-3 font-medium text-[#333]">{company.name}</td>
                    <td className="px-5 py-3 text-[#555]">{company.jobsCount}</td>
                    <td className="px-5 py-3 text-[#555]">{company.totalViews.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#555]">{company.monthlyViews.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#555]">{company.applicationsCount}</td>
                    <td className="px-5 py-3 font-medium text-[#f59e0b]">
                      ¥{company.totalCharge.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden">
          <button
            type="button"
            aria-label="close"
            onClick={() => setSelectedJob(null)}
            className="absolute inset-0"
          />
          <div className="relative w-full rounded-t-[24px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.14)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d1d5db]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#888]">#{selectedJob.rank}</p>
                <h3 className="mt-1 truncate text-[16px] font-bold text-[#1e3a5f]">
                  {selectedJob.title}
                </h3>
                <p className="truncate text-[12px] text-[#888]">{selectedJob.companyName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]"
              >
                閉じる
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="累計PV" value={selectedJob.viewCount.toLocaleString()} />
              <Metric label="今月PV" value={selectedJob.monthlyViewCount.toLocaleString()} />
              <Metric label="累計応募" value={String(selectedJob.applicationsCount)} />
              <Metric label="今月応募" value={String(selectedJob.monthlyApplicationsCount)} />
              <Metric label="CVR(ユニーク閲覧)" value={selectedJob.cvrLabel} />
            </div>
          </div>
        </div>
      )}

      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden">
          <button
            type="button"
            aria-label="close"
            onClick={() => setSelectedCompany(null)}
            className="absolute inset-0"
          />
          <div className="relative w-full rounded-t-[24px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.14)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d1d5db]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#888]">#{selectedCompany.rank}</p>
                <h3 className="mt-1 truncate text-[16px] font-bold text-[#1e3a5f]">
                  {selectedCompany.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]"
              >
                閉じる
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="求人数" value={String(selectedCompany.jobsCount)} />
              <Metric label="累計PV" value={selectedCompany.totalViews.toLocaleString()} />
              <Metric label="今月PV" value={selectedCompany.monthlyViews.toLocaleString()} />
              <Metric label="累計応募" value={String(selectedCompany.applicationsCount)} />
              <Metric label="累計売上" value={`¥${selectedCompany.totalCharge.toLocaleString()}`} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
      <p className="text-[11px] font-semibold text-[#888]">{label}</p>
      <p className="mt-1 text-[16px] font-bold text-[#333]">{value}</p>
    </div>
  );
}
