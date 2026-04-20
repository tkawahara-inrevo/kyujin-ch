import Image from "next/image";
import Link from "next/link";

type Props = {
  name: string;
  lastName?: string | null;
  firstName?: string | null;
  lastNameKana?: string | null;
  firstNameKana?: string | null;
  birthDate?: Date | null;
  gender?: string | null;
  email: string;
  phone?: string | null;
  postalCode?: string | null;
  prefecture?: string | null;
  cityTown?: string | null;
  addressLine?: string | null;
  notificationsEnabled: boolean;
  createdAt: Date;
};

function calcAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-bold text-[#666]">{label}</p>
      <p className="mt-0.5 text-[16px] font-semibold text-[#333]">{value}</p>
    </div>
  );
}

export function ProfileSummary({
  name,
  lastName,
  firstName,
  lastNameKana,
  firstNameKana,
  birthDate,
  gender,
  email,
  phone,
  postalCode,
  prefecture,
  cityTown,
  addressLine,
  notificationsEnabled,
  createdAt,
}: Props) {
  const registeredAt = new Date(createdAt).toLocaleDateString("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });

  const displayName = (lastName || firstName)
    ? [lastName, firstName].filter(Boolean).join(" ")
    : name;

  const displayKana = (lastNameKana || firstNameKana)
    ? [lastNameKana, firstNameKana].filter(Boolean).join(" ")
    : null;

  const birthDateObj = birthDate ? new Date(birthDate) : null;
  const birthStr = birthDateObj
    ? birthDateObj.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
    : null;
  const age = birthDateObj ? calcAge(birthDateObj) : null;

  const addressParts = [prefecture, cityTown, addressLine].filter(Boolean);
  const addressStr = addressParts.length > 0
    ? (postalCode ? `〒${postalCode} ` : "") + addressParts.join("")
    : null;

  return (
    <section className="border-b border-[#dddddd] pb-8">
      <div className="flex items-center gap-4">
        <h1 className="text-[22px] font-bold text-[#333]">マイページ</h1>
        <Link
          href="/mypage/edit"
          className="flex items-center gap-2 text-[14px] font-semibold text-[#555]"
        >
          <Image src="/assets/Edit_Pencil_Line_02.png" alt="" width={18} height={18} />
          <span>編集する</span>
        </Link>
      </div>

      <div className="mt-6 grid max-w-[480px] gap-4">
        <Row label="氏名" value={displayName} />
        {displayKana && <Row label="ふりがな" value={displayKana} />}
        {birthStr && (
          <Row label="生年月日" value={`${birthStr}（${age}歳）`} />
        )}
        {gender && <Row label="性別" value={gender} />}
        <Row label="メールアドレス" value={email} />
        <Row label="電話番号" value={phone ?? "未設定"} />
        {addressStr && <Row label="住所" value={addressStr} />}
        <Row label="通知設定" value={notificationsEnabled ? "ON" : "OFF"} />
      </div>

      <p className="mt-6 text-right text-[12px] text-[#999]">登録日 {registeredAt}</p>
    </section>
  );
}
