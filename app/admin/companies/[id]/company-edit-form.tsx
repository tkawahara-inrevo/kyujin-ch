"use client";

import { useState, useTransition } from "react";
import { updateCompanyByAdmin } from "@/app/actions/admin/company-edit";

type Props = {
  companyId: string;
  name: string;
  description: string;
  websiteUrl: string;
  location: string;
  contactName: string;
  phone: string;
};

export default function CompanyEditForm(props: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(props);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSuccess(false);
    startTransition(async () => {
      await updateCompanyByAdmin(props.companyId, {
        name: form.name,
        description: form.description,
        websiteUrl: form.websiteUrl,
        location: form.location,
        contactName: form.contactName,
        phone: form.phone,
      });
      setEditing(false);
      setSuccess(true);
    });
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setEditing(true); setSuccess(false); }}
          className="rounded-[8px] bg-[#2f6cff] px-5 py-2 text-[13px] font-bold text-white hover:bg-[#1d5ae0]"
        >
          編集する
        </button>
        {success && <span className="text-[13px] font-medium text-[#059669]">保存しました</span>}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="text-[16px] font-bold text-[#333]">企業情報を編集</h2>

      <Field label="企業名" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Field label="説明" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
      <Field label="WebサイトURL" value={form.websiteUrl} onChange={(v) => setForm({ ...form, websiteUrl: v })} />
      <Field label="所在地" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
      <Field label="担当者名" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
      <Field label="電話番号" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-[8px] bg-[#2f6cff] px-5 py-2 text-[13px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存"}
        </button>
        <button
          onClick={() => { setEditing(false); setForm(props); }}
          className="rounded-[8px] bg-[#e5e7eb] px-5 py-2 text-[13px] font-bold text-[#555] hover:bg-[#d1d5db]"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, multiline,
}: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[13px] font-semibold text-[#555]">{label}</label>
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
