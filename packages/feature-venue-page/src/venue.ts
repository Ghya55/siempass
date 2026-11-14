import type { CategorieLieu } from "@siempass/db";

/**
 * Un bloc du contenu d'un lieu (VEN-4) : un paragraphe en texte brut ou une photo. C'est la forme
 * d'un élément du tableau `venues.contenu`. `kind` reprend la variante du composant Figma
 * `VenueBlock` (123:93). `url` nulle : photo jamais envoyée, qui n'est pas rendue (VEN-20).
 */
export type VenueBlock =
  | { readonly id: string; readonly kind: "paragraph"; readonly text: string }
  | { readonly id: string; readonly kind: "photo"; readonly url: string | null };

/**
 * Tout ce que la fiche publique affiche d'un lieu. La fiche le reçoit, elle ne lit pas la base :
 * le site et la preview du back-office lui passent les mêmes données (VEN-12).
 * Les champs nuls ne sont pas rendus : un lieu repris n'a ni catégorie ni auteur (VEN-27), et la
 * preview d'un brouillon peut n'avoir encore ni tagline, ni avantage, ni adresse.
 */
export type VenuePageData = {
  readonly name: string;
  readonly tagline: string | null;
  readonly perk: string | null;
  readonly headerPhotoUrl: string | null;
  readonly blocks: readonly VenueBlock[];
  readonly category: CategorieLieu | null;
  readonly address: string | null;
  readonly mapsUrl: string | null;
  readonly hours: string | null;
  readonly author: string | null;
};

/** Libellés de VEN-5, au mot près (VEN-18 : interface en anglais). */
export const VENUE_CATEGORY_LABELS = {
  bar: "Bar",
  restaurant: "Restaurant",
  cafe: "Café",
  shop: "Shop",
  other: "Other",
} as const satisfies Record<CategorieLieu, string>;

const CATEGORIES: readonly CategorieLieu[] = ["bar", "restaurant", "cafe", "shop", "other"];

export function isVenueCategory(value: unknown): value is CategorieLieu {
  return CATEGORIES.some((category) => category === value);
}

/**
 * Lit `venues.contenu` (du `jsonb`, donc `unknown` à la frontière) en blocs typés. Un élément
 * mal formé est écarté plutôt que de faire tomber la page. Un bloc sans `id` reçoit sa position :
 * l'identifiant ne sert ici qu'à la clé React.
 */
export function parseVenueBlocks(value: unknown): VenueBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((element: unknown, index: number): VenueBlock[] => {
    const block = parseVenueBlock(element, index);
    return block === null ? [] : [block];
  });
}

function parseVenueBlock(element: unknown, index: number): VenueBlock | null {
  if (typeof element !== "object" || element === null) {
    return null;
  }
  const id = "id" in element && typeof element.id === "string" ? element.id : `bloc-${index}`;
  const kind = "kind" in element ? element.kind : undefined;

  if (kind === "paragraph" && "text" in element && typeof element.text === "string") {
    return { id, kind, text: element.text };
  }
  if (kind === "photo") {
    const url = "url" in element && typeof element.url === "string" ? element.url : null;
    return { id, kind, url };
  }
  return null;
}

/** VEN-20 : un paragraphe vide ou une photo jamais envoyée n'est pas rendu. */
export function isRenderableBlock(block: VenueBlock): boolean {
  switch (block.kind) {
    case "paragraph":
      return block.text.trim() !== "";
    case "photo":
      return block.url !== null && block.url !== "";
    default:
      return assertNever(block);
  }
}

function assertNever(value: never): never {
  throw new Error(`Bloc inattendu : ${JSON.stringify(value)}`);
}
