import type { Metadata } from "next";
import Link from "next/link";
import { classesBouton } from "./_composants/bouton";
import { IconCheck } from "../ui/icons";
import { SiteHeader } from "../ui/SiteHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "The SiemPass — $20",
  description: "One pass, a perk at every partner venue in Siem Reap.",
};

/** Côté de `icon/check` (7:658) dans cet écran. */
const TAILLE_COCHE = 20 as const;

/** Les trois arguments du Figma 09.1 (7:656), dans l'ordre de la maquette. */
const AVANTAGES = [
  "A perk at every partner venue",
  "Your pass opens in the browser, no app needed",
  "At the counter, the venue scans it in seconds",
] as const;

// Figma « 09.1 · Pass · acheter » (7:644). Interface en anglais : DEMO-27.
export default function BuyPage() {
  return (
    <div className={styles.ecran}>
      <SiteHeader />
      <main className={styles.contenu}>
        <h1 className={styles.titre}>The SiemPass</h1>
        <p className={styles.prix}>
          <span className={styles.montant}>$20</span>
          <span className={styles.unite}>one-time payment</span>
        </p>
        <ul className={styles.avantages}>
          {AVANTAGES.map((avantage) => (
            <li key={avantage} className={styles.avantage}>
              <span className={styles.coche}>
                <IconCheck size={TAILLE_COCHE} />
              </span>
              <span>{avantage}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/buy/payment"
          className={classesBouton({ tone: "primary", size: "lg", pleineLargeur: true })}
        >
          Get the pass
        </Link>
      </main>
    </div>
  );
}
