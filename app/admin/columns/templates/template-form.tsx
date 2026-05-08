"use client";

import Link from "next/link";
import { RichTextEditor } from "@/components/rich-text-editor";

type Props = {
  title: string;
  action: (formData: FormData) => Promise<void>;
  values?: { name?: string; body?: string };
};

export function TemplateForm({ title, action, values }: Props) {
  const inputCls = "w-full rounded-lg border border-[#d7dee9] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff]";

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">{title}</h1>
      <form action={action} className="mt-6 space-y-5 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">テンプレート名 *</label>
          <input name="name" defaultValue={values?.name ?? ""} required className={inputCls} placeholder="例：インタビュー記事テンプレ" />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">本文テンプレート</label>
          <RichTextEditor name="body" defaultValue={values?.body ?? ""} />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="rounded-lg bg-[#2f6cff] px-6 py-2.5 text-[14px] font-bold text-white hover:opacity-90">
            保存
          </button>
          <Link href="/admin/columns/templates" className="rounded-lg border border-[#d1d5db] px-6 py-2.5 text-[14px] text-[#4b5565] hover:bg-[#f8fafc]">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
