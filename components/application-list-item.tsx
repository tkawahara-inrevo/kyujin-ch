import Image from "next/image";
import Link from "next/link";
import { formatSalary } from "@/lib/format-salary";

type ApplicationListItemProps = {
  jobId: string;
  title: string;
  companyName: string;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  appliedAt?: string;
  conversationId?: string;
  imageSrc?: string;
};

export function ApplicationListItem({
  jobId,
  title,
  companyName,
  location,
  salaryMin,
  salaryMax,
  appliedAt,
  conversationId,
  imageSrc = "/assets/Resume.png",
}: ApplicationListItemProps) {
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
                <span className="rounded-full bg-[#2f6cff] px-3 py-1 text-[11px] font-bold text-white">
                  応募済み
                </span>
              </div>

              <Link href={`/jobs/${jobId}`} className="block">
                <h2 className="mt-3 line-clamp-2 text-[24px] font-bold leading-[1.45] text-[#333] hover:underline">
                  {title}
                </h2>
              </Link>

              <p className="mt-2 text-[16px] text-[#555]">{companyName}</p>
            </div>
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
            {appliedAt && (
              <p className="text-[13px] text-[#999]">応募日 {appliedAt}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/jobs/${jobId}`}
                className="rounded-[8px] border border-[#d7d7d7] px-4 py-2 text-[13px] font-bold text-[#444] transition hover:bg-[#f7f7f7]"
              >
                求人詳細を見る
              </Link>
              {conversationId && (
                <Link
                  href={`/messages/${conversationId}`}
                  className="rounded-[8px] bg-[#2f6cff] px-4 py-2 text-[13px] font-bold !text-white transition hover:opacity-90"
                >
                  メッセージを見る
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
