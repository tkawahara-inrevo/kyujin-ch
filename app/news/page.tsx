import { Header } from "@/components/header";
import { TopHero } from "@/components/top-hero";
import { NewsContent } from "@/components/news-content";
import { RightSidebar } from "@/components/right-sidebar";
import { Footer } from "@/components/footer";

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />
      <TopHero activeTab="news" />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <NewsContent />
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
