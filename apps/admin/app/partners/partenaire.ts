import type { Tables } from "@siempass/db";

export type Partenaire = Tables<"partners">;

/* Les colonnes obligatoires de la table `partners` (specs/partenaire.md § Attributs).
   `contact_email` et `lieu_photo` en sont absents : ce sont les deux seuls facultatifs. */
export const CHAMPS_OBLIGATOIRES = [
  "contact_prenom",
  "contact_nom",
  "contact_telephone",
  "lieu_nom",
  "lieu_adresse",
  "lieu_description",
  "avantage",
] as const;

export type ChampObligatoire = (typeof CHAMPS_OBLIGATOIRES)[number];

export type SaisiePartenaire = Record<ChampObligatoire, string> & { contact_email: string };

export type ErreursSaisie = Partial<Record<ChampObligatoire, string>>;

export const SAISIE_VIDE: SaisiePartenaire = {
  contact_prenom: "",
  contact_nom: "",
  contact_telephone: "",
  contact_email: "",
  lieu_nom: "",
  lieu_adresse: "",
  lieu_description: "",
  avantage: "",
};

/* FIGMA-MANQUANT: aucun état d'erreur de champ n'est maquetté. PART-11 fixe le comportement
   (« la fiche ne s'enregistre pas et le champ fautif porte son message ») ; le texte anglais
   exact reste à écrire par Quentin. */
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
