import type { ReactNode } from "react";
import { VenueAuthor, VenueBlock, VenueInfo, VenueIntro, VenuePerk, VenuePhoto } from "./components";
import { isRenderableBlock, VENUE_CATEGORY_LABELS, type VenuePageData } from "./venue";
import styles from "./VenuePage.module.css";

/**
 * La fiche publique d'un lieu — Figma « 12 · Lieu · fiche complète » (125:273), « 12.1 · sans
 * photo d'en-tête » (125:352), « 12.2 · sans bloc » (125:409). Même rendu sur le site
 * (`/places/<adresse>`) et dans la preview de l'éditeur (VEN-12) : c'est pourquoi elle reçoit ses
 * données et ne lit pas la base.
 *
 * Ordre du bloc 5 de la spec : en-tête du site, photo, nom et tagline, avantage, blocs, infos
 * pratiques, auteur. `header` reçoit l'en-tête du site (`SiteHeader` avec retour), qui appartient
 * à l'app qui l'affiche.
 */
export type VenuePageProps = {
  readonly venue: VenuePageData;
  readonly header?: ReactNode;
};

export function VenuePage({ venue, header }: VenuePageProps) {
  const blocks = venue.blocks.filter(isRenderableBlock);

  return (
    <div className={styles.page}>
      {header}
      <VenuePhoto shape="bleed" photoUrl={venue.headerPhotoUrl} alt={venue.name} />
      <div className={styles.content}>
        <VenueIntro name={venue.name} tagline={venue.tagline} />
        {isBlank(venue.perk) ? null : <VenuePerk perk={venue.perk} />}
        {/* VEN-20 : sans bloc, la fiche passe de l'avantage aux infos pratiques. */}
        {blocks.length === 0 ? null : (
          <div className={styles.blocks}>
            {blocks.map((block) => (
              <VenueBlock key={block.id} block={block} />
            ))}
          </div>
        )}
        <VenueInfo
          category={venue.category === null ? null : VENUE_CATEGORY_LABELS[venue.category]}
          address={venue.address}
          mapsUrl={venue.mapsUrl}
          hours={venue.hours}
        />
        {/* VEN-27 : un lieu repris n'a pas d'auteur, donc pas de ligne « Written by ». */}
        {isBlank(venue.author) ? null : <VenueAuthor author={venue.author} />}
      </div>
    </div>
  );
}

function isBlank(value: string | null): value is null {
  return value === null || value.trim() === "";
}
