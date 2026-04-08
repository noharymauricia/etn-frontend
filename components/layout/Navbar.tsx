"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_SESSION_EVENT, getStoredProfile, getStoredRole } from "@/services/auth.services";

// Barre de navigation partagee par les pages internes, sans modifier le visuel existant.
export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [storedRole, setStoredRole] = useState<string | null>(null);

  useEffect(() => {
    const syncStoredRole = () => {
      setStoredRole(getStoredProfile()?.role ?? getStoredRole());
    };

    syncStoredRole();
    window.addEventListener(AUTH_SESSION_EVENT, syncStoredRole);
    window.addEventListener("storage", syncStoredRole);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncStoredRole);
      window.removeEventListener("storage", syncStoredRole);
    };
  }, []);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navItems = useMemo(() => {
    if (storedRole === "Simple utilisateur") {
      return [
        { href: "/tableau", label: "Tableau de bord" },
        { href: "/activites", label: "Activites" },
        { href: "/profile", label: "Profil" },
      ];
    }

    return [
      { href: "/tableau", label: "Tableau de bord" },
      { href: "/activites", label: "Activites" },
      { href: "/utilisateurs", label: "Utilisateurs" },
    ];
  }, [storedRole]);

  return (
    <nav className="relative flex items-center px-3 py-1.5 text-white md:px-6">
      {/* Logo */}
      <div className="-ml-3 flex w-auto shrink-0 justify-center md:-ml-6 lg:w-64">
        <Image
          src="/logo.png"
          alt="MESUPRES logo"
          width={184}
          height={184}
          priority
          className="h-auto w-[120px] md:w-[150px] lg:w-auto"
        />
      </div>

      {/* Bouton hamburger — visible uniquement sur mobile/tablette */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="ml-auto p-2 text-white transition-colors hover:text-white/80 lg:hidden"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Navigation desktop — masquée sous lg */}
      <ul className="absolute left-[56%] hidden -translate-x-1/2 space-x-16 font-semibold text-[14px] text-white lg:flex">
        {navItems.map((item) => {
          const isActive = pathname.replace(/\/$/, "") === item.href.replace(/\/$/, "");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                aria-current={isActive ? "page" : undefined}
                className={`group relative inline-flex items-center rounded-full px-4 py-2.5 transition-colors duration-200 hover:bg-[#75b82a]/90 focus-visible:bg-[#75b82a]/20 active:bg-[#75b82a]/30 ${
                  isActive ? "bg-[#75b82a]/90" : ""
                }`}
              >
                <span className="relative inline-block whitespace-nowrap">
                  {item.label}
                  <span
                    className={`pointer-events-none absolute left-1/2 -bottom-5 h-1 -translate-x-1/2 rounded-full bg-[#75b82a] transition-all duration-200 group-hover:w-full group-focus-visible:w-full ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Menu mobile — overlay plein écran */}
      {menuOpen ? (
        <div className="fixed inset-0 top-[60px] z-50 flex flex-col bg-[#0f4b86]/98 backdrop-blur-md lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="flex flex-col items-center gap-2 px-6 pt-8">
            {navItems.map((item) => {
              const isActive = pathname.replace(/\/$/, "") === item.href.replace(/\/$/, "");

              return (
                <li key={item.href} className="w-full max-w-xs">
                  <Link
                    href={item.href}
                    prefetch={false}
                    aria-current={isActive ? "page" : undefined}
                    className={`block w-full rounded-2xl px-6 py-4 text-center text-base font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[#75b82a]/90 text-white shadow-lg"
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
