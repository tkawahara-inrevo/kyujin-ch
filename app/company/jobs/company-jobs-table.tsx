"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteJob, duplicateJob, toggleJobVisibility, updateJobNote, withdrawJobSubmission } from "@/app/actions/company/jobs";
import { JobPreview, type JobPreviewData } from "@/components/job-preview";

type JobRow = {
  id: string;
  title: string;
  employmentTypeLabel: string;
  location: string;
  reviewStatus: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "RETURNED";
  isPublished: boolean;
  applicationsCount: number;
  viewCount: number;
  note: string;
  hasPublishedVersion: boolean;
  previewData: JobPreviewData;
};

const FILTER_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "DRAFT", label: "下書き" },
  { value: "PENDING_REVIEW", label: "審査中" },
  { value: "PUBLISHED", label: "審査済み" },
  { value: "RETURNED", label: "要修正" },
];

const SORT_OPTIONS = [
  { value: "status", label: "ステータス順" },
  { value: "updated_desc", label: "更新日が新しい順" },
  { value: "updated_asc", label: "更新日が古い順" },
  { value: "applications_desc", label: "応募数が多い順" },
];

const REVIEW_LABELS: Record<JobRow["reviewStatus"], string> = {
  DRAFT: "下書き",
  PENDING_REVIEW: "審査中",
  PUBLISHED: "審査済み",
  RETURNED: "要修正",
};

const REVIEW_BADGES: Record<JobRow["reviewStatus"], string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_REVIEW: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  RETURNED: "bg-rose-100 text-rose-700",
};

function PublishToggle({
  job,
  disabled,
  onToggle,
}: {
  job: JobRow;
  disabled: boolean;
  onToggle: (job: JobRow) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(job)}
      disabled={disabled}
      className="inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={job.isPublished ? "非公開にする" : "公開する"}
    >
      <span
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
          job.isPublished ? "bg-[#2f6cff]" : "bg-[#d6dce8]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            job.isPublished ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

export function CompanyJobsTable({
  jobs,
  currentStatus,
  currentSort,
}: {
  jobs: JobRow[];
  currentStatus: string;
  currentSort: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [targetJob, setTargetJob] = useState<JobRow | null>(null);
  const [deleteTargetJob, setDeleteTargetJob] = useState<JobRow | null>(null);
  const [previewJob, setPreviewJob] = useState<JobRow | null>(null);
  const [noteJob, setNoteJob] = useState<JobRow | null>(null);
  const [noteText, setNoteText] = useState("");

  const filterValue = useMemo(
    () => (FILTER_OPTIONS.some((option) => option.value === currentStatus) ? currentStatus : "all"),
    [currentStatus],
  );
  const sortValue = useMemo(
    () => (SORT_OPTIONS.some((option) => option.value === currentSort) ? currentSort : "status"),
    [currentSort],
  );

  function pushQuery(nextStatus: string, nextSort: string) {
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (nextSort !== "status") params.set("sort", nextSort);
    const query = params.toString();
    router.push(query ? `/company/jobs?${query}` : "/company/jobs");
  }

  function changeFilter(nextValue: string) {
    pushQuery(nextValue, sortValue);
  }

  function changeSort(nextValue: string) {
    pushQuery(filterValue, nextValue);
  }

  function handleWithdraw() {
    if (!targetJob) return;

    startTransition(async () => {
      await withdrawJobSubmission(targetJob.id);
      setTargetJob(null);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTargetJob) return;

    startTransition(async () => {
      await deleteJob(deleteTargetJob.id);
      setDeleteTargetJob(null);
      router.refresh();
    });
  }

  function handleToggleVisibility(job: JobRow) {
    startTransition(async () => {
      await toggleJobVisibility(job.id);
      router.refresh();
    });
  }

  function handleDuplicate(job: JobRow) {
    startTransition(async () => {
      const newId = await duplicateJob(job.id);
      router.push(`/company/jobs/${newId}/edit`);
    });
  }

  function openNote(job: JobRow) {
    setNoteJob(job);
    setNoteText(job.note);
  }

  function handleSaveNote() {
    if (!noteJob) return;
    startTransition(async () => {
      await updateJobNote(noteJob.id, noteText);
      setNoteJob(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-[280px]">
          <label className="mb-2 block text-[14px] font-bold text-[#444]">絞り込み条件</label>
          <select
            value={filterValue}
            onChange={(event) => changeFilter(event.target.value)}
            className="w-full rounded-[10px] border border-[#d6dce8] bg-white px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full max-w-[280px]">
          <label className="mb-2 block text-[14px] font-bold text-[#444]">並び替え</label>
          <select
            value={sortValue}
            onChange={(event) => changeSort(event.target.value)}
            className="w-full rounded-[10px] border border-[#d6dce8] bg-white px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[18px] bg-white shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
        <div className="xl:hidden">
          {jobs.length === 0 ? (
            <div className="px-4 py-12 text-center text-[#9aa3b2]">条件に合う求人はありません</div>
          ) : (
            <div className="divide-y divide-[#edf0f5]">
              {jobs.map((job) => {
                const canWithdraw = job.reviewStatus === "PENDING_REVIEW";
                const visibilityDisabled =
                  isPending ||
                  job.reviewStatus === "DRAFT" ||
                  job.reviewStatus === "RETURNED" ||
                  (job.reviewStatus === "PENDING_REVIEW" && !job.hasPublishedVersion);
                return (
                  <div key={job.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/company/jobs/${job.id}/edit`}
                        className="min-w-0 flex-1 text-[15px] font-bold leading-[1.6] text-[#333] hover:text-[#2f6cff]"
                      >
                        <span className="line-clamp-2">{job.title}</span>
                      </Link>
                      <div className="shrink-0">
                        <PublishToggle job={job} disabled={visibilityDisabled} onToggle={handleToggleVisibility} />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/company/jobs/${job.id}/edit`}
                        className="rounded-[8px] border border-[#d0d7e6] px-3 py-1.5 text-[12px] font-medium text-[#445063] hover:bg-[#f4f7fb] transition"
                      >
                        編集
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPreviewJob(job)}
                        className="rounded-[8px] border border-[#d0d7e6] px-3 py-1.5 text-[12px] font-medium text-[#445063] hover:bg-[#f4f7fb] transition"
                      >
                        プレビュー
                      </button>
                      <button
                        type="button"
                        onClick={() => openNote(job)}
                        className={`rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition ${job.note ? "border-[#2f6cff] text-[#2f6cff]" : "border-[#d0d7e6] text-[#445063] hover:bg-[#f4f7fb]"}`}
                      >
                        {job.note ? "メモ編集" : "メモ追加"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(job)}
                        disabled={isPending}
                        className="rounded-[8px] border border-[#d0d7e6] px-3 py-1.5 text-[12px] font-medium text-[#445063] hover:bg-[#f4f7fb] transition disabled:opacity-50"
                      >
                        複製
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetJob(job)}
                        disabled={isPending}
                        className="rounded-[8px] border border-[#fca5a5] px-3 py-1.5 text-[12px] font-medium text-[#dc2626] hover:bg-[#fff5f5] transition disabled:opacity-50"
                      >
                        削除
                      </button>
                    </div>

                    {job.note && (
                      <p className="mt-3 rounded-[8px] bg-[#fffbeb] px-3 py-2 text-[12px] text-[#92400e] line-clamp-2">{job.note}</p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                      <div>
                        <p className="text-[#98a2b3]">雇用形態</p>
                        <p className="mt-1 font-semibold text-[#344054]">{job.employmentTypeLabel}</p>
                      </div>
                      <div>
                        <p className="text-[#98a2b3]">勤務地</p>
                        <p className="mt-1 truncate font-semibold text-[#344054]" title={job.location}>
                          {job.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#98a2b3]">応募数 / 閲覧数</p>
                        <p className="mt-1 font-semibold text-[#344054]">{job.applicationsCount} / {job.viewCount}</p>
                      </div>
                      <div>
                        <p className="text-[#98a2b3]">審査状況</p>
                        <div className="mt-1">
                          {canWithdraw ? (
                            <button
                              type="button"
                              onClick={() => setTargetJob(job)}
                              className={`rounded-full px-3 py-1 text-[12px] font-bold transition ${REVIEW_BADGES[job.reviewStatus]}`}
                            >
                              {REVIEW_LABELS[job.reviewStatus]}
                            </button>
                          ) : (
                            <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${REVIEW_BADGES[job.reviewStatus]}`}>
                              {REVIEW_LABELS[job.reviewStatus]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden xl:block">
          <table className="w-full table-fixed text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#e8edf5] text-[#7f8795]">
                <th className="px-4 py-4 font-bold">応募求人</th>
                <th className="w-[100px] whitespace-nowrap px-3 py-4 font-bold">雇用形態</th>
                <th className="w-[90px] whitespace-nowrap px-3 py-4 font-bold">勤務地</th>
                <th className="w-[64px] whitespace-nowrap px-3 py-4 text-center font-bold">応募数</th>
                <th className="w-[60px] whitespace-nowrap px-3 py-4 text-center font-bold">閲覧数</th>
                <th className="w-[120px] whitespace-nowrap px-3 py-4 text-center font-bold">審査状況</th>
                <th className="w-[72px] whitespace-nowrap px-3 py-4 text-center font-bold">公開</th>
                <th className="w-[64px] whitespace-nowrap px-3 py-4 text-center font-bold">プレビュー</th>
                <th className="w-[56px] whitespace-nowrap px-3 py-4 text-center font-bold">メモ</th>
                <th className="w-[56px] whitespace-nowrap px-3 py-4 text-center font-bold">複製</th>
                <th className="w-[48px] whitespace-nowrap px-3 py-4 text-center font-bold">削除</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#9aa3b2]">
                    条件に合う求人はありません
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  const canWithdraw = job.reviewStatus === "PENDING_REVIEW";
                  const visibilityDisabled =
                    isPending ||
                    job.reviewStatus === "DRAFT" ||
                    job.reviewStatus === "RETURNED" ||
                    (job.reviewStatus === "PENDING_REVIEW" && !job.hasPublishedVersion);
                  return (
                    <tr key={job.id} className="border-b border-[#edf0f5] last:border-b-0">
                      <td className="px-4 py-4 font-bold text-[#333]">
                        <Link
                          href={`/company/jobs/${job.id}/edit`}
                          className="block truncate hover:text-[#2f6cff]"
                          title={job.title}
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-[#333]">{job.employmentTypeLabel}</td>
                      <td className="px-3 py-4 text-[#333]">
                        <span className="block truncate" title={job.location}>
                          {job.location}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-[#333]">{job.applicationsCount}</td>
                      <td className="px-3 py-4 text-center text-[#555]">{job.viewCount}</td>
                      <td className="px-3 py-4 text-center">
                        {canWithdraw ? (
                          <button
                            type="button"
                            onClick={() => setTargetJob(job)}
                            className={`rounded-full px-3 py-1 text-[12px] font-bold transition ${REVIEW_BADGES[job.reviewStatus]}`}
                          >
                            {REVIEW_LABELS[job.reviewStatus]}
                          </button>
                        ) : (
                          <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${REVIEW_BADGES[job.reviewStatus]}`}>
                            {REVIEW_LABELS[job.reviewStatus]}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <PublishToggle job={job} disabled={visibilityDisabled} onToggle={handleToggleVisibility} />
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setPreviewJob(job)}
                          title="プレビューを表示"
                          className="rounded-[8px] border border-[#d0d7e6] px-2 py-1.5 text-[12px] font-medium text-[#445063] hover:bg-[#f4f7fb] transition"
                        >
                          表示
                        </button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => openNote(job)}
                          title={job.note ? job.note : "メモを追加"}
                          className={`rounded-[8px] border px-2 py-1.5 text-[12px] font-medium transition ${job.note ? "border-[#2f6cff] text-[#2f6cff] hover:bg-[#f0f5ff]" : "border-[#d0d7e6] text-[#445063] hover:bg-[#f4f7fb]"}`}
                        >
                          {job.note ? "編集" : "追加"}
                        </button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(job)}
                          disabled={isPending}
                          title="複製して下書きを作成"
                          className="rounded-[8px] border border-[#d0d7e6] px-2 py-1.5 text-[12px] font-medium text-[#445063] hover:bg-[#f4f7fb] transition disabled:opacity-50"
                        >
                          複製
                        </button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDeleteTargetJob(job)}
                          disabled={isPending}
                          title="求人を削除"
                          className="rounded-[8px] border border-[#fca5a5] px-2 py-1.5 text-[12px] font-medium text-[#dc2626] hover:bg-[#fff5f5] transition disabled:opacity-50"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTargetJob ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[420px] rounded-[20px] bg-white p-6 shadow-2xl">
            <h2 className="text-[20px] font-bold text-[#2b2f38]">求人を削除する</h2>
            <p className="mt-3 text-[14px] leading-[1.8] text-[#5f6775]">
              この操作は取り消せません。応募者がいる場合は非表示になります。
            </p>
            <div className="mt-5 rounded-[14px] bg-[#f7f9fc] px-4 py-3 text-[14px] font-semibold text-[#2b2f38]">
              {deleteTargetJob.title}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetJob(null)}
                className="rounded-[12px] border border-[#d7dce6] px-5 py-3 text-[14px] font-bold text-[#667085]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-[12px] bg-[#dc2626] px-5 py-3 text-[14px] font-bold text-white disabled:opacity-60"
              >
                {isPending ? "処理中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {targetJob ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[420px] rounded-[20px] bg-white p-6 shadow-2xl">
            <h2 className="text-[20px] font-bold text-[#2b2f38]">審査を取り下げる</h2>
            <p className="mt-3 text-[14px] leading-[1.8] text-[#5f6775]">
              {targetJob.hasPublishedVersion
                ? "取り下げると、掲載中の求人はそのままで審査状況のみ審査済みに戻ります。"
                : "取り下げると、この求人は下書きの非公開状態に戻ります。"}
            </p>
            <div className="mt-5 rounded-[14px] bg-[#f7f9fc] px-4 py-3 text-[14px] font-semibold text-[#2b2f38]">
              {targetJob.title}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTargetJob(null)}
                className="rounded-[12px] border border-[#d7dce6] px-5 py-3 text-[14px] font-bold text-[#667085]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isPending}
                className="rounded-[12px] bg-[#f59e0b] px-5 py-3 text-[14px] font-bold text-white disabled:opacity-60"
              >
                {isPending ? "処理中..." : "取り下げる"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* プレビューモーダル */}
      {previewJob ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="flex max-h-[90vh] w-full max-w-[780px] flex-col overflow-hidden rounded-[20px] bg-[#f5f7fb] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-5 py-3">
              <p className="text-[14px] font-bold text-[#2b2f38]">プレビュー — {previewJob.title}</p>
              <button type="button" onClick={() => setPreviewJob(null)} className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]">閉じる</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <JobPreview data={previewJob.previewData} />
            </div>
          </div>
        </div>
      ) : null}

      {/* メモ編集モーダル */}
      {noteJob ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[480px] rounded-[20px] bg-white p-6 shadow-2xl">
            <h2 className="text-[18px] font-bold text-[#2b2f38]">求人メモ</h2>
            <p className="mt-1 text-[12px] text-[#888]">{noteJob.title}</p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={5}
              placeholder="社内管理用のメモを入力（求職者には表示されません）"
              className="mt-4 w-full rounded-[10px] border border-[#d6dce8] px-4 py-3 text-[13px] outline-none focus:border-[#2f6cff]"
              maxLength={500}
            />
            <p className="mt-1 text-right text-[11px] text-[#aaa]">{noteText.length}/500</p>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setNoteJob(null)} className="rounded-[12px] border border-[#d7dce6] px-5 py-2.5 text-[13px] font-bold text-[#667085]">キャンセル</button>
              <button type="button" onClick={handleSaveNote} disabled={isPending} className="rounded-[12px] bg-[#2f6cff] px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-60">
                {isPending ? "保存中..." : "保存する"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
