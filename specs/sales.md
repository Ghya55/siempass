---
type: ecran
titre: "Sales : la liste des passes vendus, au back-office"
statut: à valider
porteur: Quentin
figma:
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=240-3345  # Sales · tableau
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=240-3475  # Sales · vide
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=240-3544  # Sales · erreur de chargement
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=6-9  # composant AdminSidebar (menu « Sales », CAT-1)
maj: 2026-11-28
---
*Préfixe des identifiants : `PASS-` (gardé : les identifiants ne se renumérotent pas). Décision de Ghya du 15/11 : la page des passes vendus n'est plus un outil de test mais une page du back-office. Décision de Ghya du 28/11 : elle s'appelle « Sales » (ex-`passes.md`), et « Passes » devient le catalogue des types de pass ([Catalogue des passes](catalogue-passes.md)). Écran codé le 10/11 sans spec ni Figma ; cette spec part de lui. Touche [Parcours de démonstration](parcours-demo.md), [Parcours du visiteur](parcours-visiteur.md), [Lieux](venues.md).*

## Intention
L'admin (Ghya, l'associé) voit les passes vendus et, pour chacun, s'il a déjà servi, quand et où : de quoi savoir combien de passes sont partis et répondre à un porteur ou à un partenaire qui dit « mon pass ne passe pas ».

## Blocs
1. **Page « Sales » (back-office, desktop).** Entrée du menu juste après « Passes » ([CAT-1](catalogue-passes.md#cat-1)). En haut, le titre « Sales » et le nombre de passes vendus : « 1 pass sold », « <n> passes sold ». Dessous, le tableau, une ligne par pass vendu, du plus récent au plus ancien.
2. **Une ligne de pass vendu.** Colonnes, dans l'ordre :

| Colonne | Contenu | Exemple |
|---|---|---|
| « Code » | le code du pass, celui qui est écrit sous le QR du visiteur | `3f9a…c21e` |
| « Pass » | le nom du pass du catalogue acheté ([PASS-21](sales.md#pass-21)) ; « — » sinon | « Comedy Night » |
| « Bought (ICT) » | date et heure d'achat, à l'heure du Cambodge | 15 Nov 2026 et l'heure |
| « Valid until » | la date de validité affichée sur le pass du visiteur | 22 Nov 2026 |
| « Status » | « Valid » ou « Used » ([PASS-4](sales.md#pass-4)) | « Used » |
| « Used (ICT) » | date et heure du scan, et dessous le nom du lieu où il a eu lieu ; « — » si jamais scanné | 16 Nov 2026 et l'heure · Mango Bar |

3. **États de la page.** Vide : « No sales yet ». Échec de lecture : « Couldn't load sales. Reload the page. » à la place du tableau ([PASS-11](sales.md#pass-11)).

**Ce qui change le 28/11** ([PASS-22](sales.md#pass-22)) : le nom de la page, du menu et de l'adresse, le compte, les deux messages ci-dessus (« No passes yet » et « Couldn't load passes… » sont désormais ceux du catalogue), la colonne « Pass ». Rien d'autre.

**Ce qui change par rapport au code du 10/11.**
- *Gardé* : la page, le menu, le compte, le tableau et ses colonnes, l'ordre, l'heure du Cambodge, le badge d'état, « No passes yet », « Unknown venue ».
- *Retiré, parce que c'était du test* : « Delete » et sa confirmation ([PASS-6](sales.md#pass-6)), « Refresh » ([PASS-7](sales.md#pass-7)), la note « Test tools… » sous le titre, l'état « Expired » ([PASS-4](sales.md#pass-4)), le message brut de la base en cas d'erreur.
- *Manquant* : la maquette (Alex) : tableau, vide, erreur, badge à deux états.

## Règles
**PASS-1 — Lecture seule.** La page ne crée, ne modifie ni ne supprime aucun pass. Un pass naît d'un paiement, jamais d'un clic au back-office ; il change d'état par le scan au comptoir, rien d'autre.

**PASS-2 — Tous les passes, sans tri ni filtre.** Toutes les lignes, du plus récent au plus ancien. Pas de recherche, de filtre, de tri par colonne ni de pagination au MVP.

**PASS-3 — Pas de panneau.** Le clic sur une ligne ne fait rien : la ligne dit tout ce que la base sait d'un pass. Contrairement à Partners et Venues, il n'y a ni fiche ni action.

**PASS-4 — L'état est celui que le scan donnerait.** Deux états : « Used » si le pass a été scanné, sinon « Valid ». Pas d'« Expired » tant que la durée de validité n'est pas tranchée : le scan ne regarde pas la date ([DEMO-9](parcours-demo.md#demo-9)), l'écran ne doit pas dire « expiré » d'un pass que le comptoir accepte. Hypothèse produit.

**PASS-5 — Rien du porteur.** Aucune colonne de nom, d'e-mail ou de téléphone : on ne recueille rien à l'achat ([VIS-2](parcours-visiteur.md#vis-2)). Le code est le seul identifiant.

**PASS-6 — Pas de suppression.** « Delete » disparaît : la base est unique, un pass supprimé est l'argent d'un vrai client effacé sans trace. Les passes de test restent jusqu'au nettoyage d'avant le lancement, déjà décision de Ghya (CLAUDE.md). Demandé dans la consigne du 15/11.

**PASS-7 — Pas de remise à zéro.** « Refresh » disparaît aussi : il rendait scannable un pass déjà utilisé, ce qui contredit [VEN-8](venues.md#ven-8) sur la vraie base. Pour rejouer un scan sur staging, on achète un nouveau pass (paiement factice, [DEMO-23](parcours-demo.md#demo-23)). Hypothèse produit.

**PASS-8 — Admin seulement.** La page est derrière la connexion du back-office, comme Partners et Venues. Un partenaire n'y a pas accès et ne voit jamais les passes des autres.

**PASS-9 — Les données ne viennent que de la base.** Un pass acheté apparaît, un pass scanné passe à « Used », au rechargement de la page, sans redéploiement.

**PASS-10 — Interface en anglais.** Les textes entre « » sont les libellés exacts ([VEN-18](venues.md#ven-18)). La date de validité ne porte pas « Validity period not final » ici : la mention est pour le visiteur ([VIS-12](parcours-visiteur.md#vis-12)).

**PASS-21 — Une vente dit de quel pass il s'agit.** La colonne « Pass » porte le nom actuel du pass du catalogue acheté : renommer un pass renomme ses ventes. « — » pour une vente sans pass du catalogue : toutes celles d'avant le catalogue, et toutes celles du site tant que l'achat d'un pass précis n'existe pas ([CAT-24](catalogue-passes.md#cat-24)). Pas de lien vers le catalogue ni de filtre par pass ([PASS-2](sales.md#pass-2), [PASS-3](sales.md#pass-3)).

**PASS-22 — « Passes » devient « Sales ».** Décision de Ghya du 28/11 : « Sales », pas « Customers », puisqu'on ne recueille rien du porteur ([PASS-5](sales.md#pass-5)). Le nom « Passes » et l'adresse `/passes` passent au catalogue ; la page des ventes est à `/sales`.

## Cas limites
**PASS-11 — Lecture impossible.** « Couldn't load sales. Reload the page. » (corrigé le 28/11, [PASS-22](sales.md#pass-22)), jamais le message de la base ; le compte n'est pas affiché.

**PASS-12 — Lieu du scan inconnu.** Un scan dont le lieu n'existe plus ou n'a pas de nom affiche sa date et « Unknown venue ».

**PASS-13 — Date de validité dépassée.** Le pass reste « Valid » si jamais scanné, avec sa date telle quelle ([PASS-4](sales.md#pass-4)).

**PASS-14 — Beaucoup de passes.** Au-delà de ce qu'une page charge confortablement, Stéphane le signale ; la pagination est une tâche à part, pas une anticipation de celle-ci. Hypothèse technique.

## Fini quand
**PASS-15 — Un achat arrive.** Un pass acheté sur le site apparaît en tête du tableau, « Valid », « — » dans « Used (ICT) », et le compte augmente de un.

**PASS-16 — Un scan arrive.** Le même pass validé au comptoir puis la page rechargée : « Used », la date du scan et le nom du lieu.

**PASS-17 — Plus rien de test.** La page ne porte ni « Delete », ni « Refresh », ni la note « Test tools… », ni « Expired » ; aucune action de la page n'écrit dans la base.

**PASS-18 — Les deux états vides ou en erreur se voient.** Sans vente : « No sales yet ». Lecture en échec : le message de [PASS-11](sales.md#pass-11).

**PASS-19 — Fermé sans session.** Sans session, `/sales` mène à la connexion, et la liste des passes n'est lisible par personne d'autre qu'un compte du back-office ([Détails techniques](sales.md#détails-techniques)).

**PASS-20 — Conforme au Figma.** L'écran suit la maquette d'Alex validée par Ghya et l'associé.

**PASS-23 — Le renommage est complet.** Le menu porte « Sales » et « Passes » ; `/sales` montre les ventes, avec la colonne « Pass » à « — » pour toutes les ventes existantes ; plus aucun texte de cette page ne dit « No passes yet » ni « Couldn't load passes ».

## Ouvert pour Ghya
1. **Refresh retiré** ([PASS-7](sales.md#pass-7)) : tu le gardes pour tes démos, ou rejouer un scan passe par l'achat d'un nouveau pass sur staging ?
2. **« Expired » retiré** ([PASS-4](sales.md#pass-4)) : d'accord pour n'avoir que « Valid » et « Used » tant que la durée de validité n'est pas tranchée ?
3. **Le scan par lieu** ([VEN-8](venues.md#ven-8), tâche suivante) rendra « Used » faux : un pass ne sera plus « utilisé » en tout, mais validé lieu par lieu. On accepte que cette tâche redéfinisse les colonnes « Status » et « Used (ICT) » (par exemple : nombre de lieux où il a servi) ?

Tant qu'on y est, non fait : recherche par code, filtre par état, export, statistiques de ventes, remboursement, référence de paiement PayWay par pass (donnée recueillie : décision produit), marquage des passes de test.

## Détails techniques
- **Adresse** : l'écran quitte `apps/admin/app/passes/` pour `/sales` ; `/passes` est repris par le catalogue. La table `passes` (les ventes) garde son nom : renommer serait incompatible avec le code de `main`. Colonne « Pass » : une référence au catalogue, nullable, ajoutée à `passes` par une migration additive ; nommage et forme à Stéphane.
- **Code actuel** : `apps/admin/app/passes/`. À retirer : `supprimerPass`, `rafraichirPass`, les boutons et la confirmation de `pass-row.tsx`, la note de `passes-screen.tsx`, l'état `expire` de `statutDuPass` et du badge ; l'erreur de chargement n'affiche plus `error.message`.
- **Base, en deux temps** (CLAUDE.md, une seule base) : la politique `passes_suppression_admin`, `passes_modification_admin` et la fonction `rafraichir_pass` restent tant que le code de `main` les appelle ; leur retrait est une migration après la mise en prod de cet écran.
- **Risque relevé, hors de cet écran** : la politique `passes_lecture` de `20261110010000` ouvre `select` à `anon` sur toute la table. Avec la clé publique, n'importe qui peut lister tous les codes, donc afficher le QR d'un autre porteur. [PASS-19](sales.md#pass-19) demande que la liste ne soit lisible que par le back-office : la lecture par `anon` doit se limiter à un pass dont on donne le code (page `/pass/<code>`, [VIS-16](parcours-visiteur.md#vis-16)), par une fonction ou une politique filtrée. Le choix appartient à Stéphane.
- **Lieu du scan** : aujourd'hui `utilise_par` pointe un partenaire et le nom vient de `partners.lieu_nom`. Inchangé ici ; la tâche du scan par lieu le fera pointer un lieu.
