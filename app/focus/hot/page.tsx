import { FocusArticleList } from "@/components/focus-article-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "人気の企業 | Focus" };

export default function FocusHotPage() {
  return <FocusArticleList heading="人気の企業" sort="hot" />;
}
