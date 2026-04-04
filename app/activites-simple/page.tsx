"use client";

import PageShell from "@/components/layout/PageShell";
import AppScrollArea from "@/components/ui/AppScrollArea";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <PageShell title="Activites">
      <div className="mb-8 flex justify-end">
        <div className="w-full max-w-[220px]">
          <Button label="Creer une activite" />
        </div>
      </div>

      {/* Styled Title with Line */}
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white whitespace-nowrap uppercase">Activités</h2>
        <div className="h-[1px] w-full bg-white/20" />
      </div>

      <AppScrollArea className="w-full" orientation="horizontal">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#082f63] text-white">
              <th className="rounded-l-full px-6 py-4 text-left font-bold uppercase tracking-wider text-sm">Activités</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-sm">Responsables</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-sm">Status</th>
              <th className="rounded-r-full px-6 py-4 text-left font-bold uppercase tracking-wider text-sm">Action</th>
            </tr>
          </thead>
          <tbody className="before:block before:h-4 before:content-['']">
            {[
              { id: 1, name: "1", responsable: "Alice", status: "Planifiee" },
              { id: 2, name: "2", responsable: "Bob", status: "Planifiee" }
            ].map((item) => (
              <tr key={item.id} className="group transition-colors">
                <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{item.name}</td>
                <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{item.responsable}</td>
                <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block border border-white/10 bg-white/5 ${
                    item.status === "Terminee" || item.status === "Terminée" ? "text-green-400" :
                    item.status === "Planifiee" || item.status === "Planifiée" ? "text-orange-400" :
                    "text-white"
                  }`}>
                    {item.status}
                  </div>
                </td>
                <td className="border-b-2 border-white/30 px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                      title="Voir"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.184.557.184 1.144 0 1.701C20.577 17.584 16.641 20.5 12 20.5c-4.638 0-8.573-3.007-9.963-7.183Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AppScrollArea>

      <div className="mt-8 flex justify-center items-center gap-6">
        <button className="p-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-white" aria-label="Précédent">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-sm font-bold opacity-60">1 / 1</span>
        <button className="p-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-white" aria-label="Suivant">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </PageShell>
  );
}
