/**
 * « December 9, 2026 », comme le Figma. En UTC : `valide_jusqu_au` est une date sans heure,
 * la lire dans le fuseau du lecteur la décalerait d'un jour une partie de la journée.
 *
 * Partagé par la carte de l'accueil et la page d'un pass : une seule façon d'écrire la date.
 */
export function formatPassDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
