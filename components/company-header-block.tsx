import Image from "next/image";

type CompanyHeaderBlockProps = {
  companyName: string;
  location?: string | null;
  description?: string | null;
};

export function CompanyHeaderBlock({
  companyName,
  location,
  description,
}: CompanyHeaderBlockProps) {
  return (
    <section>
      <h1 className="text-[28px] font-bold text-[#333]">{companyName}</h1>

      <div className="mt-4 flex items-center gap-2 text-[13px] text-[#444]">
        <Image src="/assets/Map_Pin.png" alt="" width={14} height={14} />
        <span>{location ?? "所在地未設定"}</span>
      </div>

      <p className="mt-4 max-w-[760px] text-[13px] leading-[1.8] text-[#555]">
        {description ??
          "企画、開発、制作、販売及び保守（ウェブサイト、ウェブコンテンツの企画、制作、保守及び管理）、人材育成のための教育コンテンツ作成、研修及び指導"}
      </p>
    </section>
  );
}