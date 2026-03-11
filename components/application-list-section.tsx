import { ApplicationListItem } from "@/components/application-list-item";

type ApplicationWithRelations = {
  id: string;
  createdAt: Date;
  status: string;
  job: {
    id: string;
    title: string;
    location: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    company: { name: string };
  };
  conversation: { id: string } | null;
};

type ApplicationListSectionProps = {
  applications: ApplicationWithRelations[];
};

const applicationImages = [
  "/assets/Resume.png",
  "/assets/Paper.png",
  "/assets/Resume.png",
  "/assets/Paper.png",
];

export function ApplicationListSection({ applications }: ApplicationListSectionProps) {
  return (
    <section className="border-b border-[#dddddd] pb-8">
      <h1 className="text-[40px] font-bold text-[#333]">応募済み一覧</h1>

      <div className="mt-6 space-y-4">
        {applications.map((application, index) => (
          <ApplicationListItem
            key={application.id}
            jobId={application.job.id}
            title={application.job.title}
            companyName={application.job.company.name}
            location={application.job.location}
            salaryMin={application.job.salaryMin}
            salaryMax={application.job.salaryMax}
            appliedAt={new Date(application.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
            conversationId={application.conversation?.id}
            imageSrc={applicationImages[index % applicationImages.length]}
          />
        ))}
      </div>
    </section>
  );
}
