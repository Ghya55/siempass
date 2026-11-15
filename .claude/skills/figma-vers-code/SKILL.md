---
name: figma-vers-code
description: Traduire un composant ou un écran Figma de SiemPass en code fidèle (tokens, props, icônes, états) via le serveur MCP Figma, pour Next.js. À charger par Stéphane dès qu'une tâche touche un écran ou un composant.
---
# Figma vers code

## Le contrat de nommage
| Dans Figma | Dans le code |
|---|---|
| Variable `color/brand/primary` | `--color-brand-primary` (et la classe ou clé de thème du même nom) |
| Composant `Button` | Composant `Button`, même nom |
| Variant `size: sm / md / lg` | Prop `size: 'sm' \| 'md' \| 'lg'` |
| Boolean `hasIcon` | Prop `hasIcon: boolean` |
| Text `label` | Prop `label: string` |
| Instance swap `icon` | Prop `icon: ReactNode` |
- Jamais de primitive (`gray/50`) dans un composant : seulement les tokens.
- Un composant Figma = un composant dans le code. Pas de composant qui n'existe pas dans Figma (hors mise en page).
- Les tokens sont générés depuis les variables Figma dans un package partagé (`packages/ui` ou équivalent), jamais édités à la main.

## L'ordre des appels MCP
1. `get_variable_defs` → les tokens. S'il en manque, `get_metadata` sur `00 · Fondations`.
2. Charger `figma-design-to-code`, puis `get_design_context` sur le nœud. Le résultat est une **référence** : on le retraduit avec les composants et tokens du projet.
3. `get_screenshot` du nœud, gardé pour comparer à la fin.
4. **Icônes : Lucide, des deux côtés.** Un composant `icon/<nom>` de la frame `Icons` porte le nom Lucide ; dans le code, `import { MapPin } from "lucide-react"` puis `<MapPin size={…} />`, taille relevée sur l'instance, couleur portée par l'usage (`currentColor`). Jamais de tracé à la main ni de placeholder. Une icône absente de Lucide : `// FIGMA-MANQUANT`, et on le dit à Alex.
   Un autre tracé vectoriel (illustration, viseur) s'exporte par `use_figma` en lecture seule (charger `figma-use`) : `exportAsync({ format: "SVG_STRING" })` renvoie le SVG dans la réponse, sans passer par figma.com que le proxy refuse (403).
5. `download_assets` pour les photos seulement ; refus réseau (403) : placeholder et note pour Ghya.

## Ce qui manque dans Figma
On ne l'invente pas : rendu volontairement grossier, `// FIGMA-MANQUANT: <quoi>` dans le code, ligne dans la description de PR pour Alex.

## Avant de livrer
- Aucune valeur en dur là où un token existe (`grep` des couleurs hexa et des px hors tokens).
- Chaque prop correspond à une propriété Figma, et réciproquement.
- Rendu comparé au screenshot, à la largeur du Figma (mobile pour le site, desktop pour le back-office).
