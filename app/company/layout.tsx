import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CompanySidebar } from "./company-sidebar";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // login page is excluded from layout auth check
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {session?.user?.role === "COMPANY" && <CompanySidebar />}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
