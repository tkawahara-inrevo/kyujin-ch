import Image from "next/image";
import Link from "next/link";

type CompanySummaryCardProps = {
  companyId?: string;
  companyName: string;
  location?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  jobsCount?: number;
  reviewsCount?: number;
};

export function CompanySummaryCard({
  companyId,
  companyName,
  location,
  description,
  websiteUrl,
  jobsCount,
  reviewsCount,
}: CompanySummaryCardProps) {
  return (
    <section className="rounded-[18px] border border-[#dfdfdf] bg-white p-6">
      <p className="text-[13px] font-semibold text-[#888]">掲載企業</p>

      {companyId ? (
        <Link href={`/companies/${companyId}`} className="mt-1.5 inline-block">
          <h3 className="text-[22px] font-bold text-[#1a1a1a] transition hover:underline">
            {companyName}
          </h3>
        </Link>
      ) : (
        <h3 className="mt-1.5 text-[22px] font-bold text-[#1a1a1a]">{companyName}</h3>
      )}

      {location && (
        <div className="mt-2 flex items-center gap-1.5 text-[13px] text-[#555]">
          <Image src="/assets/Map_Pin.png" alt="" width={14} height={14} />
          <span>{location}</span>
        </div>
      )}

      {description && (
        <p className="mt-3 text-[13px] leading-[1.9] text-[#555]">{description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {websiteUrl && (
          <Link
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] font-semibold text-[#2f6cff] underline underline-offset-2 hover:opacity-80"
          >
            公式サイト →
          </Link>
        )}
        {jobsCount != null && (
          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[12px] font-semibold text-[#475569]">
            求人 {jobsCount}件
          </span>
        )}
        {reviewsCount != null && (
          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[12px] font-semibold text-[#475569]">
            クチコミ {reviewsCount}件
          </span>
        )}
      </div>

      {companyId && (
        <div className="mt-4 border-t border-[#f0f0f0] pt-4">
          <Link
            href={`/companies/${companyId}`}
            className="text-[13px] font-bold text-[#2f6cff] underline underline-offset-2 hover:opacity-80"
          >
            会社ページを見る
          </Link>
        </div>
      )}
    </section>
  );
}
