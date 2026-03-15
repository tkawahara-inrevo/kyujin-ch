import { JobCard } from "@/components/job-card";

type RecommendJob = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  categoryTag: string | null;
  tags: string[];
  createdAt: Date;
  imageUrl?: string | null;
  company: { name: string };
};

type RecommendSectionProps = {
  title?: string;
  jobs: RecommendJob[];
};

export function RecommendSection({ title = "こちらもおすすめ", jobs }: RecommendSectionProps) {
  return (
    <section className="mt-14 border-t border-[#e5e5e5] pt-12">
      <h2 className="mb-8 text-[22px] font-bold text-[#222]">{title}</h2>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
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
            imageSrc={job.imageUrl ?? undefined}
            badge="注目"
            categoryTag={job.categoryTag ?? undefined}
            tags={job.tags.length > 0 ? job.tags : undefined}
            createdAt={job.createdAt}
          />
        ))}
      </div>
    </section>
  );
}
