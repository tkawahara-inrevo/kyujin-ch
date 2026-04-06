"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatSalary } from "@/lib/format-salary";
import { submitBulkApplications } from "@/app/actions/applications";
import { addFavorite } from "@/app/actions/favorites";
import type { SimilarJob } from "@/app/actions/applications";

type Props = {
  jobs: SimilarJob[];
};

const SWIPE_THRESHOLD = 60; // px to trigger action

type SwipeDir = "apply" | "favorite" | "skip" | null;

// ────────────────────────────────────────────
// Mobile swipe card (single job)
// ────────────────────────────────────────────
function SwipeCard({
  job,
  onSwipe,
}: {
  job: SimilarJob;
  onSwipe: (dir: "apply" | "favorite" | "skip") => void;
}) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [flyDir, setFlyDir] = useState<SwipeDir>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const action: SwipeDir = (() => {
    const absX = Math.abs(drag.x);
    const absY = Math.abs(drag.y);
    if (drag.y > SWIPE_THRESHOLD && absY > absX) return "skip";
    if (drag.x > SWIPE_THRESHOLD) return "apply";
    if (drag.x < -SWIPE_THRESHOLD) return "favorite";
    return null;
  })();

  function getTransform() {
    if (flyDir === "apply")    return "translate(150vw, -20vh) rotate(30deg)";
    if (flyDir === "favorite") return "translate(-150vw, -20vh) rotate(-30deg)";
    if (flyDir === "skip")     return "translate(0, 150vh)";
    if (!dragging && drag.x === 0 && drag.y === 0) return "none";
    const rot = drag.x * 0.08;
    return `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`;
  }

  function release() {
    setDragging(false);
    if (!action) {
      setDrag({ x: 0, y: 0 });
      return;
    }
    setFlyDir(action);
    setTimeout(() => onSwipe(action), 300);
  }

  // Touch events
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
    setDragging(true);
    setFlyDir(null);
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return;
    const t = e.touches[0];
    setDrag({ x: t.clientX - startRef.current.x, y: t.clientY - startRef.current.y });
  }
  function onTouchEnd() { release(); }

  // Pointer events (desktop preview / hybrid)
  function onPointerDown(e: React.PointerEvent) {
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    setFlyDir(null);
    cardRef.current?.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  }
  function onPointerUp() { release(); }

  const progress = Math.min(Math.abs(drag.x) / 120, 1); // 0→1 for color fade
  const applyOpacity   = action === "apply"    ? 1 : Math.max(0, drag.x / 120);
  const favoriteOpacity = action === "favorite" ? 1 : Math.max(0, -drag.x / 120);
  const skipOpacity    = action === "skip"     ? 1 : Math.max(0, drag.y / 120);

  return (
    <div
      ref={cardRef}
      style={{
        transform: getTransform(),
        transition: flyDir || (!dragging && drag.x === 0)
          ? "transform 0.35s cubic-bezier(.25,.46,.45,.94)"
          : "none",
        touchAction: "none",
        userSelect: "none",
        cursor: dragging ? "grabbing" : "grab",
        willChange: "transform",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="absolute inset-x-4 overflow-hidden rounded-[20px] bg-white shadow-2xl"
    >
      {/* Overlay labels */}
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-start justify-start p-5"
        style={{ opacity: favoriteOpacity }}
      >
        <span className="rounded-xl border-[3px] border-[#2f6cff] px-4 py-2 text-[18px] font-black text-[#2f6cff] rotate-[-15deg]">
          気になる ♡
        </span>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-start justify-end p-5"
        style={{ opacity: applyOpacity }}
      >
        <span className="rounded-xl border-[3px] border-[#22c55e] px-4 py-2 text-[18px] font-black text-[#22c55e] rotate-[15deg]">
          応募 ✓
        </span>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center p-6"
        style={{ opacity: skipOpacity }}
      >
        <span className="rounded-xl border-[3px] border-[#ef4444] px-4 py-2 text-[18px] font-black text-[#ef4444]">
          興味なし ✕
        </span>
      </div>

      {/* Card content */}
      <div className="relative aspect-[16/9] w-full bg-[#e8e8e8]">
        <Image
          src={job.imageSrc}
          alt={job.title}
          fill
          className="object-cover"
          sizes="100vw"
          draggable={false}
        />
        <span className="absolute right-2 top-2 rounded-[4px] bg-[#ff3158] px-2 py-[2px] text-[10px] font-bold text-white">
          注目
        </span>
      </div>
      <div className="px-4 pb-5 pt-3">
        {job.categoryTag && (
          <div className="flex flex-wrap gap-1">
            <span className="rounded-full bg-[#4b4b4b] px-2 py-[2px] text-[9px] font-bold text-white">
              {job.categoryTag}
            </span>
            {job.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-[#efefef] px-2 py-[2px] text-[9px] font-bold text-[#555]">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="mt-2 line-clamp-2 text-[16px] font-bold leading-[1.4] text-[#222]">
          {job.title}
        </h3>
        <p className="mt-1 text-[12px] text-[#666]">{job.companyName}</p>
        <div className="mt-1.5 flex items-center gap-1 text-[12px] text-[#666]">
          <span>📍</span>
          <span>{job.location ?? "勤務地未設定"}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold text-[#2f6cff]">
          <span>¥</span>
          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[11px] leading-[1.7] text-[#888]">
          {job.description}
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Main modal
// ────────────────────────────────────────────
export function PostApplyModal({ jobs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // PC state
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Mobile state
  const [currentIndex, setCurrentIndex] = useState(0);
  const done = currentIndex >= jobs.length;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function handleSwipe(dir: "apply" | "favorite" | "skip") {
    const job = jobs[currentIndex];
    if (!job) return;

    startTransition(async () => {
      if (dir === "apply") {
        await submitBulkApplications([job.id]);
      } else if (dir === "favorite") {
        await addFavorite(job.id);
      }
      setCurrentIndex((i) => i + 1);
    });
  }

  // PC handlers
  function toggleCheck(jobId: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
      return next;
    });
  }

  function handleBulkApply() {
    startTransition(async () => {
      await submitBulkApplications([...checked]);
      router.push("/applications");
    });
  }

  function handleSkip() {
    router.push("/applications");
  }

  return (
    <div className="fixed inset-0 z-50">

      {/* ══════════════ MOBILE swipe UI (hidden sm and up) ══════════════ */}
      <div className="flex h-full flex-col bg-black/70 sm:hidden">
        {done ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-[18px] font-bold text-white">全て確認しました！</p>
            <button
              onClick={handleSkip}
              className="rounded-[14px] bg-white px-8 py-3 text-[15px] font-bold text-[#222] shadow-lg"
            >
              応募一覧を見る
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="shrink-0 px-4 pb-3 pt-10 text-center">
              <p className="text-[12px] font-semibold text-white/50">
                {currentIndex + 1} / {jobs.length}
              </p>
              <p className="mt-0.5 text-[17px] font-bold text-white">こちらにも応募しませんか?</p>
            </div>

            {/* Card stack with side labels */}
            <div className="relative flex-1">
              {/* Left label: 気になる */}
              <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1 px-1">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 border-[#2f6cff] bg-white/90">
                  <span className="text-[18px] leading-none text-[#2f6cff]">♡</span>
                </div>
                <span className="text-[9px] font-bold text-white">気になる</span>
                <span className="text-[10px] font-bold text-white/60">←</span>
              </div>

              {/* Right label: 応募 */}
              <div className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1 px-1">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#22c55e]">
                  <span className="text-[18px] leading-none text-white">✓</span>
                </div>
                <span className="text-[9px] font-bold text-white">応募</span>
                <span className="text-[10px] font-bold text-white/60">→</span>
              </div>

              {/* Next card (peeking behind) */}
              {jobs[currentIndex + 1] && (
                <div
                  className="absolute inset-x-14 overflow-hidden rounded-[20px] bg-white shadow-lg"
                  style={{ top: 8, transform: "scale(0.96)", zIndex: 0 }}
                >
                  <div className="relative aspect-[16/9] w-full bg-[#e8e8e8]">
                    <Image
                      src={jobs[currentIndex + 1].imageSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                  <div className="h-24" />
                </div>
              )}

              {/* Current card */}
              <div className="mx-14" style={{ position: "relative", zIndex: 1 }}>
                <SwipeCard
                  key={currentIndex}
                  job={jobs[currentIndex]}
                  onSwipe={handleSwipe}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 px-6 pb-10 pt-5">
              <div className="flex items-center justify-between gap-3">
                {/* Favorite button */}
                <button
                  onClick={() => handleSwipe("favorite")}
                  disabled={isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border-2 border-[#2f6cff] bg-white py-3.5 transition active:scale-95"
                >
                  <span className="text-[16px] text-[#2f6cff]">♡</span>
                  <span className="text-[13px] font-bold text-[#2f6cff]">気になる</span>
                </button>

                {/* Skip button */}
                <button
                  onClick={() => handleSwipe("skip")}
                  disabled={isPending}
                  className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-white/20 transition active:scale-95"
                >
                  <span className="text-[16px] text-white/80">✕</span>
                </button>

                {/* Apply button */}
                <button
                  onClick={() => handleSwipe("apply")}
                  disabled={isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#22c55e] py-3.5 transition active:scale-95"
                >
                  <span className="text-[16px] text-white">✓</span>
                  <span className="text-[13px] font-bold text-white">応募する</span>
                </button>
              </div>
              <p className="mt-3 text-center text-[10px] text-white/30">下スワイプ・中央ボタンでスキップ</p>
            </div>
          </>
        )}
      </div>

      {/* ══════════════ PC checkbox UI (hidden below sm) ══════════════ */}
      <div className="hidden h-full bg-black/40 p-4 sm:flex items-center justify-center">
        <div className="flex max-h-[calc(100dvh-32px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[16px] bg-white shadow-xl">
          <div className="shrink-0 border-b border-[#f0f0f0] px-6 py-5">
            <h2 className="text-center text-[22px] font-bold text-[#222]">
              応募ありがとうございます!
            </h2>
            <p className="mt-2 text-center text-[14px] leading-[1.8] text-[#555]">
              条件の近い求人もまとめてチェックできます!
            </p>
            <p className="mt-3 text-center text-[16px] font-bold text-[#2f6cff]">
              こちらにも応募しませんか?
            </p>
            <p className="mt-1 text-center text-[12px] text-[#888]">
              チェックを入れるだけで一括応募できます!
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                      className="h-5 w-5 rounded border-[#ccc] accent-[#2f6cff]"
                    />
                  </div>
                  <div className="relative aspect-[1.8/1] w-full bg-[#e8e8e8]">
                    <Image
                      src={job.imageSrc}
                      alt={job.title}
                      fill
                      className="object-cover"
                      sizes="320px"
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
                          <span key={tag} className="rounded-full bg-[#efefef] px-2 py-[2px] text-[9px] font-bold text-[#555]">
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
                      <span>📍</span>
                      <span>{job.location ?? "勤務地未設定"}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#666]">
                      <span>¥</span>
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

          <div className="shrink-0 border-t border-[#f0f0f0] bg-white px-6 py-4">
            <div className="space-y-3">
              <button
                onClick={handleBulkApply}
                disabled={checked.size === 0 || isPending}
                className={`w-full rounded-[10px] py-3.5 text-[15px] font-bold transition ${
                  checked.size > 0
                    ? "bg-[#2f6cff] text-white hover:opacity-90"
                    : "cursor-not-allowed bg-[#ccc] text-white"
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
