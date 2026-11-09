import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "./places/ui/Hero";
import { SiteHeader } from "./places/ui/SiteHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "SiemPass — one pass, perks at the best spots in Siem Reap",
  description: "A drink, a meal, a discount: just show your pass at the counter.",
};

// Même règle que la liste : rien n'est pré-rendu au build (DEMO-16, DEMO-21).
export const dynamic = "force-dynamic";

/**
 * L'accueil : il porte l'appel à l'achat du pass et mène à la liste des lieux.
 *
 * FIGMA-MANQUANT: aucun nœud Figma ne dessine l'accueil. Le Figma de l'étape 8 dessine un seul
 * écran, « 08 · Lieux », qui tient l'en-tête, le héros et la liste ; c'est lui que rend `/places`.
 * Ici, l'en-tête et le héros sont ceux de ce même Figma, et le lien vers la liste n'a ni libellé
 * ni place maquettés : il reprend le titre de la liste, « Partner venues ». À remplacer dès
 * qu'Alex dessine l'accueil.
 */
export default function HomePage() {
  return (
    <div className={styles.shell}>
      <SiteHeader />
      <main className={styles.content}>
        <Hero />
        <Link className={styles.venuesLink} href="/places">
          Partner venues
        </Link>
      </main>
    </div>
  );
}
