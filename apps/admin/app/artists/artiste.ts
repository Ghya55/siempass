import type { Tables } from "@siempass/db";

export type Artiste = Tables<"artists">;

/* Les champs obligatoires d'un artiste (specs/artists.md, ART-1) : le nom et la catégorie.
   `reseau_social` est le seul facultatif (ART-3). */
export const CHAMPS_OBLIGATOIRES = ["nom", "categorie"] as const;

export type ChampObligatoire = (typeof CHAMPS_OBLIGATOIRES)[number];

export type SaisieArtiste = Record<ChampObligatoire, string> & { reseau_social: string };

export type ErreursSaisie = Partial<Record<ChampObligatoire, string>>;

export const SAISIE_VIDE: SaisieArtiste = {
  nom: "",
  categorie: "",
  reseau_social: "",
};

/* Même texte que les formulaires partenaire et lieu (PART-11, VEN-23). */
export const MESSAGE_CHAMP_OBLIGATOIRE = "This field is required";

export function champsManquants(saisie: SaisieArtiste): ChampObligatoire[] {
  return CHAMPS_OBLIGATOIRES.filter((champ) => saisie[champ].trim() === "");
}

export function erreursDesChamps(champs: readonly ChampObligatoire[]): ErreursSaisie {
  const erreurs: ErreursSaisie = {};

  for (const champ of champs) {
    erreurs[champ] = MESSAGE_CHAMP_OBLIGATOIRE;
  }

  return erreurs;
}
