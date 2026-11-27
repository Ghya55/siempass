import type { Tables } from "@siempass/db";
import { jourCourant } from "../lib/dates";

export type Pass = Tables<"passes">;

export type StatutPass = "valide" | "utilise" | "expire";

/**
 * Un pass tel que la ligne du tableau l'affiche : le nom du lieu validateur plutôt que son
 * UUID, et l'état déjà calculé. Il l'est sur le serveur, où « aujourd'hui » est sans ambiguïté
 * (voir `lib/dates`) ; la ligne, elle, ne fait que rendre.
 */
export type PassAffiche = Pass & {
  readonly lieuValidation: string | null;
  readonly statut: StatutPass;
};

/**
 * Trois états, dans cet ordre de priorité : utilisé, puis expiré, puis valide. « Utilisé »
 * l'emporte parce que c'est ce qui bloque un nouveau scan (DEMO-11) ; un pass à la fois utilisé
 * et périmé se rafraîchit pour cette raison-là.
 *
 * Lecture du back-office, pas règle de validation : la validation en base ne regarde ni l'un ni
 * l'autre (DEMO-6, et la durée reste provisoire — DEMO-9).
 */
export function statutDuPass(pass: Pass, maintenant: Date): StatutPass {
  if (pass.utilise_le !== null) {
    return "utilise";
  }

  /* `valide_jusqu_au` est inclusif : le pass meurt le lendemain de cette date. */
  return pass.valide_jusqu_au < jourCourant(maintenant) ? "expire" : "valide";
}
