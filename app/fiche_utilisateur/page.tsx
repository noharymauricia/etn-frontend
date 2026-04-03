"use client";

import PageShell from "@/components/layout/PageShell";
import Button from "@/components/ui/Button";

const fieldClassName =
  "w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60"

export default function Home() {
  return (
    <PageShell title="Enregistrer un utilisateur" maxWidth="max-w-4xl">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Nom</label>
          <input type="text" placeholder="rakotoarisoa" className={fieldClassName} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">IM</label>
          <input type="text" placeholder="ETU20025" className={fieldClassName} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Role</label>
          <select className={fieldClassName}>
            <option className="text-black">Administrateur</option>
            <option className="text-black">Utilisateur</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Fonction</label>
          <input type="text" placeholder="chef de services" className={fieldClassName} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Telephone</label>
          <input type="tel" placeholder="+(261)34 02 192 00" className={fieldClassName} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Mot de passe</label>
          <input type="password" placeholder="strong password" className={fieldClassName} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-[180px]">
          <Button label="Enregistrer" />
        </div>
      </div>
    </PageShell>
  );
}
