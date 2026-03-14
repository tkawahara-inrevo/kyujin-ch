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
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {isCompany && <CompanySidebar />}
      <main className="min-w-0 flex-1 overflow-auto pt-[64px] md:pt-0">{children}</main>
    </div>
  );
}
