import { Calendar, Clock, MapPin } from "lucide-react";
import styles from "./PassOfferCard.module.css";

/**
 * Figma `PassOfferCard` (235:581) : un pass en vente, en forme de billet. Pas cliquable : l'achat
 * d'un pass précis est hors périmètre (CAT-24).
 */
export type PassOfferCardProps = {
  readonly name: string;
  readonly price: string;
  /** Nul si la validité manque : impossible pour un pass en ligne, la ligne disparaît alors. */
  readonly validity: string | null;
  /** Nul quand le pass ne couvre aucun lieu en ligne : pas de ligne. */
  readonly venues: string | null;
  /** Une ligne par événement à venir (`event1`, `event2`… du Figma). */
  readonly events: readonly string[];
};

export function PassOfferCard({ name, price, validity, venues, events }: PassOfferCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{name}</h3>
          <span className={styles.price}>{price}</span>
        </div>
        {validity === null ? null : (
          <p className={styles.validity}>
            <Clock aria-hidden="true" size={14} strokeWidth={2.5} />
            {validity}
          </p>
        )}
      </div>
      <div aria-hidden="true" className={styles.perforation}>
        <span className={`${styles.notch} ${styles.notchLeft}`} />
        <span className={`${styles.notch} ${styles.notchRight}`} />
      </div>
      <ul className={styles.stub}>
        {venues === null ? null : (
          <li className={styles.line}>
            <MapPin aria-hidden="true" className={styles.icon} size={16} />
            {venues}
          </li>
        )}
        {events.map((event) => (
          <li className={styles.line} key={event}>
            <Calendar aria-hidden="true" className={styles.icon} size={16} />
            {event}
          </li>
        ))}
      </ul>
    </article>
  );
}
