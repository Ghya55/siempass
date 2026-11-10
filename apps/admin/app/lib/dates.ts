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
