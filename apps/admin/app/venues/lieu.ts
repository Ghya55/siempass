import type { CategorieLieu, Tables } from "@siempass/db";
import { isVenueCategory, VENUE_CATEGORY_LABELS } from "@siempass/feature-venue-page";
import type { FieldOption } from "../components/field";

/* Ce que le tableau et la fiche du lieu lisent (specs/venues.md, blocs 2 et 3). La photo et les
   blocs appartiennent à l'éditeur (VEN-38) : la fiche ne les lit pas. */
export type Lieu = Pick<
  Tables<"venues">,
  | "id"
  | "partenaire_id"
  | "nom"
  | "tagline"
  | "categorie"
  | "adresse"
  | "lien_maps"
  | "horaires"
  | "avantage"
  | "etat"
>;

export const COLONNES_DU_LIEU =
  "id, partenaire_id, nom, tagline, categorie, adresse, lien_maps, horaires, avantage, etat" as const;

/* Le partenaire tel que Venues le montre : son nom, jamais le reste du contact. */
export type PartenaireDuLieu = Pick<Tables<"partners">, "id" | "contact_prenom" | "contact_nom">;

export function nomDuPartenaire(partenaire: PartenaireDuLieu): string {
  return `${partenaire.contact_prenom} ${partenaire.contact_nom}`;
}

/* Les champs de la fiche, dans l'ordre du panneau (157:1571). */
export const CHAMPS_DU_LIEU = [
  "nom",
  "tagline",
  "partenaire_id",
  "categorie",
  "adresse",
  "lien_maps",
  "horaires",
  "avantage",
] as const;

export type ChampDuLieu = (typeof CHAMPS_DU_LIEU)[number];

/* La saisie du panneau : du texte partout, vide = non rempli. La catégorie est vérifiée à
   l'écriture (`categorieSaisie`). */
export type SaisieLieu = Record<ChampDuLieu, string>;

export type ErreursLieu = Partial<Record<ChampDuLieu, string>>;

/* VEN-23 : « Save » enregistre un brouillon dès que nom et partenaire sont remplis. */
export const REQUIS_POUR_ENREGISTRER = ["nom", "partenaire_id"] as const satisfies readonly ChampDuLieu[];

/* VEN-23, VEN-24 : ce qu'il faut pour publier, et pour garder un lieu en ligne. La photo d'en-tête
   et les blocs n'en font pas partie (VEN-32, VEN-38). */
export const REQUIS_POUR_PUBLIER = [
  "nom",
  "tagline",
  "partenaire_id",
  "categorie",
  "adresse",
  "avantage",
] as const satisfies readonly ChampDuLieu[];

/* Textes exacts de VEN-23. */
export const MESSAGE_CHAMP_REQUIS = "This field is required";
export const MESSAGE_PUBLICATION_INCOMPLETE = "Fill in the required fields to publish.";

export const SAISIE_VIDE: SaisieLieu = {
  nom: "",
  tagline: "",
  partenaire_id: "",
  categorie: "",
  adresse: "",
  lien_maps: "",
  horaires: "",
  avantage: "",
};

export function saisieDuLieu(lieu: Lieu): SaisieLieu {
  return {
    nom: lieu.nom,
    tagline: lieu.tagline ?? "",
    partenaire_id: lieu.partenaire_id,
    categorie: lieu.categorie ?? "",
    adresse: lieu.adresse ?? "",
    lien_maps: lieu.lien_maps ?? "",
    horaires: lieu.horaires ?? "",
    avantage: lieu.avantage ?? "",
  };
}

/* Un champ est rempli s'il porte autre chose que des espaces ; une catégorie, si elle est l'une
   des valeurs de VEN-5. */
export function champsManquants(saisie: SaisieLieu, requis: readonly ChampDuLieu[]): ChampDuLieu[] {
  return requis.filter((champ) => {
    if (champ === "categorie") {
      return categorieSaisie(saisie) === null;
    }

    return saisie[champ].trim() === "";
  });
}

export function erreursDesChamps(champs: readonly ChampDuLieu[]): ErreursLieu {
  const erreurs: ErreursLieu = {};

  for (const champ of champs) {
    erreurs[champ] = MESSAGE_CHAMP_REQUIS;
  }

  return erreurs;
}

export function categorieSaisie(saisie: SaisieLieu): CategorieLieu | null {
  return isVenueCategory(saisie.categorie) ? saisie.categorie : null;
}

/* « — » pour un lieu repris sans catégorie (description Figma de VenueRow). */
export function libelleDeCategorie(categorie: CategorieLieu | null): string {
  return categorie === null ? "—" : VENUE_CATEGORY_LABELS[categorie];
}

export const OPTIONS_DE_CATEGORIE: readonly FieldOption[] = Object.entries(VENUE_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

/* Résultat d'une écriture de la fiche. `incomplet` porte les champs manquants, et dit si le
   message de publication s'affiche en haut du panneau (VEN-23, VEN-24) : pas pour un simple
   brouillon sans nom, qui n'a rien à voir avec la publication. */
export type ResultatLieu =
  | { readonly statut: "ok"; readonly id: string }
  | {
      readonly statut: "incomplet";
      readonly champs: readonly ChampDuLieu[];
      readonly messagePublication: boolean;
    }
  | { readonly statut: "erreur"; readonly message: string };
