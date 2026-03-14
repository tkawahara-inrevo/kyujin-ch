"use client";

import { useCallback, useState, useTransition } from "react";
import { getChargesForMonth, type ChargeRow } from "@/app/actions/company/billing";
import { InvalidRequestButton } from "./invalid-request-button";
import { CsvExportButton } from "./csv-export-button";

type Props = {
  initialMonth: string;
  initialCharges: ChargeRow[];
  initialTotal: number;
  initialCount: number;
  availableMonths: string[];
};

function formatMonthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  return `${year}\u5e74${parseInt(month, 10)}\u6708`;
}

function formatDateLabel(value: string): string {
  return new Date(value).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

function formatDateTimeLabel(value: string): string {
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ isValid }: { isValid: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
        isValid ? "bg-[#d1fae5] text-[#059669]" : "bg-[#fee2e2] text-[#dc2626]"
      }`}
    >
      {isValid ? "\u6709\u52b9" : "\u7121\u52b9"}
    </span>
  );
}

export function MonthSwitcher({
  initialMonth,
  initialCharges,
  initialTotal,
  initialCount,
  availableMonths,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [charges, setCharges] = useState(initialCharges);
  const [totalAmount, setTotalAmount] = useState(initialTotal);
  const [count, setCount] = useState(initialCount);
  const [selectedCharge, setSelectedCharge] = useState<ChargeRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentIndex = availableMonths.indexOf(currentMonth);

  const loadMonth = useCallback((month: string) => {
    setCurrentMonth(month);
    setSelectedCharge(null);
    startTransition(async () => {
      const result = await getChargesForMonth(month);
      setCharges(result.charges);
      setTotalAmount(result.totalAmount);
      setCount(result.count);
    });
  }, []);

  const goPrev = () => {
    if (currentIndex > 0) {
      loadMonth(availableMonths[currentIndex - 1]);
    }
  };

  const goNext = () => {
    if (currentIndex < availableMonths.length - 1) {
      loadMonth(availableMonths[currentIndex + 1]);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-[16px] font-bold text-[#333]">
          {"\u8acb\u6c42\u5bfe\u8c61\u6708"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentIndex <= 0 || isPending}
            className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-bold text-[#1e3a5f] hover:bg-[#f0f4ff] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {"\u2190 \u524d\u6708"}
          </button>
          <select
            value={currentMonth}
            onChange={(e) => loadMonth(e.target.value)}
            disabled={isPending}
            className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-bold text-[#1e3a5f] focus:border-[#2f6cff] focus:outline-none disabled:opacity-50"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
          <button
            onClick={goNext}
            disabled={currentIndex >= availableMonths.length - 1 || isPending}
            className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-bold text-[#1e3a5f] hover:bg-[#f0f4ff] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {"\u6b21\u6708 \u2192"}
          </button>
        </div>
        <CsvExportButton charges={charges} month={currentMonth} />
      </div>

      <div className="mt-4 rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <p className="text-[12px] font-semibold text-[#888]">{formatMonthLabel(currentMonth)}</p>
        <p className="mt-2 text-[28px] font-bold text-[#2f6cff]">
          {"\u00a5"}
          {totalAmount.toLocaleString()}
        </p>
        <p className="mt-1 text-[12px] text-[#aaa]">
          {count}
          {"\u4ef6"}
        </p>
      </div>

      <div className="relative mt-4 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <span className="text-[13px] text-[#888]">
              {"\u8aad\u307f\u8fbc\u307f\u4e2d..."}
            </span>
          </div>
        )}

        <div className="md:hidden">
          {charges.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#aaa]">
              {"\u8acb\u6c42\u30c7\u30fc\u30bf\u306f\u3042\u308a\u307e\u305b\u3093"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[64px_minmax(0,1fr)_84px_58px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
                <span className="whitespace-nowrap">{"\u65e5\u6642"}</span>
                <span className="truncate">{"\u6c42\u4eba"}</span>
                <span className="whitespace-nowrap text-right">{"\u91d1\u984d"}</span>
                <span className="whitespace-nowrap text-center">{"\u6709\u52b9"}</span>
              </div>
              <div>
                {charges.map((charge) => (
                  <button
                    key={charge.id}
                    type="button"
                    onClick={() => setSelectedCharge(charge)}
                    className="grid w-full grid-cols-[64px_minmax(0,1fr)_84px_58px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                  >
                    <span className="text-[12px] font-medium text-[#888]">
                      {formatDateLabel(charge.createdAt)}
                    </span>
                    <span className="truncate text-[13px] font-medium text-[#555]">
                      {charge.jobTitle}
                    </span>
                    <span className="whitespace-nowrap text-right text-[13px] font-bold text-[#333]">
                      {"\u00a5"}
                      {charge.amount.toLocaleString()}
                    </span>
                    <span className="flex justify-center">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                          charge.isValid
                            ? "bg-[#d1fae5] text-[#059669]"
                            : "bg-[#fee2e2] text-[#dc2626]"
                        }`}
                      >
                        {charge.isValid ? "OK" : "NG"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u65e5\u6642"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u6c42\u4eba"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u5fdc\u52df\u8005"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u91d1\u984d"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u6709\u52b9"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold md:px-5">
                  {"\u5bfe\u5fdc"}
                </th>
              </tr>
            </thead>
            <tbody>
              {charges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#aaa]">
                    {"\u8acb\u6c42\u30c7\u30fc\u30bf\u306f\u3042\u308a\u307e\u305b\u3093"}
                  </td>
                </tr>
              ) : (
                charges.map((charge) => (
                  <tr
                    key={charge.id}
                    className="border-b border-[#f8f8f8] hover:bg-[#fafafa]"
                  >
                    <td className="px-5 py-3 text-[#888]">
                      {new Date(charge.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-5 py-3 text-[#555]">{charge.jobTitle}</td>
                    <td className="px-5 py-3 text-[#555]">{charge.userName}</td>
                    <td className="px-5 py-3 font-medium text-[#333]">
                      {"\u00a5"}
                      {charge.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge isValid={charge.isValid} />
                    </td>
                    <td className="px-5 py-3">
                      {charge.isValid && (
                        <InvalidRequestButton
                          applicationId={charge.applicationId}
                          hasExistingRequest={charge.hasExistingRequest}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCharge && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden">
          <button
            type="button"
            aria-label="close"
            onClick={() => setSelectedCharge(null)}
            className="absolute inset-0"
          />
          <div className="relative max-h-[85vh] w-full rounded-t-[24px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.14)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d1d5db]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#888]">
                  {formatDateTimeLabel(selectedCharge.createdAt)}
                </p>
                <h3 className="mt-1 text-[16px] font-bold text-[#1e3a5f]">
                  {selectedCharge.jobTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCharge(null)}
                className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]"
              >
                {"\u9589\u3058\u308b"}
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">
                  {"\u5fdc\u52df\u8005"}
                </p>
                <p className="mt-1 text-[14px] font-medium text-[#333]">
                  {selectedCharge.userName}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#888]">
                    {"\u91d1\u984d"}
                  </p>
                  <p className="mt-1 text-[16px] font-bold text-[#333]">
                    {"\u00a5"}
                    {selectedCharge.amount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#888]">
                    {"\u72b6\u614b"}
                  </p>
                  <div className="mt-2">
                    <StatusBadge isValid={selectedCharge.isValid} />
                  </div>
                </div>
              </div>
              {selectedCharge.isValid && (
                <div className="rounded-[12px] border border-[#e5e7eb] px-4 py-4">
                  <p className="mb-3 text-[11px] font-semibold text-[#888]">
                    {"\u7121\u52b9\u7533\u8acb"}
                  </p>
                  <InvalidRequestButton
                    applicationId={selectedCharge.applicationId}
                    hasExistingRequest={selectedCharge.hasExistingRequest}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
