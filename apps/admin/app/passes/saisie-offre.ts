import type { ModeSelection, ModeValidite } from "@siempass/db";
import type { Offre } from "./offre";

/**
 * La saisie du panneau d'un pass. Chaque mode garde sa valeur pendant la saisie (choix d'Alex) :
 * la date et le nombre de jours, et pour les lieux comme pour les événements une liste par mode
 * (choisis en « Selected … », exclus en « All … »). Seule celle du mode choisi est enregistrée.
 */
export type SaisieOffre = {
  readonly nom: string;
  readonly prix: string;
  readonly validiteMode: ModeValidite;
  readonly valideJusquAu: string;
  readonly nombreDeJours: string;
  readonly lieuxMode: ModeSelection;
  readonly lieux: Readonly<Record<ModeSelection, readonly string[]>>;
  readonly evenementsMode: ModeSelection;
  readonly evenements: Readonly<Record<ModeSelection, readonly string[]>>;
};

/** Ce que l'action serveur reçoit : la saisie lue, une liste par sélection. */
export type OffreEnvoyee = {
  readonly nom: string;
  readonly prixCentimes: number | null;
  readonly validiteMode: ModeValidite;
  readonly valideJusquAu: string | null;
  readonly validiteJours: number | null;
  readonly lieuxMode: ModeSelection;
  readonly lieux: readonly string[];
  readonly evenementsMode: ModeSelection;
  readonly evenements: readonly string[];
};

export type ErreursOffre = {
  readonly nom?: string;
  readonly prix?: string;
  readonly valideJusquAu?: string;
  readonly nombreDeJours?: string;
  /* CAT-21 : « Add at least one venue or event. », sous la liste des événements ; les deux listes
     passent en état d'erreur (240:1839). */
  readonly contenu?: string;
};

export type Verification =
  | { readonly statut: "ok"; readonly offre: OffreEnvoyee }
  | { readonly statut: "refus"; readonly erreurs: ErreursOffre; readonly alerte: string | null };

/* Textes exacts de la spec (CAT-21) et des autres formulaires (VEN-23). */
export const MESSAGE_CHAMP_OBLIGATOIRE = "This field is required";
export const MESSAGE_PUBLICATION_INCOMPLETE = "Fill in the required fields to publish.";
export const MESSAGE_CONTENU_VIDE = "Add at least one venue or event.";
export const MESSAGE_DATE_PASSEE = "Choose a date from today on.";

/* Choix d'Alex : « Days after purchase », « Selected venues », « Selected events », listes vides. */
export const SAISIE_VIDE: SaisieOffre = {
  nom: "",
  prix: "",
  validiteMode: "jours",
  valideJusquAu: "",
  nombreDeJours: "",
  lieuxMode: "liste",
  lieux: { tous: [], liste: [] },
  evenementsMode: "liste",
  evenements: { tous: [], liste: [] },
};

export function saisieDeLOffre(offre: Offre): SaisieOffre {
  return {
    nom: offre.nom,
    prix: offre.prix_centimes === null ? "" : prixSaisi(offre.prix_centimes),
    validiteMode: offre.validite_mode,
    valideJusquAu: offre.valide_jusqu_au ?? "",
    nombreDeJours: offre.validite_jours === null ? "" : String(offre.validite_jours),
    lieuxMode: offre.lieux_mode,
    lieux: { ...SAISIE_VIDE.lieux, [offre.lieux_mode]: offre.lieux },
    evenementsMode: offre.evenements_mode,
    evenements: { ...SAISIE_VIDE.evenements, [offre.evenements_mode]: offre.evenements },
  };
}

/** Ce qu'exige l'écriture demandée : « Save » d'un brouillon, ou publier (et « Save » en ligne). */
export type Exigence = "brouillon" | "en ligne";

/**
 * CAT-12 : un nom suffit à un brouillon. CAT-21, CAT-22 : en ligne, il faut aussi prix, validité
 * et au moins un lieu ou un événement. `publier` ajoute le refus d'une date fixe passée.
 *
 * Un prix ou un nombre de jours illisible (« abc », « 0 ») est traité comme absent : la spec n'a
 * pas de texte pour lui. Voir la description de la PR (attend Ghya).
 */
export function verifierSaisie(
  saisie: SaisieOffre,
  exigence: Exigence,
  publier: boolean,
  aujourdhui: string,
): Verification {
  const prixCentimes = lirePrix(saisie.prix);
  const validiteJours = lireJours(saisie.nombreDeJours);
  const valideJusquAu = saisie.valideJusquAu === "" ? null : saisie.valideJusquAu;
  const lieux = saisie.lieux[saisie.lieuxMode];
  const evenements = saisie.evenements[saisie.evenementsMode];

  const erreurs: {
    nom?: string;
    prix?: string;
    valideJusquAu?: string;
    nombreDeJours?: string;
    contenu?: string;
  } = {};

  if (saisie.nom.trim() === "") {
    erreurs.nom = MESSAGE_CHAMP_OBLIGATOIRE;
  }
  /* Même sur un brouillon, une valeur saisie doit être lisible : la base la refuserait. */
  if (saisie.prix.trim() !== "" && prixCentimes === null) {
    erreurs.prix = MESSAGE_CHAMP_OBLIGATOIRE;
  }
  if (saisie.validiteMode === "jours" && saisie.nombreDeJours.trim() !== "" && validiteJours === null) {
    erreurs.nombreDeJours = MESSAGE_CHAMP_OBLIGATOIRE;
  }

  if (exigence === "en ligne") {
    if (prixCentimes === null) {
      erreurs.prix = MESSAGE_CHAMP_OBLIGATOIRE;
    }
    if (saisie.validiteMode === "date" && valideJusquAu === null) {
      erreurs.valideJusquAu = MESSAGE_CHAMP_OBLIGATOIRE;
    }
    if (saisie.validiteMode === "jours" && validiteJours === null) {
      erreurs.nombreDeJours = MESSAGE_CHAMP_OBLIGATOIRE;
    }
    const sansContenu =
      saisie.lieuxMode === "liste" && lieux.length === 0 && saisie.evenementsMode === "liste" && evenements.length === 0;
    if (sansContenu) {
      erreurs.contenu = MESSAGE_CONTENU_VIDE;
    }
  }

  /* Choix d'Alex : la date passée se dit sous le champ seulement, sans l'alerte du haut. */
  const champManquant = Object.keys(erreurs).length > 0;
  if (publier && saisie.validiteMode === "date" && valideJusquAu !== null && valideJusquAu < aujourdhui) {
    erreurs.valideJusquAu = MESSAGE_DATE_PASSEE;
  }

  if (Object.keys(erreurs).length > 0) {
    return {
      statut: "refus",
      erreurs,
      alerte: champManquant && exigence === "en ligne" ? MESSAGE_PUBLICATION_INCOMPLETE : null,
    };
  }

  return {
    statut: "ok",
    offre: {
      nom: saisie.nom.trim(),
      prixCentimes,
      validiteMode: saisie.validiteMode,
      valideJusquAu,
      validiteJours,
      lieuxMode: saisie.lieuxMode,
      lieux,
      evenementsMode: saisie.evenementsMode,
      evenements,
    },
  };
}

/* CAT-13 : dollars, centimes permis (« 15 », « 12.5 », « 12.50 »), supérieur à zéro. */
function lirePrix(texte: string): number | null {
  const correspondance = /^(\d+)(?:\.(\d{1,2}))?$/.exec(texte.trim());

  if (correspondance === null) {
    return null;
  }
  const dollars = Number(correspondance[1] ?? "0");
  const centimes = Number((correspondance[2] ?? "").padEnd(2, "0"));
  const total = dollars * 100 + centimes;

  return total > 0 && Number.isSafeInteger(total) ? total : null;
}

/* CAT-4 : un nombre entier, au moins 1. */
function lireJours(texte: string): number | null {
  if (!/^\d+$/.test(texte.trim())) {
    return null;
  }
  const jours = Number(texte.trim());

  return jours >= 1 && Number.isSafeInteger(jours) ? jours : null;
}

function prixSaisi(centimes: number): string {
  const reste = centimes % 100;

  return reste === 0 ? String(centimes / 100) : `${Math.floor(centimes / 100)}.${String(reste).padStart(2, "0")}`;
}
