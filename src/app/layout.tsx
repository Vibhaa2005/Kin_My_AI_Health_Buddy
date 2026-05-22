import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kin — Your AI Health Buddy",
  description:
    "A longitudinal, context-aware AI health companion that keeps your whole family informed and safe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sand-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
