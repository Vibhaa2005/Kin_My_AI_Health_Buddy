import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StoreHydrator from "@/components/StoreHydrator";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Kin — Family Health Buddy",
  description: "A longitudinal, context-aware AI health companion for your whole family.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-sand-50 text-gray-900 antialiased">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
