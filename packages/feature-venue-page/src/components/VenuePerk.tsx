import styles from "./VenuePerk.module.css";

/** Figma `VenuePerk` (123:116) — « Avantage du pass sur la fiche publique, sous « Your SiemPass perk » (VEN-7). » */
export type VenuePerkProps = {
  readonly perk: string;
};

export function VenuePerk({ perk }: VenuePerkProps) {
  return (
    <div className={styles.perk}>
      <p className={styles.label}>Your SiemPass perk</p>
      <p className={styles.value}>{perk}</p>
    </div>
  );
}
