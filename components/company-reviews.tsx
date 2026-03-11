import { ReviewCard } from "@/components/review-card";

type ReviewData = {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: Date | string;
};

type Props = {
  reviews: ReviewData[];
};

export function CompanyReviews({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <section className="mt-14">
        <div className="bg-[#ff1744] px-4 py-2 text-[14px] font-bold text-white">
          クチコミ
        </div>
        <p className="mt-4 text-[13px] text-[#888]">まだクチコミがありません。</p>
      </section>
    );
  }

  return (
    <section className="mt-14">
      <div className="bg-[#ff1744] px-4 py-2 text-[14px] font-bold text-white">
        クチコミ
      </div>

      <div className="mt-4 space-y-4">
        {reviews.map((r) => (
          <ReviewCard
            key={r.id}
            rating={r.rating}
            title={r.title}
            body={r.body}
            createdAt={r.createdAt}
          />
        ))}
      </div>
    </section>
  );
}
