/**
 * Résultat d'une action serveur qui écrit. Une seule forme pour tout le back-office : l'action
 * rend un résultat, c'est l'écran qui navigue ou rafraîchit.
 */
export type ResultatEcriture = { statut: "ok" } | { statut: "erreur"; message: string };

export type EchecEcriture = { readonly statut: "erreur"; readonly message: string };

/** Échec de « Save » (éditeur et panneau d'un lieu) : texte tranché par Ghya le 15/11. */
export const MESSAGE_ECHEC_ENREGISTREMENT = "Couldn't save. Try again.";

/**
 * Une écriture refusée par la base : l'écran affiche `MESSAGE_ECHEC_ENREGISTREMENT`, jamais le
 * message brut de la base ; le détail va dans les logs du serveur (Vercel), avec ce qui était
 * tenté. À n'appeler que depuis une action serveur.
 */
export function echecEnregistrement(tentative: string, cause: unknown): EchecEcriture {
  console.error(`Écriture refusée — ${tentative}`, cause);
  return { statut: "erreur", message: MESSAGE_ECHEC_ENREGISTREMENT };
}
