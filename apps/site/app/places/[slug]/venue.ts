import { cache } from "react";
import { createSupabaseClient } from "@siempass/db";
import { toVenuePageData, VENUE_PAGE_COLUMNS, type VenuePageData } from "@siempass/feature-venue-page";
import { EN_LIGNE } from "../places";

/** Les colonnes de la fiche publique, et l'adresse. Ni partenaire, ni auteur, ni contact (VEN-35). */
const PAGE_COLUMNS = `slug, ${VENUE_PAGE_COLUMNS}` as const;

/** VEN-10 : une adresse de page n'a que des minuscules, des chiffres et des tirets. */
const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublishedVenue = { readonly slug: string; readonly page: VenuePageData };

/**
 * Le lieu en ligne derrière une adresse de page, ou `null` : brouillon ou inconnu, c'est la même
 * réponse (VEN-28), et c'est le RLS qui la garantit — le filtre sur l'état ne fait que la dire.
 * Une panne de la base lève : la page d'erreur du site, pas une fausse page introuvable.
 *
 * Le prénom de l'auteur (« Written by », VEN-9) vient de `prenom_auteur_du_lieu`, seule lecture
 * de `profiles` ouverte sans session ; nul pour un lieu repris ou un compte sans prénom.
 *
 * `cache` : `generateMetadata` et la page lisent le même lieu, une seule requête par affichage.
 */
export const fetchPublishedVenue = cache(async (slug: string): Promise<PublishedVenue | null> => {
  if (!SLUG_FORMAT.test(slug)) {
    return null;
  }

  const supabase = createSupabaseClient();
  const [venue, author] = await Promise.all([
    supabase.from("venues").select(PAGE_COLUMNS).eq("slug", slug).eq("etat", EN_LIGNE).maybeSingle(),
    supabase.rpc("prenom_auteur_du_lieu", { lieu_slug: slug }),
  ]);

  if (venue.error !== null) {
    throw new Error(`Lecture du lieu « ${slug} » : ${venue.error.message}`);
  }
  if (author.error !== null) {
    throw new Error(`Lecture de l'auteur du lieu « ${slug} » : ${author.error.message}`);
  }
  return venue.data === null
    ? null
    : { slug: venue.data.slug, page: toVenuePageData(venue.data, author.data) };
});
