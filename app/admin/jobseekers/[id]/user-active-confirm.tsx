"use client";

import { useState, useTransition } from "react";
import { toggleUserActive } from "@/app/actions/admin/accounts";

export function UserActiveToggleWithConfirm({
  userId,
  isActive,
  userName,
}: {
  userId: string;
  isActive: boolean;
  userName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleToggle() {
    setShowConfirm(false);
    startTransition(() => toggleUserActive(userId, !isActive));
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition ${
          isActive
            ? "bg-[#d1fae5] text-[#059669] hover:bg-[#a7f3d0]"
            : "bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca]"
        } disabled:opacity-50`}
      >
        {isActive ? "有効" : "無効"}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-[400px] rounded-xl bg-white p-6">
            <h3 className="text-[16px] font-bold text-[#333]">ステータス変更の確認</h3>
            <p className="mt-2 text-[14px] text-[#666]">
              <strong>{userName}</strong> のアカウントを
              <strong className={isActive ? "text-[#dc2626]" : "text-[#059669]"}>
                {isActive ? "無効" : "有効"}
              </strong>
              に変更しますか？
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-[#ddd] px-4 py-2 text-[13px] text-[#666] hover:bg-[#f5f5f5]"
              >
                キャンセル
              </button>
              <button
                onClick={handleToggle}
                className={`rounded-lg px-4 py-2 text-[13px] font-bold text-white ${
                  isActive ? "bg-[#dc2626] hover:bg-[#b91c1c]" : "bg-[#059669] hover:bg-[#047857]"
                }`}
              >
                {isActive ? "無効にする" : "有効にする"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
