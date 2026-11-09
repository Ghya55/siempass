import Link from "next/link";
import { classNames } from "./class-names";
import styles from "./Button.module.css";

/**
 * Figma `Button` (5:10) — « Bouton d'action. tone=primary pour l'action principale de l'écran,
 * une seule par écran. » Les props reprennent les propriétés Figma : `label`, `size`, `tone`.
 *
 * `href` n'existe pas dans Figma : le composant y est une boîte, ici c'est un lien. Les deux
 * boutons de l'étape 8 mènent à l'achat du pass.
 */
export type ButtonProps = {
  readonly label: string;
  readonly href: string;
  readonly size?: "md" | "lg";
  readonly tone?: "primary";
  /** Classe du site d'appel, pour la largeur : le bouton du héros occupe toute la colonne. */
  readonly className?: string | undefined;
};

export function Button({ label, href, size = "md", tone = "primary", className }: ButtonProps) {
  const sizeClass = size === "lg" ? styles.sizeLg : styles.sizeMd;
  const toneClass = tone === "primary" ? styles.tonePrimary : undefined;

  return (
    <Link href={href} className={classNames(styles.button, sizeClass, toneClass, className)}>
      {label}
    </Link>
  );
}
