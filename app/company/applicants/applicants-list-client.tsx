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
  const [, startTransition] = useTransition();

  // メモ: 値と編集中のIDを管理
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, r.note]))
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

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

  function handleNoteBlur(appId: string) {
    setEditingNoteId(null);
    const text = notes[appId] ?? "";
    startTransition(async () => {
      await updateApplicationNote(appId, text);
    });
  }

  function handleNoteKeyDown(e: React.KeyboardEvent, appId: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNoteBlur(appId);
    }
    if (e.key === "Escape") {
      setEditingNoteId(null);
    }
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
                      {editingNoteId === app.id ? (
                        <input
                          type="text"
                          value={notes[app.id] ?? ""}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
                          onBlur={() => handleNoteBlur(app.id)}
                          onKeyDown={(e) => handleNoteKeyDown(e, app.id)}
                          placeholder="メモを入力..."
                          maxLength={500}
                          autoFocus
                          className="mt-1 w-full rounded-[6px] border border-[#2f6cff] bg-white px-2 py-1 text-[12px] text-[#333] outline-none"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(app.id)}
                          className="mt-1 w-full rounded-[6px] px-2 py-1 text-left text-[12px] hover:bg-[#f5f8ff] transition"
                        >
                          {notes[app.id] ? (
                            <span className="text-[#888] italic">{notes[app.id]}</span>
                          ) : (
                            <span className="text-[#ccc]">メモ...</span>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <StatusBadge status={app.status} />
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
                <th className="w-[140px] whitespace-nowrap px-4 py-4 font-bold">氏名</th>
                <th className="w-[400px] px-4 py-4 font-bold">応募求人</th>
                <th className="w-[90px] whitespace-nowrap px-3 py-4 text-center font-bold">ステータス</th>
                <th className="px-4 py-4 font-bold">最新メッセージ</th>
                <th className="w-[240px] px-4 py-4 font-bold">メモ</th>
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
                    <td className="px-4 py-5">
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
                    </td>
                    <td className="px-4 py-5 text-[#555]">
                      <Link
                        href={`/company/applicants/${app.id}`}
                        className="block leading-[1.5] hover:text-[#2f6cff]"
                        title={app.jobTitle}
                      >
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td className="px-3 py-5 text-center">
                      <Link href={`/company/applicants/${app.id}`} className="block">
                        <StatusBadge status={app.status} />
                      </Link>
                    </td>
                    <td className="px-4 py-5">
                      {app.latestMessage ? (
                        <Link
                          href={`/company/applicants/${app.id}`}
                          className="block line-clamp-2 text-[12px] leading-[1.6] text-[#666] hover:text-[#2f6cff]"
                          title={app.latestMessage.body}
                        >
                          {app.latestMessage.senderType === "COMPANY" && <span className="text-[#2f6cff]">自分: </span>}
                          {app.latestMessage.body}
                        </Link>
                      ) : (
                        <span className="text-[12px] text-[#ccc]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      {editingNoteId === app.id ? (
                        <input
                          type="text"
                          value={notes[app.id] ?? ""}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
                          onBlur={() => handleNoteBlur(app.id)}
                          onKeyDown={(e) => handleNoteKeyDown(e, app.id)}
                          placeholder="メモを入力..."
                          maxLength={500}
                          autoFocus
                          className="w-full rounded-[6px] border border-[#2f6cff] bg-white px-2 py-1.5 text-[12px] text-[#333] outline-none"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(app.id)}
                          className="w-full rounded-[6px] px-2 py-1.5 text-left text-[12px] hover:bg-[#f5f8ff] transition"
                        >
                          {notes[app.id] ? (
                            <span className="text-[#555]">{notes[app.id]}</span>
                          ) : (
                            <span className="text-[#ccc]">メモを追加...</span>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-5 text-center text-[12px] text-[#666]">
                      {new Date(app.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
}
