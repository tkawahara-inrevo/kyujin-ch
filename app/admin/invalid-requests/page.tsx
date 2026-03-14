import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  InvalidRequestsTable,
  type InvalidRequestRow,
} from "./invalid-requests-table";

export default async function AdminInvalidRequestsPage() {
  await requireAdmin();

  const requests = await prisma.invalidRequest.findMany({
    include: {
      application: { include: { user: true, job: { include: { company: true } } } },
      company: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: InvalidRequestRow[] = requests.map((request) => ({
    id: request.id,
    createdAt: request.createdAt.toISOString(),
    companyName: request.company.name,
    userName: request.application.user.name ?? "Unknown",
    jobTitle: request.application.job.title,
    reason: request.reason,
    status: request.status,
  }));

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">無効申請管理</h1>
      <InvalidRequestsTable requests={rows} />
    </div>
  );
}
