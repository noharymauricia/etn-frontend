"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";

export default function AuthPage() {
  const [active, setActive] = useState("login");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Simulation temporaire de connexion pour conserver le parcours visuel actuel.
  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/tableau");
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#155faa_0%,#0f4f95_100%)]">
        <Loader />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#155faa_0%,#0f4f95_100%)] px-6 py-8">
      <div className="flex w-full max-w-6xl rounded-3xl bg-[#155faa] p-8 text-white shadow-xl shadow-black/20">
        <div className="flex w-full max-w-[320px] flex-col items-center justify-center border-r-2 border-white/25 pr-12">
          <Image src="/logo.jpg" alt="logo" width={260} height={260} />
        </div>

        <div className="flex-1 justify-right pl-16">
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">
            Votre espace <br /> de travail numerique
          </h1>

          <p className="mb-6 text-sm leading-6 text-white/80">
            Application web interne dediee a la gestion et au suivi des
            activites
            <br />
            du Ministere de l&apos;Enseignement Superieur et de la Recherche
            Scientifique.
          </p>

          <div className="relative mb-6 w-100 border-b border-white/25">
            <div
              className={`absolute bottom-0 h-[3px] w-100 rounded-full bg-[#75b82a] transition-all duration-300 ${
                active === "login" ? "left-0" : "left-1/2"
              }`}
            />

            <div className="flex">
              <button
                onClick={() => setActive("login")}
                className={`w-1/2 pb-2 text-left text-sm transition-colors duration-300 ${
                  active === "login" ? "text-white" : "text-white/50"
                }`}
              >
                Connexion
              </button>
            </div>
          </div>

          {active === "login" && (
            <div className="w-100">
              <input
                type="text"
                placeholder="Identifiant"
                className="mb-4 w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                className="mb-6 w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60"
              />
              <Button label="Se connecter" onClick={handleLoading} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
