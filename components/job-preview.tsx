"use client";

import { graduationYearLabel } from "@/lib/graduation-years";
import { EMPLOYMENT_LABELS, OTHER_CATEGORY_VALUE } from "@/lib/job-options";

type JobPreviewData = {
  title?: string;
  imageUrl?: string;
  categoryTag?: string;
  categoryTagDetail?: string;
  employmentType?: string;
  employmentTypeDetail?: string;
  description?: string;
  requirements?: string;
  desiredAptitude?: string;
  recommendedFor?: string;
  location?: string;
  region?: string;
  officeName?: string;
  officeDetail?: string;
  access?: string;
  salaryMin?: string;
  salaryMax?: string;
  monthlySalary?: string;
  annualSalary?: string;
  workingHours?: string;
  selectionProcess?: string;
  tags?: string[];
  benefits?: string[];
  targetType?: string;
  graduationYear?: number;
};

export function JobPreview({ data }: { data: JobPreviewData }) {
  const employmentLabel = data.employmentType
    ? data.employmentType === "OTHER" && data.employmentTypeDetail
      ? data.employmentTypeDetail
      : EMPLOYMENT_LABELS[data.employmentType] || data.employmentType
    : "";

  const categoryLabel =
    data.categoryTag === OTHER_CATEGORY_VALUE && data.categoryTagDetail
      ? data.categoryTagDetail
      : data.categoryTag || "";

  const targetLabel =
    data.targetType === "NEW_GRAD" && data.graduationYear
      ? graduationYearLabel(data.graduationYear)
      : "中途";

  const locationLabel = data.location || data.region || "勤務地未設定";
  const salaryLabel =
    data.annualSalary ||
    (data.salaryMin || data.salaryMax
      ? `年収 ${data.salaryMin ? `${data.salaryMin}万` : ""}${
          data.salaryMin && data.salaryMax ? "〜" : ""
        }${data.salaryMax ? `${data.salaryMax}万` : ""}`
      : data.monthlySalary || "給与は面談時にご説明します");

  const summaryText =
    data.description ||
    "地方企業と“可能性”を結びつけるための仲間を募集しています。事業の成長と挑戦を支えるポジションです。";

  return (
    <div className="flex h-full min-h-0 flex-col rounded-[24px] bg-white">
      <p className="mb-3 shrink-0 text-[14px] font-bold text-[#2f6cff]">Preview - 求職者に表示されるイメージ</p>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[22px] border border-[#edf1f7] bg-white shadow-[0_2px_10px_rgba(27,52,90,0.04)]">
        <div className="h-full overflow-y-auto px-5 pb-5 pt-4">
          <h2 className="text-[18px] font-bold leading-[1.6] text-[#2b2f38]">
            {headlinePrefix(targetLabel, categoryLabel)}
            {data.title || "充実の福利厚生が自慢！人材営業スタッフ"}
          </h2>

          {data.imageUrl ? (
            <div className="mt-3 overflow-hidden rounded-[16px] bg-[#eef2f8]">
              <img src={data.imageUrl} alt="" className="aspect-[1.52/1] w-full object-cover" />
            </div>
          ) : (
            <div className="mt-3 flex aspect-[1.52/1] w-full items-center justify-center rounded-[16px] bg-[#eef2f8] text-[13px] text-[#96a0af]">
              画像は未設定です
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {categoryLabel ? <Tag color="dark">{categoryLabel}</Tag> : null}
            <Tag color="light">{targetLabel}</Tag>
            {employmentLabel ? <Tag color="light">{employmentLabel}</Tag> : null}
            {data.tags?.slice(0, 2).map((tag) => (
              <Tag key={tag} color="light">
                {tag}
              </Tag>
            ))}
          </div>

          <div className="mt-4 border-b border-[#e9eef5] pb-4">
            <p className="text-[18px] font-bold text-[#2b2f38]">すごくいい株式会社</p>
            <div className="mt-3 flex items-center gap-2 text-[15px] text-[#4a5565]">
              <span>📍</span>
              <span>{locationLabel}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[15px] text-[#4a5565]">
              <span>¥</span>
              <span>{salaryLabel}</span>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <PreviewSection title="詳細" body={summaryText} />
            {data.requirements ? <PreviewSection title="応募条件" body={data.requirements} /> : null}
            {data.desiredAptitude ? <PreviewSection title="向いている人" body={data.desiredAptitude} /> : null}
            {data.recommendedFor ? <PreviewSection title="おすすめの人" body={data.recommendedFor} /> : null}
            {data.selectionProcess ? <PreviewSection title="選考フロー" body={data.selectionProcess} /> : null}
            {data.benefits && data.benefits.length > 0 ? (
              <div>
                <p className="text-[14px] font-bold text-[#2b2f38]">福利厚生</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.benefits.slice(0, 6).map((benefit) => (
                    <span
                      key={benefit}
                      className="rounded-full bg-[#f1f4f9] px-3 py-1 text-[12px] font-medium text-[#5a6575]"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {(data.officeDetail || data.access || data.workingHours) && (
              <div className="space-y-2 text-[14px] text-[#4d5867]">
                {data.officeDetail ? <p>勤務地詳細：{data.officeDetail}</p> : null}
                {data.access ? <p>アクセス：{data.access}</p> : null}
                {data.workingHours ? <p>勤務時間：{data.workingHours}</p> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function headlinePrefix(targetLabel: string, categoryLabel: string) {
  if (categoryLabel) return `【${targetLabel}${categoryLabel ? "歓迎" : ""}】 `;
  return `【${targetLabel}向け】 `;
}

function Tag({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "dark" | "light";
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[12px] font-bold ${
        color === "dark" ? "bg-[#222b38] text-white" : "bg-[#edf1f7] text-[#5a6575]"
      }`}
    >
      {children}
    </span>
  );
}

function PreviewSection({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-[14px] font-bold text-[#2b2f38]">{title}</p>
      <p className="mt-1 whitespace-pre-line text-[14px] leading-[1.8] text-[#4d5867]">{body}</p>
    </div>
  );
}
