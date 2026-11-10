/**
 * Résultat d'une action serveur qui écrit. Une seule forme pour tout le back-office : l'action
 * rend un résultat, c'est l'écran qui navigue ou rafraîchit.
 */
export type ResultatEcriture = { statut: "ok" } | { statut: "erreur"; message: string };
