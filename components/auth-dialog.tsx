"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/register";

type Mode = "register" | "login";

type Props = {
  initialMode?: Mode;
  onClose: () => void;
};

export function AuthDialog({ initialMode = "register", onClose }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (mode === "register") {
        const result = await registerUser(formData);
        if (result.error) { setError(result.error); return; }
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        await signIn("credentials", { email, password, redirect: false });
        onClose();
        router.refresh();
      } else {
        const result = await signIn("credentials", {
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          redirect: false,
        });
        if (result?.error) {
          setError("メールアドレスまたはパスワードが正しくありません");
        } else {
          onClose();
          router.refresh();
        }
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-[520px] rounded-[16px] bg-white px-10 py-10 shadow-xl mx-4">
        {/* タイトル */}
        <h2 className="text-[22px] font-bold text-[#1a1a1a]">
          {mode === "register" ? "新規会員登録" : "ログイン"}
        </h2>

        {mode === "register" && (
          <p className="mt-3 text-center text-[13px] text-[#666]">
            会員登録で応募やお気に入り、<br />メッセージ機能などが無料で使い放題！
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#333]">
                  氏名 <span className="text-[#ff3158]">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="山田 太郎"
                  className="w-full rounded-[8px] border border-[#d8d8d8] px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#333]">
                  電話番号 <span className="text-[#ff3158]">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="090-0000-0000"
                  className="w-full rounded-[8px] border border-[#d8d8d8] px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#333]">
              メールアドレス <span className="text-[#ff3158]">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="example@email.com"
              className="w-full rounded-[8px] border border-[#d8d8d8] px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#333]">
              パスワード{mode === "register" && <span className="ml-1 text-[11px] font-normal text-[#aaa]">（8文字以上）</span>}
              <span className="text-[#ff3158]"> *</span>
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={mode === "register" ? 8 : undefined}
              placeholder="パスワードを入力"
              className="w-full rounded-[8px] border border-[#d8d8d8] px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
            />
          </div>

          {error && (
            <p className="rounded-[6px] bg-[#fff0f3] px-3 py-2 text-[13px] text-[#ff3158]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full rounded-[10px] bg-[#2f6cff] py-4 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending
              ? mode === "register" ? "登録中..." : "ログイン中..."
              : mode === "register" ? "登録する" : "ログイン"}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-[#666]">
          {mode === "register" ? (
            <>すでに会員の方は<button onClick={() => { setMode("login"); setError(""); }} className="font-semibold text-[#2f6cff] underline">ログイン</button></>
          ) : (
            <>アカウントをお持ちでない方は<button onClick={() => { setMode("register"); setError(""); }} className="font-semibold text-[#2f6cff] underline">新規登録</button></>
          )}
        </p>
      </div>
    </div>
  );
}
