"use server";

import { echecEnregistrement, type EchecEcriture, type ResultatEcriture } from "../lib/ecriture";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { champsManquants, type SaisieArtiste } from "./artiste";

/* Les écritures passent par le rôle `authenticated`, session lue dans les cookies de la requête.
   Le rafraîchissement de la liste est déclenché par l'appelant (`router.refresh()`). */

export type ResultatCreation = { readonly statut: "ok"; readonly id: string } | EchecEcriture;

const CHAMPS_VIDES: EchecEcriture = { statut: "erreur", message: "Some required fields are empty." };

function colonnes(saisie: SaisieArtiste) {
  const reseauSocial = saisie.reseau_social.trim();

  return {
    nom: saisie.nom.trim(),
    categorie: saisie.categorie.trim(),
    reseau_social: reseauSocial === "" ? null : reseauSocial,
  };
}

export async function creerArtiste(saisie: SaisieArtiste): Promise<ResultatCreation> {
  /* Même contrôle que dans le formulaire : l'interface n'est pas le seul garde-fou (ART-1). */
  if (champsManquants(saisie).length > 0) {
    return CHAMPS_VIDES;
  }

  const supabase = await creerClientAdmin();
  const { data, error } = await supabase.from("artists").insert(colonnes(saisie)).select("id").single();

  return error === null ? { statut: "ok", id: data.id } : echecEnregistrement("ajout d'un artiste", error);
}

export async function modifierArtiste(id: string, saisie: SaisieArtiste): Promise<ResultatEcriture> {
  if (champsManquants(saisie).length > 0) {
    return CHAMPS_VIDES;
  }

  const supabase = await creerClientAdmin();
  const { error } = await supabase.from("artists").update(colonnes(saisie)).eq("id", id);

  return error === null ? { statut: "ok" } : echecEnregistrement("modification d'un artiste", error);
}

/* ART-8 : suppression définitive. La confirmation en deux clics est faite par l'écran. */
export async function supprimerArtiste(id: string): Promise<ResultatEcriture> {
  const supabase = await creerClientAdmin();
  const { error } = await supabase.from("artists").delete().eq("id", id);

  return error === null ? { statut: "ok" } : echecEnregistrement("suppression d'un artiste", error);
}
