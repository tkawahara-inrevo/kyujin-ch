import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header hideCompanyLink />
      <div className="mx-auto max-w-[500px] px-4 py-12 md:px-6">
        <h1 className="text-[22px] font-bold text-[#222]">パスワード再設定</h1>
        <p className="mt-2 text-[13px] text-[#666] leading-[1.7]">
          登録済みのメールアドレスを入力してください。<br />
          パスワード再設定リンクをお送りします（有効期限60分）。
        </p>
        <ForgotPasswordForm />
      </div>
      <Footer />
    </main>
  );
}
