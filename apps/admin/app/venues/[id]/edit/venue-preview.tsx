import { memo, type FC } from "react";
import { VenuePage, type VenuePageData } from "@siempass/feature-venue-page";
import { Icon } from "@siempass/core-icons";
import styles from "./venue-preview.module.css";

const BACK_SIZE = 24 as const;

export type VenuePreviewProps = {
  readonly venue: VenuePageData;
};

/**
 * La colonne de droite de l'éditeur (cadre `preview` 128:503) : la fiche publique entière dans un
 * téléphone. La fiche est `VenuePage`, le composant même du site (VEN-12) ; elle reçoit à chaque
 * frappe les blocs et la photo de l'éditeur (VEN-30).
 */
export const VenuePreview: FC<VenuePreviewProps> = memo(function VenuePreview({ venue }) {
  return (
    <aside className={styles.preview} aria-label="Preview">
      <div className={styles.phone}>
        <div className={styles.screen}>
          <VenuePage venue={venue} header={<PreviewSiteHeader />} />
        </div>
      </div>
    </aside>
  );
});

/**
 * L'en-tête du site (`SiteHeader` 5:37, `hasBack`), qui appartient à apps/site et qu'une app
 * n'importe pas de l'autre : copie statique, sans lien (la preview ne navigue pas). Seul élément
 * de la preview qui n'est pas le code du site ; voir les écarts de la PR.
 */
const PreviewSiteHeader: FC = () => {
  return (
    <div className={styles.siteHeader}>
      <span className={styles.siteBack} aria-hidden="true">
        <Icon name="chevron-left" size={BACK_SIZE} />
      </span>
      <p className={styles.siteTitle}>SiemPass</p>
      <span className={styles.siteBack} aria-hidden="true" />
    </div>
  );
};
