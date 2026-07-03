import { requireAdminPermission } from "@/lib/auth-helpers";
import AgentCreateForm from "./agent-create-form";

export default async function AdminAgentNewPage() {
  await requireAdminPermission("agents");
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">代理店を追加</h1>
      <p className="mt-2 text-[13px] text-[#888]">
        代理店を登録すると、記載のメールアドレス宛に仮パスワード付きのログイン案内メールが送信されます。
      </p>
      <AgentCreateForm />
    </div>
  );
}
