import type { Metadata } from "next";
import { Press_Start_2P, Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "./components/LanguageProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TimeBud — Stop deciding. Just start.",
  description:
    "TimeBud decides what to work on next. You tell it how much time you have. AI picks your tasks in order. You just start.",
  alternates: {
    types: { "application/rss+xml": [{ title: "TimeBud Blog", url: "/rss.xml" }] },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${pressStart2P.variable} ${spaceGrotesk.variable}`}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
