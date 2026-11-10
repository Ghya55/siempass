import { MissingIcon } from "./MissingIcon";
import styles from "./EmptyState.module.css";

/** Figma `EmptyState` (5:30) — « État vide d'une liste. » `body` absent = `hasBody` à faux. */
/** Côté de `icon/pin` dans le gabarit Figma `iconCircle` (5:31). */
const TAILLE_ICONE_PIN = 24 as const;

export type EmptyStateProps = {
  readonly title: string;
  readonly body?: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconCircle}>
        {/* FIGMA-MANQUANT: `icon/pin` (5:32), voir MissingIcon.tsx. Taille exacte (24 px). */}
        <MissingIcon size={TAILLE_ICONE_PIN} />
      </div>
      <p className={styles.title}>{title}</p>
      {body === undefined ? null : <p className={styles.body}>{body}</p>}
    </div>
  );
}
