import type { FC } from "react";
import styles from "./advantage-card.module.css";

export type AdvantageCardProps = {
  label: string;
  avantage: string;
};

/* L'avantage offert aux porteurs du pass. Toujours en lecture seule (PART-6). */
export const AdvantageCard: FC<AdvantageCardProps> = ({ label, avantage }) => {
  return (
    <div className={styles.carte}>
      <span className={styles.label}>{label}</span>
      <p className={styles.avantage}>{avantage}</p>
    </div>
  );
};
