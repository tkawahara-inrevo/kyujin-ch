-- email を任意化（Focus問い合わせはメール欄なし）
ALTER TABLE "Inquiry" ALTER COLUMN "email" DROP NOT NULL;

-- 会社名・流入元カラム追加
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT '9ch';
