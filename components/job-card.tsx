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
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "応相談";
  if (min && max && min === max) return `${min}万円`;
  if (min && max) return `${min}万円`;
  if (min) return `${min}万円〜`;
  return `〜${max}万円`;
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
}: JobCardProps) {
  return (
    <article className="rounded-[8px] bg-white transition hover:opacity-95">
      <Link
        href={`/jobs/${id}`}
        className="group block"
      >
        <div className="relative aspect-[1.38/1] w-full overflow-hidden rounded-[8px] bg-[#f2f2f2]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <span className="absolute right-3 top-3 text-[12px] font-bold text-[#2f6cff]">
            注目
          </span>
        </div>
      </Link>

      <div className="px-1 pb-2 pt-3">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#4b4b4b] px-2.5 py-[3px] text-[10px] font-bold text-white">
            営業
          </span>
          <span className="rounded-full bg-[#efefef] px-2.5 py-[3px] text-[10px] font-bold text-[#666]">
            未経験歓迎
          </span>
          <span className="rounded-full bg-[#efefef] px-2.5 py-[3px] text-[10px] font-bold text-[#666]">
            中途採用
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/jobs/${id}`} className="block">
              <h3 className="line-clamp-2 text-[18px] font-bold leading-[1.45] text-[#333] hover:underline">
                {title}
              </h3>
            </Link>
            <p className="mt-2 text-[14px] text-[#555]">{companyName}</p>
          </div>

          <FavoriteToggleButton jobId={id} />
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <Image src="/assets/Map_Pin.png" alt="" width={14} height={14} />
            <span>{location ?? "勤務地未設定"}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <span className="font-semibold">¥</span>
            <span>{formatSalary(salaryMin, salaryMax)}</span>
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-[13px] leading-[1.8] text-[#666]">
          {description}
        </p>

        <p className="mt-4 text-right text-[11px] text-[#999]">掲載日 2026/02/20</p>
      </div>
    </article>
  );
}