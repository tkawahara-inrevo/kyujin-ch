import Image from "next/image";
import Link from "next/link";
import { FavoriteToggleButton } from "@/components/favorite-toggle-button";

type JobCardProps = {
  id: string;
  title: string;
  companyName: string;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  description: string;
  imageSrc?: string;
  badge?: string;
  categoryTag?: string;
  tags?: string[];
  createdAt?: Date | string;
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "応相談";
  if (min && max && min === max) return `${min}万円`;
  if (min && max) return `${min}万円`;
  if (min) return `${min}万円〜`;
  return `〜${max}万円`;
}

function formatDate(d?: Date | string) {
  if (!d) return "2026/02/20";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getSubTagClass(tag: string) {
  if (tag === "急募") return "bg-[#ff3158] text-white";
  if (tag === "リモート勤務可") return "bg-[#efefef] text-[#555]";
  return "bg-[#efefef] text-[#555]";
}

export function JobCard({
  id,
  title,
  companyName,
  location,
  salaryMin,
  salaryMax,
  description,
  imageSrc = "/assets/Resume.png",
  badge = "注目",
  categoryTag = "営業",
  tags = ["未経験歓迎", "中途採用"],
  createdAt,
}: JobCardProps) {
  return (
    <article className="overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
      <Link href={`/jobs/${id}`} className="group block">
        <div className="relative aspect-[1.85/1] w-full overflow-hidden bg-[#e8e8e8]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {badge && (
            <span className={`absolute right-3 top-3 rounded-[4px] px-2 py-[3px] text-[11px] font-bold ${
              badge === "中途"
                ? "bg-[#2f6cff] text-white"
                : badge.includes("卒")
                  ? "bg-[#ff3158] text-white"
                  : "bg-[#ff3158] text-white"
            }`}>
              {badge}
            </span>
          )}
        </div>
      </Link>

      <div className="px-3 pb-3 pt-3">
        {/* タグ */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#4b4b4b] px-2.5 py-[3px] text-[10px] font-bold text-white">
            {categoryTag}
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-[3px] text-[10px] font-bold ${getSubTagClass(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* タイトル + ブックマーク */}
        <div className="mt-2.5 flex items-start justify-between gap-2">
          <Link href={`/jobs/${id}`} className="min-w-0 block">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-[1.5] text-[#222] hover:underline">
              {title}
            </h3>
          </Link>
          <div className="shrink-0 pt-0.5">
            <FavoriteToggleButton jobId={id} />
          </div>
        </div>

        <p className="mt-1.5 text-[13px] font-semibold text-[#555]">{companyName}</p>

        {/* 勤務地・給与 */}
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[12px] text-[#666]">
            <Image src="/assets/Map_Pin.png" alt="" width={13} height={13} />
            <span>{location ?? "勤務地未設定"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#666]">
            <span className="text-[14px] font-semibold leading-none">¥</span>
            <span>{formatSalary(salaryMin, salaryMax)}</span>
          </div>
        </div>

        {/* 説明文 */}
        <p className="mt-2.5 line-clamp-3 text-[12px] leading-[1.8] text-[#777]">
          {description}
        </p>

        <p className="mt-3 text-right text-[11px] text-[#aaa]">
          掲載日 {formatDate(createdAt)}
        </p>
      </div>
    </article>
  );
}
