import { createSupabaseClient, SUPABASE_PUBLISHABLE_KEY, type Json, type ModeValidite } from "@siempass/db";

/**
 * Les passes en vente, tels que le bloc « Our passes » les affiche (specs/catalogue-passes.md,
 * bloc 4). Lus par la fonction `passes_en_vente` : la seule lecture du catalogue ouverte à `anon`.
 * Elle ne rend que ce que CAT-16 et CAT-17 affichent — ni brouillon, ni nom de lieu, ni liste de
 * sélection — et décide elle-même de « en vente » et « à venir » à l'heure du Cambodge.
 */
export type EvenementAffiche = {
  readonly nom: string;
  readonly jour: string;
};

export type PassEnVente = {
  readonly id: string;
  readonly nom: string;
  readonly prixCentimes: number;
  readonly validiteMode: ModeValidite;
  readonly valideJusquAu: string | null;
  readonly validiteJours: number | null;
  readonly tousLesLieux: boolean;
  readonly lieuxEnLigne: number;
  readonly evenements: readonly EvenementAffiche[];
};

export type PassesEnVenteResult =
  | { readonly status: "ok"; readonly passes: readonly PassEnVente[] }
  | { readonly status: "erreur"; readonly detail: string };

/**
 * Aucune mise en cache : la page qui l'appelle porte `dynamic = "force-dynamic"`. Publier, retirer
 * ou modifier un pass, un lieu ou un événement se voit au prochain affichage, sans redéploiement
 * (CAT-19) ; la fin d'une date fixe ou d'un événement aussi, dès minuit au Cambodge (CAT-16).
 */
export async function fetchPassesEnVente(): Promise<PassesEnVenteResult> {
  if (SUPABASE_PUBLISHABLE_KEY === "") {
    return { status: "erreur", detail: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY absente de l'environnement." };
  }

  try {
    const response = await createSupabaseClient().rpc("passes_en_vente");

    if (response.error !== null) {
      return { status: "erreur", detail: response.error.message };
    }
    return {
      status: "ok",
      passes: response.data.map((ligne) => ({
        id: ligne.id,
        nom: ligne.nom,
        prixCentimes: ligne.prix_centimes,
        validiteMode: ligne.validite_mode,
        valideJusquAu: ligne.valide_jusqu_au,
        validiteJours: ligne.validite_jours,
        tousLesLieux: ligne.tous_les_lieux,
        lieuxEnLigne: ligne.lieux_en_ligne,
        evenements: lireEvenements(ligne.evenements),
      })),
    };
  } catch (cause) {
    return { status: "erreur", detail: cause instanceof Error ? cause.message : String(cause) };
  }
}

/* `evenements` arrive en JSON : lu une fois ici, à la frontière ; un élément mal formé est écarté. */
function lireEvenements(valeur: Json): EvenementAffiche[] {
  if (!Array.isArray(valeur)) {
    return [];
  }
  return valeur.flatMap((element) => {
    if (element === null || typeof element !== "object" || Array.isArray(element)) {
      return [];
    }
    const { nom, jour } = element;

    return typeof nom === "string" && typeof jour === "string" ? [{ nom, jour }] : [];
  });
}
