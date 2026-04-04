"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getStoredRole } from "@/services/auth.services";

// Barre de navigation partagee par les pages internes, sans modifier le visuel existant.
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [storedRole, setStoredRole] = useState<string | null>(null);

  const navItems = useMemo(() => {
    if (storedRole === "Simple utilisateur") {
      return [
        { href: "/tableau", label: "Tableau de bord" },
        { href: "/activites", label: "Activites" },
        { href: "/profile", label: "Profile" },
      ];
    }

    return [
      { href: "/tableau", label: "Tableau de bord" },
      { href: "/activites", label: "Activites" },
      { href: "/utilisateurs", label: "Utilisateurs" },
    ];
  }, [storedRole]);

  useEffect(() => {
    setStoredRole(getStoredRole());
  }, []);

  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [navItems, router]);

  const prefetchRoute = (href: string) => {
    router.prefetch(href);
  };

  const navigateTo = (href: string) => {
    if (pathname === href || isPending) {
      return;
    }

    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav className="relative flex items-center bg-[linear-gradient(90deg,#0f4b86_0%,#1460ab_46%,#1460ab_74%,#1d6ab7_100%)] px-6 py-1.5 text-white">
      <div className="-ml-6 flex w-64 shrink-0 justify-center">
        <Image
          src="/logo.png"
          alt="MESUPRES logo"
          width={184}
          height={184}
          priority
          className="h-auto w-auto"
        />
      </div>

      <ul className="absolute left-[56%] flex -translate-x-1/2 space-x-16 font-semibold text-[14px] text-white">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                aria-current={isActive ? "page" : undefined}
                onMouseEnter={() => prefetchRoute(item.href)}
                onFocus={() => prefetchRoute(item.href)}
                onTouchStart={() => prefetchRoute(item.href)}
                onClick={(event) => {
                  if (isActive) {
                    event.preventDefault();
                    return;
                  }

                  event.preventDefault();
                  navigateTo(item.href);
                }}
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
    </nav>
  );
}
