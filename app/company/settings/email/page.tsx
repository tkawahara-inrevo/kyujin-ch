import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import EmailChangeForm from "./email-form";

export default async function CompanyEmailPage() {
  const session = await requireCompany();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">メールアドレス変更</h1>
      <p className="mt-2 text-[14px] text-[#555]">現在のメールアドレス: {user?.email ?? "—"}</p>
      <div className="mt-6 max-w-[480px]">
        <EmailChangeForm />
      </div>
    </div>
  );
}
