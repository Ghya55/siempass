/**
 * Les icônes de SiemPass, telles que Figma les exporte.
 *
 * Source : `node.exportAsync({ format: "SVG_STRING" })` par l'outil `use_figma` du serveur MCP
 * Figma. Le SVG revient dans la réponse de l'outil : aucun téléchargement depuis figma.com, donc
 * le refus du proxy (403) qui bloquait `download_assets` ne joue pas. Pour ajouter ou mettre à
 * jour une icône : exporter le nœud, recopier ici `box`, les `d` et le trait. Rien ne se trace à
 * la main.
 *
 * Deux familles :
 * - la bibliothèque, frame `Icons` de « 00 · Fondations », dessinée sur 24 ;
 * - les icônes dessinées sur place dans un composant, sans composant d'icône (`figma` donne le
 *   nœud). Elles portent le nom de leur composant. Trois doublent une icône de la bibliothèque
 *   avec un autre dessin (pin, photo ×2) : à unifier dans Figma, pas ici.
 */
type Trait = {
  readonly kind: "stroke";
  readonly width: number;
  readonly cap: "round" | "butt";
  readonly join: "round" | "miter";
};

type IconDef = {
  /** Nœud Figma d'origine. */
  readonly figma: string;
  /** Côté du gabarit sur lequel l'icône est dessinée. */
  readonly box: number;
  readonly paint: Trait | { readonly kind: "fill" };
  readonly paths: readonly string[];
};

const TRAIT_BIBLIOTHEQUE = { kind: "stroke", width: 2, cap: "round", join: "round" } as const satisfies Trait;

export const ICONS = {
  /* ── Bibliothèque : frame `Icons` (64:11) ─────────────────────────────────────────────── */

  // FIGMA-MANQUANT: dans ces quatre composants (64:12 à 64:18), le tracé est posé en (0,0) du
  // gabarit de 24 au lieu d'y être centré, et son trait dépasse du cadre. Le dessin est exact ;
  // seul son centrage est corrigé ici. À corriger dans Figma (Alex).
  "chevron-left": { figma: "64:12", box: 24, paint: TRAIT_BIBLIOTHEQUE, paths: ["M16 4L8 12L16 20"] },
  "chevron-right": { figma: "64:14", box: 24, paint: TRAIT_BIBLIOTHEQUE, paths: ["M8 4L16 12L8 20"] },
  "arrow-right": {
    figma: "64:16",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: ["M3.5 12H20.5M13.5 19L20.5 12L13.5 5"],
  },
  /** « Chargement : arc 3/4. La rotation est côté développement. » */
  spinner: {
    figma: "64:18",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: ["M12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12"],
  },
  /** Une illustration, jamais quelque chose de scannable (VIS-3). */
  qr: {
    figma: "64:20",
    box: 24,
    paint: { kind: "fill" },
    paths: [
      "M1 1H8V2.5H1V1Z",
      "M1 6.5H8V8H1V6.5Z",
      "M1 2.5H2.5V6.5H1V2.5Z",
      "M6.5 2.5H8V6.5H6.5V2.5Z",
      "M3.5 3.5H5.5V5.5H3.5V3.5Z",
      "M16 1H23V2.5H16V1Z",
      "M16 6.5H23V8H16V6.5Z",
      "M16 2.5H17.5V6.5H16V2.5Z",
      "M21.5 2.5H23V6.5H21.5V2.5Z",
      "M18.5 3.5H20.5V5.5H18.5V3.5Z",
      "M1 16H8V17.5H1V16Z",
      "M1 21.5H8V23H1V21.5Z",
      "M1 17.5H2.5V21.5H1V17.5Z",
      "M6.5 17.5H8V21.5H6.5V17.5Z",
      "M3.5 18.5H5.5V20.5H3.5V18.5Z",
      "M16 16H19V19H16V16Z",
      "M20.5 20.5H23V23H20.5V20.5Z",
      "M16 21H18.5V23.5H16V21Z",
      "M21 16H23.5V18.5H21V16Z",
      "M10 10H12.5V12.5H10V10Z",
      "M10 1H12.5V3.5H10V1Z",
      "M1 10H3.5V12.5H1V10Z",
    ],
  },
  grip: {
    figma: "122:9",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M9 6C9.55228 6 10 5.55228 10 5C10 4.44772 9.55228 4 9 4C8.44772 4 8 4.44772 8 5C8 5.55228 8.44772 6 9 6Z",
      "M9 13C9.55228 13 10 12.5523 10 12C10 11.4477 9.55228 11 9 11C8.44772 11 8 11.4477 8 12C8 12.5523 8.44772 13 9 13Z",
      "M9 20C9.55228 20 10 19.5523 10 19C10 18.4477 9.55228 18 9 18C8.44772 18 8 18.4477 8 19C8 19.5523 8.44772 20 9 20Z",
      "M15 6C15.5523 6 16 5.55228 16 5C16 4.44772 15.5523 4 15 4C14.4477 4 14 4.44772 14 5C14 5.55228 14.4477 6 15 6Z",
      "M15 13C15.5523 13 16 12.5523 16 12C16 11.4477 15.5523 11 15 11C14.4477 11 14 11.4477 14 12C14 12.5523 14.4477 13 15 13Z",
      "M15 20C15.5523 20 16 19.5523 16 19C16 18.4477 15.5523 18 15 18C14.4477 18 14 18.4477 14 19C14 19.5523 14.4477 20 15 20Z",
    ],
  },
  trash: {
    figma: "122:14",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M3 6H21",
      "M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6",
      "M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6",
    ],
  },
  pencil: {
    figma: "122:18",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M21.174 6.812C21.7027 6.28342 21.9998 5.56647 21.9999 4.81885C22 4.07124 21.7031 3.35421 21.1745 2.8255C20.6459 2.29679 19.929 1.99971 19.1813 1.99962C18.4337 1.99952 17.7167 2.29642 17.188 2.825L3.842 16.174C3.60981 16.4055 3.43811 16.6905 3.342 17.004L2.021 21.356C1.99515 21.4425 1.9932 21.5343 2.01535 21.6219C2.03749 21.7094 2.08292 21.7892 2.14679 21.853C2.21067 21.9168 2.29062 21.9621 2.37815 21.9841C2.46569 22.0061 2.55755 22.004 2.644 21.978L6.997 20.658C7.31017 20.5628 7.59517 20.3921 7.827 20.161L21.174 6.812Z",
      "M15 5L19 9",
    ],
  },
  plus: { figma: "122:22", box: 24, paint: TRAIT_BIBLIOTHEQUE, paths: ["M5 12H19", "M12 5V19"] },
  "chevron-down": { figma: "122:25", box: 24, paint: TRAIT_BIBLIOTHEQUE, paths: ["M6 9L12 15L18 9"] },
  photo: {
    figma: "122:30",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z",
      "M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z",
      "M21 15L17.914 11.914C17.5389 11.5391 17.0303 11.3284 16.5 11.3284C15.9697 11.3284 15.4611 11.5391 15.086 11.914L6 21",
    ],
  },
  pin: {
    figma: "122:34",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M12.601 21.799C14.461 20.193 20 14.993 20 10C20 7.87827 19.1571 5.84344 17.6569 4.34315C16.1566 2.84285 14.1217 2 12 2C9.87827 2 7.84344 2.84285 6.34315 4.34315C4.84285 5.84344 4 7.87827 4 10C4 14.993 9.539 20.193 11.399 21.799C11.5723 21.9293 11.7832 21.9998 12 21.9998C12.2168 21.9998 12.4277 21.9293 12.601 21.799Z",
      "M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z",
    ],
  },
  clock: {
    figma: "122:38",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z",
      "M12 6V12L16 14",
    ],
  },
  "external-link": {
    figma: "122:43",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M15 3H21V9",
      "M10 14L21 3",
      "M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11",
    ],
  },
  tag: {
    figma: "122:47",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M12.586 2.586C12.211 2.2109 11.7024 2.00011 11.172 2H4C3.46957 2 2.96086 2.21071 2.58579 2.58579C2.21071 2.96086 2 3.46957 2 4V11.172C2.00011 11.7024 2.2109 12.211 2.586 12.586L11.29 21.29C11.7445 21.7416 12.3592 21.9951 13 21.9951C13.6408 21.9951 14.2555 21.7416 14.71 21.29L21.29 14.71C21.7416 14.2555 21.9951 13.6408 21.9951 13C21.9951 12.3592 21.7416 11.7445 21.29 11.29L12.586 2.586Z",
      "M7.5 8C7.77614 8 8 7.77614 8 7.5C8 7.22386 7.77614 7 7.5 7C7.22386 7 7 7.22386 7 7.5C7 7.77614 7.22386 8 7.5 8Z",
    ],
  },
  alert: {
    figma: "122:52",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z",
      "M12 8V12",
      "M12 16H12.01",
    ],
  },
  retry: {
    figma: "122:58",
    box: 24,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: [
      "M3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.516 3.00947 16.931 3.99122 18.74 5.74L21 8",
      "M21 3V8H16",
      "M21 12C21 14.3869 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.3869 21 12 21C9.48395 20.9905 7.06897 20.0088 5.26 18.26L3 16",
      "M8 16H3V21",
    ],
  },
  store: {
    figma: "123:213",
    box: 24,
    paint: { kind: "stroke", width: 2, cap: "butt", join: "round" },
    paths: ["M4 21V9L12 4L20 9V21", "M9 21V15H15V21"],
  },

  /* ── Dessinées sur place, sans composant d'icône ──────────────────────────────────────── */

  /** `icon/pin` de `EmptyState`. Autre dessin que `pin`. */
  "empty-state-pin": {
    figma: "5:32",
    box: 24,
    paint: { kind: "stroke", width: 2, cap: "butt", join: "round" },
    paths: [
      "M12 21C12 21 5 14.8 5 9.5C5 7.64348 5.7375 5.86301 7.05025 4.55025C8.36301 3.2375 10.1435 2.5 12 2.5C13.8565 2.5 15.637 3.2375 16.9497 4.55025C18.2625 5.86301 19 7.64348 19 9.5C19 14.8 12 21 12 21Z",
      "M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z",
    ],
  },
  /** `icon/photo` de `PlaceCard`, dessinée sur 32. Autre dessin que `photo`. */
  "place-card-photo": {
    figma: "5:45",
    box: 32,
    paint: { kind: "stroke", width: 2.13333, cap: "butt", join: "round" },
    paths: [
      "M25.3333 6.66666H6.66667C5.19391 6.66666 4 7.86057 4 9.33333V22.6667C4 24.1394 5.19391 25.3333 6.66667 25.3333H25.3333C26.8061 25.3333 28 24.1394 28 22.6667V9.33333C28 7.86057 26.8061 6.66666 25.3333 6.66666Z",
      "M12 15.4667C13.1782 15.4667 14.1334 14.5115 14.1334 13.3333C14.1334 12.1551 13.1782 11.2 12 11.2C10.8218 11.2 9.8667 12.1551 9.8667 13.3333C9.8667 14.5115 10.8218 15.4667 12 15.4667Z",
      "M5.33325 22.6667L11.9999 17.3333L17.3333 21.3333L21.3333 18.6667L26.6666 22.6667",
    ],
  },
  /** `icon/photo` de `PhotoThumb` (back-office). Même dessin que `place-card-photo`, sur 24. */
  "photo-thumb-photo": {
    figma: "18:498",
    box: 24,
    paint: { kind: "stroke", width: 2.13333, cap: "butt", join: "round" },
    paths: [
      "M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z",
      "M9 11.6C9.88366 11.6 10.6 10.8837 10.6 10C10.6 9.11637 9.88366 8.40002 9 8.40002C8.11635 8.40002 7.4 9.11637 7.4 10C7.4 10.8837 8.11635 11.6 9 11.6Z",
      "M4 17L9 13L13 16L16 14L20 17",
    ],
  },
  /** `icon/check` de `BenefitRow`, dessinée sur 20. */
  "benefit-check": {
    figma: "54:8",
    box: 20,
    paint: TRAIT_BIBLIOTHEQUE,
    paths: ["M3 10.5L7.5 15L17 5"],
  },
  /** `icon/check` du bandeau d'invitation, dessinée sur 18. */
  "invite-check": {
    figma: "6:84",
    box: 18,
    paint: { kind: "stroke", width: 1.8, cap: "round", join: "round" },
    paths: ["M3.75 9.375L7.125 12.75L14.25 5.625"],
  },
  /** `icon/close` de `PanelHeader`, dessinée sur 20. */
  "panel-close": {
    figma: "6:100",
    box: 20,
    paint: { kind: "stroke", width: 1.66667, cap: "round", join: "miter" },
    paths: ["M5 5L15 15M15 5L5 15"],
  },
  /** Les trois résultats du scan, dessinés sur 40 dans une pastille de 88. */
  "scan-valide": {
    figma: "6:118",
    box: 40,
    paint: { kind: "stroke", width: 4.33333, cap: "round", join: "round" },
    paths: ["M8.33325 20.8333L15.8333 28.3333L31.6666 12.5"],
  },
  "scan-deja-utilise": {
    figma: "6:128",
    box: 40,
    paint: { kind: "stroke", width: 3.66667, cap: "round", join: "miter" },
    paths: [
      "M20.0001 33.3333C27.3639 33.3333 33.3334 27.3638 33.3334 20C33.3334 12.6362 27.3639 6.66666 20.0001 6.66666C12.6363 6.66666 6.66675 12.6362 6.66675 20C6.66675 27.3638 12.6363 33.3333 20.0001 33.3333Z",
      "M20 12.5V20L25 23.3333",
    ],
  },
  "scan-invalide": {
    figma: "6:138",
    box: 40,
    paint: { kind: "stroke", width: 4.33333, cap: "round", join: "miter" },
    paths: ["M11.6667 11.6667L28.3334 28.3333M28.3334 11.6667L11.6667 28.3333"],
  },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;
