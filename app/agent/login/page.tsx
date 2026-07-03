import { getAgentSession } from "@/lib/agent-session";
import { redirect } from "next/navigation";
import AgentLoginForm from "./agent-login-form";

export default async function AgentLoginPage() {
  const session = await getAgentSession();
  if (session) redirect("/agent/companies");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6">
      <div className="w-full max-w-[420px] rounded-[18px] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <h1 className="text-center text-[22px] font-bold text-[#1e293b]">求人ちゃんねる<br />代理店ログイン</h1>
        <p className="mt-2 text-center text-[12px] text-[#888]">代理店向けの管理画面です</p>
        <AgentLoginForm />
      </div>
    </div>
  );
}
