import Image from "next/image";
import Link from "next/link";
import { FavoriteToggleButton } from "@/components/favorite-toggle-button";

type FavoriteListItemProps = {
  id: string;
  jobId: string;
  title: string;
  companyName: string;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  savedAt?: string;
  imageSrc?: string;
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "応相談";
  if (min && max && min === max) return `${min}万円`;
  if (min && max) return `${min}万円`;
  if (min) return `${min}万円〜`;
  return `〜${max}万円`;
}

export function FavoriteListItem({
  id,
  jobId,
  title,
  companyName,
  location,
  salaryMin,
  salaryMax,
  savedAt = "2026/02/20",
  imageSrc = "/assets/Resume.png",
}: FavoriteListItemProps) {
  return (
    <article className="rounded-[18px] border border-[#d9d9d9] bg-white p-5 transition hover:bg-[#fcfcfc]">
      <div className="grid gap-5 md:grid-cols-[180px_1fr]">
        <Link
          href={`/jobs/${jobId}`}
          className="relative block h-[120px] overflow-hidden rounded-[10px] bg-[#efefef]"
        >
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="180px"
          />
        </Link>

        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#ff3158] px-3 py-1 text-[11px] font-bold text-white">
                  気になる
                </span>
                <span className="rounded-full bg-[#efefef] px-3 py-1 text-[11px] font-bold text-[#666]">
                  中途採用
                </span>
              </div>

              <Link href={`/jobs/${jobId}`} className="block">
                <h2 className="mt-3 line-clamp-2 text-[24px] font-bold leading-[1.45] text-[#333] hover:underline">
                  {title}
                </h2>
              </Link>

              <p className="mt-2 text-[16px] text-[#555]">{companyName}</p>
            </div>

            <FavoriteToggleButton
              jobId={jobId}
              revalidatePaths={["/favorites"]}
              activeIcon="/assets/Bookmark.png"
              inactiveIcon="/assets/Bookmark_gr.png"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-[#444]">
            <div className="flex items-center gap-2">
              <Image src="/assets/Map_Pin.png" alt="" width={14} height={14} />
              <span>{location ?? "勤務地未設定"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">¥</span>
              <span>{formatSalary(salaryMin, salaryMax)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-[#999]">保存日 {savedAt}</p>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/jobs/${jobId}`}
                className="rounded-[8px] border border-[#d7d7d7] px-4 py-2 text-[13px] font-bold text-[#444] transition hover:bg-[#f7f7f7]"
              >
                求人詳細を見る
              </Link>
              <Link
                href={`/jobs/${jobId}/apply`}
                className="rounded-[8px] bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white transition hover:opacity-90"
              >
                応募する
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}