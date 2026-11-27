import type { ModeValidite } from "@siempass/db";

/*
 * Les textes d'une carte de pass du site (CAT-4, CAT-13, CAT-17). Le back-office a les siens
 * (apps/admin/app/passes/offre.ts) : une app n'importe pas dans l'autre.
 */

/** « $15 », « $12.50 ». */
export function formatPrice(centimes: number): string {
  const dollars = Math.floor(centimes / 100);
  const cents = centimes % 100;

  return cents === 0 ? `$${dollars}` : `$${dollars}.${String(cents).padStart(2, "0")}`;
}

/** « Valid until 31 Dec 2026 », « Valid 1 day from purchase », « Valid 30 days from purchase ». */
export function formatValidity(mode: ModeValidite, validUntil: string | null, days: number | null): string | null {
  if (mode === "date") {
    return validUntil === null ? null : `Valid until ${formatDay(validUntil, true)}`;
  }
  if (days === null) {
    return null;
  }
  return days === 1 ? "Valid 1 day from purchase" : `Valid ${days} days from purchase`;
}

/** « All partner venues » (tous, sans exclusion), sinon le compte des seuls lieux en ligne. */
export function formatVenues(allVenues: boolean, liveVenues: number): string | null {
  if (allVenues) {
    return "All partner venues";
  }
  if (liveVenues === 0) {
    return null;
  }
  return liveVenues === 1 ? "1 partner venue" : `${liveVenues} partner venues`;
}

/** « Friday Comedy Club · 5 Dec ». */
export function formatEvent(name: string, day: string): string {
  return `${name} · ${formatDay(day, false)}`;
}

/* En UTC : une date sans heure, lue dans le fuseau du lecteur, se décalerait d'un jour. */
function formatDay(date: string, withYear: boolean): string {
  return new Intl.DateTimeFormat("en-GB", {
    ...(withYear ? { year: "numeric" } : {}),
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
