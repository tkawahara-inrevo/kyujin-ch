"use client";

import { useState } from "react";
import { submitCompanyRequest } from "@/app/actions/public/company-request";

export default function KeisaiIraiPage() {
  const [fields, setFields] = useState({
    companyName: "",
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
    corporateNumber: "",
    address: "",
  });
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"issued" | "contact_later" | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const res = await submitCompanyRequest(fields);
      if (res.status === "error") {
        setError(res.message);
      } else {
        setResult(res.status);
      }
    } catch {
      setError("送信に失敗しました。しばらく後でお試しください。");
    } finally {
      setIsPending(false);
    }
  }

  if (result === "issued") {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center py-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">アカウントを発行しました</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            ご登録いただいたメールアドレスに、ログイン情報をお送りしました。
            <br />
            メールをご確認のうえ、ログインしてください。
          </p>
        </div>
      </main>
    );
  }

  if (result === "contact_later") {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center py-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">掲載依頼を受け付けました</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            内容を確認のうえ、担当者より改めてご連絡いたします。
            <br />
            今しばらくお待ちください。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-14">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[28px] font-bold text-gray-900 text-center mb-4">
          求人掲載依頼はこちら
        </h1>
        <p className="text-center text-sm text-blue-500 mb-10">
          求人の掲載を希望する方は下記フォームに情報を記入してください
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="会社名" required>
            <input
              type="text"
              name="companyName"
              value={fields.companyName}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="姓" required>
              <input
                type="text"
                name="lastName"
                value={fields.lastName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </Field>
            <Field label="名" required>
              <input
                type="text"
                name="firstName"
                value={fields.firstName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="電話番号" required>
              <input
                type="tel"
                name="phone"
                value={fields.phone}
                onChange={handleChange}
                inputMode="tel"
                className={inputClass}
                required
              />
            </Field>
            <Field label="メールアドレス" required>
              <input
                type="email"
                name="email"
                value={fields.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </Field>
          </div>

          <Field label="法人番号" required>
            <input
              type="text"
              name="corporateNumber"
              value={fields.corporateNumber}
              onChange={handleChange}
              placeholder="ハイフンなしの13桁"
              maxLength={13}
              inputMode="numeric"
              className={inputClass}
              required
            />
          </Field>

          <Field label="本社所在地" required>
            <input
              type="text"
              name="address"
              value={fields.address}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#f07050] hover:bg-[#e05f40] disabled:bg-[#f0a090] text-white font-semibold rounded-lg px-8 py-2.5 text-sm transition-colors"
            >
              {isPending ? "送信中..." : "送信"}
            </button>
            {isPending && (
              <p className="mt-3 text-xs text-gray-400">
                法人情報を確認しています。完了まで数十秒かかる場合があります。そのままお待ちください。
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "w-full bg-[#eef3f8] border-0 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
