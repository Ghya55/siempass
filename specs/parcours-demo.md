---
type: flux
titre: "Parcours de démonstration — de la saisie au scan"
statut: brouillon
porteur: Quentin
figma: []
maj: 2026-11-09
---

*Préfixe des identifiants : `DEMO-`. Objet manipulé : [Partenaire](partenaire.md).*

## Intention
Ghya montre à son associé, en une seule traversée du produit, qu'un partenaire saisi une fois dans notre back-office arrive sur le site public, que le partenaire voit sa fiche sans compte à créer, et qu'un pass acheté se valide au comptoir en quelques secondes — ce que Notion ne faisait pas.

## Blocs
Dix étapes, dans cet ordre.

1. **Back-office, liste des partenaires** — tableau vide : « Aucun partenaire pour le moment » et le bouton « Ajouter un partenaire ».
2. **Formulaire d'ajout** — deux groupes nettement séparés, titrés « Contact » et « Le lieu », les champs de [Partenaire](partenaire.md). Bouton « Enregistrer ».
3. **La ligne apparaît** — le tableau montre une ligne : nom du lieu, nom du contact, état « Brouillon ».
4. **Panneau latéral droit** — clic sur la ligne : la fiche complète (contact, lieu, avantage) et les boutons d'action « Inviter » et « Mettre en ligne ».
5. **Invitation** — « Inviter » envoie au partenaire un lien d'accès ; le panneau porte « Invitation envoyée ».
6. **Fiche du partenaire** — le partenaire ouvre le lien et voit sa fiche en lecture seule, avec son avantage sous le titre « Ce que vous offrez ».
7. **Mise en ligne** — de retour au back-office, « Mettre en ligne » : la ligne passe à l'état « En ligne ».
8. **Site public, liste des lieux** — le lieu apparaît dans la liste des lieux : photo, nom, description courte, avantage.
9. **Achat d'un pass** — depuis le site public, « Acheter le pass », paiement, puis le pass s'affiche avec un QR code.
10. **Scan** — depuis son compte, le partenaire ouvre « Scanner un pass », flashe le QR code, et obtient un écran de résultat.

## Règles
**DEMO-1 — Un seul aller-retour.** Les dix étapes s'enchaînent sans que personne touche à la base, à un tableur ou à un outil tiers. C'est le point de la démonstration.

**DEMO-2 — Liste vide d'abord.** L'étape 1 part d'une liste réellement vide : l'associé voit la donnée naître.

**DEMO-3 — Le brouillon n'est pas public.** Entre l'étape 3 et l'étape 7, le lieu est absent de la liste des lieux du site public.

**DEMO-4 — Le lien d'accès remplace la connexion.** L'étape 6 n'affiche aucun écran de connexion, aucune inscription, aucun mot de passe ([PART-7](partenaire.md#part-7)).

**DEMO-5 — La fiche du partenaire est en lecture seule.** À l'étape 6, aucun champ n'est modifiable, l'avantage compris ([PART-6](partenaire.md#part-6)).

**DEMO-6 — Trois résultats de scan, et trois seulement.** L'écran de résultat de l'étape 10 a trois cas :
- **pass valide** → l'avantage à offrir affiché en grand (« Un cocktail offert »), au-dessus de « Pass valide » ;
- **pass déjà utilisé** → « Ce pass a déjà été utilisé », et l'avantage n'est pas mis en avant ;
- **pass invalide** → « Pass invalide ».

**DEMO-7 — Le scan décide, pas le partenaire.** Le partenaire ne saisit rien et ne corrige rien sur l'écran de résultat ; il n'a qu'un bouton « Scanner un autre pass ».

**DEMO-8 — Site public, pas blog.** Les étapes 8 et 9 se passent sur le site public, dans la liste des lieux. Aucun autre canal n'intervient.

**DEMO-9 — Toute date est provisoire.** Si le pass de l'étape 9 affiche une date de validité, elle porte la mention « Durée de validité provisoire » : la durée n'est pas tranchée.

**DEMO-10 — Un seul partenaire, un seul pass.** La démonstration ne montre ni liste de plusieurs partenaires, ni plusieurs passes, ni statistiques, ni export.

### Ce qui est simulé pour la démonstration
Le produit décrit dans cette spec est le vrai produit. Pour la démonstration de demain, et seulement pour elle, quatre points sont simulés.

**DEMO-22 — Fausses données.** Les partenaires et le contact sont faux, saisis à la main pendant la démonstration ou chargés depuis le seed. Aucune donnée réelle de partenaire.

**DEMO-23 — Faux paiement.** À l'étape 9, aucun appel à ABA PayWay, aucune carte, aucun argent : le pass est créé comme si le paiement avait réussi.

**DEMO-24 — Fausses clés.** Toutes les clés et tous les secrets utilisés sont factices ; aucune clé réelle n'entre dans le dépôt.

**DEMO-25 — Lien d'accès affiché.** À l'étape 5, le lien d'accès peut être montré à l'écran au lieu d'être envoyé par e-mail ou par message.

**DEMO-26 — Le reste est réel.** La base, la table, l'état du partenaire, le QR code et la validation sont les vrais. Chacun des quatre points simulés se remplace par son équivalent réel sans toucher au parcours décrit ici.

## Cas limites
**DEMO-11 — Scan du même QR code deux fois de suite.** Le second scan donne « pass déjà utilisé » : c'est le cas que Ghya montre volontairement, juste après le cas valide.

**DEMO-12 — QR code étranger.** Un QR code qui n'est pas un pass SiemPass donne « Pass invalide », sans autre explication.

**DEMO-13 — Paiement refusé.** Le site public affiche « Le paiement n'a pas abouti » et aucun pass n'est créé. Cas non montré pendant la démonstration, mais l'écran existe.

**DEMO-14 — Lien d'accès ouvert avant la mise en ligne.** Fonctionne : la fiche s'affiche en lecture seule même en `brouillon`. L'étape 6 précède l'étape 7 exprès.

**DEMO-15 — Caméra indisponible au scan.** L'écran porte « Autorisez la caméra pour scanner un pass ». Pas de saisie manuelle de code dans le MVP.

## Fini quand
**DEMO-16 — La traversée se fait.** Les dix étapes s'exécutent d'affilée sur staging, sans intervention en base et sans rechargement manuel d'une page pour voir la donnée apparaître.

**DEMO-17 — L'état suit l'action.** Après l'étape 2 la ligne est « Brouillon » ; après l'étape 7 elle est « En ligne » ; le lieu est absent de la liste des lieux avant l'étape 7 et présent après.

**DEMO-18 — La fiche du partenaire s'ouvre sans compte.** Le lien de l'étape 5, ouvert dans un navigateur sans session, affiche la fiche en lecture seule et l'avantage.

**DEMO-19 — Les trois résultats de scan sont atteignables.** Un pass neuf donne « Pass valide » avec l'avantage en grand ; le même pass rescanné donne « Ce pass a déjà été utilisé » ; un QR code quelconque donne « Pass invalide ».

**DEMO-20 — Aucun écran de connexion n'apparaît.** Du début à la fin du parcours, aucun formulaire de mot de passe ni d'inscription n'est présenté.

**DEMO-21 — Rien n'est en dur.** Le lieu affiché sur le site public vient de la ligne saisie à l'étape 2, pas d'un contenu figé dans le code.

## Ouvert pour Ghya
1. Un même contact peut-il porter plusieurs lieux ?
2. Quelle est la durée de validité du pass ? Tant qu'elle n'est pas tranchée, la date affichée sur le pass reste provisoire ([DEMO-9](parcours-demo.md#demo-9)).
3. L'avantage est-il unique (une fois par pass et par lieu) ou répétable ? La réponse change l'écran « pass déjà utilisé ».
4. Qui saisit les partenaires en vrai : Ghya, l'associé, ou le partenaire lui-même ?
5. Montre-t-on le cas « paiement refusé » pendant la démonstration, ou seulement les cas qui marchent ?

## Détails techniques
Les étapes 1 à 7 se passent dans `apps/admin`, les étapes 8 et 9 dans `apps/site`, l'étape 10 sur l'écran mobile de scan du back-office sous le rôle `partner`.

Le paiement simulé est un drapeau d'environnement, pas une branche de code à retirer après : un même chemin crée le pass, avec un fournisseur de paiement factice.

La validation du pass (étape 10) passe par une Edge Function : elle seule décide entre valide, déjà utilisé et invalide, de façon à ce que le résultat ne dépende pas de l'interface.
