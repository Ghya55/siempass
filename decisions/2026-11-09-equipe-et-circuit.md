---
statut: décidée par Ghya le 2026-11-09
auteur: Richard
date: 2026-11-09
---
# L'équipe de SiemPass et son circuit

## Problème
L'équipe v3 (sept agents, tickets, journal, équipe-mère installée par copie) s'alourdissait sur Barda et Moodverse : agents inutiles (QA, second designer, PO), artefacts humains (tickets, journal), merges à la main par Ghya qui ne relit pas, conflits dès que plusieurs tâches tournent en parallèle, refus de droits en début de conversation.

## Décision
- **L'équipe vit dans ce dépôt** : plus d'équipe-mère (`Ghya55/equipe-produit` archivé), plus d'installation ni de remontée.
- **Quatre** : Richard (pilote), Quentin (PM, specs et textes), Alex (design UX et UI, site et back-office), Stéphane (full-stack). Estelle, Morgane, Jérémy, Roman sortent.
- **Pas de tickets ni de journal** : la spec dit quoi faire et quand c'est fini ; la PR est l'unité de travail ; GitHub est l'état.
- **Richard choisit les skills** de chaque agent (ligne « Skills » obligatoire).
- **Parallélisme** : une conversation = une branche = une PR ; aucun fichier partagé réécrit par toutes les tâches.
- **Merge par l'équipe** vers `staging` quand la CI est verte ; **la CI est le seul relecteur du code**. Ghya teste sur staging, à son rythme, tout au même endroit.
- **Prod** : `main`, promue depuis `staging` seulement quand Ghya le dit.
- **Figma d'abord, back-office compris** : c'est l'outil de discussion avec l'associé.

## Ce qu'on ne fait pas
QA par un agent ; relecture humaine du code ; correctif direct sur `main` ; dépôt privé pour l'instant (Ghya le passera plus tard).

## Ouvert pour Ghya
*Sans objet.*
