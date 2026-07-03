import Link from "next/link";
import { getAgentSession } from "@/lib/agent-session";
import { agentLogout } from "@/app/actions/agent/auth";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const session = await getAgentSession();

  // ログインページ自体はレイアウトのヘッダーを出さない
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="border-b border-[#e8edf5] bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link href="/agent/companies" className="flex items-center gap-2">
            <span className="text-[16px] font-bold text-[#1e293b]">求人ちゃんねる 代理店管理</span>
          </Link>
          <div className="flex items-center gap-4 text-[13px]">
            <span className="text-[#666]">{session.name} 様</span>
            <form action={agentLogout}>
              <button
                type="submit"
                className="rounded border border-[#d0d7e6] px-3 py-1.5 text-[12px] font-bold text-[#444] hover:bg-[#f4f7fb]"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-6 py-8">{children}</main>
    </div>
  );
}
