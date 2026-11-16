"use server";

import { echecEnregistrement, type ResultatEcriture } from "../lib/ecriture";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { champsManquants, type SaisieArtiste } from "./artiste";

/* L'écriture passe par le rôle `authenticated`, session lue dans les cookies de la requête. Le
   rafraîchissement de la liste est déclenché par l'appelant (`router.refresh()`). */
export async function creerArtiste(saisie: SaisieArtiste): Promise<ResultatEcriture> {
  /* Même contrôle que dans le formulaire : l'interface n'est pas le seul garde-fou (ART-1). */
  if (champsManquants(saisie).length > 0) {
    return { statut: "erreur", message: "Some required fields are empty." };
  }

  const reseauSocial = saisie.reseau_social.trim();
  const supabase = await creerClientAdmin();
  const { error } = await supabase.from("artists").insert({
    nom: saisie.nom.trim(),
    categorie: saisie.categorie.trim(),
    reseau_social: reseauSocial === "" ? null : reseauSocial,
  });

  return error === null ? { statut: "ok" } : echecEnregistrement("ajout d'un artiste", error);
}
