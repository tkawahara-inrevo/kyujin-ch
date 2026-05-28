import { FocusContactForm } from "./contact-form";

export const metadata = {
  title: "掲載に関するお問い合わせ | Focus",
};

export default function FocusContactPage() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-12 md:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-[5px] w-[50px] bg-[#1f2775]" />
        <h1 className="text-[28px] font-bold text-[#333]">掲載希望の方はこちら</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          Focusへの掲載をご希望の企業様は、下記フォームよりお問い合わせください。<br />
          担当者より折り返しご連絡いたします。
        </p>
      </div>

      <FocusContactForm />
    </div>
  );
}
