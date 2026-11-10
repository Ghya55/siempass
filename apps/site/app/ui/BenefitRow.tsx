import { IconCheck } from "./icons";
import styles from "./BenefitRow.module.css";

/** Côté de `icon/check` dans le gabarit Figma de la ligne (54:8). */
const TAILLE_COCHE = 20 as const;

/**
 * Figma `BenefitRow` (54:11) — « Une ligne d'argument de la page pass : coche + libellé. »
 * `label` est la propriété de texte du composant.
 */
export type BenefitRowProps = {
  readonly label: string;
};

export function BenefitRow({ label }: BenefitRowProps) {
  return (
    <li className={styles.benefitRow}>
      <span className={styles.check}>
        <IconCheck size={TAILLE_COCHE} />
      </span>
      <span className={styles.label}>{label}</span>
    </li>
  );
}
