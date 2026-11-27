"use server";

import { echecEnregistrement, type EchecEcriture, type ResultatEcriture } from "../lib/ecriture";
import { creerClientAdmin } from "../lib/supabase-serveur";
import type { OffreEnvoyee } from "./saisie-offre";

/* Les écritures passent par le rôle `authenticated`, session lue dans les cookies de la requête.
   Le pass et ses deux listes s'écrivent en une transaction, par `enregistrer_pass_offer` : la base
   y refuse aussi une publication incomplète (CAT-12, CAT-21, CAT-22), quel que soit l'écran.
   Pas de suppression : un pass vendu est l'argent d'un client (CAT-11). */

export type ResultatEnregistrement = { readonly statut: "ok"; readonly id: string } | EchecEcriture;

const NOM_VIDE: EchecEcriture = { statut: "erreur", message: "Some required fields are empty." };

/** « Save » (publier = false) ou « Publish » (publier = true). Sans `id` : création (CAT-26). */
export async function enregistrerOffre(
  id: string | null,
  offre: OffreEnvoyee,
  publier: boolean,
): Promise<ResultatEnregistrement> {
  if (offre.nom.trim() === "") {
    return NOM_VIDE;
  }

  const supabase = await creerClientAdmin();
  const { data, error } = await supabase.rpc("enregistrer_pass_offer", {
    offre_id: id,
    nom: offre.nom.trim(),
    prix_centimes: offre.prixCentimes,
    validite_mode: offre.validiteMode,
    valide_jusqu_au: offre.valideJusquAu,
    validite_jours: offre.validiteJours,
    lieux_mode: offre.lieuxMode,
    lieux: [...offre.lieux],
    evenements_mode: offre.evenementsMode,
    evenements: [...offre.evenements],
    publier,
  });

  return error === null
    ? { statut: "ok", id: data }
    : echecEnregistrement(publier ? "publication d'un pass" : "enregistrement d'un pass", error);
}

/** « Back to draft » : retire le pass du site sans enregistrer la saisie en cours (CAT-10). */
export async function retourEnBrouillon(id: string): Promise<ResultatEcriture> {
  const supabase = await creerClientAdmin();
  const { error } = await supabase.from("pass_offers").update({ etat: "brouillon" }).eq("id", id);

  return error === null ? { statut: "ok" } : echecEnregistrement("retour en brouillon d'un pass", error);
}
