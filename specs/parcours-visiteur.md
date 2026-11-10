---
type: flux
titre: "Parcours du visiteur sur le site public"
statut: à valider
porteur: Quentin
figma:
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=57-49  # 10 · Home · sans pass
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=57-107  # 10.1 · Home · avec pass
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=57-197  # 11 · Pass · argumentaire
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=57-218  # 11 · Pass · argumentaire · paiement ouvert
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=57-268  # 11 · Pass · argumentaire · paiement refusé
  - https://www.figma.com/design/rmCEVKTs8zzTMOuSQFnXno/Siempass?node-id=57-321  # 11.1 · Pass · le pass
maj: 2026-11-10
---

*Préfixe des identifiants : `VIS-`. Corrigée le 10/11 d'après la relecture des six Figma par Ghya. Cette spec remplace les étapes 8 et 9 de [parcours-demo.md](parcours-demo.md). Objet manipulé : [Partenaire](partenaire.md).*

## Intention
Le visiteur arrive sur le site, voit d'un coup d'œil s'il a déjà un pass, découvre les lieux partenaires, et s'il n'en a pas l'achète sans quitter l'écran où il a dit oui.

## Blocs
Trois blocs, et trois seulement.

1. **Accueil** — un en-tête, la zone « carte du pass », la liste des lieux en dessous.
   - *En-tête* : « SiemPass » centré, et rien d'autre — ni bouton d'achat, ni mention de lieu sous le titre.
   - *Sans pass* : la carte porte une phrase courte, « One pass, a perk at every partner venue. », et le bouton « Get the Pass ».
   - *Avec pass* : carte à fond très sombre ; à gauche une grosse icône de QR code, à droite « Your SiemPass », le code du pass, puis « Valid until <date> » suivi de « Validity period not final » ; à l'extrémité droite, un chevron vers la droite. Toute la carte est cliquable et mène au bloc 2.
   - La liste des lieux suit, sous le titre « Partner venues » : photo, nom, description courte et avantage de chaque partenaire.
2. **Page pass** — une seule page, plein écran, deux états, sous le même en-tête que l'accueil, avec en plus un bouton retour à gauche du titre.
   - *Sans pass* : l'argumentaire. Titre « One pass. Perks all over Siem Reap. », le prix « $20, one-time payment », trois arguments courts — « Pays for itself in 3 visits », « A perk at every partner venue », « No app to install: your pass opens in your browser » — et, en bas de l'écran, le bouton « Get the Pass », grand et porteur d'une icône.
   - *Avec pass* : le pass en grand — le QR code réel, le code du pass, « Valid until <date> », « Validity period not final », et la consigne « Show this QR code at the counter. »
3. **Feuille de paiement** — elle monte par-dessus la page pass sur un fond qui s'assombrit : titre « Payment », récapitulatif « SiemPass pass » / « $20 », les trois moyens « KHQR », « ABA Pay » et « Bank card », le bouton « Pay $20 » et la mention « Secure payment by ABA PayWay. »

## Règles
**VIS-1 — Deux zones à l'accueil.** La carte du pass est toujours au-dessus de la liste des lieux : le visiteur voit son état avant de découvrir les lieux.

**VIS-2 — Une seule question « ai-je un pass ? ».** Les deux états de l'accueil et de la page pass viennent d'une seule et même question, dont la réponse est portée par le navigateur du visiteur ([décision du 10/11](../decisions/2026-11-10-authentification.md)). Aucun compte, aucun mot de passe, aucun e-mail.

**VIS-3 — Le vrai QR ne se révèle jamais à l'accueil.** La carte « avec pass » montre une grosse icône de QR code, pas le code lui-même ; rien de scannable n'est affiché sur l'accueil.

**VIS-4 — Le clic sur la carte navigue.** La carte mène à la page pass en plein écran : ni panneau qui s'ouvre, ni agrandissement sur place.

**VIS-5 — Une seule page pass.** L'argumentaire et le pass sont deux états de la même page. Le visiteur qui achète ne change pas de page.

**VIS-6 — L'argumentaire tient dans un écran.** Sans pass, la page pass tient en une hauteur d'écran, sans défilement : en-tête, titre, prix, trois arguments, bouton. Le bouton d'achat reste visible en bas de l'écran ; la manière de le tenir là est tranchée côté développement. Un quatrième argument remplacerait un des trois, il ne s'ajoute pas.

**VIS-7 — Le pass est lisible seulement sur sa page.** Le QR code réel, celui que le comptoir scanne, n'existe que dans l'état « avec pass » de la page pass.

**VIS-8 — Le paiement est une feuille, jamais une page.** « Get the Pass » ouvre une feuille par-dessus la page pass ; l'adresse de la page ne change pas, et fermer la feuille ramène à l'argumentaire intact.

**VIS-9 — Le paiement réussi ne navigue pas.** La feuille se ferme et la page passe à l'état « avec pass » : le pass apparaît là où le visiteur se trouvait déjà.

**VIS-10 — L'achat en trois pages disparaît.** Le parcours actuel — une page d'argumentaire, une page de paiement, puis l'arrivée sur le pass — sort du flow produit ; il est remplacé par la page pass et sa feuille de paiement. Un pass garde son adresse propre, consultable directement.

**VIS-11 — Interface en anglais.** Tous les textes du visiteur sont en anglais ([DEMO-27](parcours-demo.md#demo-27)) ; ceux entre « » de cette spec sont les libellés exacts.

**VIS-12 — Toute date porte sa mention.** Chaque date de validité affichée, sur la carte de l'accueil comme sur la page pass, est suivie de « Validity period not final » ([DEMO-9](parcours-demo.md#demo-9)).

**VIS-13 — La liste ne montre que les lieux en ligne.** Seuls les partenaires `en ligne` sont publics ([PART-3](partenaire.md#part-3)) ; aucune donnée de contact n'est rendue ([PART-8](partenaire.md#part-8)).

**VIS-14 — Rien de plus.** Pas de filtre, pas de recherche, pas de carte géographique, pas de fiche de lieu : les trois blocs ci-dessus sont tout le site public du MVP.

**VIS-27 — Le même en-tête sur les deux pages.** L'accueil et la page pass portent le même en-tête : « SiemPass » centré, seul, sans bouton d'achat ni sous-titre. Sur la page pass, un bouton retour s'y ajoute, à gauche, icône seule sans libellé, et ramène à l'accueil : le site se tient comme une petite application.

**VIS-28 — La carte du pass dit qu'elle se clique.** À l'état « avec pass », un chevron vers la droite, à l'extrémité droite de la carte, désigne le geste qui mène au QR code du pass ([VIS-4](parcours-visiteur.md#vis-4)).

**VIS-29 — Le bouton d'achat attire l'œil.** Sur l'argumentaire, « Get the Pass » est l'élément le plus voyant de la page : grand, accompagné d'une icône, assez contrasté pour qu'aucun autre élément ne lui dispute l'attention.

**VIS-30 — La feuille de paiement s'ouvre, se suit et se ferme au doigt.** Elle monte depuis le bas d'un mouvement continu ; derrière elle le fond s'assombrit au même rythme, son assombrissement maximal coïncidant avec la feuille grande ouverte. Un glissement vers le bas la referme et rend l'argumentaire intact ([VIS-8](parcours-visiteur.md#vis-8)). Aucun moment de ce mouvement ne saccade.

**VIS-31 — Toute attente visible porte son chargement.** Dès que le visiteur attend une réponse, l'élément concerné le montre sur place : la carte du pass pendant que le navigateur répond à « ai-je un pass ? » ([VIS-2](parcours-visiteur.md#vis-2)), le bouton de paiement pendant que le paiement se joue. L'élément garde ses dimensions : l'arrivée de la réponse ne déplace rien autour de lui.

## Cas limites
**VIS-15 — Paiement refusé.** L'échec s'affiche dans la feuille de paiement, à la place du bouton : « Payment didn't go through », « No pass was created. You have not been charged. » et « Try again ». La feuille reste ouverte, aucun pass n'est créé ([DEMO-13](parcours-demo.md#demo-13)).

**VIS-16 — Adresse d'un pass connue, navigateur sans pass.** Le pass s'affiche en grand : il est son propre justificatif, qui a son adresse le voit. Le navigateur n'adopte pas ce pass pour autant, l'accueil reste à l'état « sans pass ». Hypothèse produit, le temps que la récupération soit tranchée.

**VIS-17 — Navigateur porteur d'un pass introuvable.** Si le pass mémorisé n'existe plus, l'accueil et la page pass retombent à l'état « sans pass » et le navigateur oublie ce pass, sans message d'erreur.

**VIS-18 — Liste de lieux vide.** La liste porte « First venues coming soon » ; la carte du pass reste en place avec son bouton, l'achat est possible même sans aucun lieu publié.

**VIS-19 — Lieu sans photo.** La carte du lieu affiche un visuel de remplacement neutre ([PART-10](partenaire.md#part-10)).

## Fini quand
**VIS-20 — L'accueil distingue les deux états.** Navigateur sans pass : phrase courte et bouton dans la carte. Navigateur avec pass : carte sombre, illustration, code et date suivie de sa mention.

**VIS-21 — Aucun QR scannable à l'accueil.** Scanner la carte de l'accueil avec l'écran de validation du back-office ne donne aucun résultat.

**VIS-22 — Le clic mène au pass plein écran.** Depuis la carte « avec pass », le pass s'affiche en grand et son QR code est validé avec succès par l'écran de validation du back-office.

**VIS-23 — L'argumentaire ne défile pas.** Sur un téléphone, la page pass sans pass se voit entièrement sans défiler, bouton compris.

**VIS-24 — L'achat ne quitte pas l'écran.** « Get the Pass » ouvre la feuille ; après un paiement réussi, le pass s'affiche sans qu'aucune autre page n'ait été visitée.

**VIS-25 — L'échec reste dans la feuille.** Un paiement refusé laisse le visiteur dans la feuille et ne crée aucun pass.

**VIS-26 — Les lieux viennent de la base.** Mettre un partenaire en ligne au back-office le fait apparaître dans la liste sans redéploiement ; le repasser en brouillon le fait disparaître.

**VIS-32 — L'en-tête est le même partout.** Sur l'accueil comme sur la page pass, le titre est centré et seul ; la page pass offre en plus un retour qui ramène à l'accueil.

**VIS-33 — La feuille se referme au doigt.** Un glissement vers le bas depuis la feuille ouverte la referme et laisse l'argumentaire intact ; le fond est au plus sombre quand la feuille est à son ouverture maximale, et s'éclaircit avec elle.

**VIS-34 — Aucune attente n'est muette ni sauteuse.** La carte du pass et le bouton de paiement montrent chacun leur chargement, et l'arrivée de la réponse ne décale aucun élément autour d'eux.

## Ouvert pour Ghya
1. Durée de validité du pass : non tranchée, donc toute date affichée reste provisoire ([DEMO-9](parcours-demo.md#demo-9)).
2. Récupération d'un pass sur un autre téléphone (lien par e-mail) : hors périmètre de cette spec, tâche ultérieure.
3. Pass expiré : l'accueil retombe-t-il à l'état « sans pass », ou montre-t-il un pass périmé avec un renouvellement ? Non spécifié ici.
4. Titre et trois arguments de l'argumentaire : libellés à valider, « Pays for itself in 3 visits » en particulier, qui promet un remboursement.
5. Fiche d'un lieu : écartée du MVP, la liste suffit.

## Détails techniques
L'accueil est `/`, l'argumentaire et le pass sont la même page `/pass`, un pass donné garde son adresse `/pass/<code>`.

`apps/site/app/buy` et `apps/site/app/buy/payment` sortent du flow : plus aucun lien n'y mène. Leur suppression efface un travail existant, elle demande le feu vert de Ghya ; d'ici là ces pages restent en place, non liées.

La question de [VIS-2](parcours-visiteur.md#vis-2) est une seule fonction, lue dans le stockage du navigateur, appelée par l'accueil et par la page pass, nulle part ailleurs. La carte du pass et la page pass sont donc des îlots rendus côté client ; la liste des lieux reste rendue côté serveur.

Tenir le bouton d'achat en bas de l'écran (position collée ou non) n'est plus un sujet de maquette : le réglage est tranché côté développement.

Les liens de nœuds Figma seront ajoutés à l'en-tête `figma:` par Alex, une fois les écrans dessinés.
