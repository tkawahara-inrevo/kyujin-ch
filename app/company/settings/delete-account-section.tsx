"use client";

import { useState, useTransition } from "react";
import { deleteCompanyAccount } from "@/app/actions/company/delete-account";

export function CompanyDeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirmed) return;
    startTransition(async () => {
      await deleteCompanyAccount();
    });
  }

  return (
    <section className="mt-12 border-t border-[#dddddd] pt-10">
      <h2 className="text-[18px] font-bold text-[#333]">退会</h2>
      <p className="mt-2 text-[13px] text-[#888]">
        退会するとアカウントと全ての求人が非公開になります。この操作は取り消せません。
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-lg border border-[#ef4444] px-5 py-2 text-[13px] font-bold text-[#ef4444] transition hover:bg-[#fef2f2]"
        >
          退会する
        </button>
      ) : (
        <div className="mt-4 rounded-xl border border-[#ef4444] bg-[#fef2f2] p-5">
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">退会の確認</h3>
          <p className="mt-2 text-[13px] text-[#555]">退会すると以下の処理が行われます：</p>
          <ul className="mt-2 space-y-1 text-[13px] text-[#555]">
            <li>・ 掲載中の求人がすべて非公開になります</li>
            <li>・ 企業アカウントが無効化されます</li>
            <li>・ 応募者とのメッセージ履歴は記録として残ります</li>
          </ul>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-[13px] font-bold text-[#333]">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            上記の内容を確認しました
          </label>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!confirmed || isPending}
              className="rounded-lg bg-[#ef4444] px-5 py-2 text-[13px] font-bold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {isPending ? "処理中..." : "退会する"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setConfirmed(false); }}
              className="rounded-lg border border-[#d1d5db] px-5 py-2 text-[13px] text-[#555] transition hover:bg-[#f9fafb]"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
