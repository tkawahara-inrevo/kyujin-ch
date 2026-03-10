import { JobCard } from "@/components/job-card";

type RecommendJob = {
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

type RecommendSectionProps = {
  title?: string;
  jobs: RecommendJob[];
};

const cardImages = [
  "/assets/Resume.png",
  "/assets/Paper.png",
  "/assets/Resume.png",
];

export function RecommendSection({
  title = "こちらもおすすめ",
  jobs,
}: RecommendSectionProps) {
  return (
    <section className="mt-16 border-t border-[#e5e5e5] pt-12">
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
    </section>
  );
}