---
type: ecran
titre: "Documentation : les documents internes de l'entreprise, au back-office"
statut: à valider
porteur: Quentin
figma: []          # à dessiner par Alex : barre avec séparateur, arbre, document, états vides, échec
maj: 2026-11-28
---
*Préfixe des identifiants : `DOC-`. Besoin de Ghya du 28/11 : remplacer le Notion du POC (« La boîte », [projet.md](../projet.md)) par un espace d'écriture dans le back-office, pour l'associé. Écart nommé : la fiche « Admin » de projet.md (« Pour qui ») ne cite pas les documents internes ; c'est un ajout de Ghya, pas une fonctionnalité d'un persona existant.*

## Intention
L'associé ouvre « Documentation », range ses documents dans des dossiers et écrit (stratégie marketing d'un partenaire, stratégie des passes, notes d'un événement, résultats) sans rien apprendre et sans penser à enregistrer.

## Blocs
1. **La barre de gauche.** En haut, les entrées existantes, inchangées ([CAT-1](catalogue-passes.md#cat-1)). Dessous, un séparateur horizontal. Sous le séparateur, l'espace interne, avec une seule entrée : « Documentation ».
2. **L'arbre.** « Documentation » se déplie et se replie dans la barre ; dépliée, elle montre ses dossiers et ses documents, puis ceux des dossiers dépliés, en retrait. « Documentation » et chaque dossier portent deux actions : « New document » et « New folder ». Chaque dossier porte aussi « Rename ». Un dossier vide, déplié, affiche « Empty folder ».
3. **La page Documentation** (clic sur « Documentation », aucun document ouvert). Titre « Documentation ». Sans aucun document ni dossier : « No documents yet », « New document » et « New folder ». Sinon : « Choose a document in the sidebar, or create one. » et les deux mêmes actions.
4. **Le document (pleine page, barre de gauche gardée).** En haut, l'état de l'enregistrement : « Saving… », « Saved » ou « Couldn't save » avec « Try again ». Dessous, le titre, invite « Untitled », puis le corps, invite « Start writing… ». Une barre d'outils au-dessus du corps : « Heading », « Subheading », « Bold », « Italic », « Bulleted list », « Numbered list », « Link ».
5. **Le lien.** « Link » sur un texte sélectionné ouvre un champ « Paste a link » et « Apply ». Sur un lien existant : le lien, « Edit » et « Remove link ».

## Règles
**DOC-1 — Back-office seulement.** Documentation n'est accessible qu'aux comptes connectés du back-office. Ni le site public, ni le lien d'accès d'un partenaire ([PART-7](partenaire.md#part-7)), ni un visiteur sans session ne lisent un dossier ou un document, pas même son titre.

**DOC-2 — Ce ne sont pas les specs.** Documentation porte les documents qui font vivre l'entreprise, écrits dans l'app. Les specs produit restent dans le dépôt ; aucun document n'y est lu ni écrit.

**DOC-3 — La barre du haut ne bouge pas.** Les six entrées existantes gardent leur ordre, leurs libellés et leurs adresses. Le séparateur et « Documentation » s'ajoutent dessous.

**DOC-4 — Un arbre, une racine.** « Documentation » est la racine. Un document ou un dossier se crée à la racine ou dans un dossier, par « New document » ou « New folder » de l'endroit choisi. Les dossiers s'imbriquent sans limite de profondeur. Un document est toujours dans un seul dossier, ou à la racine.

**DOC-5 — Ordre de l'arbre.** À chaque niveau : les dossiers d'abord, puis les documents ; dans chaque groupe, par nom, de A à Z, sans tenir compte des majuscules ni des accents. Un document sans titre se range sous « Untitled ».

**DOC-6 — Un document : un titre et un corps.** Le nom d'un document dans l'arbre est son titre : changer le titre le renomme. Aucun autre champ n'est saisi.

**DOC-7 — Créer un document.** « New document » crée tout de suite un document sans titre à l'endroit choisi, déplie son dossier, l'ouvre et place la saisie dans le titre.

**DOC-8 — Créer et renommer un dossier.** « New folder » ajoute dans l'arbre un dossier dont le nom est à saisir, prérempli « New folder » et sélectionné ; Entrée ou un clic ailleurs valide. « Rename » rend le nom du dossier modifiable de la même façon ; Échap annule.

**DOC-9 — Le texte riche, sans syntaxe.** Le corps accepte des titres (deux niveaux : « Heading », « Subheading »), du gras, de l'italique, des listes à puces et numérotées, des liens. Tout se fait par la barre d'outils ou par les raccourcis clavier usuels du gras et de l'italique ; rien n'exige de taper une syntaxe.

**DOC-10 — Rien d'autre dans le corps.** Pas d'image, de tableau, de base de données, de commande « / », de commentaire, de couleur ni d'intégration.

**DOC-11 — Coller depuis ailleurs.** Un texte collé (Google Docs, Notion, une page web, un e-mail) garde ce que DOC-9 permet et perd le reste : une image collée disparaît, un tableau devient du texte, ligne par ligne.

**DOC-12 — Les liens s'ouvrent ailleurs.** Un lien du corps s'ouvre dans un nouvel onglet. Un lien saisi sans `http://` ni `https://` reçoit `https://`.

**DOC-13 — Enregistrement automatique.** Titre et corps s'enregistrent seuls, peu après une pause de frappe et à la sortie du document ; il n'y a pas de bouton « Save ». L'état est toujours visible : « Saving… » pendant l'envoi, « Saved » une fois en base, « Couldn't save » en cas d'échec.

**DOC-14 — Chaque document a son adresse.** Un document s'ouvre à une adresse du back-office qu'un associé peut envoyer à l'autre. Ouvert par son adresse, ses dossiers se déplient dans l'arbre et il y est marqué comme ouvert.

**DOC-15 — Interface en anglais.** Comme le reste du back-office : les textes entre « » sont les libellés exacts.

## Cas limites
**DOC-16 — Échec d'enregistrement.** « Couldn't save » et « Try again » s'affichent ; le texte reste sur la page, intact, et la saisie continue. La tentative suivante a lieu à la prochaine frappe ou par « Try again ». Jamais le message de la base.

**DOC-17 — Quitter avant l'enregistrement.** Si la dernière modification n'est pas « Saved » (envoi en cours ou échec), un clic dans la barre de gauche demande « Leave without saving? », « Leave » / « Stay », comme [VEN-26](venues.md#ven-26) ; fermer ou recharger l'onglet, la confirmation du navigateur. Une fois « Saved », on sort sans question.

**DOC-18 — Deux personnes sur le même document : le dernier enregistrement gagne.** Pas d'édition simultanée ni d'alerte. Chacun voit la version qu'il a ouverte ; quand l'un enregistre après l'autre, sa version remplace entièrement celle de l'autre. Celui dont le texte a été remplacé ne voit rien changer à l'écran ; il découvre la version gagnante en rouvrant le document, et s'il tape encore, c'est la sienne qui l'emporte à nouveau.

**DOC-19 — Session expirée pendant l'écriture.** L'enregistrement échoue comme en DOC-16 ; le texte reste à l'écran le temps de le copier.

**DOC-20 — Titre ou nom vide.** Un document sans titre s'affiche « Untitled » dans l'arbre et s'enregistre quand même. Un nom de dossier vidé reprend son nom précédent (« New folder » à la création).

**DOC-21 — Noms en double.** Deux documents ou deux dossiers peuvent porter le même nom, même côte à côte ; rien ne l'empêche.

**DOC-22 — Document inconnu.** Une adresse de document qui n'existe pas affiche « This document doesn't exist. » et le lien « Back to Documentation ».

**DOC-23 — Échec de lecture.** Si l'arbre ne se charge pas, la barre affiche sous « Documentation » : « Couldn't load documents. Reload the page. » ; les entrées du haut restent utilisables. Un document qui ne se charge pas affiche le même message à sa place.

## Fini quand
**DOC-24 — La barre est en deux.** Les six entrées du haut sont identiques à avant ; un séparateur les sépare de « Documentation », seule entrée du bas, qui se déplie et se replie.

**DOC-25 — L'arbre se construit.** À la racine, créer un dossier « Partners », dans celui-ci un dossier « Mango Bar », dedans un document : l'arbre montre ces trois niveaux, et le document s'ouvre à son adresse depuis un autre onglet.

**DOC-26 — L'arbre se trie.** Dans un même dossier, les documents « b », « A » et le dossier « Z » s'affichent « Z », « A », « b » ; renommer « Z » en « 0 » le garde en tête.

**DOC-27 — L'écriture tient.** Un titre, un paragraphe en gras et en italique, une liste à puces, une liste numérotée et un lien, tapés sans bouton « Save » : après « Saved » et un rechargement, tout est là, avec sa mise en forme.

**DOC-28 — L'échec se voit et ne perd rien.** Réseau coupé pendant la frappe : « Couldn't save » s'affiche, le texte reste ; réseau rétabli, « Try again » mène à « Saved » et le rechargement montre le texte complet.

**DOC-29 — Le collage est nettoyé.** Une page web avec image et tableau, collée dans le corps : l'image est absente, le tableau est du texte, gras et liens sont gardés.

**DOC-30 — Rien ne sort.** Sans session, ni le site ni l'API ne rendent un titre, un corps ou un nom de dossier ; le lien d'accès d'un partenaire non plus.

**DOC-31 — Le dernier gagne.** Le même document ouvert dans deux sessions, modifié dans l'une puis dans l'autre : rouvert, il porte la seconde version, entière.

## Ouvert pour Ghya
1. Supprimer un document ou un dossier : absent de cette version, par prudence (base unique, pas d'historique). Le laisser absent, ou une corbeille ?
2. Déplacer un document ou un dossier d'un dossier à l'autre : maintenant, ou plus tard ? D'ici là, il faut le recréer au bon endroit.
3. Future entrée « Specifications » sous le séparateur, qui afficherait en lecture seule les specs du dépôt : notée, pas faite.
4. Hypothèse produit : desktop seulement, comme le reste du back-office ; l'associé n'écrit pas sur son téléphone dans cette version.

## Détails techniques
- **Libre à Stéphane** : la librairie d'éditeur, le format de stockage du corps, le schéma (une ou deux tables pour dossiers et documents), le délai de l'enregistrement automatique, le nommage.
- **Migration additive** (CLAUDE.md, une seule base) : nouvelles tables seulement, rien de touché dans l'existant ; compatible avec le code de `main`.
- **RLS** selon [la décision d'authentification](../decisions/2026-11-10-authentification.md) : un seul rôle connecté, `authenticated`, qui lit, crée et modifie ; pas de suppression (Ouvert 1) ; rien pour `anon`. Si des comptes partenaires apparaissent un jour (rôle `partner` de projet.md), ces politiques devront se restreindre aux admins : à reprendre à ce moment-là.
- Le corps est assaini à l'enregistrement autant qu'à l'affichage : seul ce que DOC-9 permet est gardé (DOC-11), aucun script.
- **Seed** : quelques dossiers et documents factices, aucun contenu réel de l'entreprise.
