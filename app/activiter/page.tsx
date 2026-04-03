"use client";

import PageShell from "@/components/layout/PageShell";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <PageShell title="Activites">
      <div className="mb-5 flex justify-end">
        <div className="w-full max-w-[220px]">
          <Button label="Creer une activite" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/25">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">Activites</th>
              <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">Responsables</th>
              <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">Status</th>
              <th className="border-b border-white/80 bg-white/20 px-6 py-3 text-left font-semibold text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">1</td>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Alice</td>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Planifiee</td>
              <td className="border-b border-white/80 px-6 py-4">
                <div className="w-full max-w-[120px]">
                  <Button label="Voir" />
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">2</td>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Bob</td>
              <td className="border-b border-white/80 px-6 py-4 font-semibold text-white">Planifiee</td>
              <td className="border-b border-white/80 px-6 py-4">
                <div className="w-full max-w-[120px]">
                  <Button label="Voir" />
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
