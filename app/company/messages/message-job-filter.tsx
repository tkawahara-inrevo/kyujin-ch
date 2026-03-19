"use client";

import { useRouter } from "next/navigation";

export function MessageJobFilter({
  jobs,
  currentJobId,
}: {
  jobs: { id: string; title: string }[];
  currentJobId?: string;
}) {
  const router = useRouter();

  return (
    <div>
      <label className="mb-2 block text-[14px] font-bold text-[#444]">絞り込み条件</label>
      <select
        value={currentJobId ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          router.push(value ? `/company/messages?jobId=${value}` : "/company/messages");
        }}
        className="w-full rounded-[10px] border border-[#d6dce8] bg-white px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
      >
        <option value="">応募求人</option>
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>
            {job.title}
          </option>
        ))}
      </select>
    </div>
  );
}
