---
name: figma-bibliotheque
description: Organisation du fichier Figma de SiemPass (pages, variables, composants, écrans, essais) et pièges connus du serveur MCP Figma. À charger par Alex avant toute action dans Figma, et par quiconque doit vérifier qu'un composant ou un écran existe.
---
# Le fichier Figma

## Organisation
| Page | Contenu |
|---|---|
| `00 · Fondations` | Variables, styles de texte, grilles, icônes |
| `01 · Composants · Site` | Composants du site public |
| `02 · Composants · Back-office` | Composants du back-office (et du scanner) |
| `10+ · Site · <Feature>` | Écrans du site, une page par grosse feature (`10 · Site · Lieux`) |
| `50+ · BO · <Feature>` | Écrans du back-office (`50 · BO · Partenaires`) |
| `90 · Essais` | Essais visuels, un cadre par essai, jamais de vrai composant |
| `99 · Archive` | Versions remplacées, marquées, jamais supprimées |
Des composants partagés par les deux produits (boutons de base, champs) vivent dans `01` et sont réutilisés dans `02`.

## Variables
- Deux collections : **Primitives** (`gray/50`, `blue/600`, `space/4`) et **Tokens** (`color/text/muted`, `space/inset/md`, `radius/control`). Les composants n'utilisent que des tokens.
- Le site et le back-office partagent les primitives ; des modes de la collection Tokens portent leurs différences (`site`, `bo`) si besoin.
- Un token = une variable CSS du même nom dans le code : **renommer un token, c'est casser le code**. Tout renommage figure en gras dans la description de PR.

## Composants
- `PascalCase` pour les composants, `camelCase` pour les propriétés : ce sont des props.
- Variant → apparence ou état (`size`, `tone`, `state`) · Boolean → présence (`hasIcon`) · Text → contenu (`label`) · Instance swap → emplacement (`icon`).
- Ce qui varie par état est une **variante**, pas un booléen. Un jeu de variantes ne devient jamais un composant simple. Une extension garde des valeurs par défaut égales au rendu actuel.
- Un changement de structure se teste sur un clone, avec un texte long.

## Écrans
- `NN · <nom>`, sous-écran `NN.n`, état ` · <état>` (`50 · Partenaires · panneau ouvert`). Une version remplacée devient `v1`, marquée, déplacée en `99 · Archive`.
- Un écran n'est fait que d'instances. Pas de prototype : comportement décrit en une ligne à côté du cadre.
- Contenus fictifs réalistes (noms de lieux inventés, vraies longueurs de texte) : l'associé doit comprendre l'écran sans explication.

## Serveur MCP Figma : pièges connus
- Charger `figma-use` avant `use_figma`. Vérifier chaque écriture par `get_screenshot` : les écritures mettent du temps à atteindre un canvas déjà ouvert ; Ghya recharge le fichier avant de juger.
- `search_design_system` renvoie surtout des bibliothèques tierces : `get_metadata` sur le fichier, avec un id de page (sans nœud, juste après une création, la liste des pages est périmée).
- `get_variable_defs` ne lit pas toujours les primitives. Une variante clonée perd ses liens de propriétés (à rebrancher). Une instance dont la largeur est liée à une variable reste figée même en « Fill » : délier.
- Deux enfants FILL côte à côte ne se partagent la largeur que si aucun n'a un contenu plus large que sa part : cadre FILL sans padding autour. Un calque texte n'accepte pas de hauteur minimale : l'envelopper.
- Le défilement (sticky) n'est pas exposé par l'API : réglage manuel par Ghya, sur consigne précise.
- L'envoi d'images et `download_assets` peuvent être refusés (403) : placeholder, dépôt manuel par Ghya.
