import type { CategorieLieu } from "@siempass/db";
import type { VenuePageData } from "@siempass/feature-venue-page";

/** Type schema.org le plus précis pour chaque catégorie (VEN-5) ; sans catégorie, le plus large. */
const SCHEMA_TYPES = {
  bar: "BarOrPub",
  restaurant: "Restaurant",
  cafe: "CafeOrCoffeeShop",
  shop: "Store",
  other: "LocalBusiness",
} as const satisfies Record<CategorieLieu, string>;

/**
 * Données structurées d'un lieu (skill site-public). Les horaires sont du texte libre (bloc 1 de
 * la spec) et ne suivent pas le format `openingHours` de schema.org : ils n'y figurent pas.
 */
export function venueStructuredData(venue: VenuePageData) {
  return {
    "@context": "https://schema.org",
    "@type": venue.category === null ? "LocalBusiness" : SCHEMA_TYPES[venue.category],
    name: venue.name,
    ...(venue.tagline === null ? {} : { description: venue.tagline }),
    ...(venue.headerPhotoUrl === null ? {} : { image: venue.headerPhotoUrl }),
    ...(venue.address === null ? {} : { address: venue.address }),
    ...(venue.mapsUrl === null ? {} : { hasMap: venue.mapsUrl }),
  };
}

/** JSON dans un `<script>` : `<` échappé, pour qu'un nom de lieu ne puisse pas fermer la balise. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
