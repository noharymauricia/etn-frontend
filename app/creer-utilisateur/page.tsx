"use client";

import { useEffect, useState } from "react";

import PageShell from "@/components/layout/PageShell";
import AppCombobox from "@/components/ui/AppCombobox";
import Button from "@/components/ui/Button";

const fieldClassName =
  "w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60"

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [role, setRole] = useState("Administrateur");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <PageShell title="Enregistrer un utilisateur" maxWidth="max-w-4xl">
      {isMounted ? (
        <>
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
              <AppCombobox
                value={role}
                options={[
                  { label: "Administrateur", value: "Administrateur" },
                  { label: "Utilisateur", value: "Utilisateur" },
                ]}
                placeholder="Choisir un role"
                ariaLabel="Role"
                onChange={setRole}
              />
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
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
          <div className="h-[86px] rounded-xl border border-white/10 bg-white/5" />
          <div className="h-[86px] rounded-xl border border-white/10 bg-white/5" />
          <div className="h-[86px] rounded-xl border border-white/10 bg-white/5" />
          <div className="h-[86px] rounded-xl border border-white/10 bg-white/5" />
          <div className="h-[86px] rounded-xl border border-white/10 bg-white/5" />
          <div className="h-[86px] rounded-xl border border-white/10 bg-white/5" />
        </div>
      )}
    </PageShell>
  );
}
