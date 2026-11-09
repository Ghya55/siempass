import Link from "next/link";
import { classesBouton } from "./bouton";
import styles from "./site-header.module.css";

/**
 * En-tête du site public, mobile — composant Figma `SiteHeader` (5:37).
 *
 * Il vit sous `buy/` parce que le découpage des fichiers de cette tâche ne donne pas de
 * dossier partagé dans `apps/site/app` ; la page du pass l'importe par `@/app/buy/...`.
 * À remonter d'un cran le jour où un dossier commun au site existe.
 */
export function SiteHeader() {
  return (
    <header className={styles.entete}>
      <Link href="/" className={styles.logo}>
        <span className={styles.marque}>SiemPass</span>
        <span className={styles.lieu}>Siem Reap, Cambodia</span>
      </Link>
      <Link href="/buy" className={classesBouton({ tone: "primary", size: "md" })}>
        The pass · $20
      </Link>
    </header>
  );
}
