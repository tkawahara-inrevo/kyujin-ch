import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { RecommendSection } from "@/components/recommend-section";
import { ProfileEditForm } from "./profile-edit-form";
import { PasswordSection } from "./password-section";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function MyPageEdit() {
  const currentUser = await getCurrentUser();

  const recommendedJobs = await prisma.job.findMany({
    include: { company: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            <ProfileEditForm
              name={currentUser.name}
              email={currentUser.email}
              phone={currentUser.phone}
              notificationsEnabled={currentUser.notificationsEnabled}
              createdAt={currentUser.createdAt}
            />

            <PasswordSection />

            {recommendedJobs.length > 0 && (
              <RecommendSection jobs={recommendedJobs} />
            )}
          </div>

          <ActionSidebar />
        </div>
      </div>

      <Footer />
    </main>
  );
}
