"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";

type ProfileEditFormProps = {
  name: string;
  email: string;
  phone?: string | null;
  notificationsEnabled: boolean;
  createdAt: Date;
};

export function ProfileEditForm({
  name,
  email,
  phone,
  notificationsEnabled,
  createdAt,
}: ProfileEditFormProps) {
  const [notifications, setNotifications] = useState(notificationsEnabled);
  const [isPending, startTransition] = useTransition();

  const registeredAt = new Date(createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("notificationsEnabled", String(notifications));
    startTransition(() => {
      updateProfile(formData);
    });
  }

  return (
    <section className="border-b border-[#dddddd] pb-8">
      <h1 className="text-[40px] font-bold text-[#333]">マイページ</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-[420px] space-y-4">
        <div>
          <label className="mb-2 block text-[14px] font-bold text-[#333]">
            氏名 *
          </label>
          <input
            name="name"
            defaultValue={name}
            required
            className="h-[48px] w-full rounded-[8px] border border-[#d1d1d1] bg-white px-4 text-[16px] outline-none"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-bold text-[#333]">
            メールアドレス *
          </label>
          <input
            name="email"
            type="email"
            defaultValue={email}
            required
            className="h-[48px] w-full rounded-[8px] border border-[#d1d1d1] bg-white px-4 text-[16px] outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-bold text-[#333]">
            電話番号 *
          </label>
          <input
            name="phone"
            defaultValue={phone ?? ""}
            className="h-[48px] w-full rounded-[8px] border border-[#d1d1d1] bg-white px-4 text-[16px] outline-none"
            placeholder="090-0000-0000"
          />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-bold text-[#333]">
            通知設定*
          </label>
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
          className="mt-2 w-full rounded-[10px] bg-[#2f6cff] px-6 py-4 text-[16px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "保存中..." : "決定する"}
        </button>
      </form>

      <p className="mt-4 text-right text-[12px] text-[#999]">登録日 {registeredAt}</p>
    </section>
  );
}
