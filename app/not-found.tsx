import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f7f7]">
      <h1 className="text-[64px] font-bold text-[#ddd]">404</h1>
      <p className="mt-4 text-[16px] text-[#888]">ページが見つかりませんでした</p>
      <Link
        href="/"
        className="mt-6 rounded-[10px] bg-[#2f6cff] px-6 py-3 text-[14px] font-bold text-white hover:opacity-90"
      >
        トップページへ
      </Link>
    </div>
  );
}
