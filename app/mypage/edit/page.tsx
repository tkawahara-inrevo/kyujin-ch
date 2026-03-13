import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { ProfileEditForm } from "./profile-edit-form";
import { PasswordSection } from "./password-section";
import { getCurrentUser } from "@/lib/current-user";

export default async function MyPageEdit() {
  const currentUser = await getCurrentUser();

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
          </div>

          <ActionSidebar isLoggedIn={true} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
