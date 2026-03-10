import Image from "next/image";
import Link from "next/link";

type CompanyJobStripItem = {
  id: string;
  title: string;
};

type CompanyJobStripProps = {
  jobs: CompanyJobStripItem[];
};

const stripImages = [
  "/assets/Resume.png",
  "/assets/Paper.png",
  "/assets/Resume.png",
  "/assets/Paper.png",
  "/assets/Resume.png",
];

export function CompanyJobStrip({
  jobs,
}: CompanyJobStripProps) {
  return (
    <section className="mt-6">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {jobs.map((job, index) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block min-w-[138px] shrink-0"
          >
            <div className="text-[11px] leading-[1.45] text-[#333]">
              <p>[Webマーケター] フルリ</p>
              <p>モート/フルフレックス</p>
              <p className="font-bold text-[#ff3158]">マーケター</p>
            </div>

            <div className="relative mt-2 h-[72px] overflow-hidden rounded-[6px] bg-[#efefef]">
              <Image
                src={stripImages[index % stripImages.length]}
                alt={job.title}
                fill
                className="object-cover"
                sizes="138px"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}