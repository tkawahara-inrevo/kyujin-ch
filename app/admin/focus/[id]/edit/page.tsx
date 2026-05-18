import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { updateFocusArticle, deleteFocusArticle } from "@/app/actions/admin/focus";
import { FocusForm } from "../../focus-form";

type Params = Promise<{ id: string }>;

export default async function AdminFocusEditPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;

  const article = await prisma.focusArticle.findUnique({ where: { id } });
  if (!article) notFound();

  const updateAction = updateFocusArticle.bind(null, id);

  return (
    <div>
      <FocusForm
        title="Focus 記事編集"
        submitLabel="保存する"
        action={updateAction}
        values={{
          slug: article.slug,
          companyName: article.companyName,
          title: article.title,
          summary: article.summary ?? "",
          body: article.body,
          thumbnailUrl: article.thumbnailUrl ?? "",
          tags: article.tags.join(", "),
          isPublished: article.isPublished,
          isHot: article.isHot,
          authorName: article.authorName ?? "",
          authorBio: article.authorBio ?? "",
          authorImageUrl: article.authorImageUrl ?? "",
        }}
      />

      {/* 削除 */}
      <div className="px-6 pb-10 lg:px-10">
        <form
          action={async () => {
            "use server";
            await deleteFocusArticle(id);
          }}
        >
          <button
            type="submit"
            className="text-[13px] text-[#ef4444] hover:underline"
            onClick={() => {/* confirm handled by browser default */}}
          >
            この記事を削除する
          </button>
        </form>
      </div>
    </div>
  );
}
