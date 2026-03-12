"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { issueCompanyAccount } from "@/app/actions/admin/accounts";

export default function AdminCompanyNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await issueCompanyAccount({
        companyName: fd.get("companyName") as string,
        email: fd.get("email") as string,
        password: fd.get("password") as string,
        contactName: fd.get("contactName") as string,
        location: fd.get("location") as string,
        description: fd.get("description") as string,
        websiteUrl: fd.get("websiteUrl") as string,
      });
      router.push("/admin/companies");
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-[8px] border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#1e293b]";

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">企業アカウント発行</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-[600px] space-y-5">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">企業名 <span className="text-[#ff3158]">*</span></label>
          <input name="companyName" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">担当者氏名 <span className="text-[#ff3158]">*</span></label>
          <input name="contactName" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">メールアドレス <span className="text-[#ff3158]">*</span></label>
          <input name="email" type="email" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">パスワード <span className="text-[#ff3158]">*</span></label>
          <input name="password" type="password" required minLength={8} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">所在地</label>
          <input name="location" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">WebサイトURL</label>
          <input name="websiteUrl" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">企業説明</label>
          <textarea name="description" rows={4} className={inputCls} />
        </div>

        {error && <p className="text-[13px] font-medium text-[#ff3158]">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="rounded-[10px] bg-[#1e293b] px-8 py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50">
            {loading ? "作成中..." : "アカウント発行"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-[10px] border border-[#ddd] px-8 py-3 text-[14px] font-medium text-[#666] hover:bg-[#f7f7f7]">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
