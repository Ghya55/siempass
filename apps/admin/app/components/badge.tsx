import type { FC } from "react";
import type { EtatPartenaire } from "@siempass/db";
import styles from "./badge.module.css";

/* Libellés anglais du Figma (DEMO-27) ; la colonne `etat` reste en français. */
const LIBELLE: Record<EtatPartenaire, string> = {
  brouillon: "Draft",
  "en ligne": "Live",
};

export type BadgeProps = {
  state: EtatPartenaire;
};

export const Badge: FC<BadgeProps> = ({ state }) => {
  const enLigne = state === "en ligne";

  return (
    <span className={`${styles.badge} ${enLigne ? styles.enLigne : styles.brouillon}`}>
      {/* Le « dot » du Figma est un disque plein de 6 px à la couleur du texte : rendu en CSS,
          l'asset n'étant pas téléchargeable (voir components/icon.tsx). */}
      <span aria-hidden="true" className={styles.dot} />
      {LIBELLE[state]}
    </span>
  );
};
