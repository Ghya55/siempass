import { createSupabaseClient } from "@siempass/db";

/**
 * Les trois résultats possibles d'un scan, et trois seulement (DEMO-6).
 *
 * C'est la fonction `valider-pass` qui tranche, en `service_role` : l'interface ne décide
 * rien, elle affiche. Elle ne regarde pas non plus la date de validité — il n'y a pas de
 * quatrième cas « expiré » tant que la durée n'est pas tranchée (DEMO-9).
 */
export type ResultatScan =
  | { readonly resultat: "valide"; readonly avantage: string }
  | { readonly resultat: "deja-utilise" }
  | { readonly resultat: "invalide" };

const FONCTION = "valider-pass" as const;

export async function validerPass(code: string, jeton: string): Promise<ResultatScan> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.functions.invoke<unknown>(FONCTION, {
    body: { code, jeton },
  });

  // Une panne (fonction injoignable, réponse illisible) retombe sur « invalide » : DEMO-6
  // n'autorise pas de quatrième écran. Le risque est noté dans la description de PR.
  return error !== null ? { resultat: "invalide" } : lireReponse(data);
}

/** Validation à la frontière : au-delà, le type est tenu pour vrai (skill type-safety). */
function lireReponse(charge: unknown): ResultatScan {
  if (typeof charge !== "object" || charge === null || !("resultat" in charge)) {
    return { resultat: "invalide" };
  }

  const { resultat } = charge;
  if (resultat === "valide" && "avantage" in charge && typeof charge.avantage === "string") {
    return { resultat: "valide", avantage: charge.avantage };
  }
  if (resultat === "deja-utilise") {
    return { resultat: "deja-utilise" };
  }
  return { resultat: "invalide" };
}
