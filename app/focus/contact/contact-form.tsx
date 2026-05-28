"use client";

import { useState, useTransition } from "react";
import { submitFocusInquiry } from "@/app/actions/focus-inquiry";

const REASONS = [
  { value: "posting", label: "掲載希望" },
  { value: "talk", label: "話を聞きたい" },
  { value: "other", label: "そのほか" },
] as const;

const inputCls = "w-full rounded-lg border border-[#d7dee9] px-4 py-3 text-[15px] outline-none focus:border-[#1f2775]";
const labelCls = "mb-2 block text-[14px] font-bold text-[#333]";

export function FocusContactForm() {
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("posting");
  const [other, setOther] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await submitFocusInquiry({ companyName, name, phone, reason, other });
        setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "送信に失敗しました");
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-[20px] font-bold text-[#1f2775]">お問い合わせを受け付けました</p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
          内容を確認のうえ、担当者よりご連絡いたします。<br />
          ありがとうございました。
        </p>
        <a href="/focus" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1f2775] px-8 py-3 text-[14px] font-bold text-white transition hover:opacity-90">
          記事一覧に戻る
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm md:p-8">
      <div>
        <label className={labelCls}>会社名 <span className="text-[#eb0937]">*</span></label>
        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={inputCls} placeholder="株式会社○○" />
      </div>

      <div>
        <label className={labelCls}>お名前 <span className="text-[#eb0937]">*</span></label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="山田 太郎" />
      </div>

      <div>
        <label className={labelCls}>電話番号 <span className="text-[#eb0937]">*</span></label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} placeholder="090-0000-0000" />
      </div>

      <div>
        <label className={labelCls}>お問い合わせ理由 <span className="text-[#eb0937]">*</span></label>
        <div className="flex flex-col gap-2">
          {REASONS.map((r) => (
            <label key={r.value} className="flex cursor-pointer items-center gap-2 text-[15px] text-[#333]">
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>そのほか（ご質問・ご要望など）</label>
        <textarea value={other} onChange={(e) => setOther(e.target.value)} rows={5} className={`${inputCls} resize-none`} placeholder="ご自由にご記入ください" />
      </div>

      {error && <p className="text-[14px] font-bold text-[#eb0937]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-[#1f2775] py-3.5 text-[16px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
