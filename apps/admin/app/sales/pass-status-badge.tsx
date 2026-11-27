import type { FC } from "react";
import type { StatutPass } from "./pass";
import styles from "./pass-status-badge.module.css";

/* FIGMA-MANQUANT: aucun badge d'état de pass dans le Figma — le seul maquetté est celui des
   partenaires (Draft/Live), et ses deux tons ne couvrent pas trois états. Mêmes dimensions et
   mêmes variables que `components/badge` ; « Expired » reprend un ton effacé du Figma faute de
   couleur d'avertissement. Attend Alex le jour où cet écran devient un écran de prod. */
const LIBELLE: Record<StatutPass, string> = {
  valide: "Valid",
  utilise: "Used",
  expire: "Expired",
};

export type PassStatusBadgeProps = {
  statut: StatutPass;
};

export const PassStatusBadge: FC<PassStatusBadgeProps> = ({ statut }) => {
  return (
    <span className={`${styles.badge} ${styles[statut]}`}>
      <span aria-hidden="true" className={styles.dot} />
      {LIBELLE[statut]}
    </span>
  );
};
