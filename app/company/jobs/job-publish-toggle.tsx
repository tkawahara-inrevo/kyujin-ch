"use client";

import { useTransition } from "react";
import { toggleJobPublish } from "@/app/actions/company/jobs";

export function JobPublishToggle({ jobId, isPublished }: { jobId: string; isPublished: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleJobPublish(jobId, !isPublished))}
      className={`relative h-[24px] w-[44px] rounded-full transition ${
        isPublished ? "bg-[#2f6cff]" : "bg-[#ccc]"
      } ${isPending ? "opacity-50" : ""}`}
    >
      <span
        className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow transition-transform ${
          isPublished ? "left-[22px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}
