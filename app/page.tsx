"use client";

import dynamic from "next/dynamic";
import Loader from "@/components/ui/Loader";

const AuthPageClient = dynamic(() => import("./AuthPageClient"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#155faa_0%,#0f4f95_100%)]">
      <Loader />
    </div>
  ),
});

export default function AuthPage() {
  return <AuthPageClient />;
}
