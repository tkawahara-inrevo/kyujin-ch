import Image from "next/image";
import Link from "next/link";

type ProfileSummaryProps = {
  editable?: boolean;
};

export function ProfileSummary({
  editable = true,
}: ProfileSummaryProps) {
  return (
    <section className="border-b border-[#dddddd] pb-8">
      <div className="flex items-center gap-4">
        <h1 className="text-[40px] font-bold text-[#333]">マイページ</h1>

        {editable && (
          <Link
            href="/mypage/edit"
            className="flex items-center gap-2 text-[14px] font-semibold text-[#555]"
          >
            <Image
              src="/assets/Edit_Pencil_Line_02.png"
              alt=""
              width={18}
              height={18}
            />
            <span>編集する</span>
          </Link>
        )}
      </div>

      <div className="mt-6 grid max-w-[420px] gap-4">
        <div>
          <p className="text-[14px] font-bold text-[#666]">氏名</p>
          <p className="mt-1 text-[34px] font-bold text-[#333]">山田 太郎</p>
        </div>

        <div>
          <p className="text-[14px] font-bold text-[#666]">メールアドレス</p>
          <p className="mt-1 text-[34px] font-bold text-[#333]">applicant@test.com</p>
        </div>

        <div>
          <p className="text-[14px] font-bold text-[#666]">電話番号</p>
          <p className="mt-1 text-[34px] font-bold text-[#333]">090-0000-0000</p>
        </div>

        <div>
          <p className="text-[14px] font-bold text-[#666]">通知設定</p>
          <p className="mt-1 text-[34px] font-bold text-[#333]">ON</p>
        </div>
      </div>

      <p className="mt-6 text-right text-[12px] text-[#999]">登録日 2026/02/20</p>
    </section>
  );
}