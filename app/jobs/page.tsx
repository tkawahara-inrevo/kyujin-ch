import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/job-card";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            求人一覧
          </h1>
          <p className="mt-2 text-base text-gray-500">
            求人ちゃんねるに掲載中の求人です
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              companyName={job.company.name}
              location={job.location}
              salaryMin={job.salaryMin}
              salaryMax={job.salaryMax}
              description={job.description}
            />
          ))}
        </div>
      </div>
    </main>
  );
}