import { createSupabaseClient } from "@siempass/db";

/**
 * Résultat de l'achat, tel que la fonction `acheter-pass` le décide.
 *
 * Le refus est une réponse HTTP 200 porteuse d'un discriminant, pas un code d'erreur : le
 * navigateur n'a ainsi aucun moyen de confondre « paiement refusé » et « fonction injoignable ».
 */
export type ResultatAchat =
  | { readonly resultat: "paye"; readonly code: string }
  | { readonly resultat: "refuse" }
  | { readonly resultat: "erreur"; readonly detail: string };

const FONCTION = "acheter-pass" as const;

export async function acheterPass(): Promise<ResultatAchat> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.functions.invoke<unknown>(FONCTION, { body: {} });

  if (error !== null) {
    return { resultat: "erreur", detail: error.message };
  }
  return lireReponse(data);
}

/** Validation à la frontière : au-delà, le type est tenu pour vrai (skill type-safety). */
function lireReponse(charge: unknown): ResultatAchat {
  if (typeof charge !== "object" || charge === null || !("resultat" in charge)) {
    return { resultat: "erreur", detail: `réponse inattendue de ${FONCTION}` };
  }

  const { resultat } = charge;
  if (resultat === "paye" && "code" in charge && typeof charge.code === "string") {
    return { resultat: "paye", code: charge.code };
  }
  if (resultat === "refuse") {
    return { resultat: "refuse" };
  }
  if (resultat === "erreur" && "detail" in charge && typeof charge.detail === "string") {
    return { resultat: "erreur", detail: charge.detail };
  }
  return { resultat: "erreur", detail: `réponse inattendue de ${FONCTION}` };
}
