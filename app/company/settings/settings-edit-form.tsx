"use client";

import { useState, useTransition } from "react";
import { updateCompanySettings } from "@/app/actions/company/settings";
import { ALL_PREFECTURES } from "@/lib/job-locations";

const INDUSTRY_OPTIONS = [
  "IT・通信・インターネット",
  "メーカー・製造",
  "建設・不動産・設備",
  "医療・福祉・介護",
  "教育・学習支援",
  "小売・流通・物流",
  "飲食・宿泊・サービス",
  "金融・保険",
  "農林水産・鉱業",
  "マスコミ・広告・デザイン",
  "コンサルティング・士業",
  "官公庁・団体",
  "その他",
];

const EMPLOYEE_COUNT_OPTIONS = [
  "1〜10名",
  "11〜30名",
  "31〜100名",
  "101〜300名",
  "301〜1000名",
  "1001名以上",
];

type Props = {
  companyName: string;
  businessDescription: string;
  description: string;
  industry: string;
  employeeCount: string;
  foundedYear: string;
  capital: string;
  websiteUrl: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  contactName: string;
  phone: string;
};

export default function SettingsEditForm(props: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(props);
  const [postalLoading, setPostalLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePostalCode(code: string) {
    setPostalLoading(true);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
      const json = await res.json();
      if (json.results?.[0]) {
        const { address1, address2, address3 } = json.results[0] as {
          address1: string;
          address2: string;
          address3: string;
        };
        setForm((f) => ({
          ...f,
          prefecture: address1,
          city: f.city || [address2, address3].filter(Boolean).join(""),
        }));
      }
    } catch {
      // ignore
    } finally {
      setPostalLoading(false);
    }
  }

  const handleSave = () => {
    const companyName = form.companyName.trim();
    if (!companyName) {
      setError("会社名を入力してください");
      setSuccess(false);
      return;
    }
    if (!form.businessDescription.trim()) {
      setError("事業内容を入力してください");
      setSuccess(false);
      return;
    }

    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateCompanySettings({ ...form, companyName });
        setForm((current) => ({ ...current, companyName }));
        setEditing(false);
        setSuccess(true);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "保存に失敗しました");
      }
    });
  };

  if (!editing) {
    return (
      <button
        onClick={() => {
          setEditing(true);
          setSuccess(false);
          setError(null);
        }}
        className="rounded-[8px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#1d5ae0]"
      >
        編集する
      </button>
    );
  }

  const inputCls = "w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[14px] focus:border-[#2f6cff] focus:outline-none";

  return (
    <div className="space-y-5 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {success && (
        <div className="rounded-[8px] bg-[#d1fae5] px-4 py-3 text-[13px] font-medium text-[#059669]">
          保存しました
        </div>
      )}
      {error && (
        <div className="rounded-[8px] bg-[#fff1f2] px-4 py-3 text-[13px] font-medium text-[#e11d48]">
          {error}
        </div>
      )}

      <h2 className="text-[16px] font-bold text-[#333]">プロフィール編集</h2>

      <Field label="会社名" required>
        <input
          type="text"
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          className={inputCls}
        />
      </Field>

      <Field label="事業内容" required>
        <textarea
          value={form.businessDescription}
          onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
          rows={4}
          className={inputCls}
          placeholder="主要な事業・サービスの内容を入力してください"
        />
      </Field>

      <Field label="会社説明">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className={inputCls}
          placeholder="会社のPRや特徴を入力してください（求職者向けに表示されます）"
        />
      </Field>

      <Field label="業種">
        <select
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
          className={inputCls}
        >
          <option value="">選択してください</option>
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="設立年">
          <input
            type="text"
            value={form.foundedYear}
            onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
            className={inputCls}
            placeholder="例）2010年4月"
          />
        </Field>
        <Field label="従業員数">
          <select
            value={form.employeeCount}
            onChange={(e) => setForm({ ...form, employeeCount: e.target.value })}
            className={inputCls}
          >
            <option value="">選択してください</option>
            {EMPLOYEE_COUNT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Field>
        <Field label="資本金">
          <input
            type="text"
            value={form.capital}
            onChange={(e) => setForm({ ...form, capital: e.target.value })}
            className={inputCls}
            placeholder="例）1000万円"
          />
        </Field>
      </div>

      <Field label="WebサイトURL">
        <input
          type="text"
          value={form.websiteUrl}
          onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
          className={inputCls}
          placeholder="https://example.com"
        />
      </Field>

      {/* 住所 */}
      <div className="space-y-3 rounded-[10px] border border-[#e5e7eb] p-4">
        <p className="text-[13px] font-semibold text-[#555]">所在地 <span className="text-[#ff3158]">*</span></p>

        <Field label="郵便番号">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9-]/g, "");
                setForm({ ...form, postalCode: val });
                const digits = val.replace(/-/g, "");
                if (digits.length === 7) handlePostalCode(digits);
              }}
              className={inputCls}
              placeholder="例）123-4567"
              maxLength={8}
            />
            <button
              type="button"
              onClick={() => {
                const digits = form.postalCode.replace(/-/g, "");
                if (digits.length === 7) handlePostalCode(digits);
              }}
              className="shrink-0 rounded-[5px] bg-[#1d63e3] px-3 py-[9px] text-[13px] font-bold text-white hover:opacity-90 transition"
            >
              {postalLoading ? "検索中..." : "自動入力"}
            </button>
          </div>
        </Field>

        <Field label="都道府県">
          <select
            value={form.prefecture}
            onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
            className={inputCls}
          >
            <option value="">選択してください</option>
            {ALL_PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
        </Field>

        <Field label="市区町村">
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={inputCls}
            placeholder="例）渋谷区道玄坂"
          />
        </Field>

        <Field label="以降の住所">
          <input
            type="text"
            value={form.addressLine}
            onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
            className={inputCls}
            placeholder="例）1-1-1 渋谷スクランブルスクエア 12F"
          />
        </Field>
      </div>

      <Field label="担当者名">
        <input
          type="text"
          value={form.contactName}
          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          className={inputCls}
        />
      </Field>

      <Field label="電話番号">
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputCls}
        />
      </Field>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-[8px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存"}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setForm(props);
            setError(null);
          }}
          className="rounded-[8px] bg-[#e5e7eb] px-5 py-2.5 text-[14px] font-bold text-[#555] hover:bg-[#d1d5db]"
        >
          キャンセル
        </button>
      </div>
    </div>
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
      <label className="mb-1 block text-[13px] font-semibold text-[#555]">
        {label}
        {required && <span className="ml-1 text-[#ff3158]">*</span>}
      </label>
      {children}
    </div>
  );
}
