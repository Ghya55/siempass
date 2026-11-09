import styles from "./composants.module.css";

type ProprietesDetailItem = {
  /** `label` et `value` dans Figma (6:76). */
  readonly label: string;
  readonly value: string;
};

/** Composant Figma `DetailItem` (6:76) : une donnée de la fiche, en lecture seule (PART-6). */
export function DetailItem({ label, value }: ProprietesDetailItem) {
  return (
    <div className={styles.detailItem}>
      <p className={styles.detailLabel}>{label}</p>
      <p className={styles.detailValue}>{value}</p>
    </div>
  );
}
