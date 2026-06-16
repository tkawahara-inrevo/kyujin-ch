import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { ProfileSummary } from "@/components/profile-summary";
import { DocumentUploadCard } from "@/components/document-upload-card";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { ReviewCard } from "@/components/review-card";
import { DeleteAccountSection } from "./delete-account-section";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function MyPage() {
  const currentUser = await getCurrentUser();

  const myReviews = await prisma.review.findMany({
    where: { userId: currentUser.id },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-16 lg:pb-0">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            <ProfileSummary
              name={currentUser.name}
              lastName={currentUser.lastName}
              firstName={currentUser.firstName}
              lastNameKana={currentUser.lastNameKana}
              firstNameKana={currentUser.firstNameKana}
              birthDate={currentUser.birthDate}
              gender={currentUser.gender}
              email={currentUser.email}
              phone={currentUser.phone}
              postalCode={currentUser.postalCode}
              prefecture={currentUser.prefecture}
              cityTown={currentUser.cityTown}
              addressLine={currentUser.addressLine}
              notificationsEnabled={currentUser.notificationsEnabled}
              createdAt={currentUser.createdAt}
            />

            {/* AI書類作成バナー */}
            <section className="mt-10">
              <Link
                href="/mypage/resume-builder"
                className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#2f6cff] px-5 py-4 text-white shadow-sm transition hover:opacity-90"
              >
                <div>
                  <div className="text-[15px] font-bold">✨ AI書類作成</div>
                  <div className="mt-0.5 text-[12px] opacity-90">
                    履歴書・職務経歴書をAIのサポートで自動作成
                  </div>
                </div>
                <span className="text-[20px]">→</span>
              </Link>
            </section>

            <section className="mt-8">
              <h2 className="text-[22px] font-bold text-[#333]">書類アップロード</h2>
              <p className="mt-3 text-[14px] font-semibold text-[#777]">
                対応形式：PDF / DOCX / XLSX（最大10MB）
              </p>

              <div className="mt-6 space-y-4">
                <DocumentUploadCard
                  title="履歴書"
                  docType="resume"
                  fileUrl={currentUser.resumeUrl}
                />
                <DocumentUploadCard
                  title="職務経歴書"
                  docType="careerHistory"
                  fileUrl={currentUser.careerHistoryUrl}
                />
              </div>
            </section>

            <section className="mt-12 border-t border-[#dddddd] pt-12">
              <div className="bg-[#ff1744] px-4 py-2 text-[18px] font-bold text-white">
                投稿したクチコミ
              </div>

              <div className="mt-4 space-y-4">
                {myReviews.length === 0 ? (
                  <p className="text-[13px] text-[#888]">まだクチコミを投稿していません。</p>
                ) : (
                  myReviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      id={r.id}
                      rating={r.rating}
                      title={r.title}
                      body={r.body}
                      createdAt={r.createdAt}
                      editable
                    />
                  ))
                )}
              </div>
            </section>

            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-bold text-[#333]">ブロック中のユーザー</h2>
              <p className="mt-2 text-[12px] text-[#666]">
                ブロック中のユーザーとはメッセージのやり取りができません。
              </p>
              <Link
                href="/mypage/blocks"
                className="mt-4 inline-block rounded-full border border-[#d0d7e6] px-5 py-2 text-[13px] font-bold text-[#445063] hover:bg-[#f4f7fb]"
              >
                ブロック一覧を見る
              </Link>
            </section>

            <DeleteAccountSection />
          </div>

          <ActionSidebar isLoggedIn={true} />
        </div>
      </div>

      <MobileBottomBar />
      <Footer />
    </main>
  );
}
