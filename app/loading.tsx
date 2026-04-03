"use client";

import Loader from "@/components/ui/Loader";

// Fallback global affiche pendant le chargement des segments de route.
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader />
    </div>
  );
}
