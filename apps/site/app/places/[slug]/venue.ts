import { cache } from "react";
import { createSupabaseClient, type Tables } from "@siempass/db";
import { isVenueCategory, parseVenueBlocks, type VenuePageData } from "@siempass/feature-venue-page";
import { EN_LIGNE } from "../places";

/** Les colonnes de la fiche publique. Ni partenaire, ni auteur, ni contact (VEN-35). */
const PAGE_COLUMNS =
  "slug, nom, tagline, photo_entete, contenu, adresse, lien_maps, categorie, horaires, avantage" as const;

/** VEN-10 : une adresse de page n'a que des minuscules, des chiffres et des tirets. */
const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type VenueRow = Pick<
  Tables<"venues">,
  | "slug"
  | "nom"
  | "tagline"
  | "photo_entete"
  | "contenu"
  | "adresse"
  | "lien_maps"
  | "categorie"
  | "horaires"
  | "avantage"
>;

export type PublishedVenue = { readonly slug: string; readonly page: VenuePageData };

/**
 * Le lieu en ligne derrière une adresse de page, ou `null` : brouillon ou inconnu, c'est la même
 * réponse (VEN-28), et c'est le RLS qui la garantit — le filtre sur l'état ne fait que la dire.
 * Une panne de la base lève : la page d'erreur du site, pas une fausse page introuvable.
 *
 * `cache` : `generateMetadata` et la page lisent le même lieu, une seule requête par affichage.
 */
export const fetchPublishedVenue = cache(async (slug: string): Promise<PublishedVenue | null> => {
  if (!SLUG_FORMAT.test(slug)) {
    return null;
  }

  const { data, error } = await createSupabaseClient()
    .from("venues")
    .select(PAGE_COLUMNS)
    .eq("slug", slug)
    .eq("etat", EN_LIGNE)
    .maybeSingle();

  if (error !== null) {
    throw new Error(`Lecture du lieu « ${slug} » : ${error.message}`);
  }
  return data === null ? null : { slug: data.slug, page: toVenuePageData(data) };
});

function toVenuePageData(row: VenueRow): VenuePageData {
  return {
    name: row.nom,
    tagline: row.tagline,
    perk: row.avantage,
    headerPhotoUrl: row.photo_entete,
    blocks: parseVenueBlocks(row.contenu),
    category: isVenueCategory(row.categorie) ? row.categorie : null,
    address: row.adresse,
    mapsUrl: row.lien_maps,
    hours: row.horaires,
    // Attend Ghya (« Ouvert pour Ghya » 6) : le prénom de l'auteur n'est porté par aucun compte.
    // Sans lui, pas de ligne « Written by » ; les lieux repris n'en ont de toute façon pas (VEN-27).
    author: null,
  };
}
