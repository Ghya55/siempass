import Link from "next/link";
import { classNames } from "./class-names";
import { IconArrowRight, IconSpinner } from "./icons";
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
 */
type ButtonBaseProps = {
  readonly label: string;
  readonly size?: ButtonSize | undefined;
  readonly tone?: ButtonTone | undefined;
  /** `hasIcon` du Figma : place une icône avant le libellé, `icon/arrow-right` par défaut. */
  readonly hasIcon?: boolean | undefined;
  /** Échange d'instance `icon` du Figma. Absent avec `hasIcon` : l'icône par défaut. */
  readonly icon?: React.ReactNode | undefined;
  readonly state?: ButtonState | undefined;
  /** Hors Figma, mise en page : le bouton d'une carte occupe toute sa largeur. */
  readonly fullWidth?: boolean | undefined;
  readonly className?: string | undefined;
};

/**
 * La balise n'est pas une propriété Figma, où le bouton est une boîte : elle se déduit de ce
 * qu'on lui donne. `href` mène quelque part (« Get the Pass » de l'accueil), `onClick` agit
 * sur place sans quitter l'écran (« Get the Pass » de l'argumentaire, qui ouvre la feuille,
 * et « Pay $20 » dedans — VIS-8). Un lien déguisé en bouton casse la navigation, l'inverse
 * casse l'action : les deux formes sont donc distinguées par le type, pas par une prop.
 */
export type ButtonProps = ButtonBaseProps &
  ({ readonly href: string } | { readonly onClick: () => void });

export function Button(props: ButtonProps) {
  const classe = buttonClassNames(props);

  if ("href" in props) {
    return (
      <Link href={props.href} className={classe} aria-busy={props.state === "loading"}>
        <ButtonMedia size={props.size} hasIcon={props.hasIcon} icon={props.icon} state={props.state} />
        <span>{props.label}</span>
      </Link>
    );
  }

  // En chargement, le bouton n'est plus actionnable : un second appui relancerait un paiement
  // (VIS-31). `disabled` garde la taille et la place du bouton, il ne les change pas.
  const enChargement = props.state === "loading";
  return (
    <button
      type="button"
      className={classe}
      onClick={props.onClick}
      disabled={enChargement}
      aria-busy={enChargement}
    >
      <ButtonMedia size={props.size} hasIcon={props.hasIcon} icon={props.icon} state={props.state} />
      <span>{props.label}</span>
    </button>
  );
}

/**
 * Les classes du `Button` du socle, pour les rares endroits qui doivent poser la balise
 * eux-mêmes (les écrans `buy`, hors flow, qui gardent leurs liens).
 */
export function buttonClassNames({
  size = "md",
  tone = "primary",
  fullWidth = false,
  className,
}: Pick<ButtonBaseProps, "size" | "tone" | "fullWidth" | "className">): string {
  return classNames(
    styles.button,
    CLASSE_TAILLE[size],
    CLASSE_TON[tone],
    fullWidth ? styles.fullWidth : undefined,
    className,
  );
}

type ButtonMediaProps = Pick<ButtonBaseProps, "size" | "hasIcon" | "icon" | "state">;

/**
 * En chargement, le `spinner` prend la place de l'icône — et apparaît même sans `hasIcon`,
 * comme dans Figma (cadre « paiement en cours », 71:358). Les deux ont le même côté, et la
 * hauteur du bouton est fixée par taille : passer de `default` à `loading` ne déplace rien
 * autour du bouton (VIS-31, VIS-34).
 */
function ButtonMedia({ size = "md", hasIcon = false, icon, state = "default" }: ButtonMediaProps) {
  if (state === "loading") {
    return (
      <span className={styles.spinner}>
        <IconSpinner size={TAILLE_ICONE[size]} />
      </span>
    );
  }
  if (!hasIcon) {
    return null;
  }
  return icon === undefined ? <IconArrowRight size={TAILLE_ICONE[size]} /> : icon;
}
