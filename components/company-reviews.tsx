import { ReviewCard } from "@/components/review-card";

export function CompanyReviews() {
  return (
    <section className="mt-14">
      <div className="bg-[#ff1744] px-4 py-2 text-[14px] font-bold text-white">
        クチコミ
      </div>

      <div className="mt-4 space-y-4">
        <ReviewCard />
        <ReviewCard />
        <ReviewCard />
      </div>
    </section>
  );
}