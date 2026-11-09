# SiemPass

Le pass des bons plans de Siem Reap. Monorepo : site public (`apps/site`), back-office (`apps/admin`), base Supabase (`supabase/`).

- **Le projet** : `projet.md`
- **L'équipe et sa façon de travailler** : `CLAUDE.md`
- **Ce qui est décidé** : `decisions/` · **Ce qui est spécifié** : `specs/`
- **Branches** : `staging` (par défaut, intégration, staging.siempass.com) → `main` (production, siempass.com)

## Le dépôt

```
apps/site/        siempass.com — visiteur, mobile-first, PWA, noindex hors production
apps/admin/       app.siempass.com — back-office admin et partenaire, desktop-first, PWA installable
packages/db/      @siempass/db — config, client Supabase typé, types générés, test de connexion
packages/tokens/  @siempass/tokens — tokens CSS partagés (provisoires tant que le Figma n'existe pas)
supabase/         config locale, migrations, seed (local et CI seulement)
```

## Démarrer en local

Node 22 (`engines` : ≥ 20.9), npm 10.

```bash
npm install                 # installe tout le monorepo
cp .env.example apps/site/.env.local
cp .env.example apps/admin/.env.local   # puis y coller la vraie clé publishable
npm run dev                 # site sur :3000, back-office sur :3001
```

Sans `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, les deux apps démarrent et affichent « Supabase : erreur » avec la raison : c'est voulu, pas une panne.

## Les commandes

| Commande | Ce qu'elle fait |
| --- | --- |
| `npm run dev` | les deux apps en développement |
| `npm run build` | build des deux apps |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` partout |
| `npm run check` | lint + typecheck + build — **ce que lance `tache.sh livrer` et la CI** |

Une seule app : `npm run dev -w @siempass/site` (idem `@siempass/admin`).

## La base

Une seule base Supabase (`ybcdppcdgbbujmlmimqs`) pour tous les environnements — voir `decisions/2026-11-09-une-seule-base.md` et le skill `backend-supabase`.

```bash
supabase start              # base locale jetable (Docker)
supabase db reset           # rejoue migrations/ puis seed.sql
supabase gen types typescript --project-id ybcdppcdgbbujmlmimqs > packages/db/src/database.types.ts
```

Les migrations sont testées dans la CI sur une base locale jetable, puis appliquées à la base réelle au merge dans `staging`. Jamais à la main.

## Instructions du projet Claude (à coller)
> Tu es Richard. Toi et moi (Ghya), nous sommes les deux head of product de SiemPass. Tu es mon sparring partner : challenge mes idées, contredis-moi quand je sors du cadre ou du MVP.
>
> **Au début de chaque conversation**, sans me demander : ajoute le dépôt GitHub `Ghya55/siempass` à la session avec droit d'écriture (push), clone-le, enregistre-le, puis lance `bash .claude/tools/tache.sh etat`. Ensuite suis `CLAUDE.md`.
>
> **Mes autorisations, données une fois pour toutes** : sur `Ghya55/siempass`, tu peux créer des branches, pousser sur tes branches, ouvrir des PR vers `staging` et les merger quand la CI est verte, avec `tache.sh`. Tu lances les agents Quentin, Alex et Stéphane quand c'est justifié. Tu ne merges vers `main` (production) que quand je dis « on passe en prod ». Ce qui supprime un travail existant, touche la base de prod, engage de l'argent ou sort du dépôt reste à moi.
>
> Une conversation = une tâche. Je lance souvent plusieurs conversations en parallèle : vérifie les PR ouvertes avant de commencer. Chaque compte rendu finit par son coût.
