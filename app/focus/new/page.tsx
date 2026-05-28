import { FocusArticleList } from "@/components/focus-article-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "新着記事" };

export default function FocusNewPage() {
  return <FocusArticleList heading="新着記事" sort="new" />;
}
