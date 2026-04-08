import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/styles/globals.css";
import { ToastContainer } from "@/components/ui/Toasts";
import StyledComponentsRegistry from "@/lib/styled-components-registry";


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
        className="min-h-full flex flex-col bg-[linear-gradient(90deg,#0f4b86_0%,#1460ab_46%,#1460ab_74%,#1d6ab7_100%)] bg-fixed text-white"
      >
        <StyledComponentsRegistry>
          <ToastContainer />

          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
