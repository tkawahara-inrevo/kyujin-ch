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
  const displayText = description || businessDescription;

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
        <p className="mt-4 max-w-[760px] whitespace-pre-line text-[13px] leading-[1.8] text-[#555]">
          {displayText}
        </p>
      )}
    </section>
  );
}
