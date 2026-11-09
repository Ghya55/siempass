import {
  createSupabaseClient,
  SUPABASE_PUBLISHABLE_KEY,
  type EtatPartenaire,
  type Tables,
} from "@siempass/db";

/**
 * Les seules colonnes de `partners` qui sortent sur le site public. Le contact n'en est jamais
 * (PART-8 : ni nom, ni prénom, ni téléphone, ni e-mail), le jeton d'accès non plus (PART-7).
 */
const PUBLIC_COLUMNS = "id, lieu_nom, lieu_adresse, lieu_photo, lieu_description, avantage" as const;

const MISSING_KEY_DETAIL =
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY absente de l'environnement : à poser dans Vercel (voir .env.example).";

/** Seul l'état « en ligne » est public (PART-3, DEMO-3) : un brouillon n'apparaît nulle part. */
const EN_LIGNE = "en ligne" as const satisfies EtatPartenaire;

export type Place = Pick<
  Tables<"partners">,
  "id" | "lieu_nom" | "lieu_adresse" | "lieu_photo" | "lieu_description" | "avantage"
>;

export type PlacesResult =
  | { readonly status: "ok"; readonly places: readonly Place[] }
  | { readonly status: "erreur"; readonly detail: string };

/**
 * Lit les lieux publiés. Aucune mise en cache : la liste est relue à chaque affichage pour que
 * la mise en ligne au back-office se voie sans rechargement manuel ni redéploiement
 * (DEMO-16, DEMO-21). Les pages qui l'appellent portent `dynamic = "force-dynamic"`.
 *
 * Le plus récent d'abord : l'ordre n'est pas spécifié, et c'est celui qui montre en haut de
 * liste le partenaire qu'on vient de publier.
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
    .from("partners")
    .select(PUBLIC_COLUMNS)
    .eq("etat", EN_LIGNE)
    .order("created_at", { ascending: false });

  if (response.error !== null) {
    return { status: "erreur", detail: response.error.message };
  }
  return { status: "ok", places: response.data };
}
