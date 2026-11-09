import styles from "./composants.module.css";

type ProprietesAdvantageCard = {
  /** `label` et `avantage` dans Figma (6:79). */
  readonly label: string;
  readonly avantage: string;
};

/**
 * Composant Figma `AdvantageCard` (6:79) : l'avantage offert aux porteurs du pass.
 * Toujours en lecture seule côté partenaire — un champ éditable trancherait par accident
 * la question « avantage unique ou répétable », qui est reportée (PART-6).
 */
export function AdvantageCard({ label, avantage }: ProprietesAdvantageCard) {
  return (
    <div className={styles.advantageCard}>
      <p className={styles.advantageLabel}>{label}</p>
      <p className={styles.advantageTexte}>{avantage}</p>
    </div>
  );
}
