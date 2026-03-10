import Image from "next/image";

type JobMetaProps = {
  companyName: string;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "応相談";
  if (min && max && min === max) return `${min}万円`;
  if (min && max) return `${min}万円`;
  if (min) return `${min}万円〜`;
  return `〜${max}万円`;
}

export function JobMeta({
  companyName,
  location,
  salaryMin,
  salaryMax,
}: JobMetaProps) {
  return (
    <div className="mt-4">
      <p className="text-[24px] font-bold text-[#333]">{companyName}</p>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 text-[14px] text-[#444]">
          <Image src="/assets/Map_Pin.png" alt="" width={18} height={18} />
          <span>{location ?? "勤務地未設定"}</span>
        </div>

        <div className="flex items-center gap-3 text-[14px] text-[#444]">
          <span className="text-[28px] leading-none">¥</span>
          <span>{formatSalary(salaryMin, salaryMax)}</span>
        </div>
      </div>
    </div>
  );
}