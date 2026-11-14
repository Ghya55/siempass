import type { Tables } from "@siempass/db";

export type Partenaire = Tables<"partners">;

/* Les champs obligatoires du partenaire (specs/partenaire.md § Attributs) : le contact, rien
   d'autre (PART-2). `contact_email` est le seul facultatif. Le lieu, l'avantage et l'état vivent
   sur le lieu (specs/venues.md). */
export const CHAMPS_OBLIGATOIRES = ["contact_prenom", "contact_nom", "contact_telephone"] as const;

export type ChampObligatoire = (typeof CHAMPS_OBLIGATOIRES)[number];

export type SaisiePartenaire = Record<ChampObligatoire, string> & { contact_email: string };

export type ErreursSaisie = Partial<Record<ChampObligatoire, string>>;

export const SAISIE_VIDE: SaisiePartenaire = {
  contact_prenom: "",
  contact_nom: "",
  contact_telephone: "",
  contact_email: "",
};

/* Texte de Field state=error (123:130) et de VEN-23 ; PART-11 l'écrit en français. */
export const MESSAGE_CHAMP_OBLIGATOIRE = "This field is required";

export function champsManquants(saisie: SaisiePartenaire): ChampObligatoire[] {
  return CHAMPS_OBLIGATOIRES.filter((champ) => saisie[champ].trim() === "");
}

export function erreursDesChamps(champs: readonly ChampObligatoire[]): ErreursSaisie {
  const erreurs: ErreursSaisie = {};

  for (const champ of champs) {
    erreurs[champ] = MESSAGE_CHAMP_OBLIGATOIRE;
  }

  return erreurs;
}

/* Le lien d'accès du partenaire (PART-7). La route `/p/<jeton>` est le contrat fixé par Richard ;
   le Figma, lui, écrit « app.siempass.com/a/… » — voir « Écarts » de la PR. */
export function lienAcces(origineAdmin: string, jeton: string): string {
  return `${origineAdmin}/p/${jeton}`;
}

export function nomDuContact(partenaire: Partenaire): string {
  return `${partenaire.contact_prenom} ${partenaire.contact_nom}`;
}
