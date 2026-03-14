"use client";

import { useState } from "react";

type CompanyBreakdown = {
  companyId: string;
  companyName: string;
  total: number;
  count: number;
};

type MonthData = {
  month: string;
  grandTotal: number;
  totalCount: number;
  breakdown: CompanyBreakdown[];
};

function formatMonth(month: string) {
  const [y, m] = month.split("-");
  return `${y}年${parseInt(m)}月`;
}

export function InvoiceMonthSwitcher({
  months,
  monthlyData,
}: {
  months: string[];
  monthlyData: MonthData[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(months.length - 1);
  const current = monthlyData[selectedIndex];

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex < months.length - 1;

  return (
    <div className="mt-6">
      {/* 月切替 */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => setSelectedIndex((i) => i - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#e5e7eb] text-[14px] font-bold text-[#555] transition hover:bg-[#f7f7f7] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ◀
        </button>

        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="rounded-[8px] border border-[#e5e7eb] px-4 py-2 text-[15px] font-bold text-[#1e293b] outline-none focus:border-[#2f6cff]"
        >
          {months.map((m, i) => (
            <option key={m} value={i}>
              {formatMonth(m)}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => setSelectedIndex((i) => i + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#e5e7eb] text-[14px] font-bold text-[#555] transition hover:bg-[#f7f7f7] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ▶
        </button>
      </div>

      {/* サマリーカード */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[12px] font-semibold text-[#888]">
            {formatMonth(current.month)} 合計請求額
          </p>
          <p className="mt-2 text-[28px] font-bold text-[#f59e0b]">
            ¥{current.grandTotal.toLocaleString()}
          </p>
        </div>
        <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[12px] font-semibold text-[#888]">課金件数</p>
          <p className="mt-2 text-[28px] font-bold text-[#2f6cff]">
            {current.totalCount}件
          </p>
        </div>
      </div>

      {/* 企業別内訳テーブル */}
      <div className="mt-6">
        <h2 className="text-[16px] font-bold text-[#333]">企業別内訳</h2>
        <div className="mt-3 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {current.breakdown.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[#888]">
              この月の請求データはありません
            </p>
          ) : (
            <>
              {/* モバイル */}
              <div className="md:hidden">
                {current.breakdown.map((row) => (
                  <div
                    key={row.companyId}
                    className="flex items-center justify-between border-b border-[#f8f8f8] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#333]">
                        {row.companyName}
                      </p>
                      <p className="text-[11px] text-[#999]">{row.count}件</p>
                    </div>
                    <span className="shrink-0 text-[14px] font-bold text-[#f59e0b]">
                      ¥{row.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* デスクトップ */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#f0f0f0] text-[#888]">
                      <th className="px-5 py-3 font-semibold">企業名</th>
                      <th className="px-5 py-3 font-semibold">課金件数</th>
                      <th className="px-5 py-3 font-semibold">請求額</th>
                      <th className="px-5 py-3 font-semibold">構成比</th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.breakdown.map((row) => (
                      <tr
                        key={row.companyId}
                        className="border-b border-[#f8f8f8] hover:bg-[#fafafa]"
                      >
                        <td className="px-5 py-3 font-medium text-[#333]">
                          {row.companyName}
                        </td>
                        <td className="px-5 py-3 text-[#555]">{row.count}件</td>
                        <td className="px-5 py-3 font-medium text-[#f59e0b]">
                          ¥{row.total.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-[#555]">
                          {current.grandTotal > 0
                            ? ((row.total / current.grandTotal) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#e5e7eb] bg-[#f8fafc]">
                      <td className="px-5 py-3 font-bold text-[#333]">合計</td>
                      <td className="px-5 py-3 font-bold text-[#555]">
                        {current.totalCount}件
                      </td>
                      <td className="px-5 py-3 font-bold text-[#f59e0b]">
                        ¥{current.grandTotal.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-bold text-[#555]">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
