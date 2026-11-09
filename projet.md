# Projet — SiemPass

*Le cadre du projet. Ce qui n'est pas connu reste « à compléter » : on ne l'invente pas. Seul Ghya valide un changement de « La boîte » et de « Cadre ».*

## En une phrase
Un pass (~20 $) vendu aux touristes et aux locaux de Siem Reap, qui donne des avantages dans un réseau de lieux partenaires.

## La boîte
- **Le modèle** : les partenaires (bars, restaurants, commerçants, artistes, lieux d'événements) ne paient rien. Ils sont mis en avant gratuitement et offrent un avantage (verre, plat, réduction) aux porteurs du pass. **Seule source de revenus : la vente du pass.**
- **Les associés** : Ghya (produit et technique, CTO/CPO) et son associé (réseau des lieux, vente terrain, non technique). L'associé exprime ses besoins ; on se met d'accord sur le Figma.
- **D'où on part** : un POC bricolé (Shopify pour le paiement et des bouts de blog, Notion, ClickUp, Supabase). Zéro utilisateur en production. **Objectif : tout remplacer par un produit propre**, sans Shopify, Notion ni ClickUp.
- **Ce qui compte en ce moment** : démontrer qu'une donnée saisie une fois dans notre back-office se publie sur notre site (voir « Premier jalon »).
- **Philosophie** : techniquement simple, volontairement limité à l'architecture ci-dessous. Pas d'app native au départ.

## Pour qui
- **Visiteur** (touriste, local) : découvre les lieux, achète le pass, le montre au comptoir.
- **Partenaire** : valide un pass au comptoir en 5 secondes, gère sa page et ses offres.
- **Admin** (Ghya, l'associé) : gère les lieux, les offres, les ventes, les validations.

## Cadre
- **Premier jalon (POC pour l'associé)** : une page « Partenaires » du back-office (tableau) ; clic sur une ligne → panneau latéral droit avec la fiche et des boutons d'action ; bouton « Publier » → le partenaire apparaît dans la liste des lieux du site public. Architecture réelle dès le départ : vraie base, vraie table, vrai champ `published`, aucune donnée en dur ; faux partenaires dans `supabase/seed.sql`, supprimés le jour où les vrais sont saisis.
- **Reporté volontairement** (à définir avec l'associé) : durée de validité du pass, avantage unique ou répétable par lieu, nombre de partenaires signés, canaux de distribution (hôtels, agences, en ligne).
- **Hors V1** : app native, comptes visiteurs sophistiqués, toute fonctionnalité non demandée par un des trois personas.

## Architecture (validée par Ghya, 06/11/2026)
- **Monorepo Turborepo**, deux fronts Next.js, une seule base Supabase, types et client partagés.
  - `apps/site` → siempass.com : design dédié, mobile-first, SEO, liste des lieux, achat, wallet (QR dans le navigateur, PWA).
  - `apps/admin` → app.siempass.com : desktop-first, utilitaire, quelques écrans responsive ; le scanner de validation (rôle partner) est un écran mobile à part entière.
- **Supabase** : Postgres, Auth, RLS, Edge Functions (webhooks de paiement, génération et validation des passes). Pas de serveur back-end séparé.
- **Rôles** `admin` et `partner` dans le même back-office, verrouillés par RLS (pas seulement côté interface). Le partenaire ne gère que sa page, ses offres, ses validations.
- **Paiement** : ABA PayWay (KHQR/Bakong, ABA Pay, cartes, UPI, JCB, Alipay, WeChat), API et sandbox disponibles. Apple Pay en ligne non confirmé (à vérifier auprès de PayWay) ; sinon Stripe via l'entité française. **Chemin critique administratif** : entité enregistrée au Cambodge et compte ABA business.
- **Hébergement** : Vercel. `main` → production, `staging` → staging, chaque PR → aperçu. Deux projets Supabase : staging et prod.
- Choix techniques de détail (style, librairie de composants, outils de test) : tranchés par Stéphane au socle, notés dans une décision.

## Figma
Fichier : à compléter (lien et clé). Organisation : skill `figma-bibliotheque`.

## Comptes et secrets
Jamais dans le dépôt. Variables d'environnement Vercel (par environnement) et secrets GitHub Actions. À compléter : qui détient quels accès (Vercel, Supabase, PayWay, domaine).
