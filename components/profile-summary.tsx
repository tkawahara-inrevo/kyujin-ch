import Image from "next/image";
import Link from "next/link";

type ProfileSummaryProps = {
  name: string;
  email: string;
  phone?: string | null;
  notificationsEnabled: boolean;
  createdAt: Date;
};

export function ProfileSummary({
  name,
  email,
  phone,
  notificationsEnabled,
  createdAt,
}: ProfileSummaryProps) {
  const registeredAt = new Date(createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <section className="border-b border-[#dddddd] pb-8">
      <div className="flex items-center gap-4">
        <h1 className="text-[22px] font-bold text-[#333]">マイページ</h1>

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
      </div>

      <div className="mt-6 grid max-w-[420px] gap-4">
        <div>
          <p className="text-[14px] font-bold text-[#666]">氏名</p>
          <p className="mt-1 text-[20px] font-bold text-[#333] md:text-[22px]">{name}</p>
        </div>

        <div>
          <p className="text-[14px] font-bold text-[#666]">メールアドレス</p>
          <p className="mt-1 text-[20px] font-bold text-[#333] md:text-[22px]">{email}</p>
        </div>

        <div>
          <p className="text-[14px] font-bold text-[#666]">電話番号</p>
          <p className="mt-1 text-[20px] font-bold text-[#333] md:text-[22px]">{phone ?? "未設定"}</p>
        </div>

        <div>
          <p className="text-[14px] font-bold text-[#666]">通知設定</p>
          <p className="mt-1 text-[20px] font-bold text-[#333] md:text-[22px]">
            {notificationsEnabled ? "ON" : "OFF"}
          </p>
        </div>
      </div>

      <p className="mt-6 text-right text-[12px] text-[#999]">登録日 {registeredAt}</p>
    </section>
  );
}
