---
name: backend-supabase
description: Conventions back-end de SiemPass sur Supabase — schéma, migrations, RLS avec les rôles admin et partner, seed, Edge Functions, client partagé Next.js, projets staging et prod. À charger pour toute tâche qui touche la base, l'auth, les droits ou une fonction serveur.
---
# Back-end — Supabase

## Principes
- **Le schéma suit les écrans validés.** On crée la table quand un écran en a besoin, pas avant. Un schéma complet écrit en avance est de l'anticipation.
- **Postgres standard** : rien qui n'existerait pas hors Supabase.
- **RLS activé sur toute table dès sa création**, politique par défaut : rien n'est lisible. On ouvre règle par règle, chaque politique commentée par la règle de spec qu'elle applique.
- **Les rôles** : `admin` (tout), `partner` (sa fiche, ses offres, ses validations), `anon` (ce qui est publié, en lecture seule). Le rôle se lit dans une table `profiles` liée à `auth.users`, via une fonction `security definer` ; jamais depuis une donnée que le client peut modifier.
- **Aucun secret dans le dépôt.** Clé publique dans les variables d'environnement ; la clé `service_role` ne vit que dans les Edge Functions et les secrets CI.

## Structure
```
supabase/migrations/   AAAAMMJJHHMMSS_<slug>.sql, une par changement, jamais modifiée après merge
supabase/functions/    Edge Functions (webhooks de paiement, génération et validation des passes)
supabase/seed.sql      données fictives (faux partenaires), rejouables
supabase/tests/        tests de droits (pgTAP), un fichier par table
packages/db/           client typé et types générés, partagés par apps/site et apps/admin
```

## Façon de travailler
1. Migration → politiques RLS → tests de droits → types régénérés (`supabase gen types`), dans la même PR.
2. Local : `supabase start`, `supabase db reset` (migrations + seed), `supabase test db`.
3. Un trigger est documenté en une ligne dans sa migration : ce qu'il garantit, pourquoi le client ne peut pas le faire.
4. **En parallèle** : après le rebase, si une autre migration est arrivée, renommer la sienne avec un horodatage postérieur, rejouer `db reset`, régénérer les types. Jamais de fusion manuelle des types.

## Staging et prod
- Deux projets Supabase. Les migrations s'appliquent **par la CI** : sur `staging` au merge dans `staging`, sur prod au merge dans `main`. Jamais à la main, jamais par le MCP Supabase sur la prod.
- Le seed ne s'applique **qu'en local et sur staging**, jamais en prod.
- Le MCP Supabase sert à lire (schéma, journaux, conseils) ; sur staging seulement pour écrire.

## Paiement (ABA PayWay)
- Le paiement se confirme **côté serveur** : une Edge Function reçoit le webhook, vérifie la signature, crée le pass. Le client ne crée jamais un pass.
- Sandbox PayWay sur staging, production sur prod ; clés en secrets.
- Un webhook reçu deux fois ne crée pas deux passes (clé d'idempotence = identifiant de transaction).

## Coûts
Le palier gratuit suffit au POC ; un projet gratuit inactif se met en pause après une semaine. Vérifier les prix avant de les citer à Ghya.
