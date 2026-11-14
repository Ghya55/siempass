import type { EtatPartenaire } from "@siempass/db";
import styles from "./composants.module.css";

type ProprietesBadge = {
  /** `state` dans Figma (6:8) : l'état du partenaire, tel qu'il est en base. */
  readonly state: EtatPartenaire;
};

/** Libellés anglais du Figma (DEMO-27), par valeur de `partners.etat`. */
const LIBELLES: Record<EtatPartenaire, string> = {
  brouillon: "Draft",
  "en ligne": "Live",
};

/** Composant Figma `Badge` (6:8) : l'état de la fiche, que le partenaire voit (DEMO-28). */
export function Badge({ state }: ProprietesBadge) {
  const enLigne = state === "en ligne";
  return (
    <span className={`${styles.badge} ${enLigne ? styles.badgeEnLigne : styles.badgeBrouillon}`}>
      {/* `dot` (6:3 / 6:6) : un disque plein de 6, à la couleur du libellé. */}
      <span className={styles.pastille} aria-hidden="true" />
      {LIBELLES[state]}
    </span>
  );
}
