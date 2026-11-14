import type { Tables } from "@siempass/db";
import {
  isVenueCategory,
  parseVenueBlocks,
  type VenueBlock,
  type VenuePageData,
} from "@siempass/feature-venue-page";

/**
 * L'article d'un lieu tel que l'éditeur le manie : la photo d'en-tête et les blocs (VEN-38 :
 * l'éditeur ne porte rien d'autre). Ce qui s'enregistre est `StoredArticle` ; ce que l'éditeur
 * ajoute par-dessus, c'est l'état de l'envoi de chaque photo (VEN-25).
 */

/** Colonnes du lieu que lit l'éditeur : la fiche enregistrée (pour la preview) et l'article. */
export const EDITOR_COLUMNS =
  "id, nom, etat, tagline, avantage, photo_entete, contenu, adresse, lien_maps, categorie, horaires" as const;

export type EditorVenueRow = Pick<
  Tables<"venues">,
  | "id"
  | "nom"
  | "etat"
  | "tagline"
  | "avantage"
  | "photo_entete"
  | "contenu"
  | "adresse"
  | "lien_maps"
  | "categorie"
  | "horaires"
>;

/**
 * L'envoi d'une photo vers le bucket. `file` est gardé tant que l'envoi n'a pas réussi : « Try
 * again » renvoie le même fichier (VEN-25). `idle` : rien en cours, rien en échec.
 */
export type PhotoUpload =
  | { readonly status: "idle" }
  | { readonly status: "uploading"; readonly file: File }
  | { readonly status: "failed"; readonly file: File };

export const UPLOAD_IDLE: PhotoUpload = { status: "idle" };

/** Un bloc dans l'éditeur. Un bloc photo dont `url` est nulle n'a jamais été envoyé (VEN-20). */
export type EditorBlock =
  | { readonly id: string; readonly kind: "paragraph"; readonly text: string }
  | {
      readonly id: string;
      readonly kind: "photo";
      readonly url: string | null;
      readonly upload: PhotoUpload;
    };

export type HeaderPhoto = { readonly url: string | null; readonly upload: PhotoUpload };

/** Ce que « Save » écrit : `venues.photo_entete` et `venues.contenu`. */
export type StoredArticle = {
  readonly headerPhotoUrl: string | null;
  readonly blocks: VenueBlock[];
};

export function toEditorBlocks(blocks: readonly VenueBlock[]): EditorBlock[] {
  return blocks.map((block): EditorBlock => {
    switch (block.kind) {
      case "paragraph":
        return block;
      case "photo":
        return { ...block, upload: UPLOAD_IDLE };
      default:
        return assertNever(block);
    }
  });
}

/**
 * Les blocs tels qu'ils s'enregistrent et tels que la fiche les reçoit : sans l'état d'envoi.
 * Rien n'est filtré ici : un paragraphe vide ou une photo jamais envoyée s'enregistre comme il
 * est dans l'éditeur, et c'est la fiche qui ne le rend pas (VEN-20). La preview et la fiche
 * publique reçoivent donc exactement les mêmes blocs (VEN-12, VEN-30).
 */
export function toVenueBlocks(blocks: readonly EditorBlock[]): VenueBlock[] {
  return blocks.map((block): VenueBlock => {
    switch (block.kind) {
      case "paragraph":
        return { id: block.id, kind: "paragraph", text: block.text };
      case "photo":
        return { id: block.id, kind: "photo", url: block.url };
      default:
        return assertNever(block);
    }
  });
}

export function toStoredArticle(headerPhoto: HeaderPhoto, blocks: readonly EditorBlock[]): StoredArticle {
  return { headerPhotoUrl: headerPhoto.url, blocks: toVenueBlocks(blocks) };
}

/** Empreinte de ce qui s'enregistre : deux articles égaux ont la même. Sert à VEN-26. */
export function articleFingerprint(article: StoredArticle): string {
  return JSON.stringify(article);
}

/**
 * Déplace un bloc à une position d'insertion : `insertionIndex` compte les intervalles entre
 * blocs (0 = avant le premier, `length` = après le dernier), comme l'indicateur de dépôt.
 */
export function moveBlock<Block extends { readonly id: string }>(
  blocks: readonly Block[],
  id: string,
  insertionIndex: number,
): Block[] {
  const fromIndex = blocks.findIndex((block) => block.id === id);
  const moved = blocks[fromIndex];
  if (moved === undefined) {
    return [...blocks];
  }
  const remaining = blocks.filter((block) => block.id !== id);
  const targetIndex = insertionIndex > fromIndex ? insertionIndex - 1 : insertionIndex;
  return [...remaining.slice(0, targetIndex), moved, ...remaining.slice(targetIndex)];
}

/** Une position d'insertion qui laisserait le bloc où il est. */
export function isNoOpInsertion(fromIndex: number, insertionIndex: number): boolean {
  return insertionIndex === fromIndex || insertionIndex === fromIndex + 1;
}

/**
 * La fiche que montre la preview : nom, tagline, avantage et infos pratiques viennent du lieu
 * enregistré, la photo et les blocs de l'éditeur (bloc 4 de la spec, VEN-30). Même lecture que
 * `toVenuePageData` du site (apps/site/app/places/[slug]/venue.ts) : les deux doivent rester
 * alignées, une app n'important pas dans l'autre.
 */
export function toPreviewData(venue: EditorVenueRow, article: StoredArticle): VenuePageData {
  return {
    name: venue.nom,
    tagline: venue.tagline,
    perk: venue.avantage,
    headerPhotoUrl: article.headerPhotoUrl,
    blocks: article.blocks,
    category: isVenueCategory(venue.categorie) ? venue.categorie : null,
    address: venue.adresse,
    mapsUrl: venue.lien_maps,
    hours: venue.horaires,
    // Comme le site : aucun compte ne porte encore de prénom (« Ouvert pour Ghya » 6).
    author: null,
  };
}

export function initialArticle(venue: EditorVenueRow): StoredArticle {
  return { headerPhotoUrl: venue.photo_entete, blocks: parseVenueBlocks(venue.contenu) };
}

export function assertNever(value: never): never {
  throw new Error(`Valeur inattendue : ${JSON.stringify(value)}`);
}
