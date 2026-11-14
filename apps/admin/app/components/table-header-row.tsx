import type { FC } from "react";
import styles from "./table-header-row.module.css";

/* En-tête du tableau des partenaires (Figma « TableHeaderRow », 6:24), forme de 128:2036 :
   hasVenue=false, hasStatus=false, hasVenues=true (VEN-36). */
export const TableHeaderRow: FC = () => {
  return (
    <div className={styles.ligne}>
      <span className={styles.colonne}>Contact</span>
      <span className={styles.colonneVenues}>Venues</span>
    </div>
  );
};
