import type { Metadata } from "next";
import { fetchPublishedPlaces } from "./places/places";
import { HomePassCardIsland } from "./ui/HomePassCardIsland";
import { SiteHeader } from "./ui/SiteHeader";
import { VenuesSection } from "./ui/VenuesSection";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "SiemPass — one pass, perks at the best spots in Siem Reap",
  description: "A drink, a meal, a discount: just show your pass at the counter.",
};

// La liste est relue à chaque affichage : un partenaire mis en ligne au back-office apparaît
// sans rechargement manuel et sans redéploiement (VIS-26, DEMO-16).
export const dynamic = "force-dynamic";

/**
 * Figma « 10 · Home · sans pass » (57:49), « 10.1 · avec pass » (57:107) et « 10.2 · carte en
 * chargement » (73:117) : l'en-tête, la carte du pass, puis la liste des lieux (VIS-1).
 *
 * La carte est le seul îlot client de la page : elle seule dépend de la réponse à « ai-je un
 * pass ? » (VIS-2). La liste, elle, est rendue côté serveur.
 */
export default async function HomePage() {
  const result = await fetchPublishedPlaces();

  return (
    <div className={styles.shell}>
      <SiteHeader />
      <main className={styles.content}>
        <HomePassCardIsland />
        <VenuesSection result={result} />
      </main>
    </div>
  );
}
