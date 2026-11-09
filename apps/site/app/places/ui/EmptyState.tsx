import styles from "./EmptyState.module.css";

/** Figma `EmptyState` (5:30) — « État vide d'une liste. » `body` absent = `hasBody` à faux. */
export type EmptyStateProps = {
  readonly title: string;
  readonly body?: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconCircle}>
        {/* FIGMA-MANQUANT: l'icône `icon/pin` (5:32) n'a pas pu être téléchargée — www.figma.com
            est refusé par le proxy de sortie des sessions de l'équipe. Carré tenant la place et
            la taille exactes (24 px), à remplacer par le SVG. */}
        <span className={styles.missingIcon} aria-hidden="true" />
      </div>
      <p className={styles.title}>{title}</p>
      {body === undefined ? null : <p className={styles.body}>{body}</p>}
    </div>
  );
}
