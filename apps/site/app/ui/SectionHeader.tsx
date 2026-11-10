import styles from "./SectionHeader.module.css";

/**
 * Figma `SectionHeader` (54:6) — « Titre de section du site public, avec un compteur à droite. »
 *
 * Le titre est un `h2` : le compteur, lui, n'est pas un titre. Le niveau n'est pas une
 * propriété Figma, il est fixé ici parce que les deux écrans qui s'en servent ont ce titre
 * au même niveau.
 */
export type SectionHeaderProps = {
  readonly title: string;
  /** Absent quand on ne sait pas compter (liste indisponible) : le Figma ne dessine pas ce cas. */
  readonly count?: string | undefined;
};

export function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.title}>{title}</h2>
      {count === undefined ? null : <p className={styles.count}>{count}</p>}
    </div>
  );
}
