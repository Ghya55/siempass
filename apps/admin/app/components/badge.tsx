import type { FC } from "react";
import type { EtatPartenaire } from "@siempass/db";
import styles from "./badge.module.css";

/* « Ended » : un pass du catalogue en ligne dont la date fixe est passée (CAT-20, 235:501). Ce
   n'est pas un état en base, il se déduit de la date. */
export type EtatBadge = EtatPartenaire | "termine";

/* Libellés anglais du Figma (DEMO-27) ; la colonne `etat` reste en français. */
const LIBELLE: Record<EtatBadge, string> = {
  brouillon: "Draft",
  "en ligne": "Live",
  termine: "Ended",
};

const CLASSE: Record<EtatBadge, string | undefined> = {
  brouillon: styles.brouillon,
  "en ligne": styles.enLigne,
  termine: styles.termine,
};

export type BadgeProps = {
  state: EtatBadge;
};

export const Badge: FC<BadgeProps> = ({ state }) => {
  return (
    <span className={`${styles.badge} ${CLASSE[state] ?? ""}`}>
      {/* Le « dot » du Figma est un disque plein de 6 px à la couleur du texte : rendu en CSS,
          l'asset n'étant pas téléchargeable (voir components/icon.tsx). */}
      <span aria-hidden="true" className={styles.dot} />
      {LIBELLE[state]}
    </span>
  );
};
