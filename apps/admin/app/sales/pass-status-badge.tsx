import type { FC } from "react";
import type { StatutVente } from "./vente";
import styles from "./pass-status-badge.module.css";

/* Badge d'état d'une vente (240:3345) : « Valid » en succès, « Used » en neutre (PASS-4). */
const LIBELLE: Record<StatutVente, string> = {
  valide: "Valid",
  utilise: "Used",
};

export type PassStatusBadgeProps = {
  statut: StatutVente;
};

export const PassStatusBadge: FC<PassStatusBadgeProps> = ({ statut }) => {
  return (
    <span className={`${styles.badge} ${styles[statut] ?? ""}`}>
      <span aria-hidden="true" className={styles.dot} />
      {LIBELLE[statut]}
    </span>
  );
};
