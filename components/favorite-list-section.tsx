import { FavoriteListItem } from "@/components/favorite-list-item";

type FavoriteItem = {
  id: string;
  createdAt: Date;
  job: {
    id: string;
    title: string;
    location: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    company: {
      name: string;
    };
  };
};

type FavoriteListSectionProps = {
  favorites: FavoriteItem[];
};

const favoriteImages = [
  "/assets/Resume.png",
  "/assets/Paper.png",
  "/assets/Resume.png",
  "/assets/Paper.png",
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function FavoriteListSection({
  favorites,
}: FavoriteListSectionProps) {
  return (
    <section className="border-b border-[#dddddd] pb-8">
      <h1 className="text-[22px] font-bold text-[#333]">気になる一覧</h1>

      <div className="mt-6 space-y-4">
        {favorites.map((favorite, index) => (
          <FavoriteListItem
            key={favorite.id}
            jobId={favorite.job.id}
            title={favorite.job.title}
            companyName={favorite.job.company.name}
            location={favorite.job.location}
            salaryMin={favorite.job.salaryMin}
            salaryMax={favorite.job.salaryMax}
            savedAt={formatDate(favorite.createdAt)}
            imageSrc={favoriteImages[index % favoriteImages.length]}
          />
        ))}
      </div>
    </section>
  );
}
