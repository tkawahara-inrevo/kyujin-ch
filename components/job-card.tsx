import Image from "next/image";
import Link from "next/link";
import { FavoriteToggleButton } from "@/components/favorite-toggle-button";
import { formatSalary } from "@/lib/format-salary";

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

function formatDate(d?: Date | string) {
  if (!d) return "2026/02/20";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getSubTagClass() {
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
    <article className="group relative overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
      <Link href={`/jobs/${id}`} className="absolute inset-0 z-10" aria-label={title} />

      <div className="relative aspect-[1.85/1] w-full overflow-hidden bg-[#e8e8e8]">
        {/* ブラー背景：余白を埋める */}
        <Image
          src={imageSrc}
          alt=""
          fill
          aria-hidden="true"
          className="scale-110 object-cover blur-xl brightness-75"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* メイン画像：見切れなし */}
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-contain transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {badge && (
          <span className={`absolute right-3 top-3 z-10 rounded-[4px] px-2 py-[3px] text-[11px] font-bold ${
            badge === "中途"
              ? "bg-[#2f6cff] text-white"
              : badge === "新着"
                ? "bg-[#ff3158] text-white"
                : badge === "注目"
                  ? "bg-[#ff3158] text-white"
                  : badge.includes("卒")
                    ? "bg-[#ff3158] text-white"
                    : "bg-[#ff3158] text-white"
          }`}>
            {badge}
          </span>
        )}
      </div>

      <div className="px-3 pb-3 pt-3">
        {/* タグ */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#4b4b4b] px-2.5 py-[3px] text-[10px] font-bold text-white">
            {categoryTag}
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-[3px] text-[10px] font-bold ${getSubTagClass()}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* タイトル + ブックマーク */}
        <div className="mt-2.5 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 text-[15px] font-bold leading-[1.5] text-[#222]">
            {title}
          </h3>
          <div className="relative z-20 shrink-0 pt-0.5">
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
        <p className="mt-2.5 line-clamp-3 whitespace-pre-line text-[12px] leading-[1.8] text-[#777]">
          {description}
        </p>

        <p className="mt-3 text-right text-[11px] text-[#aaa]">
          掲載日 {formatDate(createdAt)}
        </p>
      </div>
    </article>
  );
}
