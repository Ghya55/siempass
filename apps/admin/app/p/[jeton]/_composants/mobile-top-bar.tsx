import styles from "./composants.module.css";

type ProprietesMobileTopBar = {
  /** `context` dans Figma (6:102). */
  readonly context: string;
};

/** Composant Figma `MobileTopBar` (6:102) : l'en-tête mobile de l'espace partenaire. */
export function MobileTopBar({ context }: ProprietesMobileTopBar) {
  return (
    <header className={styles.topBar}>
      <span className={styles.topBarMarque}>SiemPass</span>
      <span className={styles.topBarContexte}>{context}</span>
    </header>
  );
}
