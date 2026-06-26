import Image from "next/image";
import Link from "next/link";
import { FavoriteToggleButton } from "@/components/favorite-toggle-button";
import { formatSalary } from "@/lib/format-salary";

type Props = {
  id: string;
  title: string;
  companyName: string;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryType?: string | null;
  description: string;
  imageSrc?: string;
  badge?: string;
  categoryTag?: string;
  tags?: string[];
  createdAt?: Date | string;
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

/**
 * 横並びコンパクトな求人リスト項目（リストビュー用）。
 * 画像左・テキスト右の1行レイアウト。
 */
export function JobListItem({
  id,
  title,
  companyName,
  location,
  salaryMin,
  salaryMax,
  salaryType,
  imageSrc = "/assets/Resume.png",
  badge,
  categoryTag,
  tags = [],
  createdAt,
}: Props) {
  return (
    <article className="group relative overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
      <Link href={`/jobs/${id}`} className="absolute inset-0 z-10" aria-label={title} />

      <div className="flex gap-3 p-3">
        {/* 画像 */}
        <div className="relative h-[88px] w-[136px] shrink-0 overflow-hidden rounded-[8px] bg-[#e8e8e8]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="136px"
          />
          {badge && (
            <span
              className={`absolute right-1.5 top-1.5 z-10 rounded-[4px] px-1.5 py-[2px] text-[10px] font-bold text-white ${
                badge === "中途" ? "bg-[#2f6cff]" : "bg-[#ff3158]"
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* テキスト */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 min-w-0 text-[13px] font-bold leading-[1.45] text-[#222]">
              {title}
            </h3>
            <div className="relative z-20 shrink-0">
              <FavoriteToggleButton jobId={id} />
            </div>
          </div>

          <p className="mt-1 truncate text-[11px] font-semibold text-[#555]">
            {companyName}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#666]">
            {location && <span>📍 {location}</span>}
            {(salaryMin || salaryMax) && <span>💰 {formatSalary(salaryMin, salaryMax, salaryType)}</span>}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {categoryTag && (
              <span className="rounded-full bg-[#4b4b4b] px-2 py-[2px] text-[9px] font-bold text-white">
                {categoryTag}
              </span>
            )}
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#efefef] px-2 py-[2px] text-[9px] font-bold text-[#555]"
              >
                {tag}
              </span>
            ))}
          </div>

          {createdAt && (
            <p className="mt-1 text-right text-[10px] text-[#aaa]">
              {formatDate(createdAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
