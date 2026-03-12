import { requireCompany } from "@/lib/auth-helpers";
import PasswordChangeForm from "./password-form";

export default async function CompanyPasswordPage() {
  await requireCompany();
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">パスワード変更</h1>
      <div className="mt-6 max-w-[480px]">
        <PasswordChangeForm />
      </div>
    </div>
  );
}
