import type { Metadata } from "next";
import Link from "next/link";
import { classesBouton } from "./_composants/bouton";
import { SiteHeader } from "./_composants/site-header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "The SiemPass — $20",
  description: "One pass, a perk at every partner venue in Siem Reap.",
};

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
              <IconeCoche />
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

// FIGMA-MANQUANT: le SVG `icon/check` (7:658) n'a pas pu être téléchargé — figma.com est refusé
// par le proxy de la session. Tracé approché, à remplacer par l'asset exact. Taille (20) et
// couleur (--color-status-success-fg) viennent bien de Figma, elles ne sont pas inventées.
function IconeCoche() {
  return (
    <svg
      className={styles.coche}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10.5 8 14.5 16 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
