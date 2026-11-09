import { createSupabaseClient } from "@siempass/db";
import type { Tables } from "@siempass/db";

/** Les colonnes que l'espace partenaire affiche. Le reste de la ligne ne sort pas de la base. */
const COLONNES =
  "id, contact_nom, contact_prenom, contact_telephone, contact_email, lieu_nom, lieu_adresse, lieu_photo, lieu_description, avantage, etat" as const;

export type Partenaire = Pick<
  Tables<"partners">,
  | "id"
  | "contact_nom"
  | "contact_prenom"
  | "contact_telephone"
  | "contact_email"
  | "lieu_nom"
  | "lieu_adresse"
  | "lieu_photo"
  | "lieu_description"
  | "avantage"
  | "etat"
>;

/**
 * Lit le partenaire derrière son jeton d'accès.
 *
 * Le jeton tient lieu de connexion : pas d'écran de mot de passe, pas d'inscription
 * (PART-7, DEMO-4, DEMO-20). Un jeton inconnu ne renvoie rien, et l'appelant répond 404 —
 * surtout pas un écran qui expliquerait ce qu'est un bon jeton.
 *
 * La fiche s'affiche aussi quand le partenaire est encore en brouillon (DEMO-14) : aucun
 * filtre sur `etat` ici, c'est voulu.
 */
export async function lirePartenaireParJeton(jeton: string): Promise<Partenaire | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("partners")
    .select(COLONNES)
    .eq("acces_jeton", jeton)
    .maybeSingle();

  return error !== null ? null : data;
}
