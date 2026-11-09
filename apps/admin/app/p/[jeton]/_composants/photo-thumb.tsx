import styles from "./composants.module.css";

/**
 * Composant Figma `PhotoThumb` (18:497) : la vignette de la photo du lieu, ou le visuel de
 * remplacement neutre quand le partenaire n'en a pas (PART-10).
 */
export function PhotoThumb() {
  return (
    <div className={styles.photoThumb}>
      {/* FIGMA-MANQUANT: le SVG `icon/photo` (18:498) n'a pas pu être téléchargé — figma.com
          est refusé par le proxy de la session. Tracé approché, taille (24) et couleur de
          Figma. À remplacer par l'asset exact. */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
        <path
          d="m4 17 5-5 4 4 3-2 4 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
