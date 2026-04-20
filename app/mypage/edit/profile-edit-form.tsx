"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";
import { ALL_PREFECTURES } from "@/lib/job-locations";

type Props = {
  lastName?: string | null;
  firstName?: string | null;
  lastNameKana?: string | null;
  firstNameKana?: string | null;
  birthDate?: Date | null;
  gender?: string | null;
  email: string;
  phone?: string | null;
  postalCode?: string | null;
  prefecture?: string | null;
  cityTown?: string | null;
  addressLine?: string | null;
  notificationsEnabled: boolean;
  createdAt: Date;
};

const inputCls = "h-[48px] w-full rounded-[8px] border border-[#d1d1d1] bg-white px-4 text-[15px] outline-none focus:border-[#2f6cff]";
const labelCls = "mb-1.5 block text-[13px] font-bold text-[#444]";

export function ProfileEditForm({
  lastName,
  firstName,
  lastNameKana,
  firstNameKana,
  birthDate,
  gender,
  email,
  phone,
  postalCode,
  prefecture,
  cityTown,
  addressLine,
  notificationsEnabled,
  createdAt,
}: Props) {
  const [notifications, setNotifications] = useState(notificationsEnabled);
  const [postalVal, setPostalVal] = useState(postalCode ?? "");
  const [prefVal, setPrefVal] = useState(prefecture ?? "");
  const [cityVal, setCityVal] = useState(cityTown ?? "");
  const [postalLoading, setPostalLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const registeredAt = new Date(createdAt).toLocaleDateString("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });

  const birthDateStr = birthDate
    ? new Date(birthDate).toISOString().slice(0, 10)
    : "";

  async function handlePostalLookup(code: string) {
    const digits = code.replace(/-/g, "");
    if (digits.length !== 7) return;
    setPostalLoading(true);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
      const json = await res.json();
      if (json.results?.[0]) {
        const { address1, address2, address3 } = json.results[0] as { address1: string; address2: string; address3: string };
        setPrefVal(address1);
        setCityVal([address2, address3].filter(Boolean).join(""));
      }
    } catch {
      // ignore
    } finally {
      setPostalLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("notificationsEnabled", String(notifications));
    formData.set("postalCode", postalVal);
    formData.set("prefecture", prefVal);
    formData.set("cityTown", cityVal);
    startTransition(() => { updateProfile(formData); });
  }

  return (
    <section className="border-b border-[#dddddd] pb-8">
      <h1 className="text-[22px] font-bold text-[#333]">プロフィール編集</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-[520px] space-y-5">

        {/* 姓名 */}
        <div>
          <p className={labelCls}>姓 / 名</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input name="lastName" defaultValue={lastName ?? ""} className={inputCls} placeholder="山田" />
            </div>
            <div>
              <input name="firstName" defaultValue={firstName ?? ""} className={inputCls} placeholder="太郎" />
            </div>
          </div>
        </div>

        {/* ふりがな */}
        <div>
          <p className={labelCls}>姓 / 名（ふりがな）</p>
          <div className="grid grid-cols-2 gap-3">
            <input name="lastNameKana" defaultValue={lastNameKana ?? ""} className={inputCls} placeholder="やまだ" />
            <input name="firstNameKana" defaultValue={firstNameKana ?? ""} className={inputCls} placeholder="たろう" />
          </div>
        </div>

        {/* 生年月日・性別 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>生年月日</label>
            <input
              type="date"
              name="birthDate"
              defaultValue={birthDateStr}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>性別</label>
            <select name="gender" defaultValue={gender ?? ""} className={`${inputCls} cursor-pointer`}>
              <option value="">選択してください</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>

        {/* メールアドレス */}
        <div>
          <label className={labelCls}>メールアドレス <span className="text-[#eb0937]">*</span></label>
          <input name="email" type="email" defaultValue={email} required className={inputCls} />
        </div>

        {/* 電話番号 */}
        <div>
          <label className={labelCls}>電話番号</label>
          <input name="phone" defaultValue={phone ?? ""} className={inputCls} placeholder="090-0000-0000" />
        </div>

        {/* 住所 */}
        <div className="space-y-3">
          <p className={labelCls}>住所</p>
          {/* 郵便番号 */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={postalVal}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9-]/g, "");
                setPostalVal(val);
                const digits = val.replace(/-/g, "");
                if (digits.length === 7) handlePostalLookup(digits);
              }}
              className={`${inputCls} max-w-[180px]`}
              placeholder="123-4567"
              maxLength={8}
            />
            <button
              type="button"
              onClick={() => handlePostalLookup(postalVal)}
              className="shrink-0 rounded-[6px] bg-[#2f6cff] px-3 py-2 text-[13px] font-bold text-white hover:opacity-90 transition"
            >
              {postalLoading ? "検索中..." : "自動入力"}
            </button>
          </div>
          {/* 都道府県 */}
          <select
            value={prefVal}
            onChange={(e) => setPrefVal(e.target.value)}
            className={`${inputCls} cursor-pointer`}
          >
            <option value="">都道府県を選択</option>
            {ALL_PREFECTURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {/* 市区町村 */}
          <input
            type="text"
            value={cityVal}
            onChange={(e) => setCityVal(e.target.value)}
            className={inputCls}
            placeholder="市区町村"
          />
          {/* それ以下 */}
          <input
            name="addressLine"
            defaultValue={addressLine ?? ""}
            className={inputCls}
            placeholder="番地・建物名・部屋番号"
          />
        </div>

        {/* 通知設定 */}
        <div>
          <label className={labelCls}>通知設定</label>
          <button
            type="button"
            onClick={() => setNotifications((prev) => !prev)}
            className="relative h-[28px] w-[44px] rounded-full transition-colors"
            style={{ backgroundColor: notifications ? "#2f6cff" : "#ccc" }}
          >
            <span
              className="absolute top-[2px] h-[24px] w-[24px] rounded-full bg-white transition-transform"
              style={{ left: notifications ? "18px" : "2px" }}
            />
          </button>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[10px] bg-[#2f6cff] px-6 py-4 text-[16px] font-bold !text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "保存中..." : "保存する"}
        </button>
      </form>

      <p className="mt-4 text-right text-[12px] text-[#999]">登録日 {registeredAt}</p>
    </section>
  );
}
