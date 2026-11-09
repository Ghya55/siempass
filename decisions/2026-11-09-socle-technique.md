---
statut: prise
auteur: Stéphane
date: 2026-11-09
---
# Socle technique : choix de détail

## Problème
`projet.md` § Architecture fixe le monorepo, les deux fronts Next.js et la base unique, et laisse
à Stéphane « les choix techniques de détail, tranchés au socle ». Cinq restent à poser avant
d'écrire la moindre ligne de produit, sinon chaque PR les rouvrira.

## Options
L'alternative sérieuse, et ce qu'elle coûtait :
- pnpm workspaces : meilleur en monorepo, mais un `packageManager` de plus à aligner entre Vercel,
  la CI et `tache.sh`, pour deux apps et deux packages.
- Packages `core-*` / `feature-*` (skill `hzblj-skills:project`) : la bonne cible à dix packages,
  de l'échafaudage à deux.
- Tokens en TypeScript compilés vers du CSS : typés, mais une étape de build pour des variables
  qui ne servent qu'à CSS Modules.

## Décision
Tranché par Stéphane, dans le cadre :
1. **npm workspaces + Turborepo** — Thija est en npm, Vercel et la CI n'ont rien à configurer,
   `tache.sh` appelle déjà `npm run -s check`.
2. **Deux packages, `@siempass/db` et `@siempass/tokens`** — la consigne disait « `packages/db` :
   client Supabase + tokens CSS » ; un package nommé `db` qui livre du CSS ment sur son contenu.
   Noms plats, pas de préfixe `core-` tant qu'il y a deux packages.
3. **`packages/db` = config + client typé + types générés + `checkSupabaseConnection`**, un seul
   point d'entrée (`index.ts`) : les apps n'importent jamais un fichier interne.
4. **Tokens = un `tokens.css` de variables CSS**, importé par le `globals.css` de chaque app.
   Valeurs provisoires et ternes, marquées `FIGMA-MANQUANT`, remplacées en bloc après Figma.
5. **`check` = `turbo run lint typecheck build`** à la racine : un seul mot pour `tache.sh`, et la
   CI lance exactement ce qu'on lance en local.
6. **TS strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`** — gratuit aujourd'hui,
   impayable à poser sur du code existant.

## Ce qu'on ne fait pas
Pas de Tailwind : CSS Modules + tokens, comme Thija. Pas de librairie de composants, pas d'outil
de test, pas de Storybook, pas de `vercel.json`. Aucune table métier, aucun écran produit.

## Ouvert pour Ghya
*Sans objet.*
