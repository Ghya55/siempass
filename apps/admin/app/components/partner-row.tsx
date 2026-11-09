"use client";

import type { FC } from "react";
import type { Partenaire } from "../partners/partenaire";
import { Badge } from "./badge";
import styles from "./partner-row.module.css";

export type PartnerRowProps = {
  partenaire: Partenaire;
  selected: boolean;
  onSelect: (id: string) => void;
};

/* Ligne du tableau des partenaires. Clic -> panneau latéral ; selected=true quand le panneau est
   ouvert sur cette ligne (description Figma). */
export const PartnerRow: FC<PartnerRowProps> = ({ partenaire, selected, onSelect }) => {
  return (
    <button
      aria-pressed={selected}
      className={`${styles.ligne} ${selected ? styles.selectionnee : ""}`}
      onClick={() => {
        onSelect(partenaire.id);
      }}
      type="button"
    >
      <span className={styles.colonne}>
        <span className={styles.principal}>{partenaire.lieu_nom}</span>
        <span className={styles.secondaire}>{partenaire.lieu_adresse}</span>
      </span>
      <span className={styles.colonne}>
        <span className={styles.contact}>
          {partenaire.contact_prenom} {partenaire.contact_nom}
        </span>
        <span className={styles.secondaire}>{partenaire.contact_telephone}</span>
      </span>
      <span className={styles.colonneEtat}>
        <Badge state={partenaire.etat} />
      </span>
    </button>
  );
};
