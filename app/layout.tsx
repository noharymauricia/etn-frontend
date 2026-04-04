import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/styles/globals.css";
import TopLoader from "@/components/layout/TopLoader";
import { ToastContainer } from "@/components/ui/Toasts";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadonnees globales de l'application.
export const metadata: Metadata = {
  title: "ETN",
  description: "Application interne de gestion des activites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#155faa] text-white"
      >
        <TopLoader />
        <ToastContainer />

        {children}
      </body>
    </html>
  );
}
