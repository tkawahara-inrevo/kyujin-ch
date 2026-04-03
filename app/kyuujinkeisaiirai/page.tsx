"use client";

import { useState } from "react";
import { submitCompanyRequest } from "@/app/actions/public/company-request";

export default function CompanyRequestPage() {
  const [fields, setFields] = useState({
    corporateNumber: "",
    companyName: "",
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">アカウントを発行しました</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📩</div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">掲載依頼を受け付けました</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            内容を確認のうえ、担当者より改めてご連絡いたします。
            <br />
            今しばらくお待ちください。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">求人掲載依頼</h1>
        <p className="text-sm text-gray-500 mb-8">
          以下のフォームに必要事項をご入力のうえ、送信してください。
          <br />
          法人番号をもとに会社名が確認できた場合、自動でアカウントを発行します。
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="法人番号" required>
            <input
              type="text"
              name="corporateNumber"
              value={fields.corporateNumber}
              onChange={handleChange}
              placeholder="1234567890123"
              maxLength={13}
              inputMode="numeric"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">ハイフンなしの13桁</p>
          </Field>

          <Field label="会社名" required>
            <input
              type="text"
              name="companyName"
              value={fields.companyName}
              onChange={handleChange}
              placeholder="株式会社〇〇"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="姓" required>
              <input
                type="text"
                name="lastName"
                value={fields.lastName}
                onChange={handleChange}
                placeholder="山田"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </Field>
            <Field label="名" required>
              <input
                type="text"
                name="firstName"
                value={fields.firstName}
                onChange={handleChange}
                placeholder="太郎"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </Field>
          </div>

          <Field label="メールアドレス" required>
            <input
              type="email"
              name="email"
              value={fields.email}
              onChange={handleChange}
              placeholder="info@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </Field>

          <Field label="電話番号" required>
            <input
              type="tel"
              name="phone"
              value={fields.phone}
              onChange={handleChange}
              placeholder="03-0000-0000"
              inputMode="tel"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg py-3 text-sm transition-colors"
          >
            {isPending ? "送信中..." : "送信する"}
          </button>
        </form>
      </div>
    </main>
  );
}

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
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
