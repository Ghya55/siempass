import styles from "./VenueAuthor.module.css";

/** Figma `VenueAuthor` (123:119) — « « Written by <auteur> » en bas de la fiche (VEN-9). » */
export type VenueAuthorProps = {
  readonly author: string;
};

export function VenueAuthor({ author }: VenueAuthorProps) {
  return (
    <p className={styles.author}>
      <span className={styles.label}>Written by</span> <span className={styles.name}>{author}</span>
    </p>
  );
}
