import { Button } from "./Button";
import styles from "./SiteHeader.module.css";

/** Figma `SiteHeader` (5:37) — « En-tête du site public, mobile. » */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <p className={styles.wordmark}>SiemPass</p>
        <p className={styles.place}>Siem Reap, Cambodia</p>
      </div>
      <Button label="The pass · $20" href="/buy" size="md" />
    </header>
  );
}
