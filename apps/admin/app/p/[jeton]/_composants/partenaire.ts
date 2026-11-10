import { createSupabaseClient } from "@siempass/db";
import type { Tables } from "@siempass/db";

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
 * Le jeton tient lieu de connexion : pas d'écran de mot de passe, pas d'inscription, et la
 * décision du 10/11 sur l'authentification n'y change rien (PART-7). Un jeton inconnu ne renvoie
 * rien, et l'appelant répond 404 — surtout pas un écran qui expliquerait ce qu'est un bon jeton.
 *
 * La fiche s'affiche aussi quand le partenaire est encore en brouillon (DEMO-14). C'est ce qui
 * impose la fonction `partenaire_par_jeton` plutôt qu'un `select` : depuis la migration
 * 20261110120000, la clé publishable ne lit plus que les partenaires « en ligne », et un
 * brouillon aurait disparu derrière un 404. La fonction choisit elle-même les colonnes qui
 * sortent — ni `acces_jeton`, ni `invitation_envoyee_le`.
 */
export async function lirePartenaireParJeton(jeton: string): Promise<Partenaire | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .rpc("partenaire_par_jeton", { jeton_demande: jeton })
    .maybeSingle();

  return error !== null ? null : data;
}
