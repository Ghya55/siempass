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
maj: 2026-11-10
---

*Préfixe des identifiants : `PART-`.*

## Définition
Un **partenaire** est un lieu de Siem Reap (bar, restaurant, commerce, lieu de spectacle) qui offre un avantage aux porteurs du pass, en échange d'une mise en avant gratuite sur le site public. Il ne paie rien.

L'objet tient deux groupes de données nettement distincts, et rien d'autre :
- le **contact** : la personne avec qui l'associé parle ;
- le **lieu** : ce que le visiteur voit sur le site public.

Un partenaire est saisi au back-office, vit en `brouillon`, puis passe `en ligne` quand il est prêt à être montré au public.

## Attributs
**Contact** — jamais affiché au public.

| Nom | Type | Obligatoire | Exemple |
|---|---|---|---|
| `contact_nom` | texte court | oui | « Sok » |
| `contact_prenom` | texte court | oui | « Dara » |
| `contact_telephone` | texte court | oui | « +855 12 345 678 » |
| `contact_email` | e-mail | non | « dara.sok@exemple.com » |

**Lieu** — affiché au public quand le partenaire est `en ligne`.

| Nom | Type | Obligatoire | Exemple |
|---|---|---|---|
| `lieu_nom` | texte court | oui | « Mango Bar » |
| `lieu_adresse` | texte court | oui | « Street 9, Wat Bo, Siem Reap » |
| `lieu_photo` | image unique | non | une photo de façade |
| `lieu_description` | texte court | oui | « Bar à cocktails sur une terrasse en bois, ouvert le soir. » |
| `avantage` | texte court | oui | « Un cocktail offert » |

**État**

| Nom | Type | Obligatoire | Exemple |
|---|---|---|---|
| `etat` | `brouillon` ou `en ligne` | oui | `brouillon` |

## Règles
**PART-1 — Deux groupes, une seule fiche.** Le contact et le lieu vivent sur le même partenaire. Un partenaire porte exactement un lieu et exactement un contact.

**PART-2 — Champs minimaux.** La liste d'attributs ci-dessus est fermée. Tout champ supplémentaire (horaires, catégorie, réseaux sociaux, plusieurs photos, plusieurs avantages) va dans « Ouvert pour Ghya » et ne se fait pas.

**PART-3 — Création en brouillon.** Un partenaire créé est en `brouillon`. Il n'apparaît nulle part sur le site public.

**PART-4 — Mise en ligne explicite.** Le passage à `en ligne` est une action humaine au back-office (« Mettre en ligne »). Rien ne publie automatiquement.

**PART-5 — Retour possible.** Un partenaire `en ligne` peut repasser `brouillon` (« Repasser en brouillon ») : il disparaît alors de la liste des lieux du site public.

**PART-6 — L'avantage est saisi au back-office.** `avantage` est renseigné par l'admin. Le partenaire le voit en **lecture seule** sur sa fiche : il ne le modifie pas. Un champ éditable trancherait par accident la question « avantage unique ou répétable », qui est reportée.

**PART-7 — Pas de compte, pas de mot de passe.** Le partenaire accède à sa fiche par un **lien d'accès** qui lui est envoyé depuis le back-office. Aucun écran de connexion, aucune inscription, aucun mot de passe n'est spécifié.

**PART-8 — Le contact reste privé.** `contact_nom`, `contact_prenom`, `contact_telephone` et `contact_email` ne sont jamais rendus sur le site public.

## Cas limites
**PART-9 — Deux lieux au même nom.** Autorisé : aucune unicité n'est imposée sur `lieu_nom`. On distingue par l'adresse.

**PART-10 — Pas de photo.** Un partenaire sans `lieu_photo` peut passer `en ligne` ; le site public affiche un visuel de remplacement neutre.

**PART-11 — Champ obligatoire vide.** La fiche ne s'enregistre pas et le champ fautif porte « Ce champ est obligatoire ».

**PART-12 — Avantage vide à la mise en ligne.** Impossible : `avantage` est obligatoire dès la création, donc un partenaire `en ligne` en a toujours un à afficher au scan.

## Ouvert pour Ghya
1. Un même contact peut-il porter plusieurs lieux (un propriétaire, trois bars) ? Le MVP dit non : un partenaire, un lieu, un contact.
2. Quelle est la durée de validité du pass ? Tant qu'elle n'est pas tranchée, toute date affichée est provisoire.
3. L'avantage est-il unique (une fois par pass et par lieu) ou répétable ? Le champ `avantage` reste en lecture seule pour le partenaire jusqu'à la réponse.
4. Qui saisit les partenaires en vrai : Ghya, l'associé, ou le partenaire lui-même par un formulaire ?

## Détails techniques
Une seule table `partners` pour le MVP : contact, lieu, avantage et état dans la même ligne. Pas de table `places` ni `offers` séparée tant que [PART-1](partenaire.md#part-1) tient.

`etat` est une colonne à deux valeurs (`brouillon`, `en ligne`), pas un booléen `published` : l'ajout d'un troisième état plus tard n'imposera pas de migration de type.

`lieu_photo` : un seul fichier, stockage Supabase. Le lien d'accès de [PART-7](partenaire.md#part-7) est un jeton opaque par partenaire, lisible par RLS sous le rôle `partner`.
