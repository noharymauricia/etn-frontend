"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { toast } from "@/components/ui/Toasts";
import { authService, getStoredToken } from "@/services/auth.services";

export default function AuthPageClient() {
  const [active, setActive] = useState("login");
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const formatIdentifier = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 3) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)}`;
    }
    return digits.slice(0, 6);
  };
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    if (getStoredToken()) {
      router.replace("/tableau");
    }
  }, [router]);

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
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
        matricule: identifier.replace(/\s/g, ""),
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
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <main className="flex h-screen items-center justify-center px-4 py-8 md:px-6 overflow-hidden">
      <div className="flex w-full max-w-6xl flex-col items-center text-white md:flex-row md:items-start">
        <div className="mb-8 flex w-full max-w-[320px] flex-col items-center justify-center border-white/45 pr-0 md:mb-0 md:border-r-4 md:pr-12">
          <Image
            src="/logo.png"
            alt="logo"
            width={260}
            height={260}
            priority
            className="h-auto w-48 md:w-auto"
          />
        </div>

        <div className="flex-1 px-4 text-center md:pl-16 md:text-left">
          <h1 className="mb-4 text-2xl font-bold md:text-3xl lg:text-5xl">
            Votre espace <br className="hidden md:block" /> de travail numérique
          </h1>

          <p className="mb-6 text-sm leading-6 text-white/80">
            Application web interne dediee a la gestion et au suivi des
            activites
            <br />
            du Ministere de l&apos;Enseignement Superieur et de la Recherche
            Scientifique.
          </p>

          <div className="relative mb-6 w-full max-w-md border-b border-white/25">
            <div
              className={`absolute bottom-0 h-[3px] w-full max-w-md rounded-full bg-[#75b82a] transition-all duration-300 ${
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
            <div className="mx-auto max-w-md md:mx-0">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Identifiant (ex: 123 456)"
                value={identifier}
                onChange={(event) => setIdentifier(formatIdentifier(event.target.value))}
                className="mb-4 w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60"
              />
              <div className="relative mb-6">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  maxLength={16}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 pr-12 text-white outline-none placeholder:text-white/60 focus:border-white/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.184.557.184 1.144 0 1.701C20.577 17.584 16.641 20.5 12 20.5c-4.638 0-8.573-3.007-9.963-7.183Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
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
