import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ReportForm } from "./report-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "通報する" };

type SearchParams = Promise<{ type?: string; id?: string }>;

const TYPE_LABELS: Record<string, string> = {
  job: "求人",
  company: "企業",
  user: "ユーザー",
  message: "メッセージ",
};

export default async function ReportPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/report");
  }
  const { type = "", id = "" } = await searchParams;
  const label = TYPE_LABELS[type];
  if (!label || !id) {
    return (
      <main className="min-h-screen bg-[#f7f7f7]">
        <Header />
        <div className="mx-auto max-w-[680px] px-4 py-12 md:px-6">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-[20px] font-bold text-[#333]">通報先が指定されていません</h1>
            <p className="mt-4 text-[14px] text-[#666]">
              通報したい求人・企業・メッセージのページから「通報する」をご利用ください。
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />
      <div className="mx-auto max-w-[680px] px-4 py-12 md:px-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[#2f6cff]">REPORT</p>
          <h1 className="mt-3 text-[24px] font-bold text-[#333]">通報する</h1>
          <p className="mt-3 text-[13px] leading-7 text-[#666]">
            この{label}に不適切な内容（虚偽求人・差別的内容・嫌がらせ・スパム等）がある場合に通報してください。内容を確認のうえ、必要に応じて対応いたします。
          </p>
          <div className="mt-4 rounded-lg bg-[#f8fafc] px-4 py-3 text-[12px] text-[#555]">
            対象: {label} (ID: {id})
          </div>
          <div className="mt-6">
            <ReportForm targetType={type} targetId={id} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
