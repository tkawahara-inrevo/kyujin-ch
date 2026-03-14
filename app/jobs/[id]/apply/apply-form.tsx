"use client";

import { useState, useTransition } from "react";
import { submitApplication } from "@/app/actions/applications";
import type { SimilarJob } from "@/app/actions/applications";
import { PostApplyModal } from "@/components/post-apply-modal";

type ApplyFormProps = {
  jobId: string;
};

export function ApplyForm({ jobId }: ApplyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [similarJobs, setSimilarJobs] = useState<SimilarJob[] | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const motivation = (formData.get("motivation") as string) ?? "";
    startTransition(async () => {
      const result = await submitApplication(jobId, motivation);
      if (result?.success && result.similarJobs.length > 0) {
        setSimilarJobs(result.similarJobs);
      } else {
        window.location.href = "/applications";
      }
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="rounded-[18px] bg-[#f4f4f4] p-6">
          <label className="block text-[14px] font-bold text-[#333]">
            志望動機・自己PR
          </label>

          <textarea
            name="motivation"
            className="mt-3 h-[120px] w-full rounded-[8px] border border-[#d7d7d7] bg-white px-4 py-3 text-[14px] outline-none"
            placeholder="本文"
          />

          <div className="mt-5 text-[13px] leading-[1.8] text-[#444]">
            <p className="font-bold">履歴書・職務経歴書も送付する（任意）</p>
            <p>
              ※ プロフィールにアップロード済みの書類を応募に同封します。
              未アップロードの場合はエラーになるので、先に
              <a href="/mypage" className="text-[#2f6cff] underline">
                プロフィール
              </a>
              からアップしてね
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-[10px] bg-[#2f6cff] px-6 py-4 text-[16px] font-bold !text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "送信中..." : "応募する"}
          </button>
        </div>
      </form>

      {similarJobs && <PostApplyModal jobs={similarJobs} />}
    </>
  );
}
