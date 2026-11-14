---
type: objet
titre: "Partenaire"
statut: brouillon
porteur: Quentin
figma:
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=7-42  # formulaire
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=7-210  # panneau
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=7-474  # fiche partenaire
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=7-388  # état en ligne
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=7-608  # carte lieu
maj: 2026-11-14
---

*Préfixe des identifiants : `PART-`. Corrigée le 14/11 d'après les décisions de Ghya : le lieu sort du partenaire et devient un objet à part, voir [venues.md](venues.md).*

## Définition
Un **partenaire** est un humain : la personne avec qui l'associé parle, qui offre un avantage aux porteurs du pass en échange d'une mise en avant gratuite. Il ne paie rien.

Il porte des entités : aujourd'hui des **lieux** (bar, restaurant), objets à part décrits dans [venues.md](venues.md) ; plus tard des activités et des événements, avec leur propre feature. L'objet partenaire ne tient plus que le **contact**. Il n'a pas d'état : c'est le lieu qui se publie.

## Attributs
**Contact** — jamais affiché au public.

| Nom | Type | Obligatoire | Exemple |
|---|---|---|---|
| `contact_nom` | texte court | oui | « Sok » |
| `contact_prenom` | texte court | oui | « Dara » |
| `contact_telephone` | texte court | oui | « +855 12 345 678 » |
| `contact_email` | e-mail | non | « dara.sok@exemple.com » |

**Lieu, avantage et état** — sortis du partenaire le 14/11 : ils vivent sur le lieu ([venues.md](venues.md), bloc 1).

## Règles
**PART-1 — ~~Deux groupes, une seule fiche.~~** Retirée le 14/11 : un partenaire porte plusieurs lieux, objets à part ([PART-13](partenaire.md#part-13)).

**PART-2 — Champs minimaux.** La liste d'attributs ci-dessus est fermée : le contact, rien d'autre. Le formulaire partenaire n'a plus de groupe « The venue » ; les champs du lieu sont ceux de [VEN-3](venues.md#ven-3).

**PART-3 — ~~Création en brouillon.~~** Retirée le 14/11 : l'état passe sur le lieu ([VEN-6](venues.md#ven-6)). Un partenaire n'apparaît jamais sur le site public.

**PART-4 — ~~Mise en ligne explicite.~~** Retirée le 14/11 : on publie un lieu, plus un partenaire ([VEN-6](venues.md#ven-6)).

**PART-5 — ~~Retour possible.~~** Retirée le 14/11 : « Back to draft » est sur le lieu ([VEN-6](venues.md#ven-6)).

**PART-6 — ~~L'avantage est saisi au back-office, sur le partenaire.~~** Retirée le 14/11 : l'avantage passe sur le lieu, saisi par l'admin ([VEN-7](venues.md#ven-7)). « Unique ou répétable » est tranché : un pass se valide une fois dans chaque lieu ([VEN-8](venues.md#ven-8)). Le partenaire ne modifie toujours rien.

**PART-7 — Pas de compte, pas de mot de passe.** Le partenaire accède à sa fiche par un **lien d'accès** qui lui est envoyé depuis le back-office. Aucun écran de connexion, aucune inscription, aucun mot de passe n'est spécifié.

**PART-8 — Le contact reste privé.** `contact_nom`, `contact_prenom`, `contact_telephone` et `contact_email` ne sont jamais rendus sur le site public.

**PART-13 — Un humain, plusieurs entités.** Tranché le 14/11 : un même contact porte zéro, un ou plusieurs lieux ([VEN-1](venues.md#ven-1)). Le tableau « Partners » affiche leur nombre dans la colonne « Venues » ([VEN-15](venues.md#ven-15)).

## Cas limites
**PART-9 — ~~Deux lieux au même nom.~~** Retirée le 14/11 : cas du lieu ([VEN-21](venues.md#ven-21)).

**PART-10 — ~~Pas de photo.~~** Retirée le 14/11 : cas du lieu ([VEN-19](venues.md#ven-19)).

**PART-11 — Champ obligatoire vide.** La fiche ne s'enregistre pas et le champ fautif porte « Ce champ est obligatoire ».

**PART-12 — ~~Avantage vide à la mise en ligne.~~** Retirée le 14/11 : l'avantage est requis pour publier un lieu ([VEN-23](venues.md#ven-23)).

## Ouvert pour Ghya
1. Quelle est la durée de validité du pass ? Tant qu'elle n'est pas tranchée, toute date affichée est provisoire.
2. Qui saisit les partenaires en vrai : Ghya, l'associé, ou le partenaire lui-même par un formulaire ?

## Détails techniques
`partners` ne tient plus que le contact (14/11). Les colonnes `lieu_*`, `avantage` et `etat` sont recopiées dans `venues` et restent en place, lues par le code de `main`, le lien partenaire et le scan, jusqu'à la tâche du scan par lieu ; leur suppression vient après sa mise en prod ([venues.md](venues.md), « Détails techniques »). Le lien d'accès de [PART-7](partenaire.md#part-7) est un jeton opaque par partenaire, lisible par RLS sous le rôle `partner`.
