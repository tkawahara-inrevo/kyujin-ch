import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { getCurrentUserOptional } from "@/lib/current-user";
import ContactForm from "./contact-form";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const currentUser = await getCurrentUserOptional();

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-16 lg:pb-0">
      <Header />

      <div className="mx-auto max-w-[920px] px-4 py-10 md:px-6">
        <div className="rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] md:p-8">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[#2f6cff]">CONTACT</p>
          <h1 className="mt-3 text-[28px] font-bold text-[#1e293b]">お問い合わせ</h1>
          <p className="mt-3 text-[14px] leading-7 text-[#666]">
            質問や不具合報告はこちらからどうぞ! 内容を確認のうえ、必要に応じてご連絡します。
          </p>

          <div className="mt-6 rounded-[16px] bg-[#f8fafc] px-5 py-4 text-[13px] leading-7 text-[#555]">
            <p>カテゴリは次の2つに分けて受け付けます。</p>
            <p>・質問</p>
            <p>・不具合報告</p>
          </div>

          <div className="mt-8">
            <ContactForm
              defaultName={currentUser?.name || ""}
              defaultPhone={currentUser?.phone || ""}
              defaultEmail={currentUser?.email || ""}
            />
          </div>
        </div>
      </div>

      <MobileBottomBar />
      <Footer />
    </main>
  );
}
