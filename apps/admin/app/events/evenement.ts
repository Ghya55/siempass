import type { Tables } from "@siempass/db";

export type Evenement = Tables<"events">;

/** Un lieu tel que le choix « Venue » le propose : tous, brouillons compris (EVT-11). */
export type LieuChoisissable = Pick<Tables<"venues">, "id" | "nom">;

/** Une ligne du tableau : l'événement et le nom de son lieu. */
export type EvenementAffiche = Evenement & { readonly lieuNom: string };

/* EVT-6 : les quatre données sont exigées. */
export const CHAMPS_OBLIGATOIRES = ["nom", "jour", "lieu_id", "avantage"] as const;

export type ChampObligatoire = (typeof CHAMPS_OBLIGATOIRES)[number];

export type SaisieEvenement = Record<ChampObligatoire, string>;

export type ErreursSaisie = Partial<Record<ChampObligatoire, string>>;

export const SAISIE_VIDE: SaisieEvenement = {
  nom: "",
  jour: "",
  lieu_id: "",
  avantage: "",
};

/* Même texte que les autres formulaires du back-office (PART-11, VEN-23, ART-1). */
export const MESSAGE_CHAMP_OBLIGATOIRE = "This field is required";

export function champsManquants(saisie: SaisieEvenement): ChampObligatoire[] {
  return CHAMPS_OBLIGATOIRES.filter((champ) => saisie[champ].trim() === "");
}

export function erreursDesChamps(champs: readonly ChampObligatoire[]): ErreursSaisie {
  const erreurs: ErreursSaisie = {};

  for (const champ of champs) {
    erreurs[champ] = MESSAGE_CHAMP_OBLIGATOIRE;
  }

  return erreurs;
}

export function saisieDeLEvenement(evenement: Evenement): SaisieEvenement {
  return {
    nom: evenement.nom,
    jour: evenement.jour,
    lieu_id: evenement.lieu_id,
    avantage: evenement.avantage,
  };
}
