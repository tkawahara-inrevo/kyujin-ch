"use client";

import Link from "next/link";
import { RichTextEditor } from "@/components/rich-text-editor";

type ColumnFormValues = {
  title: string;
  summary: string;
  body: string;
  thumbnailUrl: string;
  tags: string;
  isPublished: boolean;
};

type Props = {
  title: string;
  submitLabel: string;
  action: (formData: FormData) => Promise<void>;
  values?: Partial<ColumnFormValues>;
};

export function ColumnForm({ title, submitLabel, action, values }: Props) {
  const initial: ColumnFormValues = {
    title: values?.title ?? "",
    summary: values?.summary ?? "",
    body: values?.body ?? "",
    thumbnailUrl: values?.thumbnailUrl ?? "",
    tags: values?.tags ?? "",
    isPublished: values?.isPublished ?? false,
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">{title}</h1>

      <form action={action} className="mt-6 space-y-5 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">タイトル *</label>
          <input
            name="title"
            defaultValue={initial.title}
            required
            className="w-full rounded-lg border border-[#d7dee9] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">概要（一覧に表示されるサマリー）</label>
          <input
            name="summary"
            defaultValue={initial.summary}
            className="w-full rounded-lg border border-[#d7dee9] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">サムネイルURL</label>
          <input
            name="thumbnailUrl"
            defaultValue={initial.thumbnailUrl}
            placeholder="https://..."
            className="w-full rounded-lg border border-[#d7dee9] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">タグ（カンマ区切り）</label>
          <input
            name="tags"
            defaultValue={initial.tags}
            placeholder="就活ノウハウ, 面接対策, チェックリスト"
            className="w-full rounded-lg border border-[#d7dee9] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">本文 *</label>
          <RichTextEditor name="body" defaultValue={initial.body} />
        </div>

        <label className="flex items-center gap-2 text-[14px] font-medium text-[#374151]">
          <input type="checkbox" name="isPublished" defaultChecked={initial.isPublished} />
          公開する
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:opacity-90"
          >
            {submitLabel}
          </button>
          <Link
            href="/admin/columns"
            className="rounded-lg border border-[#d1d5db] px-5 py-2.5 text-[14px] text-[#4b5565] hover:bg-[#f8fafc]"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
