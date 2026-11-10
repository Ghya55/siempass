/**
 * Les deux chemins de la session, au même endroit : le proxy y redirige, les actions serveur
 * aussi. En double, ils finiraient par se contredire.
 */
export const CHEMIN_CONNEXION = "/login" as const;
export const CHEMIN_APRES_CONNEXION = "/partners" as const;
