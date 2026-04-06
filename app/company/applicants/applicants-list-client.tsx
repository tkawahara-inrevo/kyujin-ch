"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusBadge } from "./status-badge";
import { updateApplicationNote } from "@/app/actions/company/applicants";

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "応募済",
  REVIEWING: "選考中",
  INTERVIEW: "面接",
  OFFER: "内定",
  HIRED: "採用",
  REJECTED: "不採用",
};

const ALL_STATUSES = ["APPLIED", "REVIEWING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;

type LatestMessage = {
  id: string;
  body: string;
  senderType: string;
  conversationId: string;
} | null;

export type ApplicantRow = {
  id: string;
  userName: string;
  userEmail: string;
  jobId: string;
  jobTitle: string;
  status: string;
  note: string;
  isUnread: boolean;
  isDeleted: boolean;
  createdAt: string;
  latestMessage: LatestMessage;
};

export function ApplicantsListClient({
  jobs,
  rows,
  currentJobId,
  currentName,
  currentStatuses,
  currentSort,
}: {
  jobs: { id: string; title: string }[];
  rows: ApplicantRow[];
  currentJobId: string;
  currentName: string;
  currentStatuses: string[];
  currentSort: string;
}) {
  const router = useRouter();
  const [noteApp, setNoteApp] = useState<ApplicantRow | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filter form state (local, submitted via URL)
  const [nameInput, setNameInput] = useState(currentName);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(currentStatuses);
  const [sortDir, setSortDir] = useState(currentSort);
  const [jobIdInput, setJobIdInput] = useState(currentJobId);

  function buildUrl(overrides?: Partial<{ name: string; statuses: string[]; sort: string; jobId: string }>) {
    const name = overrides?.name ?? nameInput;
    const statuses = overrides?.statuses ?? selectedStatuses;
    const sort = overrides?.sort ?? sortDir;
    const jobId = overrides?.jobId ?? jobIdInput;
    const params = new URLSearchParams();
    if (jobId) params.set("jobId", jobId);
    if (name.trim()) params.set("name", name.trim());
    if (statuses.length > 0) params.set("statuses", statuses.join(","));
    if (sort !== "desc") params.set("sort", sort);
    return `/company/applicants?${params.toString()}`;
  }

  function handleApplyFilters(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl());
  }

  function toggleStatus(s: string) {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function openNote(app: ApplicantRow) {
    setNoteApp(app);
    setNoteText(app.note);
  }

  function handleSaveNote() {
    if (!noteApp) return;
    const appId = noteApp.id;
    const text = noteText;
    startTransition(async () => {
      await updateApplicationNote(appId, text);
      setNoteApp(null);
    });
  }

  return (
    <>
      {/* Filters */}
      <form onSubmit={handleApplyFilters} className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="氏名で検索"
            className="rounded-[10px] border border-[#d6dce8] bg-white px-4 py-2.5 text-[14px] text-[#333] outline-none focus:border-[#2f6cff] w-[200px]"
          />
          <select
            value={jobIdInput}
            onChange={(e) => setJobIdInput(e.target.value)}
            className="rounded-[10px] border border-[#d6dce8] bg-white px-4 py-2.5 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
          >
            <option value="">応募求人（全て）</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
            className="rounded-[10px] border border-[#d6dce8] bg-white px-4 py-2.5 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
          >
            <option value="desc">応募日: 新しい順</option>
            <option value="asc">応募日: 古い順</option>
          </select>
          <button
            type="submit"
            className="rounded-[10px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:opacity-90 transition"
          >
            絞り込む
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-1.5 text-[13px]">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(s)}
                onChange={() => toggleStatus(s)}
                className="h-4 w-4 accent-[#2f6cff]"
              />
              <StatusBadge status={s} />
            </label>
          ))}
          {selectedStatuses.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedStatuses([])}
              className="text-[12px] text-[#888] hover:text-[#333] underline"
            >
              クリア
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-[18px] bg-white shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
        {/* Mobile */}
        <div className="xl:hidden">
          {rows.length === 0 ? (
            <div className="px-4 py-12 text-center text-[#9aa3b2]">条件に合う応募者はありません</div>
          ) : (
            <div className="divide-y divide-[#edf0f5]">
              {rows.map((app) => (
                <div key={app.id} className={`px-4 py-4 ${app.isUnread ? "bg-[#f9fbff]" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {app.isUnread && (
                          <span className="shrink-0 rounded-full bg-[#ff3158] px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>
                        )}
                        {app.isDeleted && (
                          <span className="shrink-0 rounded-full bg-[#999] px-2 py-0.5 text-[10px] font-bold text-white">退会済み</span>
                        )}
                        <Link
                          href={`/company/applicants/${app.id}`}
                          className={`truncate text-[15px] font-bold hover:text-[#2f6cff] ${app.isUnread ? "text-[#1a1a2e]" : "text-[#333]"}`}
                        >
                          {app.userName}
                        </Link>
                      </div>
                      <p className="mt-1 truncate text-[13px] text-[#475467]">{app.jobTitle}</p>
                      {app.latestMessage && (
                        <p className="mt-1 line-clamp-1 text-[12px] text-[#888]">
                          {app.latestMessage.senderType === "COMPANY" ? "自分: " : ""}
                          <Link href={`/company/applicants/${app.id}`} className="hover:underline">
                            {app.latestMessage.body.slice(0, 50)}
                          </Link>
                        </p>
                      )}
                      {app.note && (
                        <p className="mt-1 truncate text-[12px] text-[#888] italic">{app.note}</p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <StatusBadge status={app.status} />
                      <button
                        type="button"
                        onClick={() => openNote(app)}
                        className="rounded-[6px] border border-[#d6dce8] px-2 py-1 text-[11px] text-[#666] hover:bg-[#f8fbff]"
                      >
                        メモ
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-[12px] text-[#98a2b3]">
                    応募日 {new Date(app.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden xl:block">
          <table className="w-full table-fixed text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#e8edf5] text-[#7f8795]">
                <th className="w-[130px] whitespace-nowrap px-4 py-4 font-bold">氏名</th>
                <th className="px-4 py-4 font-bold">応募求人</th>
                <th className="w-[90px] whitespace-nowrap px-3 py-4 text-center font-bold">ステータス</th>
                <th className="w-[200px] px-4 py-4 font-bold">最新メッセージ</th>
                <th className="w-[160px] px-4 py-4 font-bold">メモ</th>
                <th className="w-[82px] whitespace-nowrap px-3 py-4 text-center font-bold">応募日</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#9aa3b2]">条件に合う応募者はありません</td>
                </tr>
              ) : (
                rows.map((app) => (
                  <tr key={app.id} className={`border-b border-[#edf0f5] last:border-b-0 ${app.isUnread ? "bg-[#f9fbff]" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          {app.isUnread && <span className="shrink-0 rounded-full bg-[#ff3158] px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</span>}
                          {app.isDeleted && <span className="shrink-0 rounded-full bg-[#999] px-1.5 py-0.5 text-[9px] font-bold text-white">退会</span>}
                          <Link
                            href={`/company/applicants/${app.id}`}
                            className={`truncate font-bold hover:text-[#2f6cff] ${app.isUnread ? "text-[#1a1a2e]" : "text-[#333]"}`}
                          >
                            {app.userName}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#555]">
                      <Link href={`/company/applicants/${app.id}`} className="block truncate hover:text-[#2f6cff]" title={app.jobTitle}>
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Link href={`/company/applicants/${app.id}`} className="block">
                        <StatusBadge status={app.status} />
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {app.latestMessage ? (
                        <Link
                          href={`/company/applicants/${app.id}`}
                          className="block truncate text-[12px] text-[#666] hover:text-[#2f6cff]"
                          title={app.latestMessage.body}
                        >
                          {app.latestMessage.senderType === "COMPANY" && <span className="text-[#2f6cff]">自分: </span>}
                          {app.latestMessage.body.slice(0, 40)}
                        </Link>
                      ) : (
                        <span className="text-[12px] text-[#ccc]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex-1 truncate text-[12px] text-[#888]">{app.note || ""}</span>
                        <button
                          type="button"
                          onClick={() => openNote(app)}
                          className="shrink-0 rounded-[6px] border border-[#d6dce8] px-2 py-1 text-[11px] text-[#666] hover:bg-[#f8fbff] transition"
                        >
                          編集
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] text-[#666]">
                      {new Date(app.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note modal */}
      {noteApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-4">
          <div className="w-full max-w-[480px] rounded-[16px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <p className="text-[15px] font-bold text-[#2c2f36]">メモを編集</p>
            <p className="mt-1 text-[13px] text-[#888]">{noteApp.userName}</p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              maxLength={500}
              className="mt-3 w-full rounded-[8px] border border-[#d3dae8] px-3 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none resize-none"
              placeholder="社内メモを入力..."
              autoFocus
            />
            <p className="mt-1 text-right text-[11px] text-[#aaa]">{noteText.length} / 500</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteApp(null)}
                className="rounded-[8px] border border-[#d7deeb] px-4 py-2 text-[13px] text-[#555] hover:bg-[#f8fbff] transition"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isPending}
                className="rounded-[8px] bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {isPending ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
