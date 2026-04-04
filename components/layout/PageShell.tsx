"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import AppScrollArea from "@/components/ui/AppScrollArea";
import { authService, clearAuthSession, getStoredToken, persistAuthSession } from "@/services/auth.services";

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
    const validateSession = async () => {
      const token = getStoredToken();

      if (!token) {
        clearAuthSession();
        router.replace("/");
        return;
      }

      try {
        const profil = await authService.me();
        persistAuthSession({ token, profil });
      } catch {
        clearAuthSession();
        router.replace("/");
      }
    };

    void validateSession();
  }, [router]);

  return (
    <main className="flex h-screen flex-col bg-[linear-gradient(90deg,#0f4b86_0%,#1460ab_46%,#1460ab_74%,#1d6ab7_100%)] text-white">
      <Navbar />
      <AppScrollArea className="flex-1" viewportClassName="px-6 py-8">
        <div className={`mx-auto w-full ${maxWidth} p-6 text-white`}>
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
