"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { submitBulkApplications } from "@/app/actions/applications";
import type { SimilarJob } from "@/app/actions/applications";

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "応相談";
  if (min && max && min === max) return `${min}万円`;
  if (min && max) return `${min}万円`;
  if (min) return `${min}万円〜`;
  return `〜${max}万円`;
}

type Props = {
  jobs: SimilarJob[];
};

export function PostApplyModal({ jobs }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggleCheck(jobId: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }

  function handleBulkApply() {
    startTransition(async () => {
      await submitBulkApplications([...checked]);
    });
  }

  function handleSkip() {
    router.push("/applications");
  }

  const hasChecked = checked.size > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-[720px] rounded-[16px] bg-white px-6 py-8 shadow-xl md:px-10">
        <h2 className="text-center text-[22px] font-bold text-[#222]">
          ご応募ありがとうございます
        </h2>

        <p className="mt-3 text-[14px] text-[#555]">
          企業からの連絡を待つ間に.....
        </p>

        <p className="mt-4 text-center text-[16px] font-bold text-[#2f6cff]">
          おすすめ求人
        </p>
        <p className="mt-1 text-center text-[12px] text-[#888]">
          チェックを入れることで同じ内容で一括応募が可能です
        </p>

        {/* 求人カード一覧 */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {jobs.map((job) => (
            <label
              key={job.id}
              className="relative cursor-pointer overflow-hidden rounded-[10px] border border-[#e8e8e8] bg-white transition hover:shadow-md"
            >
              {/* チェックボックス */}
              <div className="absolute left-3 top-3 z-10">
                <input
                  type="checkbox"
                  checked={checked.has(job.id)}
                  onChange={() => toggleCheck(job.id)}
                  className="h-5 w-5 rounded border-[#ccc] text-[#2f6cff] accent-[#2f6cff]"
                />
              </div>

              {/* 画像 */}
              <div className="relative aspect-[1.8/1] w-full bg-[#e8e8e8]">
                <Image
                  src={job.imageSrc}
                  alt={job.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 220px"
                />
                <span className="absolute right-2 top-2 rounded-[4px] bg-[#ff3158] px-2 py-[2px] text-[10px] font-bold text-white">
                  注目
                </span>
              </div>

              {/* 情報 */}
              <div className="px-3 pb-3 pt-2.5">
                {job.categoryTag && (
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-full bg-[#4b4b4b] px-2 py-[2px] text-[9px] font-bold text-white">
                      {job.categoryTag}
                    </span>
                    {job.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#efefef] px-2 py-[2px] text-[9px] font-bold text-[#555]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <h3 className="mt-1.5 line-clamp-2 text-[13px] font-bold leading-[1.4] text-[#222]">
                  {job.title}
                </h3>

                <p className="mt-1 text-[11px] text-[#666]">{job.companyName}</p>

                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#666]">
                  <span>&#x1f4cd;</span>
                  <span>{job.location ?? "未設定"}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#666]">
                  <span>&#xa5;</span>
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>

                <p className="mt-1.5 line-clamp-2 text-[10px] leading-[1.6] text-[#888]">
                  {job.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* ボタン */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleBulkApply}
            disabled={!hasChecked || isPending}
            className={`w-full rounded-[10px] py-3.5 text-[15px] font-bold transition ${
              hasChecked
                ? "bg-[#2f6cff] text-white hover:opacity-90"
                : "bg-[#ccc] text-white cursor-not-allowed"
            } disabled:opacity-60`}
          >
            {isPending ? "応募中..." : "まとめて応募する"}
          </button>

          <button
            onClick={handleSkip}
            disabled={isPending}
            className="w-full rounded-[10px] border border-[#ddd] bg-[#f5f5f5] py-3.5 text-[15px] font-bold text-[#555] transition hover:bg-[#eee] disabled:opacity-60"
          >
            今は応募しない
          </button>
        </div>
      </div>
    </div>
  );
}
