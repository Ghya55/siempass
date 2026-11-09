import type { Metadata } from "next";
import Link from "next/link";
import { classesBouton } from "../_composants/bouton";
import { SiteHeader } from "../_composants/site-header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Payment didn't go through — SiemPass",
  description: "The payment was not completed and no pass was created.",
};

type ProprietesPage = {
  readonly searchParams: Promise<{ readonly raison?: string }>;
};

// FIGMA-MANQUANT: l'écran « paiement refusé » (DEMO-13) n'existe dans aucun nœud du Figma.
// Tout ce qui suit — libellés anglais compris — est provisoire et attend Alex : la spec ne
// donne que le sens (« Le paiement n'a pas abouti »), pas le texte exact exigé par DEMO-27.
// Rendu volontairement sobre pour qu'il ne passe pas pour un écran validé.
export default async function PaymentFailedPage({ searchParams }: ProprietesPage) {
  const { raison } = await searchParams;

  return (
    <div className={styles.ecran}>
      <SiteHeader />
      <main className={styles.contenu}>
        <h1 className={styles.titre}>Payment didn&apos;t go through</h1>
        <p className={styles.lead}>No pass was created. You have not been charged.</p>
        {raison !== undefined && raison !== "" && <p className={styles.raison}>{raison}</p>}
        <Link
          href="/buy"
          className={classesBouton({ tone: "primary", size: "lg", pleineLargeur: true })}
        >
          Try again
        </Link>
      </main>
    </div>
  );
}
