"use client";

import Link from "next/link";
import { useState } from "react";
import { CompanyActiveToggle } from "./company-active-toggle";

export type CompanyRow = {
  id: string;
  name: string;
  corporateNumber: string;
  email: string;
  username: string;
  jobsCount: number;
  isActive: boolean;
  createdAt: string;
};

export function CompaniesTable({ companies }: { companies: CompanyRow[] }) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyRow | null>(null);

  return (
    <>
      <div className="mt-3 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="md:hidden">
          {companies.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#aaa]">
              企業がまだありません
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_52px_72px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
                <span className="truncate">企業</span>
                <span className="text-right">求人</span>
                <span className="text-center">状態</span>
              </div>
              <div>
                {companies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setSelectedCompany(company)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_52px_72px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#333]">
                        {company.name}
                      </p>
                      <p className="truncate text-[11px] text-[#999]">
                        {company.corporateNumber}
                      </p>
                      <p className="truncate text-[11px] text-[#999]">
                        {company.username} / {company.email}
                      </p>
                    </div>
                    <span className="text-right text-[13px] text-[#555]">
                      {company.jobsCount}
                    </span>
                    <span className="flex justify-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          company.isActive
                            ? "bg-[#d1fae5] text-[#059669]"
                            : "bg-[#fee2e2] text-[#dc2626]"
                        }`}
                      >
                        {company.isActive ? "有効" : "停止"}
                      </span>
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
                <th className="px-5 py-3 font-semibold">企業名</th>
                <th className="px-5 py-3 font-semibold">法人番号</th>
                <th className="px-5 py-3 font-semibold">アカウント</th>
                <th className="px-5 py-3 font-semibold">求人数</th>
                <th className="px-5 py-3 font-semibold">ステータス</th>
                <th className="px-5 py-3 font-semibold">登録日</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#aaa]">
                    企業がまだありません
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-[#f8f8f8] hover:bg-[#fafafa]"
                  >
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="hover:text-[#2f6cff] hover:underline"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#555]">{company.corporateNumber}</td>
                    <td className="px-5 py-3 text-[#555]">
                      <div>{company.username}</div>
                      <div className="text-[11px] text-[#888]">{company.email}</div>
                    </td>
                    <td className="px-5 py-3 text-[#555]">
                      {company.jobsCount > 0 ? (
                        <Link href={`/admin/jobs?q=${encodeURIComponent(company.name)}`} className="text-[#2f6cff] hover:underline">
                          {company.jobsCount}
                        </Link>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <CompanyActiveToggle
                        companyId={company.id}
                        isActive={company.isActive}
                      />
                    </td>
                    <td className="px-5 py-3 text-[#888]">
                      {new Date(company.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden">
          <button
            type="button"
            aria-label="close"
            onClick={() => setSelectedCompany(null)}
            className="absolute inset-0"
          />
          <div className="relative max-h-[85vh] w-full rounded-t-[24px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.14)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d1d5db]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#888]">
                  {new Date(selectedCompany.createdAt).toLocaleDateString("ja-JP")}
                </p>
                <h3 className="mt-1 truncate text-[16px] font-bold text-[#1e3a5f]">
                  {selectedCompany.name}
                </h3>
                <p className="truncate text-[12px] text-[#888]">{selectedCompany.corporateNumber}</p>
                <p className="truncate text-[12px] text-[#888]">{selectedCompany.username} / {selectedCompany.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]"
              >
                閉じる
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#888]">求人数</p>
                  <p className="mt-1 text-[16px] font-bold text-[#333]">
                    {selectedCompany.jobsCount}
                  </p>
                </div>
                <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#888]">状態</p>
                  <div className="mt-2">
                    <CompanyActiveToggle
                      companyId={selectedCompany.id}
                      isActive={selectedCompany.isActive}
                    />
                  </div>
                </div>
              </div>
              <Link
                href={`/admin/companies/${selectedCompany.id}`}
                className="flex items-center justify-center rounded-[12px] bg-[#2f6cff] px-4 py-3 text-[13px] font-bold text-white"
              >
                企業詳細を見る
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
