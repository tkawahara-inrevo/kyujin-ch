"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateJob, deleteJob } from "@/app/actions/company/jobs";

const EMPLOYMENT_OPTIONS = [
  { value: "FULL_TIME", label: "正社員" },
  { value: "PART_TIME", label: "パート" },
  { value: "CONTRACT", label: "契約社員" },
  { value: "TEMPORARY", label: "派遣" },
  { value: "INTERN", label: "インターン" },
  { value: "OTHER", label: "その他" },
];

type Job = {
  id: string;
  title: string;
  description: string;
  employmentType: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  categoryTag: string | null;
  tags: string[];
  isPublished: boolean;
};

export function JobEditForm({ job }: { job: Job }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await updateJob(job.id, {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      employmentType: fd.get("employmentType") as string,
      location: fd.get("location") as string,
      salaryMin: fd.get("salaryMin") ? Number(fd.get("salaryMin")) : undefined,
      salaryMax: fd.get("salaryMax") ? Number(fd.get("salaryMax")) : undefined,
      categoryTag: fd.get("categoryTag") as string,
      tags: (fd.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [],
      isPublished: fd.get("isPublished") === "true",
    });
    router.push("/company/jobs");
  }

  async function handleDelete() {
    if (!confirm("この求人を削除しますか？")) return;
    setLoading(true);
    await deleteJob(job.id);
    router.push("/company/jobs");
  }

  const inputCls =
    "w-full rounded-[8px] border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#2f6cff]";

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-[720px] space-y-5">
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">タイトル <span className="text-[#ff3158]">*</span></label>
        <input name="title" required defaultValue={job.title} className={inputCls} />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">雇用形態 <span className="text-[#ff3158]">*</span></label>
        <select name="employmentType" defaultValue={job.employmentType} className={inputCls}>
          {EMPLOYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">勤務地</label>
          <input name="location" defaultValue={job.location ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">カテゴリタグ</label>
          <input name="categoryTag" defaultValue={job.categoryTag ?? ""} className={inputCls} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">給与下限 (万円)</label>
          <input name="salaryMin" type="number" defaultValue={job.salaryMin ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">給与上限 (万円)</label>
          <input name="salaryMax" type="number" defaultValue={job.salaryMax ?? ""} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">スキルタグ (カンマ区切り)</label>
        <input name="tags" defaultValue={job.tags.join(", ")} className={inputCls} />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">仕事内容 <span className="text-[#ff3158]">*</span></label>
        <textarea name="description" required rows={8} defaultValue={job.description} className={inputCls} />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">公開設定</label>
        <select name="isPublished" defaultValue={String(job.isPublished)} className={inputCls}>
          <option value="true">公開</option>
          <option value="false">下書き</option>
        </select>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="rounded-[10px] bg-[#2f6cff] px-8 py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50">
          {loading ? "保存中..." : "更新する"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-[10px] border border-[#ddd] px-8 py-3 text-[14px] font-medium text-[#666] hover:bg-[#f7f7f7]">
          キャンセル
        </button>
        <button type="button" onClick={handleDelete} disabled={loading} className="ml-auto rounded-[10px] border border-[#ff3158] px-6 py-3 text-[14px] font-bold text-[#ff3158] hover:bg-[#fff5f7] disabled:opacity-50">
          削除
        </button>
      </div>
    </form>
  );
}
