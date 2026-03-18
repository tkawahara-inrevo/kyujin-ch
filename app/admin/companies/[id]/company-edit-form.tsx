"use client";

import { useState, useTransition } from "react";
import { updateCompanyByAdmin } from "@/app/actions/admin/company-edit";

type Props = {
  companyId: string;
  companyName: string;
  corporateNumber: string;
  username: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
};

export default function CompanyEditForm(props: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(props);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateCompanyByAdmin(props.companyId, form);
        setEditing(false);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "保存に失敗しました");
      }
    });
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setEditing(true);
            setSuccess(false);
            setError("");
          }}
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
      <h2 className="text-[16px] font-bold text-[#333]">企業アカウント情報を編集</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="会社名" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} />
        <Field
          label="法人番号"
          value={form.corporateNumber}
          onChange={(v) => setForm({ ...form, corporateNumber: v.replace(/[^\d]/g, "").slice(0, 13) })}
        />
        <Field label="ユーザー名" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
        <Field label="電話番号" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Field label="姓（担当者）" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
        <Field label="名（担当者）" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
        <div className="md:col-span-2">
          <Field label="メールアドレス" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        </div>
      </div>

      {error && <p className="text-[13px] font-medium text-[#ff3158]">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-[8px] bg-[#2f6cff] px-5 py-2 text-[13px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存"}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setError("");
            setForm(props);
          }}
          className="rounded-[8px] bg-[#e5e7eb] px-5 py-2 text-[13px] font-bold text-[#555] hover:bg-[#d1d5db]"
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[13px] font-semibold text-[#555]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[14px] focus:border-[#2f6cff] focus:outline-none"
      />
    </div>
  );
}
