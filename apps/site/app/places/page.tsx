import type { Metadata } from "next";
import { SiteHeader } from "../ui/SiteHeader";
import { VenuesSection } from "../ui/VenuesSection";
import { Hero } from "./ui/Hero";
import { fetchPublishedPlaces } from "./places";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Partner venues — SiemPass",
  description: "The Siem Reap venues where the pass gets you a perk.",
};

// La liste est relue à chaque affichage : un partenaire mis en ligne au back-office apparaît
// sans rechargement manuel et sans redéploiement (DEMO-16, DEMO-21).
export const dynamic = "force-dynamic";

/**
 * Figma « 08 · Lieux » (7:608). Cet écran sort du parcours du visiteur : depuis le nouvel
 * accueil, plus aucun lien n'y mène (VIS-1, VIS-14). Il reste en place — son effacement
 * demande le feu vert de Ghya — et porte désormais l'en-tête et la liste communs au site.
 */
export default async function PlacesPage() {
  const result = await fetchPublishedPlaces();

  return (
    <div className={styles.shell}>
      <SiteHeader />
      <main className={styles.content}>
        <Hero />
        <VenuesSection result={result} />
      </main>
    </div>
  );
}
