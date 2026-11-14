import type { Tables } from "@siempass/db";
import {
  parseVenueBlocks,
  toVenuePageData,
  VENUE_PAGE_COLUMNS,
  type VenueBlock,
  type VenuePageData,
  type VenuePageRow,
} from "@siempass/feature-venue-page";

/**
 * L'article d'un lieu tel que l'éditeur le manie : la photo d'en-tête et les blocs (VEN-38 :
 * l'éditeur ne porte rien d'autre). Ce qui s'enregistre est `StoredArticle` ; ce que l'éditeur
 * ajoute par-dessus, c'est l'état de l'envoi de chaque photo (VEN-25).
 */

/** Colonnes du lieu que lit l'éditeur : la fiche enregistrée (pour la preview), l'article,
    l'état et l'auteur (son prénom est lu à part, dans `profiles`). */
export const EDITOR_COLUMNS = `id, etat, auteur_id, ${VENUE_PAGE_COLUMNS}` as const;

export type EditorVenueRow = VenuePageRow & Pick<Tables<"venues">, "id" | "etat" | "auteur_id">;

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
 * Les blocs tels qu'ils s'enregistrent et tels que la fiche les reçoit : sans l'état d'envoi, et
 * sans photo jamais envoyée (tranché par Ghya le 15/11 : elle est retirée à l'enregistrement et
 * ne revient pas en échec après rechargement). Dans l'éditeur, elle reste avec « Try again »
 * jusqu'à ce qu'on la renvoie ou la supprime ; tant qu'elle n'est pas envoyée, elle n'est pas une
 * modification à enregistrer. Un paragraphe vide s'enregistre, et la fiche ne le rend pas
 * (VEN-20). La preview et la fiche publique reçoivent les mêmes blocs (VEN-12, VEN-30).
 */
export function toVenueBlocks(blocks: readonly EditorBlock[]): VenueBlock[] {
  return blocks.flatMap((block): VenueBlock[] => {
    switch (block.kind) {
      case "paragraph":
        return [{ id: block.id, kind: "paragraph", text: block.text }];
      case "photo":
        return block.url === null ? [] : [{ id: block.id, kind: "photo", url: block.url }];
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
 * La fiche que montre la preview : nom, tagline, avantage, infos pratiques et auteur viennent du
 * lieu enregistré, lus comme le site les lit (`toVenuePageData`) ; la photo et les blocs viennent
 * de l'éditeur (bloc 4 de la spec, VEN-30).
 */
export function toPreviewData(venue: EditorVenueRow, author: string | null, article: StoredArticle): VenuePageData {
  return {
    ...toVenuePageData(venue, author),
    headerPhotoUrl: article.headerPhotoUrl,
    blocks: article.blocks,
  };
}

/** L'article enregistré. Une photo jamais envoyée, enregistrée avant le 15/11, n'est pas reprise. */
export function initialArticle(venue: EditorVenueRow): StoredArticle {
  return { headerPhotoUrl: venue.photo_entete, blocks: parseVenueBlocks(venue.contenu).filter(isSentBlock) };
}

/** Faux pour une photo jamais envoyée, qui ne s'enregistre pas. */
export function isSentBlock(block: VenueBlock): boolean {
  return block.kind !== "photo" || block.url !== null;
}

export function assertNever(value: never): never {
  throw new Error(`Valeur inattendue : ${JSON.stringify(value)}`);
}
