import Link from "next/link";
import { IconChevronLeft } from "./icons";
import styles from "./SiteHeader.module.css";

/** Côté de `icon/chevron-left` (64:12) dans le gabarit Figma `back` (66:45). */
const TAILLE_RETOUR = 24 as const;

/**
 * Figma `SiteHeader` (5:37) — « En-tête du site. Titre « SiemPass » centré, seul. hasBack
 * affiche le retour (icône seule) à gauche et son contrepoids à droite, pour que le titre
 * reste centré. »
 *
 * Un seul en-tête pour tout le site (VIS-27, VIS-32). Il remplace les deux copies qui
 * vivaient sous `places/ui` et `buy/_composants` : le bouton d'achat et le sous-titre
 * « Siem Reap, Cambodia » ont disparu du Figma, la hauteur passe de 67 à 64.
 */
export type SiteHeaderProps = {
  /** Propriété booléenne `hasBack` du Figma. Le retour ramène à l'accueil (VIS-27). */
  readonly hasBack?: boolean;
};

export function SiteHeader({ hasBack = false }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      {hasBack ? (
        // « Back » n'est écrit nulle part dans le Figma : l'icône y est seule. Le nom
        // accessible est pourtant obligatoire, un lien sans texte n'est pas annonçable.
        <Link href="/" className={styles.back} aria-label="Back">
          <IconChevronLeft size={TAILLE_RETOUR} />
        </Link>
      ) : null}
      <p className={styles.title}>SiemPass</p>
      {hasBack ? <span className={styles.trailingSpacer} aria-hidden="true" /> : null}
    </header>
  );
}
