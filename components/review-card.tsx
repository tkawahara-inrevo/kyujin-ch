"use client";

import { useTransition } from "react";
import { deleteReview } from "@/app/actions/reviews";

type ReviewCardProps = {
  id?: string;
  rating?: number;
  title?: string;
  body?: string;
  createdAt?: Date | string;
  editable?: boolean;
};

function formatDate(d?: Date | string) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function ReviewCard({
  id,
  rating = 5,
  title = "仕事内容が分かりやすい",
  body = "求人票の内容が具体的で、選考の流れも明確でした。次は面談まで進めたいです。",
  createdAt,
  editable = false,
}: ReviewCardProps) {
  const [isPending, startTransition] = useTransition();

  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  function handleDelete() {
    if (!id) return;
    startTransition(async () => {
      await deleteReview(id);
    });
  }

  return (
    <div className="rounded-[12px] border border-[#d7d7d7] bg-white p-5">
      <p className="text-[14px] font-bold text-[#f5a623]">{stars}</p>
      <p className="mt-3 text-[28px] font-bold text-[#333]">{title}</p>
      <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.8] text-[#555]">
        {body}
      </p>
      {createdAt && (
        <p className="mt-3 text-[13px] text-[#888]">投稿日 {formatDate(createdAt)}</p>
      )}

      {editable && id && (
        <div className="mt-4">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-[8px] bg-[#9a9a9a] px-3 py-2 text-[13px] font-bold text-white transition hover:bg-[#ff3158] disabled:opacity-60"
          >
            {isPending ? "削除中..." : "削除　×"}
          </button>
        </div>
      )}
    </div>
  );
}
