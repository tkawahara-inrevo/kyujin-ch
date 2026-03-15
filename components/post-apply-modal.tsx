"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitBulkApplications } from "@/app/actions/applications";
import type { SimilarJob } from "@/app/actions/applications";

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "応相談";
  if (min && max && min === max) return `${min}万円`;
  if (min && max) return `${min}万〜${max}万円`;
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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function toggleCheck(jobId: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
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
    <div className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4">
      <div className="mx-auto flex h-full w-full max-w-[720px] items-center justify-center">
        <div className="flex max-h-[calc(100dvh-24px)] w-full flex-col overflow-hidden rounded-[16px] bg-white shadow-xl sm:max-h-[calc(100dvh-32px)]">
          <div className="shrink-0 border-b border-[#f0f0f0] px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-center text-[20px] font-bold text-[#222] sm:text-[22px]">
              応募ありがとうございます!
            </h2>
            <p className="mt-2 text-center text-[13px] leading-[1.8] text-[#555] sm:text-[14px]">
              条件の近い求人もまとめてチェックできます!
            </p>
            <p className="mt-3 text-center text-[15px] font-bold text-[#2f6cff] sm:text-[16px]">
              こちらにも応募しませんか?
            </p>
            <p className="mt-1 text-center text-[12px] text-[#888]">
              チェックを入れるだけで一括応募できます!
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <label
                  key={job.id}
                  className="relative cursor-pointer overflow-hidden rounded-[10px] border border-[#e8e8e8] bg-white transition hover:shadow-md"
                >
                  <div className="absolute left-3 top-3 z-10">
                    <input
                      type="checkbox"
                      checked={checked.has(job.id)}
                      onChange={() => toggleCheck(job.id)}
                      className="h-5 w-5 rounded border-[#ccc] text-[#2f6cff] accent-[#2f6cff]"
                    />
                  </div>

                  <div className="relative aspect-[1.8/1] w-full bg-[#e8e8e8]">
                    <Image
                      src={job.imageSrc}
                      alt={job.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 320px"
                    />
                    <span className="absolute right-2 top-2 rounded-[4px] bg-[#ff3158] px-2 py-[2px] text-[10px] font-bold text-white">
                      注目
                    </span>
                  </div>

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
                      <span>{job.location ?? "勤務地未設定"}</span>
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
          </div>

          <div className="shrink-0 border-t border-[#f0f0f0] bg-white px-4 py-4 sm:px-6">
            <div className="space-y-3">
              <button
                onClick={handleBulkApply}
                disabled={!hasChecked || isPending}
                className={`w-full rounded-[10px] py-3.5 text-[15px] font-bold transition ${
                  hasChecked
                    ? "bg-[#2f6cff] !text-white hover:opacity-90"
                    : "cursor-not-allowed bg-[#ccc] !text-white"
                } disabled:opacity-60`}
              >
                {isPending ? "応募中..." : "まとめて応募する"}
              </button>

              <button
                onClick={handleSkip}
                disabled={isPending}
                className="w-full rounded-[10px] border border-[#ddd] bg-[#f5f5f5] py-3.5 text-[15px] font-bold text-[#555] transition hover:bg-[#eee] disabled:opacity-60"
              >
                今回は応募しない
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
