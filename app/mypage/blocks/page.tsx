import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { BlockList } from "./block-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "ブロック中のユーザー" };

export default async function BlocksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/mypage/blocks");
  }

  const blocks = await prisma.block.findMany({
    where: { blockerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  const users = blocks.length
    ? await prisma.user.findMany({
        where: { id: { in: blocks.map((b) => b.blockedId) } },
        select: { id: true, name: true, image: true },
      })
    : [];
  const map = new Map(users.map((u) => [u.id, u]));
  const items = blocks.map((b) => ({
    userId: b.blockedId,
    name: map.get(b.blockedId)?.name ?? "(削除済みユーザー)",
    avatarUrl: map.get(b.blockedId)?.image ?? null,
    blockedAt: b.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />
      <div className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
        <div className="mb-6">
          <Link href="/mypage" className="text-[13px] text-[#2f6cff] hover:underline">
            ← マイページに戻る
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-[20px] font-bold text-[#333]">ブロック中のユーザー</h1>
          <p className="mt-2 text-[12px] text-[#666]">
            ブロックされたユーザーとの間ではメッセージが送受信できなくなります。
          </p>
          <BlockList items={items} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
