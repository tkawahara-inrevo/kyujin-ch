import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "応相談";
  if (min && max && min === max) return `${min}万円`;
  if (min && max) return `${min}万円〜${max}万円`;
  if (min) return `${min}万円〜`;
  return `〜${max}万円`;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { id },
    include: {
      company: true,
    },
  });

  if (!job) {
    notFound();
  }

  const recommendedJobs = await prisma.job.findMany({
    where: {
      NOT: {
        id: job.id,
      },
    },
    include: {
      company: true,
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              {job.title}
            </h1>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="aspect-[16/9] w-full bg-gray-200" />

              <div className="p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-white">
                    営業
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    未経験歓迎
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    中途採用
                  </span>
                </div>

                <p className="text-lg text-gray-700">{job.company.name}</p>

                <div className="mt-4 space-y-3 border-b border-gray-200 pb-6 text-base text-gray-800">
                  <p>📍 {job.location ?? "勤務地未設定"}</p>
                  <p>¥ {formatSalary(job.salaryMin, job.salaryMax)}</p>
                </div>

                <section className="border-b border-gray-200 py-6">
                  <h2 className="mb-3 text-lg font-bold text-gray-900">詳細</h2>
                  <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                    {job.description}
                  </p>
                </section>

                <section className="border-b border-gray-200 py-6">
                  <h2 className="mb-3 text-lg font-bold text-gray-900">対象</h2>
                  <p className="text-sm leading-7 text-gray-700">
                    未経験者歓迎。主体的に動ける方、コミュニケーションを大切にできる方を歓迎します。
                  </p>
                </section>

                <section className="py-6">
                  <h2 className="mb-3 text-lg font-bold text-gray-900">仕事内容</h2>
                  <p className="text-sm leading-7 text-gray-700">
                    人材採用支援に関する提案、顧客対応、採用活動サポートなどを担当していただきます。
                  </p>
                </section>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">こちらもおすすめ</h2>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {recommendedJobs.map((recommendedJob) => (
                  <Link
                    key={recommendedJob.id}
                    href={`/jobs/${recommendedJob.id}`}
                    className="rounded-2xl border border-gray-200 p-4 transition hover:shadow-sm"
                  >
                    <div className="aspect-[16/9] w-full rounded-xl bg-gray-100" />
                    <h3 className="mt-3 line-clamp-2 text-lg font-bold text-gray-900">
                      {recommendedJob.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-700">
                      {recommendedJob.company.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {recommendedJob.location ?? "勤務地未設定"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside>
            <div className="sticky top-6 rounded-2xl bg-white p-5 shadow-sm">
              <Link
                href={`/jobs/${job.id}/apply`}
                className="block rounded-xl bg-blue-600 px-4 py-4 text-center text-sm font-bold text-white transition hover:bg-blue-700"
              >
                今すぐ応募する
              </Link>

              <div className="mt-6 space-y-4 border-t border-gray-200 pt-6 text-sm text-gray-700">
                <Link href="/mypage" className="block">
                  マイページ
                </Link>
                <Link href="/applications" className="block">
                  応募済み
                </Link>
                <button className="block text-left">気になる</button>
                <Link href="/messages" className="block">
                  メッセージ
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}