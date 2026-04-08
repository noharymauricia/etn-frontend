"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import AppScrollArea from "@/components/ui/AppScrollArea";
import { clearAuthSession, getStoredToken } from "@/services/auth.services";
import { UNAUTHORIZED_EVENT } from "@/api/axios";

type PageShellProps = {
  title?: string;
  children: ReactNode;
  maxWidth?: string;
};

// Conteneur de mise en page commun pour uniformiser les pages internes.
export default function PageShell({
  title,
  children,
  maxWidth = "max-w-6xl",
}: PageShellProps) {
  const router = useRouter();

  useEffect(() => {
    if (!getStoredToken()) {
      clearAuthSession();
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthSession();
      router.replace("/");
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [router]);

  return (
    <main className="flex h-screen flex-col text-white overflow-hidden">
      <Navbar />
      <AppScrollArea className="flex-1" viewportClassName="px-3 py-4 md:px-6 md:py-8">
        <div className={`mx-auto w-full ${maxWidth} p-2 text-white sm:p-4 md:p-6`}>
          {title ? (
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-wide">{title}</h1>
            </div>
          ) : null}
          {children}
        </div>
      </AppScrollArea>
    </main>
  );
}
