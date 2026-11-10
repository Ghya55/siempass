---
statut: décidée par Ghya le 2026-11-10
auteur: Richard
date: 2026-11-10
---
# Authentification : mécanisme réel, identités de test

## Problème
La décision « droits sans authentification » du 10/11 était bornée à la démonstration, qui est faite.
L'étape suivante est de faire essayer l'app à un cercle d'amis : le back-office doit être protégé et
les politiques ouvertes au rôle `anon` doivent se refermer. Ghya veut le processus d'authentification
réel, sans avoir à gérer de vrais comptes pendant les mois de tests internes.

## Options
1. Rester sans authentification : exclu, la clé publishable part dans le navigateur de chaque ami.
2. Authentification complète (Google, vérification d'e-mail, inscription client) : coût inutile tant qu'aucun partenaire réel n'est en base.
3. Mécanisme réel, identités de test : Supabase auth e-mail/mot de passe, comptes créés au seed sur un domaine factice.

## Décision
Option 3, par Ghya le 10/11.
- **Admin** : Supabase auth e-mail/mot de passe sur `apps/admin`. Comptes créés par le seed, adresses factices en `@siempass.com`, confirmation d'e-mail désactivée, aucun e-mail envoyé. Un compte pour Ghya au départ ; celui de l'associé s'ajoute par une ligne de seed. Le mot de passe vient d'une variable d'environnement, jamais du dépôt.
- **Partenaire** : rien ne change. Le lien d'accès à jeton opaque de [PART-7](../specs/partenaire.md#part-7) est déjà le mécanisme réel et reste sans compte ni mot de passe.
- **Client** : le pass reste porté par le navigateur, derrière une seule fonction. L'e-mail et le lien de récupération sont une tâche séparée.
- **Politiques** : `partners` repasse en lecture seule pour `anon`, et seulement sur les lignes `en ligne` ; les écritures du back-office passent sous le rôle authentifié. `passes` reste en lecture seule pour `anon`, ses écritures en Edge Function.
- DEMO-4 et DEMO-20 (aucun écran de connexion) étaient des contraintes de démonstration, pas des règles produit : elles ne s'appliquent plus au back-office. Le parcours du client et celui du partenaire restent sans connexion.

## Ce qu'on ne fait pas
Pas de Google, pas d'inscription en libre-service, pas de table `profiles`, pas de distinction
`admin` / `partner` en base tant qu'il n'y a qu'un rôle authentifié. Pas de nom de domaine réel, pas
d'envoi d'e-mail. Le nettoyage de la base avant la mise en production reste à faire et appartient à Ghya.

## Ouvert pour Ghya
*Sans objet.*
