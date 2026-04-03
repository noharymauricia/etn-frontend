"use client";

import type { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";

type PageShellProps = {
  title: string;
  children: ReactNode;
  maxWidth?: string;
};

// Conteneur de mise en page commun pour uniformiser les pages internes.
export default function PageShell({
  title,
  children,
  maxWidth = "max-w-6xl",
}: PageShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#155faa_0%,#0f4f95_100%)]">
      <Navbar />
      <section className="px-6 py-8">
        <div
          className={`mx-auto w-full ${maxWidth} rounded-3xl border border-white/20 bg-[rgb(15,27,45)] p-6 text-white shadow-xl shadow-black/20`}
        >
          <div className="mb-6 border-b border-white/30 pb-4">
            <h1 className="text-3xl font-bold tracking-wide">{title}</h1>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
