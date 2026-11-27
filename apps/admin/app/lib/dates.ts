/**
 * Le back-office se lit depuis le Cambodge, et il est rendu sur le serveur : sans fuseau
 * explicite, les horodatages s'afficheraient en UTC, c'est-à-dire sept heures en arrière de ce
 * que Ghya a sous les yeux. Les colonnes qui en viennent portent « (ICT) » dans leur en-tête.
 */
const FUSEAU_BACK_OFFICE = "Asia/Phnom_Penh" as const;

/** « Nov 10, 2026, 3:12 PM », heure du Cambodge. Pour un `timestamptz`. */
export function formatInstant(horodatage: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: FUSEAU_BACK_OFFICE,
  }).format(new Date(horodatage));
}

/**
 * « Nov 17, 2026 ». En UTC : `valide_jusqu_au` est une date sans heure, la lire dans un autre
 * fuseau la décalerait d'un jour une partie de la journée (même raison que `formatPassDate` du
 * site, qui ne peut pas être partagé — une app n'importe pas dans l'autre).
 */
export function formatDateSeule(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** Le jour courant au Cambodge, en `AAAA-MM-JJ`, pour comparer avec une colonne `date`. */
export function jourCourant(maintenant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: FUSEAU_BACK_OFFICE,
  }).format(maintenant);
}

/**
 * « 19 Dec 2026 » : une colonne `date` (jour d'un événement, date fixe d'un pass), au format des
 * maquettes Events et Passes (237:2, 238:2). En UTC pour la même raison que `formatDateSeule`.
 */
export function formatJour(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** « 19 Dec » : le jour sans l'année, dans une liste de choix d'événements (234:434). */
export function formatJourCourt(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** « 27 Nov 2026, 22:15 », heure du Cambodge, au format de la maquette Sales (240:3345). */
export function formatInstantVente(horodatage: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: FUSEAU_BACK_OFFICE,
  }).format(new Date(horodatage));
}
