---
type: flux
titre: "Passes : le catalogue des types de pass, au back-office et sur le site"
statut: à valider
porteur: Quentin
figma:
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=238-2  # Passes · catalogue (cartes Draft, Live, Ended)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=238-276  # Passes · vide
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=238-338  # Passes · erreur de chargement
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=239-325  # fiche du pass (panneau) · création
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=239-876  # fiche du pass · brouillon (pass comedy club, CAT-30)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=239-1334  # fiche du pass · recherche d'un lieu (CAT-7)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=239-1792  # fiche du pass · en ligne (All venues + Except)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=240-1839  # fiche du pass · erreurs de publication (CAT-21)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=240-2397  # fiche du pass · date fixe passée (CAT-21)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=240-2891  # fiche du pass · échec d'enregistrement (CAT-25)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=240-4157  # site · 10.3 Home · bloc Our passes
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=235-501  # composant PassTicket (carte du back-office)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=234-434  # composant PickList (sélection des lieux et des événements)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=234-470  # composant ValidityField
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=235-581  # composant PassOfferCard (carte du site)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=6-9  # composant AdminSidebar (menu, CAT-1)
maj: 2026-11-28
---
*Préfixe des identifiants : `CAT-`. Cadrage de Ghya du 28/11, d'après le besoin de l'associé. La page des passes vendus devient « Sales » ([sales.md](sales.md)) ; « Passes » est désormais ce catalogue. Objets touchés : [Lieux](venues.md), [Événements](events.md). Écart nommé : le bloc 4 ajoute au site public un bloc que [VIS-35](parcours-visiteur.md#vis-35) excluait ; décision de Ghya du 28/11.*

## Intention
L'admin compose plusieurs passes différents (un « comedy club » qui réunit le spectacle à prix réduit et deux bars pour l'après ; un mensuel ou un annuel pour les locaux et expats), les met en vente, et le visiteur voit sur le site ceux qui sont en vente aujourd'hui.

## Blocs
1. **L'objet pass.** Une dizaine à quelques dizaines dans le catalogue, pas cent.

| Donnée | Libellé | Type | Enregistrer | Publier | Exemple |
|---|---|---|---|---|---|
| Nom | « Name » | texte court | oui | oui | « Comedy Night » |
| Prix | « Price (USD) » | montant en dollars, centimes permis ([CAT-13](catalogue-passes.md#cat-13)) | non | oui | 15 |
| Validité | « Validity » | jusqu'à une date, ou N jours après l'achat ([CAT-4](catalogue-passes.md#cat-4)) | non | oui | 30 jours après l'achat |
| Lieux | « Venues » | tous (sauf exclusions) ou une liste ([CAT-7](catalogue-passes.md#cat-7)) | non | voir [CAT-12](catalogue-passes.md#cat-12) | Mango Bar, Pub Street Grill |
| Événements | « Events » | tous (sauf exclusions) ou une liste ([CAT-8](catalogue-passes.md#cat-8)) | non | voir [CAT-12](catalogue-passes.md#cat-12) | Friday Comedy Club |
| État | — | `brouillon` ou `en ligne` | auto | — | `brouillon` |

2. **Page « Passes » (back-office, desktop).** Titre « Passes », bouton « Add a pass ». Dessous, les passes du catalogue, chacun en petite carte « pass » (dessin d'Alex), du plus récent au plus ancien. Une carte porte : le nom, le prix (« $15 », « $12.50 »), la validité ([CAT-4](catalogue-passes.md#cat-4)), le contenu ([CAT-17](catalogue-passes.md#cat-17)) et l'état « Draft », « Live » ou « Ended » ([CAT-20](catalogue-passes.md#cat-20)). Le clic sur une carte ouvre la fiche du pass à droite ; « Add a pass » l'ouvre en création. Vide : « No passes yet ». Échec de lecture : « Couldn't load passes. Reload the page. » à la place des cartes.
3. **Fiche du pass (panneau de droite, même geste que Venues et Partners).** En haut, les seules actions : « Publish » (brouillon) ou « Back to draft » (en ligne). Dessous, modifiables :
   - « Name », « Price (USD) » ;
   - « Validity » : deux choix, « Until a date » (champ « Valid until ») ou « Days after purchase » (champ « Number of days » et quatre raccourcis « 1 day », « 7 days », « 30 days », « 365 days ») ;
   - « Venues » : deux choix, « All venues » (avec la liste « Except ») ou « Selected venues » ;
   - « Events » : deux choix, « All events » (avec la liste « Except ») ou « Selected events ».
   « Save », en pied de panneau, enregistre. En création : titre « New pass », aucune action en haut ; une fois créé, le panneau montre la fiche avec ses actions.
4. **Site public : les passes en vente.** Sur l'accueil, sous la carte du pass et au-dessus de « Partner venues » ([VIS-1](parcours-visiteur.md#vis-1) tenu), le titre « Our passes » et une carte par pass en vente ([CAT-16](catalogue-passes.md#cat-16)) : nom, prix, validité, contenu. Les cartes ne sont pas cliquables ([CAT-24](catalogue-passes.md#cat-24)). Sans pass en vente, le bloc entier disparaît. Emplacement : hypothèse produit ; le dessin est à Alex.

## Règles
**CAT-1 — Le menu.** « Partners », « Venues », « Events », « Passes », « Sales », « Artists ». « Passes » reprend l'adresse `/passes` ; les ventes passent à `/sales` ([PASS-22](sales.md#pass-22)). Ordre : hypothèse produit.

**CAT-2 — Pas de recherche.** Tous les passes, du plus récent au plus ancien ; ni recherche, ni filtre, ni tri, ni pagination : quelques dizaines tiennent sur une page.

**CAT-3 — Cinq champs, pas plus.** Nom, prix, validité, lieux, événements. Description, photo, stock, dates de mise en vente, codes promo viendront si un besoin le dit : rien n'est préparé.

**CAT-4 — Validité, deux modes.** *Jusqu'à une date* : tout pass acheté vaut jusqu'à la fin de ce jour (heure du Cambodge), quel que soit le jour d'achat ; affiché « Valid until 31 Dec 2026 ». *N jours après l'achat* : nombre entier, au moins 1 ; le pass vendu vaut jusqu'à la date d'achat plus N jours ; affiché « Valid 1 day from purchase », « Valid <n> days from purchase ». Un raccourci remplit le nombre, qui reste modifiable. Mensuel = 30 jours, annuel = 365 jours : pas de mois calendaire.

**CAT-5 — Pas d'abonnement.** Aucun renouvellement, aucun prélèvement récurrent : un mensuel racheté est une nouvelle vente. Hors périmètre.

**CAT-6 — On affilie des lieux, pas des partenaires.** L'avantage et la page publique sont portés par le lieu ([VEN-1](venues.md#ven-1), [VEN-7](venues.md#ven-7)).

**CAT-7 — Lieux : tous ou une liste.** « All venues » est dynamique : tout lieu en fait partie, y compris ceux créés après, sauf ceux de « Except ». « Selected venues » est une liste explicite : un lieu créé après n'y entre pas. Le choix montre tous les lieux, brouillons compris. Le besoin : cocher vite plusieurs lieux parmi quelques dizaines, en retrouver un par son nom, voir combien sont choisis ; l'interface est à Alex.

**CAT-8 — Événements : la même chose.** « All events » / « Selected events », mêmes règles et même besoin de sélection rapide que [CAT-7](catalogue-passes.md#cat-7). Un pass peut mêler lieux et événements, ou n'avoir que l'un des deux.

**CAT-9 — Les lieux en brouillon ne comptent pas en public.** Un lieu en brouillon choisi reste dans le pass ; le site ne le compte qu'une fois en ligne ([VEN-6](venues.md#ven-6)).

**CAT-10 — État « Draft » / « Live », comme les lieux.** Un pass créé est en brouillon. « Publish » enregistre et met en vente ; « Back to draft » retire le pass du site sans enregistrer la saisie en cours. Pas de dates de mise en vente. Hypothèse produit de Richard.

**CAT-11 — Pas de suppression.** Un pass vendu est l'argent d'un client ([PASS-6](sales.md#pass-6)) : au plus un retour en brouillon. Les ventes gardent leur pass, et rien de ce qui a été vendu ne change.

**CAT-12 — Publier exige le minimum.** Nom, prix, validité, et au moins un lieu ou un événement (« All venues » ou « All events » compte, même vide aujourd'hui). « Save » enregistre un brouillon dès que le nom est rempli.

**CAT-13 — Le prix.** En dollars US, supérieur à zéro, centimes permis ; affiché « $15 » ou « $12.50 ». Sans prix, ni affichage ni vente. Tranché par Ghya le 28/11.

**CAT-14 — Modifier un pass déjà vendu.** Ce qui est écrit sur la vente à l'achat ne bouge plus : le prix payé et la date « Valid until ». Le reste se lit en direct dans le catalogue : nom ([PASS-21](sales.md#pass-21)), lieux, événements. Changer la validité ne vaut que pour les ventes suivantes ; retirer un lieu le retire aussi aux porteurs déjà servis. Hypothèse produit de Richard.

**CAT-15 — Admin seulement.** Page et fiche derrière la connexion du back-office ; un partenaire n'y a pas accès.

**CAT-16 — En vente, c'est en ligne et pas fini.** Le site montre un pass s'il est en ligne et, pour une validité à date fixe, si cette date n'est pas passée (heure du Cambodge). Même ordre qu'au back-office.

**CAT-17 — Le contenu se dit en une ou deux lignes.** Lieux : « All partner venues » (tous, sans exclusion), sinon « 1 partner venue », « <n> partner venues », en comptant les seuls lieux en ligne. Événements : chacun « <name> · <date> » (« Friday Comedy Club · 5 Dec »), les seuls à venir. Au back-office, les brouillons comptent, et les événements se résument : « All events », « 1 event », « <n> events ».

**CAT-18 — Interface en anglais.** Les textes entre « » sont les libellés exacts ([VEN-18](venues.md#ven-18)).

**CAT-19 — Tout vient de la base.** Publier, modifier ou retirer un pass change le site sans redéploiement, comme un lieu ([VEN-29](venues.md#ven-29)).

## Cas limites
**CAT-20 — Date fixe passée.** Le lendemain, le pass quitte le site ; au back-office il reste en ligne, sa carte porte « Ended » à la place de « Live ». Le repousser à une date future le remet en vente.

**CAT-21 — Publier incomplet.** Rien n'est publié ni enregistré : la saisie reste, chaque champ manquant porte « This field is required », en haut du panneau « Fill in the required fields to publish. » ; sans lieu ni événement : « Add at least one venue or event. ». Une date fixe déjà passée : « Choose a date from today on. ».

**CAT-22 — Vider un champ requis d'un pass en ligne.** « Save » refuse avec les mêmes messages ([VEN-24](venues.md#ven-24)).

**CAT-23 — Rien à montrer.** Un pass en ligne qui ne couvre aucun lieu en ligne ni aucun événement à venir n'apparaît pas sur le site ; sa carte au back-office n'en dit rien. Hypothèse produit.

**CAT-24 — Ce qui reste faux tant que le hors-périmètre n'est pas fait.** Hors périmètre : l'achat d'un pass précis, le scan par lieu ([VEN-8](venues.md#ven-8)), la billetterie, l'abonnement.
- Achat : « Get the Pass » vend toujours le pass unique à $20 ; le site montre des passes qu'on ne peut pas acheter. Accepté par Ghya le 28/11 : test interne, rien ne part en production avant l'achat d'un pass précis.
- Ventes : toutes à « — » en « Pass » ([PASS-21](sales.md#pass-21)), et leur date de validité ne suit pas le catalogue.
- Scan : tout pass est accepté dans tout lieu ; les lieux affiliés n'ont aucun effet au comptoir.
- Billetterie : un porteur peut trouver le spectacle complet ([EVT-1](events.md#evt-1)).

**CAT-25 — Échec d'enregistrement.** « Couldn't save. Try again. » dans le panneau, jamais le message de la base.

## Fini quand
**CAT-26 — Créer.** « Add a pass », un nom, « Save » : la carte apparaît en tête, « Draft », et le panneau montre la fiche.

**CAT-27 — Publier exige le minimum.** Sans prix, « Publish » refuse et le dit ; rempli, la carte passe à « Live » et le pass apparaît sous « Our passes » ; « Back to draft » l'en retire ; sans redéploiement.

**CAT-28 — « All venues » suit le réseau.** Un pass « All venues » excluant Mango Bar : un nouveau lieu publié augmente de un le compte du site ; Mango Bar n'y entre jamais.

**CAT-29 — La validité s'affiche juste.** Le raccourci « 30 days » remplit 30 et la carte dit « Valid 30 days from purchase » ; un pass à date fixe d'hier est « Ended » et absent du site.

**CAT-30 — Le pass « comedy club » se compose.** Un pass avec un événement et deux lieux choisis se publie ; le site montre l'événement avec sa date et « 2 partner venues ».

**CAT-31 — Fermé sans session.** Sans session, `/passes` mène à la connexion ; depuis le site, aucun pass en brouillon ni aucune donnée de sélection au-delà de [CAT-17](catalogue-passes.md#cat-17) n'est lisible.

**CAT-32 — Conforme au Figma.** Page, panneau et bloc du site suivent les maquettes d'Alex validées par Ghya et l'associé.

## Ouvert pour Ghya
1. **Mise en vente** ([CAT-10](catalogue-passes.md#cat-10), [CAT-16](catalogue-passes.md#cat-16)) : « Draft » / « Live » plutôt que des dates de mise en vente ; une date fixe passée retire le pass du site. D'accord ?
2. **Pass déjà vendu modifié** ([CAT-14](catalogue-passes.md#cat-14)) : prix et date figés à l'achat, lieux et événements lus en direct ; retirer un lieu le retire aux porteurs actuels. D'accord ?

Tant qu'on y est, non fait : description et photo du pass, stock, dates de mise en vente, codes promo, duplication, statistiques par pass, prix en riel, abonnement.

## Détails techniques
- **Base, migrations additives** (CLAUDE.md, une seule base) : une table du catalogue (nom à Stéphane ; `passes` désigne déjà les ventes et ne se renomme pas), le mode et les listes de lieux et d'événements (inclus ou exclus), une référence nullable du pass vendu vers le catalogue ([PASS-21](sales.md#pass-21)). Rien de renommé ni de supprimé : `passes.valide_jusqu_au` garde son défaut tant que l'achat ne l'écrit pas.
- **RLS** : `authenticated` lit, crée, modifie, ne supprime pas ; `anon` ne lit que ce que [CAT-16](catalogue-passes.md#cat-16) et [CAT-17](catalogue-passes.md#cat-17) affichent, par vue ou fonction si besoin, sans brouillon ni nom de lieu en brouillon. Choix de Stéphane, tests de droits dans la même PR.
- **Site** : bloc rendu côté serveur, revalidé à la publication d'un pass, d'un lieu ou d'un événement (skill `site-public`) ; la fin d'une date fixe ou d'un événement tombe à minuit heure du Cambodge, sans publication : revalidation au changement de jour, à Stéphane.
- **Prix** : stockage en centimes entiers conseillé ; le choix appartient à Stéphane.
- **Pour plus tard** : l'achat d'un pass précis écrira sur la vente le pass, le prix payé et la date calculée ([CAT-14](catalogue-passes.md#cat-14)) ; le scan par lieu lira vente → pass du catalogue → lieux couverts.
