"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/actions/reviews";

type Props = {
  companyId: string;
};

const STAR_OPTIONS = [5, 4, 3, 2, 1];

export function CompanyReviewForm({ companyId }: Props) {
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("rating", String(rating));
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await submitReview(companyId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
        form.reset();
        setRating(5);
      }
    });
  }

  if (done) {
    return (
      <div className="mt-6 rounded-[18px] bg-[#f4f4f4] p-5 text-center text-[14px] font-semibold text-[#555]">
        クチコミを投稿しました。ありがとうございます！
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-[18px] bg-[#f4f4f4] p-5">
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-[13px] font-bold text-[#333]">評価</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-2 h-[34px] rounded-[6px] border border-[#cfcfcf] bg-white px-3 text-[13px] outline-none"
          >
            {STAR_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)}{"☆".repeat(5 - n)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <input
            name="title"
            required
            className="h-[42px] w-full rounded-[6px] border border-[#cfcfcf] bg-white px-4 text-[13px] outline-none"
            placeholder="タイトル"
          />
        </div>

        <div className="mt-3 flex gap-3">
          <textarea
            name="body"
            required
            className="min-h-[90px] flex-1 rounded-[6px] border border-[#cfcfcf] bg-white px-4 py-3 text-[13px] outline-none"
            placeholder="本文"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-[90px] min-w-[86px] rounded-[10px] bg-[#2f6cff] px-4 text-[14px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "送信中" : "送信"}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-[13px] text-[#ff3158]">{error}</p>
        )}
      </form>
    </section>
  );
}
