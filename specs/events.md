---
type: ecran
titre: "Événements : l'objet minimal et la page Events, au back-office"
statut: à valider
porteur: Quentin
figma:
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=237-2  # Events · tableau
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=237-141  # Events · vide
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=237-212  # Events · erreur de chargement
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=237-273  # fiche de l'événement (panneau) · création
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=237-438  # fiche de l'événement · fiche
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=237-599  # fiche de l'événement · erreurs (EVT-6)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=237-765  # fiche de l'événement · échec d'enregistrement (EVT-14)
maj: 2026-11-28
---
*Préfixe des identifiants : `EVT-`. Cadrage de Ghya du 28/11 : un événement minimal, sans billetterie, pour être affilié à un pass ([Catalogue des passes](catalogue-passes.md)). C'est la « feature à part » annoncée par [VEN-2](venues.md#ven-2). Objet voisin : [Lieux](venues.md).*

## Intention
L'admin saisit un événement (comedy club, concert, spectacle) en quelques secondes pour pouvoir le mettre dans un pass, avec l'avantage qu'y trouve le porteur.

## Blocs
1. **L'objet événement.** Quatre données, toutes exigées.

| Donnée | Libellé | Type | Exemple |
|---|---|---|---|
| Nom | « Name » | texte court | « Friday Comedy Club » |
| Date | « Date » | un jour | 5 Dec 2026 |
| Lieu | « Venue » | un lieu existant ([VEN-1](venues.md#ven-1)) | « Mango Bar » |
| Avantage | « Perk for pass holders » | texte court | « Half-price entry » |

2. **Page « Events » (back-office, desktop).** Entrée du menu après « Venues » ([CAT-1](catalogue-passes.md#cat-1)). Titre « Events », bouton « Add an event ». Tableau, une ligne par événement, par date, la plus lointaine en tête ; colonnes « Event », « Date », « Venue », « Perk ». Vide : « No events yet ». Échec de lecture : « Couldn't load events. Reload the page. » à la place du tableau.
3. **Fiche de l'événement (panneau de droite, même geste que Venues et Artists).** Les quatre champs, modifiables ; « Venue » est une liste des lieux par nom, invite « Choose a venue ». « Save », en pied de panneau, enregistre. En création, titre « New event » ; après « Save », le panneau montre la fiche de l'événement créé. Aucune autre action.

## Règles
**EVT-1 — Pas de billetterie.** Ni stock, ni places, ni billet, ni prix du billet. L'événement dit seulement ce que le porteur du pass y gagne ; il montre son pass sur place, comme dans un lieu.

**EVT-2 — Un événement, un jour, un lieu.** Pas d'heure, pas de récurrence : un comedy club chaque vendredi, ce sont des événements distincts. Tranché par Ghya le 28/11.

**EVT-3 — Pas de type.** Comedy club, concert, spectacle se disent dans le nom ; pas de catégorie au MVP.

**EVT-4 — Pas d'état, pas de page publique.** Un événement n'est ni brouillon ni en ligne : il n'apparaît sur le site qu'à travers un pass en vente qui le contient, par son nom et sa date, tant qu'il n'est pas passé ([CAT-17](catalogue-passes.md#cat-17)).

**EVT-5 — Les événements se saisissent ici, et seulement ici.** Le panneau d'un pass choisit parmi les événements existants ([CAT-8](catalogue-passes.md#cat-8)) ; il n'en crée pas. Hypothèse produit de Richard : une page de plus, mais copie de celle des artistes, au lieu d'un formulaire dans un formulaire.

**EVT-6 — Tout est exigé.** « Save » avec un champ vide n'enregistre rien et marque le champ : « This field is required ».

**EVT-7 — Pas de suppression.** Un événement peut être dans un pass vendu ; comme un pass ([CAT-11](catalogue-passes.md#cat-11)), il ne disparaît pas. Hypothèse produit.

**EVT-8 — Admin seulement.** Page et fiche derrière la connexion du back-office ; un partenaire n'y a pas accès, même pour son lieu.

**EVT-9 — Interface en anglais.** Les textes entre « » sont les libellés exacts ([VEN-18](venues.md#ven-18)).

## Cas limites
**EVT-10 — Événement passé.** Il reste au back-office et dans ses passes ; le site cesse de le montrer le lendemain (heure du Cambodge). « All events » couvre toujours les suivants.

**EVT-11 — Lieu en brouillon.** Un événement peut s'y tenir ; le site ne montre jamais le nom du lieu d'un événement ([CAT-17](catalogue-passes.md#cat-17)).

**EVT-12 — Date passée à la saisie.** Permise : on peut saisir après coup. Hypothèse produit.

**EVT-13 — Doublon.** Deux événements peuvent porter le même nom, le même jour.

**EVT-14 — Échec d'enregistrement.** « Couldn't save. Try again. » dans le panneau, qui reste ouvert avec la saisie, jamais le message de la base.

## Fini quand
**EVT-15 — Créer.** « Add an event », les quatre champs, « Save » : la ligne apparaît à sa date et l'événement est proposé dans le choix « Selected events » d'un pass.

**EVT-16 — Tout est exigé.** Un événement sans lieu ne s'enregistre pas et le champ le dit.

**EVT-17 — Modifier se voit partout.** Renommer un événement change son nom dans le tableau, dans ses passes et sur le site, sans redéploiement.

**EVT-18 — Rien de billetterie.** Ni le panneau ni le tableau ne portent de nombre de places, de prix de billet ni de « Sold out ».

**EVT-19 — Fermé sans session.** Sans session, `/events` mène à la connexion ; depuis le site, aucun événement n'est lisible hors d'un pass en vente.

**EVT-20 — Conforme au Figma.** L'écran suit la maquette d'Alex validée par Ghya et l'associé.

## Ouvert pour Ghya
1. **Où se saisissent les événements** ([EVT-5](events.md#evt-5)) : une page « Events » plutôt qu'une création depuis le panneau du pass. D'accord ?

Tant qu'on y est, non fait : heure, récurrence, photo, page publique d'un événement, artistes de la soirée ([Artistes](artists.md)), annulation, billetterie.

## Détails techniques
- **Table `events`** (annoncée par [venues.md](venues.md#détails-techniques)), migration additive : nom, date, lieu (clé étrangère non nulle vers `venues`), avantage, tous `not null`. Nommage à Stéphane.
- **RLS** : `authenticated` lit, crée, modifie ; pas de suppression ; `anon` ne lit rien directement, seulement nom et date des événements d'un pass en vente ([CAT-31](catalogue-passes.md#cat-31)).
- **Écran** : la page et le panneau reprennent ceux des artistes (`apps/admin/app/artists/`), sans « Delete ».
