---
type: flux
titre: "Lieux d'un partenaire : page Venues, éditeur, fiche publique"
statut: validée
porteur: Quentin
figma:
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=126-3  # Venues · tableau
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=126-137  # Venues · vide
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=126-195  # Venues · filtré sur un partenaire
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=126-272  # Venues · filtré, partenaire sans lieu (VEN-22)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=157-1571  # fiche du lieu (panneau) · brouillon
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=157-1801  # fiche du lieu (panneau) · en ligne
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=157-1851  # fiche du lieu (panneau) · création
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=160-1872  # fiche du lieu (panneau) · création, partenaire prérempli (VEN-22)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=157-1901  # fiche du lieu (panneau) · erreurs de publication (VEN-23)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=128-244  # éditeur · article vide
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=128-450  # éditeur · rempli
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=128-740  # éditeur · bloc en déplacement
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=128-1241  # éditeur · échec d'envoi d'une photo (VEN-25)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=125-273  # fiche d'un lieu · complète
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=125-352  # fiche · sans photo d'en-tête (VEN-19)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=125-409  # fiche · sans bloc (VEN-20)
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=128-2036  # Partners · colonne Venues
maj: 2026-11-15
---
*Préfixe des identifiants : `VEN-`. Décisions de Ghya du 14/11 (réunion avec Clinton et Seang), révisées le soir : fiche du lieu en panneau ; réponses du 15/11 reportées dans les règles. Touche [Partenaire](partenaire.md), [Parcours du visiteur](parcours-visiteur.md).*

## Intention
L'admin crée un lieu (bar, restaurant) rattaché à un partenaire, en renseigne la fiche, écrit son article en le voyant tel que le visiteur le verra, et le met en ligne ; le visiteur ouvre cette page depuis la liste des lieux et y trouve l'avantage du pass.

## Blocs
1. **L'objet lieu.** Ce que les associés appelaient « blog » est la page d'un lieu.

| Donnée | Type | Où | Enregistrer | Publier | Exemple |
|---|---|---|---|---|---|
| Partenaire | un partenaire existant | fiche | oui | oui | « Dara Sok » |
| Nom | texte court | fiche | oui | oui | « Mango Bar » |
| Tagline | texte court, une ligne | fiche | non | oui | « Cocktails on a wooden terrace » |
| Photo d'en-tête | une image | éditeur | non | non | une photo de façade |
| Contenu | blocs ordonnés : paragraphe ou photo | éditeur | non | non | 2 paragraphes, 1 photo |
| Adresse | texte court | fiche | non | oui | « Street 9, Wat Bo, Siem Reap » |
| Lien Google Maps | lien | fiche | non | non | un lien maps.app.goo.gl |
| Catégorie | liste fermée | fiche | non | oui | « Bar » |
| Horaires | une ligne de texte libre | fiche | non | non | « Every day, 5pm–1am » |
| Avantage du pass | texte court | fiche | non | oui | « One free cocktail » |
| Adresse de la page | déduite du nom | auto | auto | auto | `mango-bar` |
| Auteur | le compte connecté qui crée le lieu | auto | auto | auto | « Ghya » |
| État | `brouillon` ou `en ligne` | fiche | auto | — | `brouillon` |

2. **Page « Venues » (back-office, desktop).** Titre « Venues », bouton « Add a venue », tableau à une ligne par lieu, du plus récent au plus ancien, colonnes « Venue », « Partner », « Category », « Status » (« Draft » ou « Live »). Vide : « No venues yet ». Filtrée sur un partenaire : « Partner: <prénom> <nom> » et le lien « Show all venues ». Le clic sur une ligne ouvre la fiche du lieu à droite du tableau ; « Add a venue » ouvre la même fiche en création.
3. **Fiche du lieu (panneau de droite, même geste que le panneau de Partners).** En haut, les seules actions : « Publish » (brouillon) ou « Back to draft » (en ligne), et « Edit page », qui ouvre l'éditeur. Dessous, modifiables : « Name », « Tagline », « Partner » (liste déroulante par prénom, « Choose a partner »), « Category », « Address », « Google Maps link », « Opening hours », « Perk for pass holders » ; « Save », en pied de panneau, enregistre. En création, titre « New venue », aucune action en haut et « Save » au même endroit, en pied ; une fois créé, le panneau montre la fiche du lieu avec ses actions.
4. **Éditeur de l'article (pleine page).** En haut : « Back to venues », le nom du lieu (non modifiable ici), l'état, « Save ».
   - *Colonne de gauche* : le cadre de la photo d'en-tête avec « Add photo » au centre ; posée, la photo remplit le cadre et un crayon, à droite hors du cadre, la change. Dessous, une zone visuellement à part, titrée « Article », qui contient les blocs et, sous le dernier, toujours « Add paragraph » et « Add photo ».
   - *Colonne de droite* : la fiche publique entière telle qu'un téléphone l'affiche ; nom, tagline, infos pratiques et avantage viennent de la fiche du lieu, les blocs et la photo sont ceux de l'éditeur.
5. **Fiche publique d'un lieu (site, mobile-first).** En-tête du site avec retour ([VIS-27](parcours-visiteur.md#vis-27)), photo d'en-tête, nom, tagline, l'avantage sous « Your SiemPass perk », blocs dans l'ordre, infos pratiques (catégorie, adresse, « Open in Google Maps », horaires), puis « Written by <prénom de l'auteur> » ([VEN-9](venues.md#ven-9)).

## Règles
**VEN-1 — Un partenaire, plusieurs lieux.** Le partenaire est un humain, le contact ([PART-13](partenaire.md#part-13)). Il porte zéro, un ou plusieurs lieux ; un lieu a exactement un partenaire.

**VEN-2 — Lieux seulement.** Activités (tour, cours) et événements (concert, comedy club) sont d'autres entités, avec leur propre feature. Cette spec n'en prépare rien.

**VEN-3 — Champs fermés.** La liste du bloc 1 est complète. Réseaux sociaux, téléphone, gamme de prix et mise en forme du texte sont écartés.

**VEN-4 — Deux types de blocs.** Un bloc est un paragraphe (texte brut, sans gras, lien ni titre) ou une photo. Leur nombre est libre, leur ordre est celui de l'éditeur.

**VEN-5 — Catégorie : liste fermée.** « Bar », « Restaurant », « Café », « Shop », « Other ».

**VEN-6 — Le lieu se publie, plus le partenaire.** L'état `brouillon` / `en ligne` est porté par le lieu. Un lieu créé est en brouillon ; « Publish » (sur la fiche) l'enregistre et le met en ligne, « Back to draft » le retire du site sans enregistrer la saisie en cours. Rien ne publie automatiquement.

**VEN-7 — L'avantage est sur le lieu.** Il est saisi par l'admin sur la fiche du lieu et s'affiche sur la fiche publique et dans la liste des lieux.

**VEN-8 — Un pass, une fois par lieu.** Un pass se valide une fois dans chaque lieu du réseau, pas une fois en tout. Appliqué par la tâche suivante (« Ouvert pour Ghya » 1) : dans cette feature, le scan ne change pas.

**VEN-9 — L'auteur ne se saisit pas.** C'est le compte connecté qui crée le lieu ; aucun champ. Il ne change pas quand un autre compte modifie le lieu. Il s'affiche par le prénom que porte son compte, jamais par son e-mail ; un compte sans prénom n'a pas de « Written by ».

**VEN-10 — Adresse de page déduite du nom.** Minuscules, sans accent, mots reliés par des tirets ; unique parmi tous les lieux. Elle suit le nom jusqu'à la première publication (le nom publié compris), puis reste figée, même après un retour en brouillon : un lien partagé ne casse pas.

**VEN-11 — ~~Clic sur une ligne : l'éditeur.~~** Remplacée le 14/11 au soir : le clic ouvre la fiche du lieu en panneau ([VEN-37](venues.md#ven-37)), l'éditeur s'ouvre par « Edit page ».

**VEN-12 — La preview est la fiche.** La colonne de droite de l'éditeur rend la fiche publique entière, pas une imitation : ce qui s'y voit est ce que le visiteur verra après « Publish ».

**VEN-13 — Blocs maniables.** Chaque bloc porte une poignée pour le déplacer par glisser-déposer et une action pour le supprimer. Un paragraphe se saisit dans une zone de texte de plusieurs lignes.

**VEN-14 — La photo d'en-tête est toujours en haut.** Elle n'est pas un bloc : elle ne se déplace pas, elle se change par le crayon. Son cadre, dans l'éditeur, a le même ratio que sur la fiche publique, en plus petit.

**VEN-15 — Partners mène à Venues.** Le clic sur le nombre de la colonne « Venues » ouvre la page Venues filtrée sur ce partenaire. Le formulaire partenaire perd son groupe « The venue » ([PART-2](partenaire.md#part-2)).

**VEN-16 — Le site lit les lieux en ligne.** La liste des lieux (`/places` et l'accueil) ne montre que les lieux `en ligne` : photo d'en-tête, nom, tagline, avantage ; le clic mène à la fiche. Rien du contact n'est rendu ([PART-8](partenaire.md#part-8)).

**VEN-17 — Les lieux existants sont repris.** Chaque partenaire déjà en base devient un lieu : nom, adresse, photo, description (en tagline), avantage et état recopiés ; partenaire = lui-même ; pas d'auteur, pas de catégorie.

**VEN-18 — Interface en anglais.** Back-office et site : les textes entre « » sont les libellés exacts.

**VEN-36 — Partners allégé.** Tranché le 14/11 au soir : le tableau Partners gagne une colonne « Venues » (le nombre de lieux du partenaire) et perd ses colonnes « Venue » et « Status » (le partenaire n'a plus ni lieu ni état) ; son panneau perd « Publish » / « Back to draft » et garde « Invite ».

**VEN-37 — Clic sur une ligne : la fiche.** Le clic sur une ligne de « Venues » ouvre la fiche du lieu dans un panneau de droite, pas l'éditeur ; « Add a venue » l'ouvre en création. Depuis la page filtrée sur un partenaire, le partenaire est déjà choisi ([VEN-22](venues.md#ven-22)). On crée le lieu avec ses détails, puis on passe à l'article par « Edit page ».

**VEN-38 — La fiche rend le lieu valide, l'éditeur écrit l'article.** Tout ce qui conditionne la publication est sur la fiche ; l'éditeur ne porte que la photo d'en-tête et les blocs, et ne bloque jamais la publication. La fiche n'a ni suppression ni autre action que celles du bloc 3.

## Cas limites
**VEN-19 — Lieu sans photo d'en-tête.** Il se publie ; la fiche, la preview et la liste affichent un visuel de remplacement neutre.

**VEN-20 — Lieu sans bloc.** Il se publie ; la fiche passe de l'avantage aux infos pratiques. Un paragraphe vide ou une photo jamais envoyée n'est pas rendu ; une photo jamais envoyée est retirée à l'enregistrement.

**VEN-21 — Adresse de page en doublon.** Un deuxième « Mango Bar » reçoit `mango-bar-2`, puis `-3` ; deux lieux peuvent porter le même nom.

**VEN-22 — Partenaire sans lieu.** Sa colonne « Venues » affiche « 0 » ; la page filtrée porte « No venues for this partner yet » et « Add a venue », qui ouvre le panneau en création avec ce partenaire déjà choisi.

**VEN-23 — Publier un lieu incomplet.** « Publish » ne publie pas tant que nom, tagline, adresse, catégorie, avantage et partenaire ne sont pas remplis : le lieu reste en brouillon, chaque champ manquant du panneau porte « This field is required », et en haut du panneau « Fill in the required fields to publish. ». « Save » enregistre un brouillon dès que nom et partenaire sont remplis. « Publish » incomplet n'enregistre rien : la saisie reste dans le panneau.

**VEN-24 — Vider un champ requis d'un lieu en ligne.** « Save », dans le panneau, refuse avec les mêmes messages : un lieu en ligne a toujours de quoi remplir sa fiche.

**VEN-25 — Échec d'envoi ou d'enregistrement.** Le cadre ou le bloc photo affiche « Upload failed. » et « Try again » ; la photo précédente reste en place, le reste du formulaire est intact. Un « Save » refusé, dans l'éditeur ou le panneau, affiche « Couldn't save. Try again. », jamais le message de la base.

**VEN-26 — Quitter l'éditeur avec des modifications non enregistrées.** « Back to venues » et la barre latérale demandent « Leave without saving? », « Leave » / « Stay » ; fermer ou recharger l'onglet, la confirmation du navigateur. Fermer le panneau de la fiche avec des modifications non enregistrées ne pose aucune question (tranché par Ghya le 15/11, avec les libellés « Edit page » et « Article » et « Publish » dans le seul panneau).

**VEN-27 — Lieu repris sans auteur ni catégorie.** La fiche n'a pas de ligne « Written by » ; il reste en ligne, mais sa première modification exige une catégorie ([VEN-24](venues.md#ven-24)).

**VEN-28 — Fiche d'un lieu en brouillon ou inconnu.** Son adresse donne la page introuvable du site.
## Fini quand
**VEN-29 — La donnée naît au back-office et arrive au site.** Un lieu créé dans le panneau, enregistré puis publié, apparaît dans la liste des lieux et sa fiche s'ouvre à son adresse ; « Back to draft » l'en retire, sans redéploiement.

**VEN-30 — La preview suit la frappe.** Chaque caractère tapé dans un bloc, chaque bloc ou photo ajouté, déplacé ou supprimé change la preview sans enregistrer ; nom, tagline, infos et avantage sont ceux de la fiche enregistrée, et la fiche publiée est identique à la dernière preview.

**VEN-31 — Les blocs se manient.** Trois blocs ajoutés, le dernier glissé en premier, le deuxième supprimé : la preview puis la fiche montrent ces deux blocs, dans cet ordre.

**VEN-32 — Publier exige le minimum.** Un lieu sans catégorie ne se publie pas et le champ du panneau le dit ; sans photo et sans bloc, il se publie ; un lieu dont la fiche est remplie se publie sans ouvrir l'éditeur.

**VEN-33 — Partners et Venues se répondent.** Un partenaire à deux lieux affiche « 2 » ; le clic montre ces deux lieux et eux seuls.

**VEN-34 — L'existant est repris.** Après la migration, chaque partenaire déjà en base a son lieu, dans le même état, et un lieu en ligne reste visible sur le site.

**VEN-35 — Rien du contact ni d'un brouillon ne sort.** Sans session, aucune donnée de contact ni aucun lieu en brouillon n'est lisible depuis le site.
## Ouvert pour Ghya
1. **Tâche suivante, à ne pas perdre : le scan par lieu** ([VEN-8](venues.md#ven-8)). D'ici là, le lien partenaire et le scan lisent encore les anciennes colonnes du partenaire : un partenaire créé après cette feature n'a pas d'avantage à cet endroit, son scan d'un pass valide répondra « Invalid pass », et changer l'avantage d'un lieu ne change pas celui du scan. Risque accepté jusqu'à la tâche suivante ?
2. Hypothèse produit : enregistrer un lieu en ligne modifie la fiche publique tout de suite ; pas de brouillon parallèle d'un lieu publié.
3. ~~Adresse de page figée à la première publication.~~ Tranché le 15/11 : [VEN-10](venues.md#ven-10).
4. Hypothèse produit : les champs requis pour publier sont ceux de [VEN-23](venues.md#ven-23) ; la photo d'en-tête reste facultative.
5. Hypothèse produit : la liste de [VEN-5](venues.md#ven-5), dont « Shop » et « Other ».
6. « Written by » ([VEN-9](venues.md#ven-9), tranché le 15/11) : les comptes de la base réelle n'ont pas encore de prénom ; tant qu'ils n'en ont pas, aucun lieu n'affiche d'auteur. À poser par Ghya.
7. Hypothèse produit : la liste de l'accueil mène aussi à la fiche ; la description courte des cartes est remplacée par la tagline.
8. Supprimer un lieu : non prévu (aucun partenaire ne se supprime non plus). À trancher si un lieu ferme.
9. Manques relevés par Alex au Figma, dessinés par hypothèse : invite du champ « Category » du panneau (« Choose a category »), catégorie d'un lieu repris dans le tableau (« — »), preview d'un lieu vide (rien de vide n'est rendu), échec du premier envoi d'un bloc photo (pas de photo précédente), barre latérale gardée dans l'éditeur, preview mise à jour au dépôt du bloc et non pendant le glisser. Tant qu'on y est, non fait : filtre par catégorie, fiche partagée sur les réseaux (aperçu Open Graph au-delà du minimum SEO).

## Détails techniques
- **Table `venues`**, une seule : `events` et `activities` viendront avec leur feature. Clé étrangère vers `partners` (non nulle), auteur = `auth.uid()` par défaut côté base (nul pour les lieux repris), état à deux valeurs comme `partners.etat`, adresse de page unique. Les blocs : un tableau ordonné en `jsonb` sur la ligne suffit (une écriture, un ordre) ; le choix appartient à Stéphane. Nommage : Stéphane.
- **Migrations additives** (CLAUDE.md, une seule base) : créer `venues`, recopier les `lieu_*`, `avantage` et `etat` de `partners`, lever le `not null` des `lieu_*` et d'`avantage` pour que le formulaire partenaire puisse s'en passer. Les anciennes colonnes et `partners.etat` restent, lues par le code de `main` (site de prod, lien partenaire, scan) ; leur suppression viendra après la mise en prod de la tâche du scan par lieu. Un partenaire créé sur staging apparaît en prod sans lieu dans l'ancien tableau : sans effet public, il est en brouillon.
- **RLS** : `anon` lit les lieux `en ligne` seulement (VEN-16, VEN-35), sans jamais joindre le contact ; `authenticated` lit, crée et modifie ; pas de suppression. Prénom d'un compte : table `profiles`, lue par `authenticated`, par `anon` seulement via `prenom_auteur_du_lieu` (lieu en ligne) ; aucune écriture par l'API. Photos dans un bucket Storage en lecture publique, écriture `authenticated`.
- **Composant partagé** : la fiche est un package du monorepo, consommé par `apps/site` (page `/places/<adresse>`) et par `apps/admin` (preview), sans accès à la base : il reçoit les données du lieu, lues d'une ligne par sa fonction `toVenuePageData`. L'en-tête du site est le package `site-header`, partagé aussi. C'est ce qui tient [VEN-12](venues.md#ven-12).
- **Scan par lieu (tâche suivante)** : validation par couple pass × lieu dans `passes` ou une table de validations, fonction `valider-pass` qui reçoit le lieu, lien d'accès qui désigne le lieu scanné, page partenaire qui lit ses lieux. Puis migration de suppression des `lieu_*`.
- Site : la fiche suit les conventions du skill `site-public` (`h1` = nom, données structurées). Métadonnées validées le 15/11 : titre « <nom> — SiemPass », description = tagline ; ni URL canonique ni sitemap tant que le site n'a pas de domaine. 