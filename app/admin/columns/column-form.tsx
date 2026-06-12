"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";

const PRESET_TAGS = [
  "就活ノウハウ", "新卒向け", "学生向け", "管理職向け",
  "チェックリスト", "最新", "2025年", "2026年",
  "面接", "履歴書", "カジュアル面談", "面接対策",
];

type Status = "draft" | "published" | "scheduled";
type Template = { id: string; name: string; body: string };
type ColumnFormValues = {
  slug?: string; title?: string; summary?: string; body?: string; thumbnailUrl?: string;
  tags?: string; isPublished?: boolean; publishedAt?: Date | null;
  metaTitle?: string | null; metaDescription?: string | null;
};
type Props = {
  title: string;
  action: (formData: FormData) => Promise<void>;
  values?: ColumnFormValues;
  templates?: Template[];
  cancelHref?: string;
};

function deriveStatus(values?: ColumnFormValues): Status {
  if (!values?.isPublished) return "draft";
  if (values.publishedAt && new Date(values.publishedAt) > new Date()) return "scheduled";
  return "published";
}

function toDatetimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function ColumnForm({ title, action, values, templates = [], cancelHref = "/admin/columns" }: Props) {
  const initialStatus = deriveStatus(values);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [scheduledAt, setScheduledAt] = useState(
    initialStatus === "scheduled" ? toDatetimeLocal(values?.publishedAt) : ""
  );
  const initialTags = values?.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [thumbnailUrl, setThumbnailUrl] = useState(values?.thumbnailUrl ?? "");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [bodyKey, setBodyKey] = useState(0);
  const [bodyValue, setBodyValue] = useState(values?.body ?? "");
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setThumbnailUrl(data.url);
      else alert(data.error ?? "アップロードに失敗しました");
    } catch { alert("アップロードに失敗しました"); }
    setThumbnailUploading(false);
    e.target.value = "";
  }

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplate(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) { setBodyValue(tmpl.body); setBodyKey((k) => k + 1); }
  }

  const inputCls = "w-full rounded-lg border border-[#d7dee9] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff]";
  const textareaCls = "w-full rounded-lg border border-[#d7dee9] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff] resize-none";

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">{title}</h1>
      <form action={action} className="mt-6 space-y-6">

        {templates.length > 0 && (
          <div className="rounded-xl bg-[#f0f5ff] p-4">
            <label className="mb-2 block text-[13px] font-bold text-[#2f6cff]">テンプレートから読み込む</label>
            <select value={selectedTemplate} onChange={(e) => handleTemplateSelect(e.target.value)}
              className="rounded-lg border border-[#c7d7ff] bg-white px-4 py-2 text-[14px] outline-none">
              <option value="">選択してください</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selectedTemplate && <p className="mt-1 text-[11px] text-[#888]">本文に読み込まれました。編集してください。</p>}
          </div>
        )}

        <div className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-[#374151]">基本情報</h2>
          <div>
            <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">タイトル *</label>
            <input name="title" defaultValue={values?.title ?? ""} required className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">スラッグ（URL）*</label>
            <input
              name="slug"
              defaultValue={values?.slug ?? ""}
              required
              pattern="[a-z0-9_\-]+"
              className={inputCls}
              placeholder="例: tenshoku-agent_hoshu"
            />
            <p className="mt-1 text-[11px] text-[#888]">
              半角英数字・ハイフン・アンダースコアのみ。URLは /column/[スラッグ] になります
            </p>
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">概要（一覧サマリー）</label>
            <input name="summary" defaultValue={values?.summary ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">サムネイル画像</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => thumbnailInputRef.current?.click()} disabled={thumbnailUploading}
                  className="rounded-lg border border-[#2f6cff] px-4 py-2 text-[13px] font-bold text-[#2f6cff] hover:bg-[#f0f5ff] disabled:opacity-50">
                  {thumbnailUploading ? "アップロード中..." : "ファイルを選択"}
                </button>
                {thumbnailUrl && <button type="button" onClick={() => setThumbnailUrl("")} className="text-[12px] text-[#ef4444] hover:underline">削除</button>}
              </div>
              <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
              {thumbnailUrl && <img src={thumbnailUrl} alt="サムネイル" className="h-32 w-auto rounded-lg object-cover" />}
              <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">タグ</label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-[#d7dee9] p-3">
              {PRESET_TAGS.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                    selectedTags.includes(tag) ? "bg-[#2f6cff] text-white" : "bg-[#e5e5e5] text-[#333] hover:bg-[#d0d0d0]"}`}>
                  {tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && <p className="mt-1.5 text-[11px] text-[#888]">選択中: {selectedTags.join(", ")}</p>}
            <input type="hidden" name="tags" value={selectedTags.join(",")} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-[#374151]">本文 *</h2>
          <RichTextEditor key={bodyKey} name="body" defaultValue={bodyValue} />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-[#374151]">SEO設定</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">
                SEOタイトル <span className="font-normal text-[#888] text-[11px]">（空の場合は記事タイトルを使用）</span>
              </label>
              <input name="metaTitle" defaultValue={values?.metaTitle ?? ""} className={inputCls} placeholder="検索結果に表示されるタイトル" maxLength={70} />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">メタディスクリプション</label>
              <textarea name="metaDescription" defaultValue={values?.metaDescription ?? ""} className={textareaCls} rows={3}
                placeholder="検索結果に表示される説明文（120〜160文字推奨）" maxLength={200} />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-[#374151]">公開設定</h2>
          <div className="flex flex-wrap gap-3">
            {(["draft", "published", "scheduled"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`rounded-lg px-5 py-2.5 text-[13px] font-bold transition ${
                  status === s
                    ? s === "draft" ? "bg-[#6b7280] text-white" : s === "published" ? "bg-[#16a34a] text-white" : "bg-[#d97706] text-white"
                    : "border border-[#d1d5db] text-[#4b5565] hover:bg-[#f8fafc]"}`}>
                {s === "draft" ? "下書き保存" : s === "published" ? "今すぐ公開" : "予約投稿"}
              </button>
            ))}
          </div>
          {status === "scheduled" && (
            <div className="mt-4">
              <label className="mb-2 block text-[13px] font-bold text-[#4b5565]">公開日時</label>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                className="rounded-lg border border-[#d7dee9] px-4 py-2 text-[14px] outline-none focus:border-[#2f6cff]" />
            </div>
          )}
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="scheduledAt" value={status === "scheduled" ? scheduledAt : ""} />
        </div>

        <div className="flex gap-3">
          <button type="submit"
            className={`rounded-lg px-6 py-2.5 text-[14px] font-bold text-white hover:opacity-90 ${
              status === "draft" ? "bg-[#6b7280]" : status === "published" ? "bg-[#16a34a]" : "bg-[#d97706]"}`}>
            {status === "draft" ? "下書き保存" : status === "published" ? "公開する" : "予約投稿する"}
          </button>
          <Link href={cancelHref} className="rounded-lg border border-[#d1d5db] px-6 py-2.5 text-[14px] text-[#4b5565] hover:bg-[#f8fafc]">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
