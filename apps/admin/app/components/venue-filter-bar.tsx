import Link from "next/link";
import type { FC } from "react";
import styles from "./venue-filter-bar.module.css";

export type VenueFilterBarProps = {
  /* « Partner: <prénom> <nom> » (VEN-15). */
  filterLabel: string;
  /* La page Venues sans filtre. */
  showAllHref: string;
};

/* Filtre de la page Venues sur un partenaire (Figma « VenueFilterBar », 124:285). */
export const VenueFilterBar: FC<VenueFilterBarProps> = ({ filterLabel, showAllHref }) => {
  return (
    <div className={styles.barre}>
      <span className={styles.filtre}>{filterLabel}</span>
      <Link className={styles.lien} href={showAllHref}>
        Show all venues
      </Link>
    </div>
  );
};
