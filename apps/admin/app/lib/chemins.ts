/**
 * Les deux chemins de la session, au même endroit : le proxy y redirige, les actions serveur
 * aussi. En double, ils finiraient par se contredire.
 */
export const CHEMIN_CONNEXION = "/login" as const;
export const CHEMIN_APRES_CONNEXION = "/partners" as const;

/** La page Venues, et le paramètre qui la filtre sur un partenaire (VEN-15). */
export const CHEMIN_VENUES = "/venues" as const;
export const PARAMETRE_PARTENAIRE = "partner" as const;

export function cheminVenuesDuPartenaire(partenaireId: string): string {
  return `${CHEMIN_VENUES}?${new URLSearchParams({ [PARAMETRE_PARTENAIRE]: partenaireId }).toString()}`;
}

/** L'éditeur de l'article d'un lieu (« Edit page », VEN-38). */
export function cheminEditeurDuLieu(lieuId: string): string {
  return `${CHEMIN_VENUES}/${encodeURIComponent(lieuId)}/edit`;
}
