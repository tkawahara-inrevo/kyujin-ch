import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { FavoriteListSection } from "@/components/favorite-list-section";
import { EmptyStateCard } from "@/components/empty-state-card";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function FavoritesPage() {
  const currentUser = await getCurrentUser();

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: currentUser.id,
    },
    include: {
      job: {
        include: {
          company: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-16 lg:pb-0">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            {favorites.length > 0 ? (
              <FavoriteListSection favorites={favorites} />
            ) : (
              <section className="border-b border-[#dddddd] pb-8">
                <h1 className="text-[40px] font-bold text-[#333]">気になる一覧</h1>

                <div className="mt-6">
                  <EmptyStateCard
                    title="まだ気になる求人はありません"
                    description={
                      "気になるボタンを押した求人はこのページに表示されます。\nあとで見返したい求人を保存しておこう。"
                    }
                  />
                </div>
              </section>
            )}
          </div>

          <ActionSidebar
            applyHref="/jobs"
            primaryLabel="求人一覧を見る"
            isLoggedIn={true}
          />
        </div>
      </div>

      <MobileBottomBar />
      <Footer />
    </main>
  );
}