import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans_JP } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import { GoogleAnalytics } from "@next/third-parties/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "求人ちゃんねる",
  description: "求人ちゃんねる",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
      <GoogleAnalytics gaId="G-X2C2DSVWH3" />
    </html>
  );
}
