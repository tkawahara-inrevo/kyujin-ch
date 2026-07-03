import { redirect } from "next/navigation";
import { getAgentSession } from "@/lib/agent-session";

export default async function AgentIndexPage() {
  const session = await getAgentSession();
  if (session) redirect("/agent/companies");
  redirect("/agent/login");
}
