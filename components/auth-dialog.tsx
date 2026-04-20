"use client";

import { useState, useTransition, type FormEvent, type MouseEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/register";

type Mode = "register" | "login";

type Props = {
  initialMode?: Mode;
  onClose: () => void;
};

const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "true";

export function AuthDialog({ initialMode = "register", onClose }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const router = useRouter();

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (mode === "register") {
        const result = await registerUser(formData);
        if (result.error) {
          setError(result.error);
          return;
        }

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        await signIn("credentials", { email, password, redirect: false });
        onClose();
        router.refresh();
        return;
      }

      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false,
      });

      if (result?.error) {
        setError("メールアドレスまたはパスワードが正しくありません");
        return;
      }

      onClose();
      router.refresh();
    });
  }

  async function handleGoogleSignIn() {
    setError("");
    setIsGooglePending(true);
    await signIn("google", { callbackUrl: window.location.href });
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={handleBackdropClick}
    >
      <div className="mx-4 w-full max-w-[520px] rounded-[16px] bg-white px-10 py-10 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-[22px] font-bold text-[#1a1a1a]">
          {mode === "register" ? "新規会員登録" : "ログイン"}
        </h2>

        {mode === "register" && (
          <p className="mt-3 text-center text-[13px] text-[#666]">
            会員登録で応募やお気に入りに加え、
            <br />
            メッセージ機能なども無料で使えます!
          </p>
        )}

        {googleEnabled && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isPending || isGooglePending}
              className="flex w-full items-center justify-center gap-3 rounded-[10px] border border-[#d8d8d8] bg-white px-4 py-3 text-[14px] font-semibold text-[#333] transition hover:bg-[#f8f8f8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4C12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l.1-.1l6.2 5.2C37 39 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
                />
              </svg>
              {isGooglePending
                ? "Googleで移動中..."
                : `Googleで${mode === "register" ? "登録" : "ログイン"}`}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e5e7eb]" />
              <span className="text-[12px] text-[#999]">または</span>
              <div className="h-px flex-1 bg-[#e5e7eb]" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#333]">
                  お名前 <span className="text-[#ff3158]">*</span>
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
              パスワード
              {mode === "register" && (
                <span className="ml-1 text-[11px] font-normal text-[#aaa]">
                  8文字以上
                </span>
              )}
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
            disabled={isPending || isGooglePending}
            className="mt-2 w-full rounded-[10px] bg-[#2f6cff] py-4 text-[15px] font-bold !text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending
              ? mode === "register"
                ? "登録中..."
                : "ログイン中..."
              : mode === "register"
                ? "登録する"
                : "ログイン"}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-[#666]">
          {mode === "register" ? (
            <>
              すでに会員の方は{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="font-semibold text-[#2f6cff] underline"
              >
                ログイン
              </button>
            </>
          ) : (
            <>
              アカウントをお持ちでない方は{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="font-semibold text-[#2f6cff] underline"
              >
                新規登録
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
