// Validation d'un pass au comptoir : la fonction décide seule entre les trois résultats.
//   specs/parcours-demo.md — DEMO-6 (trois résultats et trois seulement), DEMO-7 (le scan
//   décide, pas le partenaire), DEMO-11 (deux scans de suite), DEMO-12 (QR code étranger).
//
// Le résultat ne dépend pas de l'interface : l'écran de scan ne fait qu'afficher ce qui sort
// d'ici. Elle NE REGARDE PAS `valide_jusqu_au` : la durée de validité n'est pas tranchée
// (DEMO-9), un quatrième résultat « expiré » n'existe pas.

import { createClient } from "jsr:@supabase/supabase-js@2";

// Dupliqué dans acheter-pass : voir le commentaire là-bas.
const ENTETES_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type ReponseValidation =
  | { readonly resultat: "valide"; readonly avantage: string }
  | { readonly resultat: "deja-utilise" }
  | { readonly resultat: "invalide" }
  | { readonly resultat: "erreur"; readonly detail: string };

function reponse(charge: ReponseValidation, statut = 200): Response {
  return new Response(JSON.stringify(charge), {
    status: statut,
    headers: { ...ENTETES_CORS, "Content-Type": "application/json" },
  });
}

function texteOuVide(valeur: unknown): string {
  return typeof valeur === "string" ? valeur : "";
}

Deno.serve(async (requete: Request): Promise<Response> => {
  if (requete.method === "OPTIONS") {
    return new Response("ok", { headers: ENTETES_CORS });
  }
  if (requete.method !== "POST") {
    return reponse({ resultat: "erreur", detail: "méthode non autorisée" }, 405);
  }

  let corps: unknown;
  try {
    corps = await requete.json();
  } catch {
    return reponse({ resultat: "invalide" });
  }

  const { code, jeton } =
    typeof corps === "object" && corps !== null
      ? (corps as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  const codeLu = texteOuVide(code);
  const jetonPartenaire = texteOuVide(jeton);

  if (codeLu === "" || jetonPartenaire === "") {
    return reponse({ resultat: "invalide" });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Jeton de partenaire inconnu : « invalide », au même titre qu'un code inconnu (DEMO-12).
  // Rien n'est marqué utilisé tant qu'on ne sait pas pour quel partenaire.
  const partenaire = await supabase
    .from("partners")
    .select("id, avantage")
    .eq("acces_jeton", jetonPartenaire)
    .maybeSingle();

  if (partenaire.error !== null) {
    return reponse({ resultat: "erreur", detail: partenaire.error.message }, 500);
  }
  if (partenaire.data === null) {
    return reponse({ resultat: "invalide" });
  }

  // Marquage atomique : un seul ordre SQL, `where utilise_le is null`, qui renvoie la ligne
  // touchée. Jamais un lire-puis-écrire : deux comptoirs qui scannent le même pass en même
  // temps, c'est Postgres qui tranche, et un seul des deux obtient « valide ».
  const marquage = await supabase
    .from("passes")
    .update({ utilise_le: new Date().toISOString(), utilise_par: partenaire.data.id })
    .eq("code", codeLu)
    .is("utilise_le", null)
    .select("id")
    .maybeSingle();

  if (marquage.error !== null) {
    return reponse({ resultat: "erreur", detail: marquage.error.message }, 500);
  }
  if (marquage.data !== null) {
    return reponse({ resultat: "valide", avantage: partenaire.data.avantage });
  }

  // Rien marqué : soit le pass existe et portait déjà une date d'utilisation, soit il
  // n'existe pas. C'est la seule relecture, et elle ne décide que du libellé.
  const existant = await supabase.from("passes").select("id").eq("code", codeLu).maybeSingle();

  if (existant.error !== null) {
    return reponse({ resultat: "erreur", detail: existant.error.message }, 500);
  }
  return reponse(existant.data === null ? { resultat: "invalide" } : { resultat: "deja-utilise" });
});
