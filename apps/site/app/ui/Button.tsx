import Link from "next/link";
import { classNames } from "./class-names";
import { MissingIcon } from "./MissingIcon";
import styles from "./Button.module.css";

/** Propriétés `size`, `tone` et `state` du composant Figma `Button` (5:10). */
export type ButtonSize = "md" | "lg" | "xl";
export type ButtonTone = "primary" | "secondary";
export type ButtonState = "default" | "loading";

/** Côté de l'icône et du `spinner` par taille, relevé sur les variantes Figma. */
const TAILLE_ICONE: Record<ButtonSize, number> = { md: 16, lg: 20, xl: 24 };

const CLASSE_TAILLE: Record<ButtonSize, string | undefined> = {
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
};

const CLASSE_TON: Record<ButtonTone, string | undefined> = {
  primary: styles.tonePrimary,
  secondary: styles.toneSecondary,
};

/**
 * Figma `Button` (5:10) — « Bouton d'action. tone=primary pour l'action principale de l'écran,
 * une seule par écran. » Les props reprennent les propriétés Figma : `label`, `size`, `tone`,
 * `hasIcon`, `icon`, `state`.
 *
 * `href` n'existe pas dans Figma : le composant y est une boîte, ici c'est un lien — tous les
 * boutons dessinés de cette passe mènent quelque part. La forme `<button>` (feuille de
 * paiement) s'ajoutera ici même quand la page `/pass` existera, pas dans un second composant.
 */
export type ButtonProps = {
  readonly label: string;
  readonly href: string;
  readonly size?: ButtonSize;
  readonly tone?: ButtonTone;
  /** `hasIcon` du Figma : place une icône avant le libellé, `icon/arrow-right` par défaut. */
  readonly hasIcon?: boolean;
  /** Échange d'instance `icon` du Figma. Absent avec `hasIcon` : l'icône par défaut. */
  readonly icon?: React.ReactNode;
  readonly state?: ButtonState;
  /** Hors Figma, mise en page : le bouton d'une carte occupe toute sa largeur. */
  readonly fullWidth?: boolean;
  readonly className?: string | undefined;
};

export function Button({
  label,
  href,
  size = "md",
  tone = "primary",
  hasIcon = false,
  icon,
  state = "default",
  fullWidth = false,
  className,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={classNames(
        styles.button,
        CLASSE_TAILLE[size],
        CLASSE_TON[tone],
        fullWidth ? styles.fullWidth : undefined,
        className,
      )}
      aria-busy={state === "loading"}
    >
      <ButtonMedia size={size} hasIcon={hasIcon} icon={icon} state={state} />
      <span>{label}</span>
    </Link>
  );
}

type ButtonMediaProps = Pick<ButtonProps, "hasIcon" | "icon" | "state"> & {
  readonly size: ButtonSize;
};

/**
 * En chargement, le `spinner` prend la place de l'icône — et apparaît même sans `hasIcon`,
 * comme dans Figma. Les deux ont le même côté, et la hauteur du bouton est fixée par taille :
 * passer de `default` à `loading` ne déplace rien (VIS-31, VIS-34).
 */
function ButtonMedia({ size, hasIcon = false, icon, state = "default" }: ButtonMediaProps) {
  if (state === "loading") {
    return (
      <span className={styles.spinner}>
        <MissingIcon size={TAILLE_ICONE[size]} />
      </span>
    );
  }
  if (!hasIcon) {
    return null;
  }
  // FIGMA-MANQUANT: `icon/arrow-right`, l'icône par défaut de `hasIcon`, n'a pas pu être
  // téléchargée (voir MissingIcon.tsx). Taille exacte du gabarit en attendant le SVG.
  return icon === undefined ? <MissingIcon size={TAILLE_ICONE[size]} /> : icon;
}
