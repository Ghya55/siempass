"use server";

import type { EtatPartenaire } from "@siempass/db";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { champsManquants, type SaisiePartenaire } from "./partenaire";

export type ResultatEcriture = { statut: "ok" } | { statut: "erreur"; message: string };

/* Les écritures passent par le rôle `authenticated` : la session est lue dans les cookies de la
   requête (migration 20261110120000). La clé publishable seule n'écrit plus rien, et une action
   appelée sans session se fait refuser par le RLS — le proxy l'a déjà interceptée avant.
   Le rafraîchissement de la liste est déclenché par l'appelant (`router.refresh()`), pour que la
   donnée apparaisse sans rechargement manuel (DEMO-16). */

function texteOuNull(valeur: string): string | null {
  const propre = valeur.trim();

  return propre === "" ? null : propre;
}

export async function creerPartenaire(saisie: SaisiePartenaire): Promise<ResultatEcriture> {
  /* Même contrôle que dans le formulaire : l'interface n'est pas le seul garde-fou (PART-11). */
  if (champsManquants(saisie).length > 0) {
    return { statut: "erreur", message: "Some required fields are empty." };
  }

  const supabase = await creerClientAdmin();
  /* `etat` et `acces_jeton` ne sont pas passés : la base les pose elle-même
     (`brouillon` et un jeton opaque), ce qui tient PART-3 côté serveur. */
  const { error } = await supabase.from("partners").insert({
    contact_prenom: saisie.contact_prenom.trim(),
    contact_nom: saisie.contact_nom.trim(),
    contact_telephone: saisie.contact_telephone.trim(),
    contact_email: texteOuNull(saisie.contact_email),
    lieu_nom: saisie.lieu_nom.trim(),
    lieu_adresse: saisie.lieu_adresse.trim(),
    lieu_description: saisie.lieu_description.trim(),
    avantage: saisie.avantage.trim(),
  });

  return error === null ? { statut: "ok" } : { statut: "erreur", message: error.message };
}

export async function inviterPartenaire(id: string): Promise<ResultatEcriture> {
  const supabase = await creerClientAdmin();
  const { error } = await supabase
    .from("partners")
    .update({ invitation_envoyee_le: new Date().toISOString() })
    .eq("id", id);

  return error === null ? { statut: "ok" } : { statut: "erreur", message: error.message };
}

export async function changerEtatPartenaire(id: string, etat: EtatPartenaire): Promise<ResultatEcriture> {
  const supabase = await creerClientAdmin();
  const { error } = await supabase.from("partners").update({ etat }).eq("id", id);

  return error === null ? { statut: "ok" } : { statut: "erreur", message: error.message };
}
