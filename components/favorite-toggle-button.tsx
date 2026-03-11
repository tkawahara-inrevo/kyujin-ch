import Image from "next/image";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { addFavorite, removeFavorite } from "@/app/actions/favorites";

type FavoriteToggleButtonProps = {
  jobId: string;
  revalidatePaths?: string[];
  activeIcon?: string;
  inactiveIcon?: string;
};

export async function FavoriteToggleButton({
  jobId,
  revalidatePaths = ["/favorites"],
  activeIcon = "/assets/Bookmark.png",
  inactiveIcon = "/assets/Bookmark_gr.png",
}: FavoriteToggleButtonProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <button type="button" className="shrink-0 opacity-70" aria-label="favorite-toggle-disabled">
        <Image
          src={inactiveIcon}
          alt=""
          width={16}
          height={20}
          className="object-contain"
        />
      </button>
    );
  }

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_jobId: {
        userId: session.user.id,
        jobId,
      },
    },
  });

  const isFavorited = Boolean(favorite);

  async function toggleFavoriteAction() {
    "use server";

    if (isFavorited) {
      await removeFavorite(jobId);
    } else {
      await addFavorite(jobId);
    }

    for (const path of revalidatePaths) {
      revalidatePath(path);
    }
  }

  return (
    <form action={toggleFavoriteAction}>
      <button type="submit" className="shrink-0" aria-label="favorite-toggle">
        <Image
          src={isFavorited ? activeIcon : inactiveIcon}
          alt=""
          width={16}
          height={20}
          className="object-contain"
        />
      </button>
    </form>
  );
}