-- WordPressからの記事一括移行に伴い、既存ColumnPostレコードをクリア
TRUNCATE TABLE "ColumnPost";

-- slug カラムを追加
ALTER TABLE "ColumnPost" ADD COLUMN "slug" TEXT NOT NULL;

-- ユニーク制約
CREATE UNIQUE INDEX "ColumnPost_slug_key" ON "ColumnPost"("slug");

-- 検索用インデックス
CREATE INDEX "ColumnPost_slug_idx" ON "ColumnPost"("slug");
