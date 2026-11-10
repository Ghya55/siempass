"use server";

import { creerClientAdmin } from "../lib/supabase-serveur";

export type SaisieConnexion = {
  readonly adresse: string;
  readonly motDePasse: string;
};

/* Même forme que `ResultatEcriture` des partenaires : l'action rend un résultat, c'est l'écran
   qui navigue (`router`). Un `redirect()` dans l'action laisserait le `await` de l'appelant sans
   réponse, et l'état « en cours » du bouton bloqué. */
export type ResultatConnexion = { statut: "ok" } | { statut: "erreur"; message: string };

/* Un seul message, quelle que soit la cause : une adresse inconnue et un mauvais mot de passe
   donnent la même réponse, sinon le formulaire dit lesquelles des adresses existent. */
const MESSAGE_REFUS = "Wrong email or password." as const;
const MESSAGE_CHAMPS_VIDES = "Enter your email and password." as const;

export async function seConnecter(saisie: SaisieConnexion): Promise<ResultatConnexion> {
  const adresse = saisie.adresse.trim();

  if (adresse === "" || saisie.motDePasse === "") {
    return { statut: "erreur", message: MESSAGE_CHAMPS_VIDES };
  }

  const supabase = await creerClientAdmin();
  /* Pose les cookies de session sur la réponse de l'action : la navigation qui suit arrive au
     proxy avec la session, et passe. */
  const { error } = await supabase.auth.signInWithPassword({
    email: adresse,
    password: saisie.motDePasse,
  });

  return error === null ? { statut: "ok" } : { statut: "erreur", message: MESSAGE_REFUS };
}

export async function seDeconnecter(): Promise<void> {
  const supabase = await creerClientAdmin();
  await supabase.auth.signOut();
}
