"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteCompanyMember, removeCompanyMember } from "@/app/actions/company/members";

type Member = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
};

export function MembersSection({ members, currentUserId }: { members: Member[]; currentUserId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        await inviteCompanyMember(email, name);
        setSuccess(`${email} に初期パスワードを送信しました`);
        setEmail("");
        setName("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "発行に失敗しました");
      }
    });
  }

  function handleRemove(memberId: string, memberEmail: string) {
    if (!confirm(`${memberEmail} を削除しますか？`)) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        await removeCompanyMember(memberId);
        setSuccess("メンバーを削除しました");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "削除に失敗しました");
      }
    });
  }

  return (
    <div className="mt-8 rounded-[16px] border border-[#e8edf5] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="text-[18px] font-bold text-[#2b2f38]">アカウント管理</h2>
      <p className="mt-1 text-[13px] text-[#666]">同じ企業の複数メンバーがログインできます。全員フル権限です。</p>

      {error && (
        <div className="mt-4 rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#dc2626]">{error}</div>
      )}
      {success && (
        <div className="mt-4 rounded-[8px] bg-[#ecfdf5] px-4 py-3 text-[13px] font-medium text-[#047857]">{success}</div>
      )}

      {/* メンバー一覧 */}
      <ul className="mt-5 divide-y divide-[#eef0f5] rounded-[10px] border border-[#eef0f5]">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#2b2f38]">{m.name || "(名前未設定)"}</p>
              <p className="text-[12px] text-[#888]">{m.email}</p>
            </div>
            <span className="shrink-0 text-[11px] text-[#888]">{new Date(m.createdAt).toLocaleDateString("ja-JP")}</span>
            {m.id !== currentUserId && (
              <button
                type="button"
                onClick={() => handleRemove(m.id, m.email)}
                disabled={isPending}
                className="shrink-0 rounded-[8px] border border-[#fca5a5] px-3 py-1 text-[12px] font-medium text-[#dc2626] hover:bg-[#fff5f5] transition disabled:opacity-50"
              >
                削除
              </button>
            )}
            {m.id === currentUserId && (
              <span className="shrink-0 rounded-full bg-[#eff6ff] px-2 py-0.5 text-[11px] font-bold text-[#2563eb]">あなた</span>
            )}
          </li>
        ))}
      </ul>

      {/* 招待フォーム */}
      <form onSubmit={handleInvite} className="mt-5 space-y-3">
        <p className="text-[13px] font-bold text-[#333]">新しいメンバーを追加</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="お名前"
            className="rounded-[6px] border border-[#d0d7e6] px-3 py-2 text-[14px] outline-none focus:border-[#1d63e3]"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="rounded-[6px] border border-[#d0d7e6] px-3 py-2 text-[14px] outline-none focus:border-[#1d63e3]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[8px] bg-[#1d63e3] px-5 py-2 text-[14px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "発行中..." : "アカウント発行"}
        </button>
        <p className="text-[12px] text-[#888]">初期パスワードが入力したメールアドレスに送信されます。</p>
      </form>
    </div>
  );
}
