# Architecture ETN Frontend

Cette organisation garde `app/` pour le routing Next.js et deplace le code partage dans des dossiers dedies pour rester propre sans casser le design actuel.

## Structure recommandee

```text
.
|-- app/                  # routes Next.js uniquement
|-- components/
|   |-- layout/           # shells, navbar, loaders de navigation
|   `-- ui/               # boutons, loaders, composants visuels
|-- context/              # providers React globaux
|-- hooks/                # hooks reutilisables
|-- lib/                  # clients techniques et helpers
|-- public/               # assets statiques
|-- services/             # appels API metier
|-- store/                # etat global optionnel
|-- styles/               # styles et documents de style partages
`-- types/                # types TypeScript communs
```

## Regles simples

- Garder `app/` reserve au routing, aux layouts et aux fichiers speciaux Next.js.
- Mettre les composants reutilisables hors de `app/` pour mieux separer UI et navigation.
- Centraliser Axios dans `lib/axios.ts` et consommer via `services/api.ts`.
- Ajouter les hooks, contexts, store et types seulement quand le besoin existe.
