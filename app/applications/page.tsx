import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { ApplicationListSection } from "@/components/application-list-section";
import { EmptyStateCard } from "@/components/empty-state-card";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function ApplicationsPage() {
  const currentUser = await getCurrentUser();

  const applications = await prisma.application.findMany({
    where: { userId: currentUser.id },
    include: {
      job: { include: { company: true } },
      conversation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            {applications.length > 0 ? (
              <ApplicationListSection applications={applications} />
            ) : (
              <section className="border-b border-[#dddddd] pb-8">
                <h1 className="text-[40px] font-bold text-[#333]">応募済み一覧</h1>

                <div className="mt-6">
                  <EmptyStateCard
                    title="まだ応募した求人はありません"
                    description={
                      "気になる求人を見つけたら、応募してみよう。\n応募した求人はこのページに表示されます。"
                    }
                  />
                </div>
              </section>
            )}
          </div>

          <ActionSidebar applyHref="/jobs" primaryLabel="求人一覧を見る" />
        </div>
      </div>

      <Footer />
    </main>
  );
}
