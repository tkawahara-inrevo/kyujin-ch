import Image from "next/image";
import Link from "next/link";

type CompanySummaryCardProps = {
  companyName: string;
  location?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  imageSrc?: string;
};

export function CompanySummaryCard({
  companyName,
  location,
  description,
  websiteUrl,
  imageSrc = "/assets/Resume.png",
}: CompanySummaryCardProps) {
  return (
    <section className="rounded-[18px] border border-[#dfdfdf] bg-white p-6">
      <div className="grid gap-6 md:grid-cols-[1fr_180px] md:items-start">
        <div>
          <h3 className="text-[28px] font-bold text-[#333]">{companyName}</h3>

          <div className="mt-3 flex items-center gap-2 text-[14px] text-[#444]">
            <Image src="/assets/Map_Pin.png" alt="" width={16} height={16} />
            <span>{location ?? "所在地未設定"}</span>
          </div>

          <p className="mt-4 text-[13px] leading-[1.9] text-[#555]">
            {description ??
              "企画、開発、制作、販売及び保守（ウェブサイト、ウェブコンテンツの企画、制作、保守及び管理）、人材育成のための教育コンテンツ作成、研修及び指導"}
          </p>

          <div className="mt-4">
            <Link
              href={websiteUrl || "#"}
              className="text-[13px] font-bold text-[#2f6cff] underline underline-offset-2"
            >
              公式サイト
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-[8px] bg-[#2f6cff] px-3 py-1 text-[12px] font-bold text-white">
              求人数　4件
            </span>
            <span className="rounded-[8px] bg-[#ff3158] px-3 py-1 text-[12px] font-bold text-white">
              クチコミ　10件
            </span>
          </div>
        </div>

        <div className="relative h-[120px] overflow-hidden rounded-[12px] bg-[#f2f2f2] md:h-[140px]">
          <Image
            src={imageSrc}
            alt={companyName}
            fill
            className="object-cover"
            sizes="180px"
          />
        </div>
      </div>
    </section>
  );
}