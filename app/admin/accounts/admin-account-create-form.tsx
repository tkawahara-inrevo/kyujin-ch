"use client";

import { useState, useTransition } from "react";
import { createAdminAccount } from "@/app/actions/admin/admin-accounts";
import { EMPTY_PERMISSIONS } from "@/lib/admin-permissions";
import type { AdminPermissions } from "@/lib/admin-permissions";

type Props = {
  permissionLabels: Record<keyof AdminPermissions, string>;
};

export default function AdminAccountCreateForm({ permissionLabels }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<AdminPermissions>({ ...EMPTY_PERMISSIONS });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleAll = (value: boolean) => {
    setPermissions(
      Object.fromEntries(Object.keys(permissions).map((k) => [k, value])) as AdminPermissions
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await createAdminAccount({ username, email, password, permissions });
        setUsername("");
        setEmail("");
        setPassword("");
        setPermissions({ ...EMPTY_PERMISSIONS });
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "作成に失敗しました");
      }
    });
  };

  const inputCls =
    "w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[14px] focus:border-[#2f6cff] focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-[8px] bg-[#fff1f2] px-4 py-3 text-[13px] font-medium text-[#e11d48]">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-[8px] bg-[#d1fae5] px-4 py-3 text-[13px] font-medium text-[#059669]">
          アカウントを作成しました
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-[13px] font-semibold text-[#555]">
            管理者ID <span className="text-[#ff3158]">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            placeholder="半角英数字"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-[13px] font-semibold text-[#555]">
            メールアドレス <span className="text-[#ff3158]">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-[13px] font-semibold text-[#555]">
            パスワード <span className="text-[#ff3158]">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="8文字以上"
            required
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[13px] font-semibold text-[#555]">権限設定</label>
          <div className="flex gap-3 text-[12px]">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="text-[#2f6cff] hover:underline"
            >
              全て有効
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="text-[#888] hover:underline"
            >
              全て無効
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-[10px] border border-[#e5e7eb] p-4 sm:grid-cols-3 md:grid-cols-5">
          {(Object.keys(permissionLabels) as (keyof AdminPermissions)[]).map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={permissions[key]}
                onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                className="h-4 w-4 rounded border-[#d1d5db] accent-[#2f6cff]"
              />
              <span className="text-[13px] text-[#444]">{permissionLabels[key]}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-[8px] bg-[#2f6cff] px-6 py-2.5 text-[14px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
      >
        {isPending ? "作成中..." : "アカウントを作成"}
      </button>
    </form>
  );
}
