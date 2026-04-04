"use client";

import { useState } from "react";

import PageShell from "@/components/layout/PageShell";
import AppCombobox from "@/components/ui/AppCombobox";
import Button from "@/components/ui/Button";

const fieldClassName =
  "w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60"

export default function Home() {
  const [status, setStatus] = useState("En cours");
  const [responsable, setResponsable] = useState("Marie");

  return (
    <PageShell title="Fiche activite" maxWidth="max-w-4xl">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Nom activite</label>
          <input type="text" className={fieldClassName} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Statut</label>
          <AppCombobox
            value={status}
            options={[
              { label: "En cours", value: "En cours" },
              { label: "Planifier", value: "Planifier" },
              { label: "Terminer", value: "Terminer" },
            ]}
            placeholder="Choisir un statut"
            ariaLabel="Statut"
            onChange={setStatus}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Responsable</label>
          <AppCombobox
            value={responsable}
            options={[
              { label: "Marie", value: "Marie" },
              { label: "Nohary", value: "Nohary" },
            ]}
            placeholder="Choisir un responsable"
            ariaLabel="Responsable"
            onChange={setResponsable}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Participants</label>
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-white">
            <ul className="space-y-2">
              <li>Marie</li>
              <li>Nohary</li>
              <li>Mauricia</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold text-white">Commentaires</label>
        <textarea className={`${fieldClassName} h-32 resize-none`} placeholder="Entrez votre texte..." />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Date debut</label>
          <input type="date" className={fieldClassName} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Date fin</label>
          <input type="date" className={fieldClassName} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <div className="w-full max-w-[190px]">
          <Button label="Mettre a jour" />
        </div>
        <div className="w-full max-w-[170px]">
          <Button label="Supprimer" />
        </div>
      </div>
    </PageShell>
  );
}
