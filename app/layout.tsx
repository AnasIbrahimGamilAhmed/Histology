import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "HistoPro | Professional Histology Platform",
  description: "Advanced histology simulation and diagnostic training for medical students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-[#020617] font-sans antialiased text-slate-200">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
