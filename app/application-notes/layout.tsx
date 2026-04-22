import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ApplicationNotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header hideTargetSwitch />
      {children}
      <Footer />
    </>
  );
}
