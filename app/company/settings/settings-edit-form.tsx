"use client";

import { useState, useTransition } from "react";
import { updateCompanySettings } from "@/app/actions/company/settings";

type Props = {
  companyName: string;
  description: string;
  websiteUrl: string;
  location: string;
  contactName: string;
  phone: string;
};

export default function SettingsEditForm(props: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(props);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const companyName = form.companyName.trim();
    if (!companyName) {
      setError("会社名を入力してください");
      setSuccess(false);
      return;
    }

    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateCompanySettings({ ...form, companyName });
        setForm((current) => ({ ...current, companyName }));
        setEditing(false);
        setSuccess(true);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "保存に失敗しました");
      }
    });
  };

  if (!editing) {
    return (
      <button
        onClick={() => {
          setEditing(true);
          setSuccess(false);
          setError(null);
        }}
        className="rounded-[8px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#1d5ae0]"
      >
        編集する
      </button>
    );
  }

  return (
    <div className="space-y-5 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {success ? (
        <div className="rounded-[8px] bg-[#d1fae5] px-4 py-3 text-[13px] font-medium text-[#059669]">
          保存しました
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[8px] bg-[#fff1f2] px-4 py-3 text-[13px] font-medium text-[#e11d48]">
          {error}
        </div>
      ) : null}

      <h2 className="text-[16px] font-bold text-[#333]">プロフィール編集</h2>

      <Field label="会社名" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} required />
      <Field label="説明" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
      <Field label="WebサイトURL" value={form.websiteUrl} onChange={(v) => setForm({ ...form, websiteUrl: v })} />
      <Field label="所在地" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
      <Field label="担当者名" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
      <Field label="電話番号" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-[8px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存"}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setForm(props);
            setError(null);
          }}
          className="rounded-[8px] bg-[#e5e7eb] px-5 py-2.5 text-[14px] font-bold text-[#555] hover:bg-[#d1d5db]"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[13px] font-semibold text-[#555]">
        {label}
        {required ? <span className="ml-1 text-[#ff3158]">*</span> : null}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      )}
    </div>
  );
}
