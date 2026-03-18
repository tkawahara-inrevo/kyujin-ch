"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitInquiry } from "@/app/actions/inquiries";

type Props = {
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string;
};

export default function ContactForm({ defaultName, defaultPhone, defaultEmail }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    category: "QUESTION" as "QUESTION" | "BUG_REPORT",
    name: defaultName,
    phone: defaultPhone,
    email: defaultEmail,
    body: "",
  });

  const inputCls =
    "w-full rounded-[12px] border border-[#d8e0ec] px-4 py-3 text-[14px] outline-none transition focus:border-[#2f6cff]";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setWarning("");
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await submitInquiry(form);
        setSuccess(true);
        setWarning(result.mailWarning);
        setForm((current) => ({ ...current, body: "", category: "QUESTION" }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "送信に失敗しました");
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-[18px] bg-[#f8fafc] p-6">
        <h2 className="text-[22px] font-bold text-[#1e293b]">送信できたよ!</h2>
        <p className="mt-3 text-[14px] leading-7 text-[#555]">
          お問い合わせを受け付けました。確認後、必要に応じてご連絡します!
        </p>
        {warning && <p className="mt-3 text-[13px] font-medium text-[#b7791f]">{warning}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="rounded-[10px] bg-[#2f6cff] px-5 py-3 text-[14px] font-bold text-white"
          >
            続けて送る
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-[10px] border border-[#d8e0ec] px-5 py-3 text-[14px] font-bold text-[#555]"
          >
            トップへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">カテゴリ</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as "QUESTION" | "BUG_REPORT" })}
          className={inputCls}
        >
          <option value="QUESTION">質問</option>
          <option value="BUG_REPORT">不具合報告</option>
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="お名前" required value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <Field label="電話番号" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
      </div>

      <Field
        label="メールアドレス"
        required
        type="email"
        value={form.email}
        onChange={(value) => setForm({ ...form, email: value })}
      />

      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">
          お問い合わせ内容 <span className="text-[#ff3158]">*</span>
        </label>
        <textarea
          required
          rows={8}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className={inputCls}
        />
      </div>

      {error && <p className="text-[13px] font-medium text-[#ff3158]">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[10px] bg-[#1e293b] px-8 py-3 text-[14px] font-bold text-white disabled:opacity-50"
        >
          {isPending ? "送信中..." : "送信する"}
        </button>
      </div>
    </form>
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
        className="w-full rounded-[12px] border border-[#d8e0ec] px-4 py-3 text-[14px] outline-none transition focus:border-[#2f6cff]"
      />
    </div>
  );
}
