import Image from "next/image";

type CompanyHeaderBlockProps = {
  companyName: string;
  location?: string | null;
  description?: string | null;
  businessDescription?: string | null;
};

export function CompanyHeaderBlock({
  companyName,
  location,
  description,
  businessDescription,
}: CompanyHeaderBlockProps) {
  const displayText = businessDescription || description;

  return (
    <section>
      <h1 className="text-[28px] font-bold text-[#333]">{companyName}</h1>

      {location && (
        <div className="mt-4 flex items-center gap-2 text-[13px] text-[#444]">
          <Image src="/assets/Map_Pin.png" alt="" width={14} height={14} />
          <span>{location}</span>
        </div>
      )}

      {displayText && (
        <div className="mt-6">
          <div className="bg-[#2f6cff] px-4 py-2 text-[14px] font-bold text-white">
            会社概要
          </div>
          <div className="border border-t-0 border-[#e0e0e0] bg-white px-5 py-4">
            <p className="whitespace-pre-line text-[13px] leading-[1.9] text-[#444]">
              {displayText}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
