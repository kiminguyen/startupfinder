import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SparkleCursor } from "@/components/SparkleCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Startup Finder — YC, a16z, USV & Bessemer companies",
  description:
    "Find startups backed by Y Combinator, a16z, Union Square Ventures, or Bessemer to pitch yourself to. Search by role, skill, and industry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SparkleCursor />
        {children}
      </body>
    </html>
  );
}
