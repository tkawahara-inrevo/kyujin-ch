"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { issueCompanyAccount } from "@/app/actions/admin/accounts";

type FormState = {
  companyName: string;
  corporateNumber: string;
  username: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
};

const initialForm: FormState = {
  companyName: "",
  corporateNumber: "",
  username: "",
  lastName: "",
  firstName: "",
  phone: "",
  email: "",
};

export default function AdminCompanyNewPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState("");
  const [lookupMessage, setLookupMessage] = useState("");
  const [issuedAccount, setIssuedAccount] = useState<{
    companyId: string;
    temporaryPassword: string;
    companyName: string;
    email: string;
    username: string;
  } | null>(null);

  async function handleLookup() {
    setLookupMessage("");
    setError("");

    const corporateNumber = form.corporateNumber.replace(/[^\d]/g, "");
    if (!/^\d{13}$/.test(corporateNumber)) {
      setLookupMessage("法人番号は13桁の数字で入力してね!");
      return;
    }

    setLookupLoading(true);
    try {
      const response = await fetch(
        `/api/admin/corporate-number?number=${encodeURIComponent(corporateNumber)}`,
        { cache: "no-store" }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "法人番号の確認に失敗しました");
      }

      setForm((current) => ({
        ...current,
        corporateNumber: result.corporateNumber,
        companyName: result.companyName || current.companyName,
      }));
      setLookupMessage(`確認できたよ! 会社名: ${result.companyName}`);
    } catch (err) {
      setLookupMessage(err instanceof Error ? err.message : "法人番号の確認に失敗しました");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setLookupMessage("");

    try {
      const issued = await issueCompanyAccount(form);
      setIssuedAccount({
        ...issued,
        companyName: form.companyName,
        email: form.email,
        username: form.username,
      });
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-[10px] border border-[#d8e0ec] px-4 py-3 text-[14px] outline-none transition focus:border-[#2f6cff]";

  if (issuedAccount) {
    return (
      <div className="p-6 lg:p-10">
        <div className="max-w-[720px] rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[#2f6cff]">ACCOUNT ISSUED</p>
          <h1 className="mt-3 text-[28px] font-bold text-[#1e293b]">企業アカウントを発行しました</h1>
          <p className="mt-3 text-[14px] leading-7 text-[#555]">
            仮パスワードはこの画面でのみ表示されます。必要な場合は必ず控えてください。
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard label="会社名" value={issuedAccount.companyName} />
            <InfoCard label="メールアドレス" value={issuedAccount.email} />
            <InfoCard label="ユーザー名" value={issuedAccount.username} />
            <InfoCard label="仮パスワード" value={issuedAccount.temporaryPassword} accent />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/admin/companies/${issuedAccount.companyId}`}
              className="rounded-[10px] bg-[#2f6cff] px-5 py-3 text-[14px] font-bold text-white"
            >
              企業詳細を見る
            </Link>
            <button
              type="button"
              onClick={() => setIssuedAccount(null)}
              className="rounded-[10px] border border-[#d8e0ec] px-5 py-3 text-[14px] font-bold text-[#555]"
            >
              続けて登録する
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/companies")}
              className="rounded-[10px] border border-[#d8e0ec] px-5 py-3 text-[14px] font-bold text-[#555]"
            >
              一覧へ戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">企業アカウント発行</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-[760px] space-y-5">
        <div className="rounded-[18px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="会社名"
              required
              value={form.companyName}
              onChange={(value) => setForm({ ...form, companyName: value })}
            />
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">
                法人番号 <span className="text-[#ff3158]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  name="corporateNumber"
                  required
                  value={form.corporateNumber}
                  onChange={(e) =>
                    setForm({ ...form, corporateNumber: e.target.value.replace(/[^\d]/g, "").slice(0, 13) })
                  }
                  className={inputCls}
                  inputMode="numeric"
                  maxLength={13}
                />
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={lookupLoading}
                  className="shrink-0 rounded-[10px] border border-[#d8e0ec] px-4 py-3 text-[13px] font-bold text-[#2f6cff] disabled:opacity-50"
                >
                  {lookupLoading ? "確認中..." : "法人名確認"}
                </button>
              </div>
              <p className="mt-1 text-[12px] text-[#888]">13桁の数字で入力。公式APIが設定されていれば存在確認できるよ!</p>
              {lookupMessage && <p className="mt-2 text-[12px] font-medium text-[#2f6cff]">{lookupMessage}</p>}
            </div>

            <Field
              label="ユーザー名"
              required
              value={form.username}
              onChange={(value) => setForm({ ...form, username: value })}
            />
            <Field
              label="電話番号"
              required
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />

            <Field
              label="姓（担当者）"
              required
              value={form.lastName}
              onChange={(value) => setForm({ ...form, lastName: value })}
            />
            <Field
              label="名（担当者）"
              required
              value={form.firstName}
              onChange={(value) => setForm({ ...form, firstName: value })}
            />

            <div className="md:col-span-2">
              <Field
                label="メールアドレス"
                required
                type="email"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-[13px] font-medium text-[#ff3158]">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-[10px] bg-[#1e293b] px-8 py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "作成中..." : "アカウント発行"}
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">
        {label} {required && <span className="text-[#ff3158]">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[10px] border border-[#d8e0ec] px-4 py-3 text-[14px] outline-none transition focus:border-[#2f6cff]"
      />
    </div>
  );
}

function InfoCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-[14px] px-4 py-4 ${accent ? "bg-[#f3f6ff]" : "bg-[#f8fafc]"}`}>
      <p className="text-[11px] font-semibold text-[#888]">{label}</p>
      <p className={`mt-2 text-[16px] font-bold ${accent ? "text-[#2f6cff]" : "text-[#333]"}`}>{value}</p>
    </div>
  );
}
