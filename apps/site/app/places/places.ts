import { createSupabaseClient, SUPABASE_PUBLISHABLE_KEY, type EtatPartenaire, type Tables } from "@siempass/db";

/**
 * Les colonnes de `venues` que lit la liste des lieux (VEN-16) : photo d'en-tête, nom, tagline,
 * avantage, et l'adresse que le Figma de la carte affiche. Rien du partenaire ni de son contact
 * (VEN-35) : `anon` n'a de toute façon aucun droit sur ces colonnes.
 */
const LIST_COLUMNS = "id, slug, nom, tagline, adresse, photo_entete, avantage" as const;

const MISSING_KEY_DETAIL =
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY absente de l'environnement : à poser dans Vercel (voir .env.example).";

/** Seul l'état « en ligne » est public (VEN-6, VEN-16) : un brouillon n'apparaît nulle part. */
export const EN_LIGNE = "en ligne" as const satisfies EtatPartenaire;

export type Place = Pick<
  Tables<"venues">,
  "id" | "slug" | "nom" | "tagline" | "adresse" | "photo_entete" | "avantage"
>;

export type PlacesResult =
  | { readonly status: "ok"; readonly places: readonly Place[] }
  | { readonly status: "erreur"; readonly detail: string };

/**
 * Lit les lieux en ligne. Aucune mise en cache : la liste est relue à chaque affichage pour
 * qu'une mise en ligne ou un retour en brouillon se voie sans redéploiement (VEN-29). Les pages
 * qui l'appellent portent `dynamic = "force-dynamic"`.
 *
 * Le plus récent d'abord : l'ordre n'est pas spécifié (« Ouvert pour Ghya » 9), c'est celui de
 * la liste avant les lieux. Les lieux repris gardent la date de leur partenaire.
 */
export async function fetchPublishedPlaces(): Promise<PlacesResult> {
  // Sans clé, `supabase-js` lève au lieu de répondre : la liste rendrait une exception plutôt
  // que son bloc d'erreur. Même garde que `checkSupabaseConnection` (packages/db).
  if (SUPABASE_PUBLISHABLE_KEY === "") {
    return { status: "erreur", detail: MISSING_KEY_DETAIL };
  }

  try {
    return await selectPublishedPlaces();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { status: "erreur", detail: message };
  }
}

async function selectPublishedPlaces(): Promise<PlacesResult> {
  const response = await createSupabaseClient()
    .from("venues")
    .select(LIST_COLUMNS)
    .eq("etat", EN_LIGNE)
    .order("created_at", { ascending: false });

  if (response.error !== null) {
    return { status: "erreur", detail: response.error.message };
  }
  return { status: "ok", places: response.data };
}
