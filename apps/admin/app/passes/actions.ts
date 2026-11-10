"use server";

import type { ResultatEcriture } from "../lib/ecriture";
import { creerClientAdmin } from "../lib/supabase-serveur";

/* Deux gestes de test, ouverts au seul rôle `authenticated` par la migration 20261110160000.
   Il n'y a pas de création ici : un pass naît d'un paiement, par l'Edge Function `acheter-pass`.
   Le rafraîchissement de la liste est déclenché par l'appelant (`router.refresh()`). */

/** Remet le pass dans l'état « jamais utilisé » et repousse sa validité. Le code ne change pas. */
export async function rafraichirPass(id: string): Promise<ResultatEcriture> {
  const supabase = await creerClientAdmin();
  const { error } = await supabase.rpc("rafraichir_pass", { pass_id: id });

  return error === null ? { statut: "ok" } : { statut: "erreur", message: error.message };
}

/** Suppression définitive : la base est unique, il n'y a pas de corbeille. L'écran confirme. */
export async function supprimerPass(id: string): Promise<ResultatEcriture> {
  const supabase = await creerClientAdmin();
  const { error } = await supabase.from("passes").delete().eq("id", id);

  return error === null ? { statut: "ok" } : { statut: "erreur", message: error.message };
}
