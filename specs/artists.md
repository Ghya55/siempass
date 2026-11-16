---
type: objet
titre: "Artistes : la liste des artistes, au back-office"
statut: à valider
porteur: Quentin
figma: []          # à dessiner par Alex : page, modale « Add artist », vide, erreur
maj: 2026-11-16
---
*Préfixe des identifiants : `ART-`. Besoin terrain de Ghya du 16/11, à faire vite : tâche directe de Richard, codée sans Figma en reprenant la page Partners. Cette spec décrit ce qui est codé.*

## Définition
Un artiste est une personne ou un groupe qui se produit dans le réseau SiemPass (DJ, groupe, humoriste). Pour l'instant c'est un carnet d'adresses : l'admin le saisit au back-office, page « Artists », quatrième entrée du menu.

## Attributs
| Nom | Type | Obligatoire | Exemple |
|---|---|---|---|
| « Name » | texte | oui | Sokha & The Band |
| « Category » | texte libre | oui | Band |
| « Instagram or social link » | texte libre | non | @sokha.band |

## Règles
**ART-1 — Nom et catégorie exigés.** « Save » sans l'un des deux n'enregistre rien et marque le champ : « This field is required ».

**ART-2 — La catégorie est un texte libre.** Pas de liste fermée : l'admin écrit ce qu'il veut. Demande de Ghya du 16/11.

**ART-3 — Un seul réseau social, facultatif.** Saisi tel quel, lien ou identifiant ; affiché tel quel, « — » s'il est vide.

**ART-4 — Ajouter et lister, rien d'autre.** La page liste tous les artistes, du plus récent au plus ancien, et « Add artist » en ajoute un. Pas de fiche, de modification, de suppression, de recherche ni de filtre.

**ART-5 — Back-office seulement.** La page est derrière la connexion. Rien d'un artiste n'est lisible par le site public.

**ART-6 — États de la page.** Vide : « No artists yet ». Échec de lecture : « Couldn't load artists. Reload the page. » à la place du tableau. Échec de « Save » : « Couldn't save. Try again. » dans la modale, qui reste ouverte avec la saisie.

## Cas limites
**ART-7 — Doublon.** Deux artistes peuvent porter le même nom : rien ne l'empêche.

## Ouvert pour Ghya
1. Une faute de saisie ne se corrige pas : ni modification ni suppression ([ART-4](artists.md#art-4)). Lequel des deux d'abord ?
2. Catégorie libre : « DJ », « dj » et « Dj » feront trois catégories le jour où on voudra filtrer ou afficher par catégorie. On ferme la liste à ce moment-là, ou avant ?
3. À quoi l'artiste se rattache ensuite : un lieu, une soirée, une page publique ? Rien n'est construit tant que ce n'est pas dit.

## Détails techniques
Table `artists` (migration `20261116200000_artists.sql`) : `nom`, `categorie`, `reseau_social`. RLS : lecture et ajout pour `authenticated`, rien pour `anon`, aucune politique de modification ni de suppression. Tests : `supabase/tests/artists.test.sql`. Écran : `apps/admin/app/artists/`.
