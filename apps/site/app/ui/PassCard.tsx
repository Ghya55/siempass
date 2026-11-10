import { formatPassDate } from "./pass-date";
import styles from "./PassCard.module.css";

/** Libellés exacts du Figma (5:70, 5:71, 5:79, 5:80) et de la spec (bloc 2). */
const MARQUE = "SiemPass" as const;
const GAMME = "Siem Reap Pass" as const;
const MENTION_PROVISOIRE = "Validity period not final" as const;
const CONSIGNE = "Show this QR code at the counter." as const;

/**
 * Figma `PassCard` (5:68) — « Le pass acheté, avec QR code. Toute date porte « Durée de
 * validité provisoire » (DEMO-9). »
 *
 * `code` et `validity` sont les textes du composant ; `qrCode` (5:73) en est le gabarit
 * d'image, donc ici un nœud reçu en prop. C'est le seul endroit du site où le vrai QR
 * s'affiche (VIS-7), et c'est l'appelant qui le fabrique : la carte, elle, ne sait pas
 * dessiner un QR, elle lui tient sa place.
 */
export type PassCardProps = {
  readonly code: string;
  /** Date brute, telle qu'elle est en base ; la carte l'écrit, elle ne la calcule pas. */
  readonly validUntil: string;
  readonly qrCode: React.ReactNode;
};

export function PassCard({ code, validUntil, qrCode }: PassCardProps) {
  return (
    <section className={styles.passCard}>
      <div className={styles.top}>
        <span className={styles.brand}>{MARQUE}</span>
        <span className={styles.range}>{GAMME}</span>
      </div>
      <div className={styles.qr}>{qrCode}</div>
      <p className={styles.code}>{code}</p>
      <div className={styles.validity}>
        <p className={styles.until}>Valid until {formatPassDate(validUntil)}</p>
        {/* VIS-12 : toute date affichée porte sa mention tant que la durée n'est pas tranchée. */}
        <p className={styles.provisional}>{MENTION_PROVISOIRE}</p>
      </div>
      <p className={styles.hint}>{CONSIGNE}</p>
    </section>
  );
}
