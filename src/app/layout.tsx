import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PNG eGP - National e-Government Procurement System",
  description:
    "Papua New Guinea's National e-Government Procurement System for transparent and efficient public procurement",
  keywords: [
    "PNG",
    "Papua New Guinea",
    "eGP",
    "e-Procurement",
    "Government",
    "Tendering",
    "Public Procurement",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MainLayout>{children}</MainLayout>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
