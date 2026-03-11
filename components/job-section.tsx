import Link from "next/link";
import { JobCard } from "@/components/job-card";

type JobWithCompany = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  categoryTag: string | null;
  tags: string[];
  createdAt: Date;
  company: { name: string };
};

type JobSectionProps = {
  title: string;
  jobs: JobWithCompany[];
  moreHref: string;
  moreLabel: string;
  badge?: "注目" | "新着";
};

const cardImages = [
  "/assets/Online.png",
  "/assets/Talk_01.png",
  "/assets/Resume.png",
];

export function JobSection({ title, jobs, moreHref, moreLabel, badge = "注目" }: JobSectionProps) {
  return (
    <section className="mt-14">
      <h2 className="mb-8 text-[22px] font-bold text-[#222]">{title}</h2>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            id={job.id}
            title={job.title}
            companyName={job.company.name}
            location={job.location}
            salaryMin={job.salaryMin}
            salaryMax={job.salaryMax}
            description={job.description}
            imageSrc={cardImages[index % cardImages.length]}
            badge={badge}
            categoryTag={job.categoryTag ?? undefined}
            tags={job.tags.length > 0 ? job.tags : undefined}
            createdAt={job.createdAt}
          />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href={moreHref}
          className="rounded-full bg-[#2f6cff] px-14 py-4 text-[14px] font-bold text-white transition hover:opacity-90"
        >
          {moreLabel}
        </Link>
      </div>
    </section>
  );
}
