"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { FocusArticleView } from "@/components/focus-article-view";

type FocusFormValues = {
  slug: string;
  companyName: string;
  title: string;
  summary: string;
  body: string;
  thumbnailUrl: string;
  tags: string;
  isPublished: boolean;
  isHot: boolean;
  authorName: string;
  authorBio: string;
  authorImageUrl: string;
};

type Props = {
  title: string;
  submitLabel: string;
  action: (formData: FormData) => Promise<void>;
  values?: Partial<FocusFormValues>;
};

const inputCls = "w-full rounded-lg border border-[#d7dee9] px-4 py-2.5 text-[14px] outline-none focus:border-[#1f2775]";
const labelCls = "mb-2 block text-[13px] font-bold text-[#4b5565]";

export function FocusForm({ title, submitLabel, action, values }: Props) {
  const initial: FocusFormValues = {
    slug: values?.slug ?? "",
    companyName: values?.companyName ?? "",
    title: values?.title ?? "",
    summary: values?.summary ?? "",
    body: values?.body ?? "",
    thumbnailUrl: values?.thumbnailUrl ?? "",
    tags: values?.tags ?? "",
    isPublished: values?.isPublished ?? false,
    isHot: values?.isHot ?? false,
    authorName: values?.authorName ?? "",
    authorBio: values?.authorBio ?? "",
    authorImageUrl: values?.authorImageUrl ?? "",
  };

  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [isHot, setIsHot] = useState(initial.isHot);
  const formRef = useRef<HTMLFormElement>(null);
  const [previewData, setPreviewData] = useState<null | {
    slug: string;
    companyName: string;
    title: string;
    summary: string;
    body: string;
    thumbnailUrl: string;
    tags: string[];
    authorName: string;
    authorBio: string;
    authorImageUrl: string;
  }>(null);

  function openPreview() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setPreviewData({
      slug: (fd.get("slug") as string) ?? "",
      companyName: (fd.get("companyName") as string) ?? "",
      title: (fd.get("title") as string) ?? "",
      summary: (fd.get("summary") as string) ?? "",
      body: (fd.get("body") as string) ?? "",
      thumbnailUrl: (fd.get("thumbnailUrl") as string) ?? "",
      tags: ((fd.get("tags") as string) ?? "").split(",").map((t) => t.trim()).filter(Boolean),
      authorName: (fd.get("authorName") as string) ?? "",
      authorBio: (fd.get("authorBio") as string) ?? "",
      authorImageUrl: (fd.get("authorImageUrl") as string) ?? "",
    });
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">{title}</h1>

      <form ref={formRef} action={action} className="mt-6 space-y-5 rounded-xl bg-white p-6 shadow-sm">
        {/* 法人番号 */}
        <div>
          <label className={labelCls}>法人番号 *</label>
          <input
            name="slug"
            defaultValue={initial.slug}
            required
            pattern="\d{13}"
            inputMode="numeric"
            maxLength={13}
            className={inputCls}
            placeholder="6290001104501"
            title="13桁の半角数字"
          />
          <p className="mt-1 text-[11px] text-[#888]">URL: /focus/[法人番号]。13桁の半角数字。</p>
        </div>

        {/* 企業名 */}
        <div>
          <label className={labelCls}>企業名 *</label>
          <input name="companyName" defaultValue={initial.companyName} required className={inputCls} placeholder="株式会社○○" />
        </div>

        {/* タイトル */}
        <div>
          <label className={labelCls}>記事タイトル *</label>
          <input name="title" defaultValue={initial.title} required className={inputCls} placeholder="利他的な人間をデザインする。自律自走で成長し続ける美容室" />
        </div>

        {/* 概要（サマリー） */}
        <div>
          <label className={labelCls}>概要（サムネイル横のテキスト）</label>
          <textarea name="summary" defaultValue={initial.summary} rows={3} className={`${inputCls} resize-none`} placeholder="記事の概要文..." />
        </div>

        {/* サムネイルURL */}
        <div>
          <label className={labelCls}>サムネイルURL</label>
          <input name="thumbnailUrl" defaultValue={initial.thumbnailUrl} className={inputCls} placeholder="https://..." />
        </div>

        {/* タグ */}
        <div>
          <label className={labelCls}>タグ（カンマ区切り）</label>
          <input name="tags" defaultValue={initial.tags} className={inputCls} placeholder="注目, 新着, IT" />
        </div>

        {/* 本文 */}
        <div>
          <label className={labelCls}>本文 *</label>
          <p className="mb-2 text-[11px] text-[#888]">H1=左縦線、H2=青四角、H3=装飾なし のスタイルで表示されます。</p>
          <RichTextEditor name="body" defaultValue={initial.body} />
        </div>

        {/* 著者情報 */}
        <div className="rounded-lg border border-[#e5e7eb] p-4 space-y-3">
          <p className="text-[13px] font-bold text-[#4b5565]">著者情報（任意）</p>
          <input name="authorName" defaultValue={initial.authorName} className={inputCls} placeholder="著者名" />
          <textarea name="authorBio" defaultValue={initial.authorBio} rows={3} className={`${inputCls} resize-none`} placeholder="著者の経歴・プロフィール" />
          <input name="authorImageUrl" defaultValue={initial.authorImageUrl} className={inputCls} placeholder="著者顔写真URL" />
        </div>

        {/* 公開・PICK UP */}
        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#374151]">
            <input
              type="checkbox"
              name="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            公開する
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#374151]">
            <input
              type="checkbox"
              name="isHot"
              checked={isHot}
              onChange={(e) => setIsHot(e.target.checked)}
            />
            PICK UP（ヒーローエリアに表示）
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-[#1f2775] px-5 py-2.5 text-[14px] font-bold text-white hover:opacity-90 transition"
          >
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={openPreview}
            className="rounded-lg border border-[#1f2775] bg-white px-5 py-2.5 text-[14px] font-bold text-[#1f2775] hover:bg-[#f0f3ff] transition"
          >
            プレビュー
          </button>
          {initial.slug && (
            <a
              href={`/focus/${initial.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[#d1d5db] px-5 py-2.5 text-[14px] text-[#4b5565] hover:bg-[#f8fafc] transition"
            >
              公開ページを開く ↗
            </a>
          )}
          <Link
            href="/admin/focus"
            className="rounded-lg border border-[#d1d5db] px-5 py-2.5 text-[14px] text-[#4b5565] hover:bg-[#f8fafc] transition"
          >
            キャンセル
          </Link>
        </div>
      </form>

      {/* プレビューモーダル */}
      {previewData && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => setPreviewData(null)}
        >
          <div
            className="my-8 w-full max-w-[1280px] rounded-[12px] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eee] bg-white px-6 py-3 rounded-t-[12px]">
              <p className="text-[14px] font-bold text-[#333]">プレビュー（保存前 / 未公開状態を再現）</p>
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="rounded-lg border border-[#d1d5db] px-3 py-1 text-[12px] text-[#4b5565] hover:bg-[#f8fafc] transition"
              >
                閉じる
              </button>
            </div>
            <div className="px-6 py-8 md:px-12">
              <div className="flex gap-8">
                <FocusArticleView
                  slug={previewData.slug}
                  companyName={previewData.companyName || "（企業名未入力）"}
                  title={previewData.title || "（タイトル未入力）"}
                  summary={previewData.summary}
                  body={previewData.body || "<p>（本文未入力）</p>"}
                  thumbnailUrl={previewData.thumbnailUrl}
                  tags={previewData.tags}
                  publishedAt={null}
                  authorName={previewData.authorName}
                  authorBio={previewData.authorBio}
                  authorImageUrl={previewData.authorImageUrl}
                  preview
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
