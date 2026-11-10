import { createSupabaseClient, SUPABASE_PUBLISHABLE_KEY } from "@siempass/db";

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

const CLE_ABSENTE =
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY absente de l'environnement : à poser dans Vercel (voir .env.example).";

/**
 * Le seul chemin par lequel un pass s'achète. Il ne lève jamais : sans clé, `supabase-js` lève
 * au lieu de répondre (même garde que `fetchPublishedPlaces` et `useBrowserPass`), et un appel
 * réseau peut échouer à tout moment. Une exception ici laisserait le bouton de paiement sans
 * réponse et le visiteur sans message (VIS-31, VIS-34) : tout ressort en `erreur`.
 */
export async function acheterPass(): Promise<ResultatAchat> {
  if (SUPABASE_PUBLISHABLE_KEY === "") {
    return { resultat: "erreur", detail: CLE_ABSENTE };
  }
  try {
    return await appelerFonction();
  } catch (cause) {
    return { resultat: "erreur", detail: cause instanceof Error ? cause.message : String(cause) };
  }
}

async function appelerFonction(): Promise<ResultatAchat> {
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
