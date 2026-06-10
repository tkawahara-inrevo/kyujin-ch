import { BizColumnHeader } from "@/components/biz-column-header";
import { BizColumnFooter } from "@/components/biz-column-footer";

export default function BizColumnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <BizColumnHeader />
      {children}
      <BizColumnFooter />
    </div>
  );
}
