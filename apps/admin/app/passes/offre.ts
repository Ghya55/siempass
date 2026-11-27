import type { ModeSelection, ModeValidite, Tables } from "@siempass/db";
import type { EtatBadge } from "../components/badge";
import { formatJour } from "../lib/dates";

/** Un pass du catalogue (`pass_offers`), avec les identifiants de ses deux listes. */
export type Offre = Tables<"pass_offers"> & {
  readonly lieux: readonly string[];
  readonly evenements: readonly string[];
};

/** Un lieu tel que « Venues » le propose : tous, brouillons compris (CAT-7). */
export type LieuChoisissable = Pick<Tables<"venues">, "id" | "nom" | "etat">;

/** Un événement tel que « Events » le propose : tous, passés compris (EVT-10). */
export type EvenementChoisissable = Pick<Tables<"events">, "id" | "nom" | "jour">;

/** Les deux catalogues de choix, et leur taille, qu'il faut pour résumer « All … » (CAT-17). */
export type Choix = {
  readonly lieux: readonly LieuChoisissable[];
  readonly evenements: readonly EvenementChoisissable[];
};

/* CAT-13 : « $15 », « $12.50 ». */
export function prixAffiche(centimes: number): string {
  const dollars = Math.floor(centimes / 100);
  const reste = centimes % 100;

  return reste === 0 ? `$${dollars}` : `$${dollars}.${String(reste).padStart(2, "0")}`;
}

/* CAT-4 : « Valid until 31 Dec 2026 », « Valid 1 day from purchase », « Valid 30 days from
   purchase ». Nul tant que la valeur du mode choisi manque : la carte n'en dit rien. */
export function validiteAffichee(
  mode: ModeValidite,
  valideJusquAu: string | null,
  jours: number | null,
): string | null {
  switch (mode) {
    case "date":
      return valideJusquAu === null ? null : `Valid until ${formatJour(valideJusquAu)}`;
    case "jours":
      if (jours === null) {
        return null;
      }
      return jours === 1 ? "Valid 1 day from purchase" : `Valid ${jours} days from purchase`;
    default:
      return assertNever(mode);
  }
}

/* CAT-17, au back-office : les brouillons comptent. « All partner venues » pour tous sans
   exclusion ; sinon le compte. Nul pour une liste vide : la carte n'en dit rien. */
export function lieuxAffiches(offre: Offre, nombreDeLieux: number): string | null {
  const compte = compterCouverts(offre.lieux_mode, offre.lieux.length, nombreDeLieux);

  if (compte === "tous") {
    return "All partner venues";
  }
  if (compte === 0) {
    return null;
  }
  return compte === 1 ? "1 partner venue" : `${compte} partner venues`;
}

/* CAT-17, au back-office : « All events », « 1 event », « <n> events ». Un « All events » avec
   exclusions se dit par son compte, comme les lieux. */
export function evenementsAffiches(offre: Offre, nombreDEvenements: number): string | null {
  const compte = compterCouverts(offre.evenements_mode, offre.evenements.length, nombreDEvenements);

  if (compte === "tous") {
    return "All events";
  }
  if (compte === 0) {
    return null;
  }
  return compte === 1 ? "1 event" : `${compte} events`;
}

function compterCouverts(mode: ModeSelection, tailleDeLaListe: number, total: number): number | "tous" {
  switch (mode) {
    case "tous":
      return tailleDeLaListe === 0 ? "tous" : Math.max(total - tailleDeLaListe, 0);
    case "liste":
      return tailleDeLaListe;
    default:
      return assertNever(mode);
  }
}

/* CAT-20 : « Ended » se déduit de la date ; en base, le pass reste en ligne. */
export function etatAffiche(offre: Offre, aujourdhui: string): EtatBadge {
  if (offre.etat === "brouillon") {
    return "brouillon";
  }
  const termine = offre.validite_mode === "date" && offre.valide_jusqu_au !== null && offre.valide_jusqu_au < aujourdhui;

  return termine ? "termine" : "en ligne";
}

export function assertNever(valeur: never): never {
  throw new Error(`Valeur inattendue : ${String(valeur)}`);
}
