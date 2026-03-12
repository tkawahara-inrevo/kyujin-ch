import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserActiveToggle } from "./user-active-toggle";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminJobseekersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">求職者一覧</h1>
      <div className="mt-6 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0f0] text-[#888]">
              <th className="px-5 py-3 font-semibold">氏名</th>
              <th className="px-5 py-3 font-semibold">メール</th>
              <th className="px-5 py-3 font-semibold">応募数</th>
              <th className="px-5 py-3 font-semibold">ステータス</th>
              <th className="px-5 py-3 font-semibold">登録日</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                <td className="px-5 py-3 font-medium text-[#333]">
                  <Link href={`/admin/jobseekers/${u.id}`} className="hover:text-[#2f6cff] hover:underline">{u.name}</Link>
                </td>
                <td className="px-5 py-3 text-[#555]">{u.email}</td>
                <td className="px-5 py-3 text-[#555]">{u._count.applications}</td>
                <td className="px-5 py-3">
                  <UserActiveToggle userId={u.id} isActive={u.isActive} />
                </td>
                <td className="px-5 py-3 text-[#888]">{u.createdAt.toLocaleDateString("ja-JP")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
