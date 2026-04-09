import { requireSuperAdmin } from "@/lib/auth-helpers";
import { getAdminAccounts } from "@/app/actions/admin/admin-accounts";
import { parsePermissions, PERMISSION_LABELS } from "@/lib/admin-permissions";
import type { AdminPermissions } from "@/lib/admin-permissions";
import AdminAccountCreateForm from "./admin-account-create-form";
import AdminAccountCard from "./admin-account-card";

export default async function AdminAccountsPage() {
  await requireSuperAdmin();
  const accounts = await getAdminAccounts();

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#1e3a5f]">アカウント管理</h1>
      </div>

      <div className="mb-8 rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 text-[16px] font-bold text-[#333]">新規アカウント発行</h2>
        <AdminAccountCreateForm permissionLabels={PERMISSION_LABELS} />
      </div>

      <div className="space-y-4">
        <h2 className="text-[16px] font-bold text-[#333]">管理者アカウント一覧</h2>
        {accounts.length === 0 ? (
          <p className="text-[14px] text-[#888]">管理者アカウントはまだありません</p>
        ) : (
          accounts.map((account) => (
            <AdminAccountCard
              key={account.id}
              account={{
                ...account,
                permissions: parsePermissions(account.adminPermissions),
              }}
              permissionLabels={PERMISSION_LABELS}
            />
          ))
        )}
      </div>
    </div>
  );
}
