import type { Metadata } from "next";
import { Geist, Geist_Mono, Yuji_Syuku } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const yujiSyuku = Yuji_Syuku({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "おみくじ",
  description: "縦書きのおみくじを楽しめるサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${yujiSyuku.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
