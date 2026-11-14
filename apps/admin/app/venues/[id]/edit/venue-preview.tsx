import { memo, type FC } from "react";
import { VenuePage, type VenuePageData } from "@siempass/feature-venue-page";
import { SiteHeader } from "@siempass/site-header";
import styles from "./venue-preview.module.css";

export type VenuePreviewProps = {
  readonly venue: VenuePageData;
};

/**
 * La colonne de droite de l'éditeur (cadre `preview` 128:503) : la fiche publique entière dans un
 * téléphone. La fiche est `VenuePage` et l'en-tête `SiteHeader`, les composants mêmes du site
 * (VEN-12) ; elle reçoit à chaque frappe les blocs et la photo de l'éditeur (VEN-30).
 *
 * L'en-tête est `inert` : la preview ne navigue pas, son retour mènerait à l'accueil du
 * back-office.
 */
export const VenuePreview: FC<VenuePreviewProps> = memo(function VenuePreview({ venue }) {
  return (
    <aside className={styles.preview} aria-label="Preview">
      <div className={styles.phone}>
        <div className={styles.screen}>
          <VenuePage
            venue={venue}
            header={
              <div inert>
                <SiteHeader hasBack />
              </div>
            }
          />
        </div>
      </div>
    </aside>
  );
});
