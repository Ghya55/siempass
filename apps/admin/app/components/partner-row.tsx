"use client";

import Link from "next/link";
import type { FC } from "react";
import type { Partenaire } from "../partners/partenaire";
import styles from "./partner-row.module.css";

export type PartnerRowProps = {
  partenaire: Partenaire;
  /* Nombre de lieux du partenaire (colonne « Venues », VEN-15, PART-13). */
  venueCount: number;
  /* La page Venues filtrée sur ce partenaire. */
  venuesHref: string;
  selected: boolean;
  onSelect: (id: string) => void;
};

/* Ligne du tableau des partenaires (Figma « PartnerRow », 6:75), dans sa forme allégée de
   128:2036 : hasVenue=false, hasStatus=false, hasVenues=true (VEN-36). Les variantes avec lieu
   et état ne servent plus : elles ne sont pas codées.
   Deux cibles dans la ligne : le contact ouvre le panneau, le nombre ouvre Venues filtrée.
   Un lien ne peut pas vivre dans un bouton : la ligne est un conteneur, chaque cible est un
   élément cliquable à part. */
export const PartnerRow: FC<PartnerRowProps> = ({
  partenaire,
  venueCount,
  venuesHref,
  selected,
  onSelect,
}) => {
  return (
    <div className={`${styles.ligne} ${selected ? styles.selectionnee : ""}`}>
      <button
        aria-pressed={selected}
        className={styles.colonneContact}
        onClick={() => {
          onSelect(partenaire.id);
        }}
        type="button"
      >
        <span className={styles.contact}>
          {partenaire.contact_prenom} {partenaire.contact_nom}
        </span>
        <span className={styles.secondaire}>{partenaire.contact_telephone}</span>
      </button>
      <span className={styles.colonneVenues}>
        <Link className={styles.nombre} href={venuesHref}>
          {venueCount}
        </Link>
      </span>
    </div>
  );
};
