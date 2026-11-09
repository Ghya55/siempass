---
statut: proposée
auteur: Richard
date: 2026-11-10
---
# Droits de la démonstration : pas d'authentification, donc pas de rôles

## Problème
Le parcours de démonstration interdit tout écran de connexion (PART-7, DEMO-4, DEMO-20) : le
partenaire entre par un lien, l'admin ouvre le back-office. Sans `auth.users`, les rôles `admin`
et `partner` du skill back-end n'existent pas : il ne reste que le rôle `anon` de la clé
publishable, qui part dans le navigateur de qui ouvre l'URL.

## Options
1. Rôles réels : un écran de connexion pour l'admin — contredit une question déjà tranchée.
2. Écritures du back-office côté serveur avec la clé `service_role` dans Vercel : rôles toujours
   absents, et une clé réelle à poser hors du dépôt, ce que la démonstration exclut (DEMO-24).
3. Politiques ouvertes au rôle `anon` sur `partners`, lecture seule sur `passes` : coût nul,
   la base de la démonstration est lisible et modifiable par qui connaît l'URL et la clé.

## Décision
Option 3, par Richard, dans le cadre de la démonstration de demain. Les écritures de `passes`
(achat, validation) restent interdites au navigateur et passent par Edge Function en
`service_role` : le pass ne se fabrique pas depuis le client. `partners` est ouvert en lecture,
ajout et modification ; aucune politique de suppression nulle part.

## Ce qu'on ne fait pas
Pas de table `profiles`, pas de fonction `security definer`, pas de distinction `admin` /
`partner` dans la base : elles arriveront avec l'authentification, qui n'est pas spécifiée.
Rien n'est à défaire : on ajoute des politiques, on n'en retire pas.

## Ouvert pour Ghya
1. La base de la démonstration est la base réelle (décision du 09/11). Tant que ces politiques
   tiennent, tout partenaire saisi y est lisible et modifiable par le porteur de l'URL : avant
   d'y entrer de vraies coordonnées de partenaires, il faut l'authentification.
