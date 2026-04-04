"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { toast } from "@/components/ui/Toasts";
import { authService, getStoredToken } from "@/services/auth.services";


export default function AuthPage() {
  const [active, setActive] = useState("login");
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    if (getStoredToken()) {
      router.replace("/tableau");
    }
  }, [router]);

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#155faa_0%,#0f4f95_100%)]">
        <Loader />
      </div>
    );
  }

  const handleLoading = async () => {
    if (!identifier.trim()) {
      toast.warning("Veuillez renseigner votre identifiant avant de vous connecter.");
      return;
    }

    if (!password.trim()) {
      toast.warning("Veuillez renseigner votre mot de passe.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        matricule: identifier.trim(),
        mot_de_passe: password,
      });

      toast.success(`Connexion reussie. Bienvenue ${response.profil.nom} !`);
      router.push("/tableau");
    } catch (error) {
      toast.error(
        authService.getErrorMessage(error) === "Erreur login"
          ? "Identifiant ou mot de passe incorrect."
          : authService.getErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
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
      <div className="flex w-full max-w-6xl text-white">
        <div className="flex w-full max-w-[320px] flex-col items-center justify-center border-r-4 border-white/45 pr-12">
          <Image
            src="/logo.png"
            alt="logo"
            width={260}
            height={260}
            priority
            className="h-auto w-auto"
          />
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
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="mb-4 w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60"
              />
              <div className="relative mb-6">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.184.557.184 1.144 0 1.701C20.577 17.584 16.641 20.5 12 20.5c-4.638 0-8.573-3.007-9.963-7.183Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              <Button label="Se connecter" onClick={handleLoading} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
