import { auth } from "@/auth";
import { CompanySidebar } from "./company-sidebar";

export const dynamic = "force-dynamic";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isCompany = session?.user?.role === "COMPANY";

  return (
    <div className="flex min-h-screen bg-[#eef4fb]">
      {isCompany && <CompanySidebar />}
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-visible pt-[64px] xl:pt-0">{children}</main>
    </div>
  );
}
