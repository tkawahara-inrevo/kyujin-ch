"use client";

import { useState } from "react";
import { InvalidRequestActions } from "./invalid-request-actions";

export type InvalidRequestRow = {
  id: string;
  createdAt: string;
  companyName: string;
  userName: string;
  jobTitle: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

function RequestStatusBadge({ status }: { status: InvalidRequestRow["status"] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
        status === "PENDING"
          ? "bg-[#fef3c7] text-[#d97706]"
          : status === "APPROVED"
            ? "bg-[#d1fae5] text-[#059669]"
            : "bg-[#fee2e2] text-[#dc2626]"
      }`}
    >
      {status === "PENDING" ? "審査待ち" : status === "APPROVED" ? "承認" : "却下"}
    </span>
  );
}

export function InvalidRequestsTable({ requests }: { requests: InvalidRequestRow[] }) {
  const [selectedRequest, setSelectedRequest] = useState<InvalidRequestRow | null>(null);

  return (
    <>
      <div className="mt-6 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="xl:hidden">
          {requests.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#aaa]">
              無効申請はありません
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_72px_72px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
                <span className="truncate">申請</span>
                <span className="truncate">企業</span>
                <span className="text-center">状態</span>
              </div>
              <div>
                {requests.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_72px_72px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#333]">{request.jobTitle}</p>
                      <p className="truncate text-[11px] text-[#999]">{request.userName}</p>
                    </div>
                    <span className="truncate text-[12px] text-[#555]">{request.companyName}</span>
                    <span className="flex justify-center">
                      <RequestStatusBadge status={request.status} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">申請日</th>
                <th className="px-5 py-3 font-semibold">企業名</th>
                <th className="px-5 py-3 font-semibold">求職者名</th>
                <th className="px-5 py-3 font-semibold">求人名</th>
                <th className="px-5 py-3 font-semibold">理由</th>
                <th className="px-5 py-3 font-semibold">ステータス</th>
                <th className="px-5 py-3 font-semibold">対応</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#aaa]">
                    無効申請はありません
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 text-[#888]">
                      {new Date(request.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-5 py-3 text-[#333]">{request.companyName}</td>
                    <td className="px-5 py-3 text-[#555]">{request.userName}</td>
                    <td className="px-5 py-3 text-[#555]">{request.jobTitle}</td>
                    <td className="max-w-[200px] truncate px-5 py-3 text-[#555]">{request.reason}</td>
                    <td className="px-5 py-3">
                      <RequestStatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-3">
                      {request.status === "PENDING" && (
                        <InvalidRequestActions requestId={request.id} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 xl:hidden">
          <button type="button" aria-label="close" onClick={() => setSelectedRequest(null)} className="absolute inset-0" />
          <div className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-[24px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.14)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d1d5db]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#888]">
                  {new Date(selectedRequest.createdAt).toLocaleDateString("ja-JP")}
                </p>
                <h3 className="mt-1 truncate text-[16px] font-bold text-[#1e3a5f]">
                  {selectedRequest.jobTitle}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedRequest(null)} className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]">
                閉じる
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">企業</p>
                <p className="mt-1 text-[14px] font-medium text-[#333]">{selectedRequest.companyName}</p>
              </div>
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">求職者</p>
                <p className="mt-1 text-[14px] font-medium text-[#333]">{selectedRequest.userName}</p>
              </div>
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">理由</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#444]">{selectedRequest.reason}</p>
              </div>
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#888]">状態</p>
                <div className="mt-2">
                  <RequestStatusBadge status={selectedRequest.status} />
                </div>
              </div>
              {selectedRequest.status === "PENDING" && (
                <div className="rounded-[12px] border border-[#e5e7eb] px-4 py-4">
                  <p className="mb-3 text-[11px] font-semibold text-[#888]">対応</p>
                  <InvalidRequestActions requestId={selectedRequest.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
