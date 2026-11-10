import type { Place, PlacesResult } from "@/app/places/places";
import { EmptyState } from "./EmptyState";
import { PlaceCard } from "./PlaceCard";
import { SectionHeader } from "./SectionHeader";
import styles from "./VenuesSection.module.css";

/** Libellé exact de la spec (bloc 1) et du Figma : il ne varie pas d'un écran à l'autre. */
const TITRE = "Partner venues" as const;

/**
 * La liste des lieux partenaires, telle qu'elle est dessinée sur l'accueil (73:114) et sur
 * « 08 · Lieux » : mise en page, pas un composant Figma. Seuls les lieux `en ligne` y
 * arrivent, c'est `fetchPublishedPlaces` qui le garantit (VIS-13, PART-3).
 */
export type VenuesSectionProps = { readonly result: PlacesResult };

export function VenuesSection({ result }: VenuesSectionProps) {
  return (
    <section className={styles.venues}>
      <SectionHeader title={TITRE} count={compterLieux(result)} />
      <VenuesList result={result} />
    </section>
  );
}

function VenuesList({ result }: VenuesSectionProps) {
  if (result.status === "erreur") {
    return <VenuesUnavailable detail={result.detail} />;
  }
  if (result.places.length === 0) {
    // VIS-18 : la liste vide porte sa phrase, et la carte du pass reste achetable au-dessus.
    return (
      <div className={styles.box}>
        <EmptyState title="First venues coming soon" />
      </div>
    );
  }
  return (
    <ul className={styles.list}>
      {result.places.map((place: Place) => (
        <li key={place.id}>
          <PlaceCard
            name={place.lieu_nom}
            address={place.lieu_adresse}
            description={place.lieu_description}
            avantage={place.avantage}
            photoUrl={place.lieu_photo}
          />
        </li>
      ))}
    </ul>
  );
}

type VenuesUnavailableProps = { readonly detail: string };

// FIGMA-MANQUANT: aucun état d'erreur de la liste des lieux n'est maquetté, et aucune spec ne
// donne sa phrase. Bloc tenant la place, calqué sur l'état vide : il vaut mieux que la page
// blanche d'une exception. Le détail technique est affiché le temps de staging.
function VenuesUnavailable({ detail }: VenuesUnavailableProps) {
  return (
    <div className={styles.box}>
      <EmptyState title="Venues are unavailable right now" body={detail} />
    </div>
  );
}

/** Pas de compteur quand la liste n'a pas pu être lue : on ne sait pas combien il y en a. */
function compterLieux(result: PlacesResult): string | undefined {
  if (result.status === "erreur") {
    return undefined;
  }
  return result.places.length === 1 ? "1 venue" : `${result.places.length} venues`;
}
