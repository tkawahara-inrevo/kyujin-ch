import { ApplicationListItem } from "@/components/application-list-item";

type ApplicationJob = {
  id: string;
  title: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  company: {
    name: string;
  };
};

type ApplicationListSectionProps = {
  jobs: ApplicationJob[];
};

const applicationImages = [
  "/assets/Resume.png",
  "/assets/Paper.png",
  "/assets/Resume.png",
  "/assets/Paper.png",
];

export function ApplicationListSection({
  jobs,
}: ApplicationListSectionProps) {
  return (
    <section className="border-b border-[#dddddd] pb-8">
      <h1 className="text-[40px] font-bold text-[#333]">応募済み一覧</h1>

      <div className="mt-6 space-y-4">
        {jobs.map((job, index) => (
          <ApplicationListItem
            key={job.id}
            id={job.id}
            jobId={job.id}
            title={job.title}
            companyName={job.company.name}
            location={job.location}
            salaryMin={job.salaryMin}
            salaryMax={job.salaryMax}
            appliedAt="2026/02/20"
            imageSrc={applicationImages[index % applicationImages.length]}
          />
        ))}
      </div>
    </section>
  );
}