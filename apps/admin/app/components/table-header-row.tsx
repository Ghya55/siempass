import type { FC } from "react";
import styles from "./table-header-row.module.css";

export const TableHeaderRow: FC = () => {
  return (
    <div className={styles.ligne}>
      <span className={styles.colonne}>Venue</span>
      <span className={styles.colonne}>Contact</span>
      <span className={styles.colonneEtat}>Status</span>
    </div>
  );
};
