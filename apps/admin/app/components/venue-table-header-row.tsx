import type { FC } from "react";
import styles from "./venue-table-header-row.module.css";

/* En-tête du tableau Venues (Figma « VenueTableHeaderRow », 124:249). */
export const VenueTableHeaderRow: FC = () => {
  return (
    <div className={styles.ligne}>
      <span className={styles.colonne}>Venue</span>
      <span className={styles.colonne}>Partner</span>
      <span className={styles.colonneCategorie}>Category</span>
      <span className={styles.colonneEtat}>Status</span>
    </div>
  );
};
