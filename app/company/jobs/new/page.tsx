"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/app/actions/company/jobs";

const EMPLOYMENT_OPTIONS = [
  { value: "FULL_TIME", label: "正社員" },
  { value: "PART_TIME", label: "パート" },
  { value: "CONTRACT", label: "契約社員" },
  { value: "TEMPORARY", label: "派遣" },
  { value: "INTERN", label: "インターン" },
  { value: "OTHER", label: "その他" },
];

export default function CompanyJobNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    await createJob({
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

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">求人を作成する</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-[720px] space-y-5">
        <Field label="タイトル" required>
          <input name="title" required className={inputCls} placeholder="例: フロントエンドエンジニア" />
        </Field>

        <Field label="雇用形態" required>
          <select name="employmentType" required className={inputCls}>
            {EMPLOYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="勤務地">
            <input name="location" className={inputCls} placeholder="例: 東京都渋谷区" />
          </Field>
          <Field label="カテゴリタグ">
            <input name="categoryTag" className={inputCls} placeholder="例: エンジニア" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="給与下限 (万円)">
            <input name="salaryMin" type="number" className={inputCls} placeholder="300" />
          </Field>
          <Field label="給与上限 (万円)">
            <input name="salaryMax" type="number" className={inputCls} placeholder="600" />
          </Field>
        </div>

        <Field label="スキルタグ (カンマ区切り)">
          <input name="tags" className={inputCls} placeholder="未経験歓迎, 中途採用, リモート可" />
        </Field>

        <Field label="仕事内容" required>
          <textarea name="description" required rows={8} className={inputCls} placeholder="仕事内容の詳細を記載してください" />
        </Field>

        <Field label="公開設定">
          <select name="isPublished" className={inputCls}>
            <option value="true">即時公開</option>
            <option value="false">下書き保存</option>
          </select>
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-[10px] bg-[#2f6cff] px-8 py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "保存中..." : "作成する"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-[10px] border border-[#ddd] px-8 py-3 text-[14px] font-medium text-[#666] hover:bg-[#f7f7f7]"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#2f6cff]";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">
        {label}
        {required && <span className="ml-1 text-[#ff3158]">*</span>}
      </label>
      {children}
    </div>
  );
}
