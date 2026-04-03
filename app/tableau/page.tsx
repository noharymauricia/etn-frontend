"use client";

import Image from "next/image";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";

export default function TableauPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#155faa_0%,#0f4f95_100%)]">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar gauche */}
        <div className="flex min-h-full w-64 flex-col items-center border-r border-white/15 bg-[rgb(15,27,45)]/20 p-4 text-white backdrop-blur-sm">
          <div className="mb-6 flex w-full flex-col items-center">
            <Image
              src="/photo.jpg"
              alt="Profil"
              width={170}
              height={215}
              className="mb-5 rounded-xl object-cover"
            />
            <div className="w-[170px] rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-left">
              <div className="flex items-start justify-between gap-3">
                <p className="pb-2 text-[15px] font-semibold leading-5">
                  Nohary <br />
                  RAKOTOARISOA
                </p>
                <button
                  type="button"
                  aria-label="Modifier le profil"
                  className="inline-flex h-6 w-6 items-center justify-center text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L8.25 18.463 4.5 19.5l1.037-3.75L16.862 3.487Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 4.5 19.5 8.25"
                    />
                  </svg>
                </button>
              </div>
              <div className="my-2 h-[3px] w-full rounded-full bg-white" />
              <p className="pb-2 text-sm font-medium leading-5">
                Directeur artistique
              </p>
              <div className="my-2 h-[3px] w-full rounded-full bg-white" />
              <p className="pt-2 text-sm font-medium capitalize leading-5">
                administrateur
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="mt-auto flex w-full items-center justify-center gap-2 py-3 text-white transition-opacity hover:opacity-80"
          >
            <span className="font-medium">Deconnexion</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              className="h-6 w-6 shrink-0 [transform:scaleX(-1)]"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 3H18a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 18 21h-2.25"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 16.5 3.75 12 9 7.5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 12h12"
              />
            </svg>
          </Link>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-6">
          {/* Blocs alignes en carre */}
          <div className="mb-6 max-w-5xl rounded-3xl border border-white/20 bg-[rgb(15,27,45)] p-5 shadow-lg shadow-black/15">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex aspect-square max-w-[180px] items-center justify-center justify-self-center rounded-2xl border-2 border-[#8ec5ff] bg-[#2f6fb8] px-4 py-4 text-center text-white shadow-md shadow-black/15">
                <div className="flex w-full flex-col items-center">
                  <span className="text-base font-semibold">Activites en cours</span>
                  <div className="my-3 h-px w-full bg-white/90" />
                  <span className="text-3xl font-bold">12</span>
                </div>
              </div>
              <div className="flex aspect-square max-w-[180px] items-center justify-center justify-self-center rounded-2xl border-2 border-[#8ec5ff] bg-[#2f6fb8] px-4 py-4 text-center text-white shadow-md shadow-black/15">
                <div className="flex w-full flex-col items-center">
                  <span className="text-base font-semibold">
                    Activites planifiees
                  </span>
                  <div className="my-3 h-px w-full bg-white/90" />
                  <span className="text-3xl font-bold">08</span>
                </div>
              </div>
              <div className="flex aspect-square max-w-[180px] items-center justify-center justify-self-center rounded-2xl border-2 border-[#8ec5ff] bg-[#2f6fb8] px-4 py-4 text-center text-white shadow-md shadow-black/15">
                <div className="flex w-full flex-col items-center">
                  <span className="text-base font-semibold">Activites terminees</span>
                  <div className="my-3 h-px w-full bg-white/90" />
                  <span className="text-3xl font-bold">24</span>
                </div>
              </div>
              <div className="flex aspect-square max-w-[180px] items-center justify-center justify-self-center rounded-2xl border-2 border-[#8ec5ff] bg-[#2f6fb8] px-4 py-4 text-center text-white shadow-md shadow-black/15">
                <div className="flex w-full flex-col items-center">
                  <span className="text-base font-semibold">Activites recentes</span>
                  <div className="my-3 h-px w-full bg-white/90" />
                  <span className="text-3xl font-bold">05</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton sous les 3 div <div className="mb-6">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
            Activites recentes
            </button>
          </div>*/}

          {/* Tableau statique */}
          <div className="rounded-2xl border border-white/20 bg-[rgb(15,27,45)]/35 p-4 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Liste des utilisateurs
            </h2>
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">
                    Activites
                  </th>
                  <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">
                    Status
                  </th>
                  <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">
                    1
                  </td>
                  <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">
                    Alice
                  </td>
                  <td className="border-b border-white/80 px-6 py-4">
                    <div className="w-full max-w-[120px]">
                      <Button label="Voir" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">
                    2
                  </td>
                  <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">
                    Bob
                  </td>
                  <td className="border-b border-white/80 px-6 py-4">
                    <div className="w-full max-w-[120px]">
                      <Button label="Voir" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
