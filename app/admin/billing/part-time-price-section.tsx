"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertPartTimeFixedPrice } from "@/app/actions/admin/prices";

type Props = {
  initialPrice: number;
  initialPriceInexp: number | null;
};

export default function PartTimePriceSection({ initialPrice, initialPriceInexp }: Props) {
  const router = useRouter();
  const [price, setPrice] = useState(String(initialPrice));
  const [priceInexp, setPriceInexp] = useState(initialPriceInexp != null ? String(initialPriceInexp) : "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError("");
    setSuccess(false);
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) {
      setError("正しい金額を入力してください");
      return;
    }
    const pi = priceInexp.trim() ? Number(priceInexp) : null;
    if (pi !== null && (!Number.isFinite(pi) || pi < 0)) {
      setError("未経験者料金は正しい金額か空欄で");
      return;
    }
    startTransition(async () => {
      try {
        await upsertPartTimeFixedPrice(p, pi);
        setSuccess(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました");
      }
    });
  }

  return (
    <section className="mt-8 rounded-[12px] border border-[#fde68a] bg-[#fffbeb] p-5">
      <h2 className="text-[16px] font-bold text-[#92400e]">アルバイト・インターン 一律固定料金</h2>
      <p className="mt-1 text-[12px] text-[#92400e]">
        対象タイプが「アルバイト・インターン」の求人に適用される固定料金です。
      </p>

      {error && <p className="mt-3 text-[12px] text-[#dc2626]">{error}</p>}
      {success && <p className="mt-3 text-[12px] text-[#047857]">保存しました</p>}

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-[12px] font-bold text-[#92400e]">料金（経験者・必須）</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-[160px] rounded-[6px] border border-[#d6b67e] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#92400e]"
              min={0}
            />
            <span className="text-[13px] text-[#92400e]">円</span>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-bold text-[#92400e]">未経験者料金（任意）</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              value={priceInexp}
              onChange={(e) => setPriceInexp(e.target.value)}
              className="w-[160px] rounded-[6px] border border-[#d6b67e] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#92400e]"
              min={0}
              placeholder="空欄で経験者と同額"
            />
            <span className="text-[13px] text-[#92400e]">円</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-[8px] bg-[#92400e] px-5 py-2 text-[13px] font-bold text-white hover:opacity-90 transition disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存"}
        </button>
      </div>
    </section>
  );
}
