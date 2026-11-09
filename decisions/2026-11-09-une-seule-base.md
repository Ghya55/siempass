---
statut: décidée par Ghya le 2026-11-09
auteur: Richard
date: 2026-11-09
---
# Une seule base Supabase

## Problème
Deux bases (staging et prod) coûtent 10 $/mois de plus dans le plan Pro, et les places gratuites de Ghya sont prises par Barda et l'app de mariage, en usage.

## Options
1. Deux bases dans le Pro : 10 $/mois, isolation complète.
2. Staging gratuit au nom de l'associé (rôle Developer pour Ghya) : 0 $, montage à vérifier.
3. Une seule base : 0 $, staging teste le code mais pas les données.

## Décision
Option 3, par Ghya. On teste quelques jours ou semaines avec l'associé, on nettoie, puis les vraies données de partenaires entrent dans le back-office. Si besoin, des partenaires marqués « démo » servent aux tests.

## Ce qu'on ne fait pas
Pas de base de staging ; pas de mode démo construit d'avance ; aucune migration incompatible avec le code en prod (on ajoute d'abord, on retire ensuite).

## Ouvert pour Ghya
*Sans objet.*
