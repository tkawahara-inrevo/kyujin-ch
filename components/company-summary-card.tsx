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
      <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#7a8699]">
            Company
          </p>

          {companyId ? (
            <Link href={`/companies/${companyId}`} className="mt-2 inline-block">
              <h3 className="text-[28px] font-bold text-[#333] transition hover:underline">
                {companyName}
              </h3>
            </Link>
          ) : (
            <h3 className="mt-2 text-[28px] font-bold text-[#333]">{companyName}</h3>
          )}

          <div className="mt-3 flex items-center gap-2 text-[14px] text-[#444]">
            <Image src="/assets/Map_Pin.png" alt="" width={16} height={16} />
            <span>{location ?? "所在地は現在確認中です"}</span>
          </div>

          <p className="mt-4 text-[13px] leading-[1.9] text-[#555]">
            {description ?? "会社概要は現在確認中です。"}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoCard label="所在地" value={location ?? "現在確認中"} />
            <InfoCard
              label="Webサイト"
              value={websiteUrl ?? "現在確認中"}
              href={websiteUrl ?? undefined}
            />
            <InfoCard
              label="掲載中の求人"
              value={jobsCount != null ? `${jobsCount}件` : "現在確認中"}
            />
            <InfoCard
              label="口コミ"
              value={reviewsCount != null ? `${reviewsCount}件` : "現在確認中"}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {companyId && (
              <Link
                href={`/companies/${companyId}`}
                className="text-[13px] font-bold text-[#2f6cff] underline underline-offset-2"
              >
                会社ページを見る
              </Link>
            )}
          </div>
      </div>
    </section>
  );
}

function InfoCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="rounded-[14px] bg-[#f8fafc] px-4 py-4">
      <p className="text-[11px] font-semibold text-[#7a8699]">{label}</p>
      <div className="mt-1">
        {href ? (
          <Link
            href={href}
            className="break-all text-[13px] font-semibold text-[#2f6cff] underline underline-offset-2"
          >
            {value}
          </Link>
        ) : (
          <p className="text-[13px] font-semibold leading-[1.7] text-[#334155]">{value}</p>
        )}
      </div>
    </div>
  );
}
