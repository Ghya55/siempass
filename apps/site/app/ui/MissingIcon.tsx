import styles from "./MissingIcon.module.css";

export type MissingIconProps = {
  /** Côté exact du gabarit Figma, en pixels : la place ne bougera pas quand l'icône arrivera. */
  readonly size: number;
};

/**
 * FIGMA-MANQUANT: aucun SVG d'icône n'a pu être téléchargé — www.figma.com est refusé par le
 * proxy de sortie des sessions de l'équipe (403 au CONNECT, déjà constaté sur `icon/photo` et
 * `icon/pin`). Carré en pointillés qui tient la place et la taille exactes du gabarit.
 *
 * Icônes attendues de cette passe : `icon/arrow-left` (24, retour de l'en-tête),
 * `icon/chevron-right` (24, carte du pass), `icon/qr` (80, carte du pass),
 * `icon/arrow-right` (16 · 20 · 24, `Button` avec `hasIcon`), `icon/spinner` (16 · 20 · 24).
 * Le carré prend la couleur du texte autour de lui, comme les icônes du Figma.
 */
export function MissingIcon({ size }: MissingIconProps) {
  return <span className={styles.missingIcon} style={{ width: size, height: size }} aria-hidden="true" />;
}
