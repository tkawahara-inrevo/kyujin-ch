"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/user/delete-account";

export function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await deleteAccount();
    });
  }

  return (
    <>
      <section className="mt-12 border-t border-[#ddd] pt-10">
        <h2 className="text-[16px] font-bold text-[#333]">退会</h2>
        <p className="mt-2 text-[13px] text-[#888]">
          退会するとアカウント情報は匿名化されます。退会から30日後にデータが完全に削除されます。
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 rounded-[8px] border border-[#ccc] px-5 py-2 text-[13px] text-[#888] transition hover:border-[#e00] hover:text-[#e00]"
        >
          退会する
        </button>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-[440px] rounded-[16px] bg-white p-8">
            <h3 className="text-[18px] font-bold text-[#1a1a1a]">退会の確認</h3>
            <p className="mt-4 text-[14px] leading-relaxed text-[#555]">
              退会すると以下の処理が行われます。
            </p>
            <ul className="mt-3 space-y-1 text-[13px] text-[#666]">
              <li>・ 氏名・メールアドレス・電話番号が削除されます</li>
              <li>・ 応募履歴は「退会済みユーザー」として残ります</li>
              <li>・ 30日後にデータが完全に削除されます</li>
            </ul>
            <p className="mt-4 text-[13px] font-bold text-[#e00]">
              この操作は取り消せません。よろしいですか？
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 rounded-[8px] border border-[#ccc] py-3 text-[14px] text-[#555] transition hover:bg-[#f5f5f5]"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 rounded-[8px] bg-[#e00] py-3 text-[14px] font-bold text-white transition hover:bg-[#c00] disabled:opacity-50"
              >
                {isPending ? "処理中..." : "退会する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
