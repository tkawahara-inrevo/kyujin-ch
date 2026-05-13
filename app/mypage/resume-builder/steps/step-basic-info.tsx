"use client";

import { useState } from "react";
import { ALL_PREFECTURES } from "@/lib/job-locations";
import type { WizardState } from "../resume-wizard";

type Props = {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
};

const inputCls = "h-[44px] w-full rounded-lg border border-[#d1d1d1] bg-white px-3 text-[14px] outline-none focus:border-[#2f6cff]";
const labelCls = "mb-1.5 block text-[13px] font-bold text-[#444]";

export function StepBasicInfo({ state, update, onNext, onBack }: Props) {
  const [postalLoading, setPostalLoading] = useState(false);

  async function handlePostalLookup() {
    const digits = state.postalCode.replace(/-/g, "");
    if (digits.length !== 7) return;
    setPostalLoading(true);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
      const json = await res.json();
      if (json.results?.[0]) {
        const { address1, address2, address3 } = json.results[0];
        update({ prefecture: address1, cityTown: [address2, address3].filter(Boolean).join("") });
      }
    } finally {
      setPostalLoading(false);
    }
  }

  const isValid =
    state.lastName.trim() &&
    state.firstName.trim() &&
    state.email.trim();

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold text-[#1f2937]">基本情報の確認</h2>
      <p className="mb-6 text-[13px] text-[#6b7280]">
        登録済みの情報を自動で反映しています。必要に応じて修正してください。
      </p>

      <div className="space-y-5">
        {/* 氏名 */}
        <div>
          <p className={labelCls}>氏名 <span className="text-[#eb0937]">*</span></p>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={state.lastName}
              onChange={(e) => update({ lastName: e.target.value })}
              className={inputCls}
              placeholder="山田"
            />
            <input
              value={state.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
              className={inputCls}
              placeholder="太郎"
            />
          </div>
        </div>

        {/* ふりがな */}
        <div>
          <p className={labelCls}>ふりがな</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={state.lastNameKana}
              onChange={(e) => update({ lastNameKana: e.target.value })}
              className={inputCls}
              placeholder="やまだ"
            />
            <input
              value={state.firstNameKana}
              onChange={(e) => update({ firstNameKana: e.target.value })}
              className={inputCls}
              placeholder="たろう"
            />
          </div>
        </div>

        {/* 生年月日・性別 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>生年月日</label>
            <input
              type="date"
              value={state.birthDate}
              onChange={(e) => update({ birthDate: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>性別</label>
            <select
              value={state.gender}
              onChange={(e) => update({ gender: e.target.value })}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="">選択</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
              <option value="未記載">未記載</option>
            </select>
          </div>
        </div>

        {/* メール・電話 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>メールアドレス <span className="text-[#eb0937]">*</span></label>
            <input
              type="email"
              value={state.email}
              onChange={(e) => update({ email: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>電話番号</label>
            <input
              value={state.phone}
              onChange={(e) => update({ phone: e.target.value })}
              className={inputCls}
              placeholder="090-0000-0000"
            />
          </div>
        </div>

        {/* 住所 */}
        <div>
          <p className={labelCls}>住所</p>
          <div className="flex items-center gap-2 mb-2">
            <input
              value={state.postalCode}
              onChange={(e) => update({ postalCode: e.target.value })}
              className={`${inputCls} max-w-[160px]`}
              placeholder="123-4567"
              maxLength={8}
            />
            <button
              type="button"
              onClick={handlePostalLookup}
              className="shrink-0 rounded-lg bg-[#2f6cff] px-3 py-2 text-[12px] font-bold text-white hover:opacity-90 transition"
            >
              {postalLoading ? "..." : "自動入力"}
            </button>
          </div>
          <select
            value={state.prefecture}
            onChange={(e) => update({ prefecture: e.target.value })}
            className={`${inputCls} cursor-pointer mb-2`}
          >
            <option value="">都道府県</option>
            {ALL_PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            value={state.cityTown}
            onChange={(e) => update({ cityTown: e.target.value })}
            className={`${inputCls} mb-2`}
            placeholder="市区町村"
          />
          <input
            value={state.addressLine}
            onChange={(e) => update({ addressLine: e.target.value })}
            className={inputCls}
            placeholder="番地・建物名・部屋番号"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-[#d1d5db] px-6 py-2.5 text-[14px] text-[#555] hover:bg-[#f9fafb] transition">
          ← 戻る
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="rounded-lg bg-[#2f6cff] px-8 py-3 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
