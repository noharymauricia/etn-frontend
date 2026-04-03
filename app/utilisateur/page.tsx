"use client";

import PageShell from "@/components/layout/PageShell";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <PageShell title="Utilisateurs">
      <div className="mb-5 flex justify-end">
        <div className="w-full max-w-[220px]">
          <Button label="Creer un utilisateur" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/25">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">Noms</th>
              <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">Fonctions</th>
              <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">Role</th>
              <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Marie</td>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Chef de service</td>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Administrateur</td>
              <td className="border-b border-white/80 px-6 py-4">
                <div className="w-full max-w-[140px]">
                  <Button label="Supprimer" />
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Bob</td>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Directeur</td>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Utilisateur</td>
              <td className="border-b border-white/80 px-6 py-4">
                <div className="w-full max-w-[140px]">
                  <Button label="Supprimer" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex justify-between gap-4">
        <div className="w-full max-w-[150px]">
          <Button label="Precedent" />
        </div>
        <div className="w-full max-w-[150px]">
          <Button label="Suivant" />
        </div>
      </div>
    </PageShell>
  );
}
