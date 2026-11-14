import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VenuePage } from "@siempass/feature-venue-page";
import { SiteHeader } from "@siempass/site-header";
import { serializeJsonLd, venueStructuredData } from "./structured-data";
import { fetchPublishedVenue } from "./venue";
import styles from "./page.module.css";

/**
 * Relue à chaque affichage : un lieu mis en ligne apparaît, un lieu repassé en brouillon devient
 * introuvable, sans redéploiement (VEN-29).
 */
export const dynamic = "force-dynamic";

type VenueRouteProps = {
  readonly params: Promise<{ readonly slug: string }>;
};

export async function generateMetadata({ params }: VenueRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = await fetchPublishedVenue(slug);
  if (venue === null) {
    return { title: "Venue not found — SiemPass" };
  }

  const { page } = venue;
  // Validé par Ghya le 15/11 (specs/venues.md, § Détails techniques) : titre « <nom> — SiemPass »,
  // description = tagline.
  // Pas d'URL canonique ni de sitemap : le site n'a pas encore de domaine (`metadataBase`).
  const title = `${page.name} — SiemPass`;
  const description = page.tagline ?? undefined;
  return {
    title,
    ...(description === undefined ? {} : { description }),
    openGraph: {
      title,
      type: "website",
      ...(description === undefined ? {} : { description }),
      ...(page.headerPhotoUrl === null ? {} : { images: [page.headerPhotoUrl] }),
    },
  };
}

/**
 * La fiche publique d'un lieu, à son adresse de page (VEN-10) — Figma 125:273, 125:352, 125:409.
 * La fiche elle-même est le package `@siempass/feature-venue-page`, partagé avec la preview du
 * back-office (VEN-12). Brouillon ou inconnu : la page introuvable du site (VEN-28).
 */
export default async function VenueRoute({ params }: VenueRouteProps) {
  const { slug } = await params;
  const venue = await fetchPublishedVenue(slug);
  if (venue === null) {
    notFound();
  }

  const structuredData = venueStructuredData(venue.page);

  return (
    <main className={styles.shell}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <VenuePage venue={venue.page} header={<SiteHeader hasBack />} />
    </main>
  );
}
