"use client";

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
};

export function JobPreview({ data }: { data: JobPreviewData }) {
  const employmentLabel = data.employmentType
    ? data.employmentType === "OTHER" && data.employmentTypeDetail
      ? `${EMPLOYMENT_LABELS.OTHER} (${data.employmentTypeDetail})`
      : EMPLOYMENT_LABELS[data.employmentType] || data.employmentType
    : "";

  const categoryLabel =
    data.categoryTag === OTHER_CATEGORY_VALUE && data.categoryTagDetail
      ? `${OTHER_CATEGORY_VALUE} (${data.categoryTagDetail})`
      : data.categoryTag || "";

  return (
    <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-6 shadow-sm">
      <p className="mb-4 text-[12px] font-bold uppercase tracking-wider text-[#999]">
        Preview - 求職者に表示されるイメージ
      </p>

      <h2 className="text-[22px] font-bold leading-[1.5] text-[#333]">
        {data.title || "(タイトル未入力)"}
      </h2>

      {data.imageUrl ? (
        <div className="relative mt-4 aspect-[1.95/1] overflow-hidden rounded-[10px] bg-[#ececec]">
          <img src={data.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="mt-4 flex aspect-[1.95/1] items-center justify-center rounded-[10px] bg-[#ececec]">
          <span className="text-[14px] text-[#aaa]">画像なし</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {categoryLabel && (
          <span className="rounded-full bg-[#4b4b4b] px-3 py-1 text-[11px] font-bold text-white">
            {categoryLabel}
          </span>
        )}
        {employmentLabel && (
          <span className="rounded-full bg-[#efefef] px-3 py-1 text-[11px] font-bold text-[#666]">
            {employmentLabel}
          </span>
        )}
        {data.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#efefef] px-3 py-1 text-[11px] font-bold text-[#666]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-1 text-[13px] text-[#777]">
        {data.region && <p>{data.region}</p>}
        {data.location && <p>{data.location}</p>}
        {(data.salaryMin || data.salaryMax) && (
          <p>
            年収{" "}
            {data.salaryMin ? `${data.salaryMin}万` : ""}
            {data.salaryMin && data.salaryMax ? " 〜 " : ""}
            {data.salaryMax ? `${data.salaryMax}万` : ""}
          </p>
        )}
      </div>

      {data.description && <PreviewBlock heading="仕事内容" body={data.description} />}
      {data.requirements && <PreviewBlock heading="応募条件" body={data.requirements} />}
      {data.desiredAptitude && (
        <PreviewBlock heading="こんな方に向いています" body={data.desiredAptitude} />
      )}
      {data.recommendedFor && (
        <PreviewBlock heading="こんな方におすすめ" body={data.recommendedFor} />
      )}

      {(data.officeName || data.officeDetail || data.access) && (
        <div className="mt-4 border-t border-[#eee] pt-4">
          <p className="text-[13px] font-bold text-[#333]">勤務地</p>
          {data.officeName && (
            <p className="mt-1 text-[13px] text-[#555]">{data.officeName}</p>
          )}
          {data.officeDetail && (
            <p className="text-[13px] text-[#777]">{data.officeDetail}</p>
          )}
          {data.access && (
            <p className="text-[13px] text-[#777]">{data.access}</p>
          )}
        </div>
      )}

      {(data.monthlySalary || data.annualSalary) && (
        <div className="mt-4 border-t border-[#eee] pt-4">
          <p className="text-[13px] font-bold text-[#333]">給与</p>
          {data.monthlySalary && (
            <p className="mt-1 text-[13px] text-[#555]">月給: {data.monthlySalary}</p>
          )}
          {data.annualSalary && (
            <p className="text-[13px] text-[#555]">年収: {data.annualSalary}</p>
          )}
        </div>
      )}

      {data.workingHours && (
        <div className="mt-4 border-t border-[#eee] pt-4">
          <p className="text-[13px] font-bold text-[#333]">勤務時間</p>
          <p className="mt-1 text-[13px] text-[#555]">{data.workingHours}</p>
        </div>
      )}

      <div className="mt-4 border-t border-[#eee] pt-4">
        <p className="text-[13px] font-bold text-[#333]">福利厚生</p>
        {data.benefits && data.benefits.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.benefits.map((benefit) => (
              <span
                key={benefit}
                className="rounded bg-[#f3f3f3] px-2 py-1 text-[12px] text-[#555]"
              >
                {benefit}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-[13px] leading-[1.8] text-[#94a3b8]">
            福利厚生は現在確認中です。
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-[#eee] pt-4">
        <p className="text-[13px] font-bold text-[#333]">選考フロー</p>
        {data.selectionProcess ? (
          <p className="mt-1 whitespace-pre-line text-[13px] text-[#555]">
            {data.selectionProcess}
          </p>
        ) : (
          <p className="mt-1 text-[13px] leading-[1.8] text-[#94a3b8]">
            選考フローは現在確認中です。
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="block cursor-default rounded-[10px] bg-[#2f6cff] px-6 py-4 text-center text-[15px] font-bold text-white opacity-60">
          応募する (プレビュー)
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="mt-4 border-t border-[#eee] pt-4">
      <p className="text-[13px] font-bold text-[#333]">{heading}</p>
      <p className="mt-1 whitespace-pre-line text-[13px] leading-[1.8] text-[#555]">
        {body}
      </p>
    </div>
  );
}
