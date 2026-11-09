import type { Metadata } from "next";
import { EmptyState } from "./ui/EmptyState";
import { Hero } from "./ui/Hero";
import { PlaceCard } from "./ui/PlaceCard";
import { SiteHeader } from "./ui/SiteHeader";
import { fetchPublishedPlaces, type Place, type PlacesResult } from "./places";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Partner venues — SiemPass",
  description: "The Siem Reap venues where the pass gets you a perk.",
};

// La liste est relue à chaque affichage : un partenaire mis en ligne au back-office apparaît
// sans rechargement manuel et sans redéploiement (DEMO-16, DEMO-21).
export const dynamic = "force-dynamic";

export default async function PlacesPage() {
  const result = await fetchPublishedPlaces();

  return (
    <div className={styles.shell}>
      <SiteHeader />
      <main className={styles.content}>
        <Hero />
        <section className={styles.venues}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>Partner venues</h2>
            {result.status === "ok" ? (
              <p className={styles.count}>{formatVenueCount(result.places.length)}</p>
            ) : null}
          </div>
          <PlacesList result={result} />
        </section>
      </main>
    </div>
  );
}

type PlacesListProps = { readonly result: PlacesResult };

function PlacesList({ result }: PlacesListProps) {
  if (result.status === "erreur") {
    return <PlacesUnavailable detail={result.detail} />;
  }
  if (result.places.length === 0) {
    // Figma « 08.0 · Lieux · lieu en brouillon (absent) » (7:577) : la liste se tient vide
    // comme à un seul lieu (DEMO-10), et le brouillon n'y est pas (DEMO-3).
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

type PlacesUnavailableProps = { readonly detail: string };

// FIGMA-MANQUANT: aucun état d'erreur de la liste des lieux n'est maquetté, et aucune spec ne
// donne sa phrase. Bloc tenant la place, calqué sur l'état vide : il vaut mieux que la page
// blanche d'une exception pendant la démonstration. Le détail technique est affiché comme sur
// la page socle, le temps de staging.
function PlacesUnavailable({ detail }: PlacesUnavailableProps) {
  return (
    <div className={styles.box}>
      <EmptyState title="Venues are unavailable right now" body={detail} />
    </div>
  );
}

function formatVenueCount(count: number): string {
  return count === 1 ? "1 venue" : `${count} venues`;
}
