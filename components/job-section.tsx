import Link from "next/link";
import { JobCard } from "@/components/job-card";

type JobWithCompany = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  company: {
    name: string;
  };
};

type JobSectionProps = {
  title: string;
  jobs: JobWithCompany[];
  moreHref: string;
  moreLabel: string;
};

const cardImages = [
  "/assets/Online.png",
  "/assets/Talk_01.png",
  "/assets/Person.png",
];

export function JobSection({
  title,
  jobs,
  moreHref,
  moreLabel,
}: JobSectionProps) {
  return (
    <section className="mt-16">
      <h2 className="mb-10 text-[24px] font-bold text-[#333]">{title}</h2>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 xl:grid-cols-3">
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
          />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href={moreHref}
          className="rounded-full bg-[#2f6cff] px-12 py-4 text-[14px] font-bold text-white transition hover:opacity-90"
        >
          {moreLabel}
        </Link>
      </div>
    </section>
  );
}