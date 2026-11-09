---
name: site-public
description: Conventions de siempass.com (apps/site) — pages lieux, achat du pass, wallet PWA, SEO, performance, textes. À charger pour toute tâche qui touche le site public, en spec (Quentin), en design (Alex) ou en code (Stéphane).
---
# Le site public

## Son travail
Faire acheter le pass. Chaque page sert un des trois gestes du visiteur : **découvrir** les lieux, **acheter** le pass, **montrer** son pass au comptoir. Ce qui n'y contribue pas n'y est pas.

## Pages (à confirmer par spec, page par page)
- Accueil : la promesse en une phrase (le bénéfice, pas la fonctionnalité), les lieux phares, l'appel à l'achat.
- Liste des lieux et fiche d'un lieu : seulement les partenaires `published`, avec l'avantage offert.
- Achat : le moins d'étapes possible ; paiement PayWay.
- Wallet : le QR du pass, consultable hors connexion (PWA), lisible au soleil (contraste, taille).

## Textes
Les textes exacts viennent de la spec (entre « »). Stéphane ne réécrit pas une phrase : il signale à Quentin. Jamais de témoignage ni de chiffre inventé. Langue de départ : anglais pour le visiteur ; d'autres langues seulement sur décision.

## Technique (Next.js App Router)
- Pages lieux générées statiquement et revalidées à la publication (ISR ou revalidation à la demande) : publier dans le back-office met le site à jour sans redéploiement.
- Mobile-first ; images optimisées (`next/image`, dimensions déclarées) ; une seule police chargée. Lighthouse mobile ≥ 90 avant livraison.
- SEO : `title`, `description`, Open Graph par page, `sitemap.xml`, `robots.txt` (staging : `noindex`), titres `h1`→`h3` dans l'ordre, données structurées pour les lieux.
- Analytics respectueux de la vie privée, sans bannière si possible ; choix de Ghya, noté dans une décision.
- Aucune donnée personnelle collectée sans mention de confidentialité.

## Livrer
Une PR du site joint une capture mobile (et desktop si la page change à cette largeur).
