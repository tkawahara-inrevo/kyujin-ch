"use client";

import { useState, useTransition } from "react";
import {
  updateAdminPermissions,
  toggleAdminActive,
  deleteAdminAccount,
} from "@/app/actions/admin/admin-accounts";
import type { AdminPermissions } from "@/lib/admin-permissions";

type Account = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  isActive: boolean;
  permissions: AdminPermissions;
  createdAt: Date;
};

type Props = {
  account: Account;
  permissionLabels: Record<keyof AdminPermissions, string>;
};

export default function AdminAccountCard({ account, permissionLabels }: Props) {
  const [permissions, setPermissions] = useState<AdminPermissions>(account.permissions);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateAdminPermissions(account.id, permissions);
        setSaved(true);
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "保存に失敗しました");
      }
    });
  };

  const handleToggleActive = () => {
    startTransition(async () => {
      await toggleAdminActive(account.id, !account.isActive);
    });
  };

  const handleDelete = () => {
    if (!confirm(`「${account.username ?? account.name}」を削除しますか？`)) return;
    startTransition(async () => {
      await deleteAdminAccount(account.id);
    });
  };

  const toggleAll = (value: boolean) => {
    setPermissions(
      Object.fromEntries(Object.keys(permissions).map((k) => [k, value])) as AdminPermissions
    );
  };

  return (
    <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-[#333]">
              {account.username ?? account.name}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                account.isActive
                  ? "bg-[#d1fae5] text-[#059669]"
                  : "bg-[#f3f4f6] text-[#888]"
              }`}
            >
              {account.isActive ? "有効" : "無効"}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-[#888]">{account.email}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => { setEditing(!editing); setSaved(false); setError(null); }}
            className="rounded-[6px] bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-semibold text-[#555] hover:bg-[#e5e7eb]"
          >
            {editing ? "キャンセル" : "権限編集"}
          </button>
          <button
            onClick={handleToggleActive}
            disabled={isPending}
            className="rounded-[6px] bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-semibold text-[#555] hover:bg-[#e5e7eb] disabled:opacity-50"
          >
            {account.isActive ? "無効化" : "有効化"}
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-[6px] bg-[#fff1f2] px-3 py-1.5 text-[12px] font-semibold text-[#e11d48] hover:bg-[#ffe4e6] disabled:opacity-50"
          >
            削除
          </button>
        </div>
      </div>

      {!editing && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.keys(permissionLabels) as (keyof AdminPermissions)[]).map((key) => (
            <span
              key={key}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                account.permissions[key]
                  ? "bg-[#2f6cff]/10 text-[#2f6cff]"
                  : "bg-[#f3f4f6] text-[#bbb]"
              }`}
            >
              {permissionLabels[key]}
            </span>
          ))}
        </div>
      )}

      {editing && (
        <div className="mt-4 space-y-3">
          {error && (
            <p className="text-[13px] font-medium text-[#e11d48]">{error}</p>
          )}
          {saved && (
            <p className="text-[13px] font-medium text-[#059669]">保存しました</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#555]">権限設定</span>
            <div className="flex gap-3 text-[12px]">
              <button type="button" onClick={() => toggleAll(true)} className="text-[#2f6cff] hover:underline">
                全て有効
              </button>
              <button type="button" onClick={() => toggleAll(false)} className="text-[#888] hover:underline">
                全て無効
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-[10px] border border-[#e5e7eb] p-3 sm:grid-cols-3 md:grid-cols-5">
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
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-[8px] bg-[#2f6cff] px-5 py-2 text-[13px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
          >
            {isPending ? "保存中..." : "保存"}
          </button>
        </div>
      )}
    </div>
  );
}
