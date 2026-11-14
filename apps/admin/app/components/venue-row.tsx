"use client";

import type { FC } from "react";
import type { EtatPartenaire } from "@siempass/db";
import { Badge } from "./badge";
import styles from "./venue-row.module.css";

export type VenueRowProps = {
  id: string;
  venueName: string;
  partnerName: string;
  /* Libellé de la catégorie ; « — » pour un lieu repris sans catégorie (description Figma). */
  category: string;
  state: EtatPartenaire;
  selected: boolean;
  onSelect: (id: string) => void;
};

/* Ligne du tableau Venues (Figma « VenueRow », 124:280). Clic : la fiche du lieu en panneau
   (VEN-37 ; la description du composant dit encore « l'éditeur », VEN-11 est remplacée).
   selected=true quand le panneau est ouvert sur cette ligne. */
export const VenueRow: FC<VenueRowProps> = ({
  id,
  venueName,
  partnerName,
  category,
  state,
  selected,
  onSelect,
}) => {
  return (
    <button
      aria-pressed={selected}
      className={`${styles.ligne} ${selected ? styles.selectionnee : ""}`}
      onClick={() => {
        onSelect(id);
      }}
      type="button"
    >
      <span className={styles.colonne}>
        <span className={styles.nom}>{venueName}</span>
      </span>
      <span className={styles.colonne}>
        <span className={styles.texte}>{partnerName}</span>
      </span>
      <span className={styles.colonneCategorie}>
        <span className={styles.texte}>{category}</span>
      </span>
      <span className={styles.colonneEtat}>
        <Badge state={state} />
      </span>
    </button>
  );
};
