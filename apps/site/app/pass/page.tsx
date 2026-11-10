import type { Metadata } from "next";
import { PassPageIsland } from "@/app/ui/PassPageIsland";
import { SiteHeader } from "@/app/ui/SiteHeader";
import styles from "./page.module.css";

/** Titre et description reprennent les textes du Figma, sans en inventer d'autres. */
export const metadata: Metadata = {
  title: "One pass. Perks all over Siem Reap.",
  description: "$20, one-time payment. A perk at every partner venue.",
};

/**
 * Figma « 11 · Pass · argumentaire » (57:197) et « 11.1 · Pass · le pass » (57:321) : une
 * seule page, deux états (VIS-5). L'en-tête est celui de l'accueil, avec son retour (VIS-27).
 *
 * Tout ce qui dépend de « ai-je un pass ? » est dans l'îlot : le serveur ne sait pas répondre
 * à cette question, elle est portée par le navigateur du visiteur (VIS-2).
 */
export default function PassPage() {
  return (
    <div className={styles.shell}>
      <SiteHeader hasBack />
      <PassPageIsland />
    </div>
  );
}
