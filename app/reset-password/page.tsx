import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ResetPasswordForm } from "./reset-password-form";

type SearchParams = Promise<{ token?: string }>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header hideCompanyLink />
      <div className="mx-auto max-w-[500px] px-4 py-12 md:px-6">
        <h1 className="text-[22px] font-bold text-[#222]">パスワード再設定</h1>
        <p className="mt-2 text-[13px] text-[#666]">
          新しいパスワードを入力してください（8文字以上）
        </p>

        {!token ? (
          <div className="mt-6 rounded-[10px] bg-white p-6 text-[14px] text-[#eb0937]">
            無効なリンクです。メール内のリンクから再度アクセスしてください。
          </div>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </div>
      <Footer />
    </main>
  );
}
