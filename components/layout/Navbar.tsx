"use client";

import Image from "next/image";
import Link from "next/link";

// Barre de navigation partagee par les pages internes, sans modifier le visuel existant.
export default function Navbar() {
  return (
    <nav className="relative flex items-center border-b border-white/15 bg-[#155faa] px-6 py-1.5 shadow-md">
      <div className="-ml-6 flex w-64 shrink-0 justify-center">
        <Image src="/logo.jpg" alt="MESUPRES logo" width={184} height={184} />
      </div>

      <ul className="absolute left-[56%] flex -translate-x-1/2 space-x-16 font-semibold text-[14px] text-white">
        <li>
          <Link
            href="/tableau"
            className="group relative inline-flex items-center rounded-full px-4 py-2.5 transition-colors duration-200 hover:bg-[#75b82a]/90 focus-visible:bg-[#75b82a]/20 active:bg-[#75b82a]/30"
          >
            <span className="relative inline-block whitespace-nowrap">
              Tableau de bord
              <span className="pointer-events-none absolute left-1/2 -bottom-5 h-1 w-0 -translate-x-1/2 rounded-full bg-[#75b82a] transition-all duration-200 group-hover:w-full group-focus-visible:w-full group-active:w-full" />
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/activiter_creation"
            className="group relative inline-flex items-center rounded-full px-4 py-2.5 transition-colors duration-200 hover:bg-[#75b82a]/90 focus-visible:bg-[#75b82a]/20 active:bg-[#75b82a]/30"
          >
            <span className="relative inline-block whitespace-nowrap">
              Activites
              <span className="pointer-events-none absolute left-1/2 -bottom-5 h-1 w-0 -translate-x-1/2 rounded-full bg-[#75b82a] transition-all duration-200 group-hover:w-full group-focus-visible:w-full group-active:w-full" />
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/fiche_utilisateur"
            className="group relative inline-flex items-center rounded-full px-4 py-2.5 transition-colors duration-200 hover:bg-[#75b82a]/90 focus-visible:bg-[#75b82a]/20 active:bg-[#75b82a]/30"
          >
            <span className="relative inline-block whitespace-nowrap">
              Utilisateurs
              <span className="pointer-events-none absolute left-1/2 -bottom-5 h-1 w-0 -translate-x-1/2 rounded-full bg-[#75b82a] transition-all duration-200 group-hover:w-full group-focus-visible:w-full group-active:w-full" />
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/fiche"
            className="group relative inline-flex items-center rounded-full px-4 py-2.5 transition-colors duration-200 hover:bg-[#75b82a]/90 focus-visible:bg-[#75b82a]/20 active:bg-[#75b82a]/30"
          >
            <span className="relative inline-block whitespace-nowrap">
              Profil
              <span className="pointer-events-none absolute left-1/2 -bottom-5 h-1 w-0 -translate-x-1/2 rounded-full bg-[#75b82a] transition-all duration-200 group-hover:w-full group-focus-visible:w-full group-active:w-full" />
            </span>
          </Link>
        </li>
        <li className="ml-2">
          <Link
            href="#"
            aria-label="Notifications"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-[#75b82a]/90 focus-visible:bg-[#75b82a]/20 active:bg-[#75b82a]/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17H9.143m5.714 0H18l-1.714-2.286V10.43a4.286 4.286 0 1 0-8.572 0v4.285L6 17h3.143m5.714 0a2.857 2.857 0 1 1-5.714 0"
              />
            </svg>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
