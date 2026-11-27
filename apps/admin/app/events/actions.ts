"use server";

import { echecEnregistrement, type EchecEcriture, type ResultatEcriture } from "../lib/ecriture";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { champsManquants, type SaisieEvenement } from "./evenement";

/* Les écritures passent par le rôle `authenticated`, session lue dans les cookies de la requête.
   Le rafraîchissement de la liste est déclenché par l'appelant (`router.refresh()`).
   Pas de suppression : un événement peut être dans un pass vendu (EVT-7). */

export type ResultatCreation = { readonly statut: "ok"; readonly id: string } | EchecEcriture;

const CHAMPS_VIDES: EchecEcriture = { statut: "erreur", message: "Some required fields are empty." };

function colonnes(saisie: SaisieEvenement) {
  return {
    nom: saisie.nom.trim(),
    jour: saisie.jour,
    lieu_id: saisie.lieu_id,
    avantage: saisie.avantage.trim(),
  };
}

export async function creerEvenement(saisie: SaisieEvenement): Promise<ResultatCreation> {
  /* Même contrôle que dans le formulaire : l'interface n'est pas le seul garde-fou (EVT-6). */
  if (champsManquants(saisie).length > 0) {
    return CHAMPS_VIDES;
  }

  const supabase = await creerClientAdmin();
  const { data, error } = await supabase.from("events").insert(colonnes(saisie)).select("id").single();

  return error === null ? { statut: "ok", id: data.id } : echecEnregistrement("ajout d'un événement", error);
}

export async function modifierEvenement(id: string, saisie: SaisieEvenement): Promise<ResultatEcriture> {
  if (champsManquants(saisie).length > 0) {
    return CHAMPS_VIDES;
  }

  const supabase = await creerClientAdmin();
  const { error } = await supabase.from("events").update(colonnes(saisie)).eq("id", id);

  return error === null ? { statut: "ok" } : echecEnregistrement("modification d'un événement", error);
}
