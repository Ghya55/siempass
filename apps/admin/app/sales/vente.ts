import type { Tables } from "@siempass/db";

export type Vente = Tables<"passes">;

/* PASS-4 : deux états, ceux que le scan donnerait. Pas d'« Expired » : le scan ne regarde pas la
   date (DEMO-9), l'écran ne dit pas « expiré » d'un pass que le comptoir accepte. */
export type StatutVente = "valide" | "utilise";

/**
 * Une vente telle que la ligne du tableau l'affiche : le nom du pass du catalogue (PASS-21) et
 * celui du lieu du scan plutôt que leurs UUID, et l'état déjà calculé.
 */
export type VenteAffichee = Vente & {
  readonly nomDuPass: string | null;
  readonly lieuValidation: string | null;
  readonly statut: StatutVente;
};

export function statutDeLaVente(vente: Vente): StatutVente {
  return vente.utilise_le === null ? "valide" : "utilise";
}

/** « 3f9a…c21e » : le code tel que la maquette l'abrège (240:3345). */
export function codeAbrege(code: string): string {
  return code.length <= 9 ? code : `${code.slice(0, 4)}…${code.slice(-4)}`;
}
