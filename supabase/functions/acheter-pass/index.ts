// Achat d'un pass : autorise le paiement, crée le pass, renvoie son code.
//   specs/parcours-demo.md — DEMO-23 (faux paiement), DEMO-26 (le reste est réel), DEMO-28 (20 $).
//
// Le paiement est choisi par un drapeau d'environnement, jamais par une branche de code à
// retirer après la démonstration : un seul chemin crée le pass, quel que soit le fournisseur.
// ABA PayWay se branchera dans FOURNISSEURS sans toucher au parcours ni à cette fonction.
//
// Le client ne crée jamais un pass (skill backend-supabase) : `passes` est en lecture seule
// pour le rôle `anon`, l'insertion n'est possible qu'ici, sous `service_role`.

import { createClient } from "jsr:@supabase/supabase-js@2";

// Dupliqué dans valider-pass : un module partagé sous `supabase/functions/_*` ne se déploie
// pas comme une fonction, et le pari ne vaut pas le risque — le déploiement a lieu APRÈS le
// merge, un échec y serait découvert trop tard.
const ENTETES_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

/** « 20 $ », en cents : DEMO-28. Le montant ne vient pas du navigateur, qui pourrait mentir. */
const MONTANT_CENTS = 2_000 as const;

const FOURNISSEUR_PAR_DEFAUT = "factice" as const;

type ResultatPaiement =
  | { readonly etat: "autorise"; readonly reference: string }
  | { readonly etat: "refuse"; readonly motif: string };

type FournisseurPaiement = (montantCents: number) => Promise<ResultatPaiement>;

/**
 * Les fournisseurs disponibles, choisis par PAIEMENT_FOURNISSEUR.
 * - `factice`       : autorise toujours. Valeur par défaut, celle de la démonstration.
 * - `factice-refus` : refuse toujours. Permet d'atteindre l'écran DEMO-13 sans code jetable.
 */
const FOURNISSEURS: Record<string, FournisseurPaiement> = {
  factice: (montantCents) =>
    Promise.resolve({ etat: "autorise", reference: `factice-${montantCents}-${crypto.randomUUID()}` }),
  "factice-refus": () =>
    Promise.resolve({ etat: "refuse", motif: "refus simulé par le fournisseur factice" }),
};

type ReponseAchat =
  | { readonly resultat: "paye"; readonly code: string }
  | { readonly resultat: "refuse"; readonly motif: string }
  | { readonly resultat: "erreur"; readonly detail: string };

// Le résultat du paiement est une donnée du domaine, pas un code HTTP : un refus est une
// réponse 200 que le client sait lire. Les codes d'erreur restent pour les vraies pannes.
function reponse(charge: ReponseAchat, statut = 200): Response {
  return new Response(JSON.stringify(charge), {
    status: statut,
    headers: { ...ENTETES_CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (requete: Request): Promise<Response> => {
  if (requete.method === "OPTIONS") {
    return new Response("ok", { headers: ENTETES_CORS });
  }
  if (requete.method !== "POST") {
    return reponse({ resultat: "erreur", detail: "méthode non autorisée" }, 405);
  }

  const nomFournisseur = Deno.env.get("PAIEMENT_FOURNISSEUR") ?? FOURNISSEUR_PAR_DEFAUT;
  const fournisseur = FOURNISSEURS[nomFournisseur];
  if (fournisseur === undefined) {
    return reponse({ resultat: "erreur", detail: `fournisseur de paiement inconnu : ${nomFournisseur}` }, 500);
  }

  const paiement = await fournisseur(MONTANT_CENTS);
  if (paiement.etat === "refuse") {
    // DEMO-13 : aucun pass n'est créé quand le paiement n'aboutit pas.
    return reponse({ resultat: "refuse", motif: paiement.motif });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Toutes les colonnes de `passes` ont une valeur par défaut en base, `code` compris :
  // la fonction n'a rien à fabriquer, elle insère une ligne et relit le code généré.
  const { data, error } = await supabase.from("passes").insert({}).select("code").single();

  if (error !== null || data === null) {
    return reponse({ resultat: "erreur", detail: error?.message ?? "insertion du pass sans retour" }, 500);
  }

  return reponse({ resultat: "paye", code: data.code });
});
