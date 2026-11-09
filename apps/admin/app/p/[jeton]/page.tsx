import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdvantageCard } from "./_composants/advantage-card";
import { Badge } from "./_composants/badge";
import { classesBouton } from "./_composants/bouton";
import { DetailItem } from "./_composants/detail-item";
import { MobileTopBar } from "./_composants/mobile-top-bar";
import { PhotoThumb } from "./_composants/photo-thumb";
import { lirePartenaireParJeton } from "./_composants/partenaire";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Your venue — SiemPass",
  description: "Your SiemPass partner page.",
};

/** La fiche se lit en base à chaque ouverture : le back-office vient peut-être de la changer. */
export const dynamic = "force-dynamic";

type ProprietesPage = {
  readonly params: Promise<{ readonly jeton: string }>;
};

/**
 * Figma « 06 · Fiche partenaire · lecture seule » (7:474).
 *
 * Tous les champs sont en lecture seule, l'avantage compris (PART-6, DEMO-5) : pas un seul
 * `input` sur cet écran, et c'est la règle, pas un oubli.
 */
export default async function FichePartenairePage({ params }: ProprietesPage) {
  const { jeton } = await params;
  const partenaire = await lirePartenaireParJeton(jeton);

  if (partenaire === null) {
    notFound();
  }

  return (
    <div className={styles.ecran}>
      <MobileTopBar context="Partner area" />
      <main className={styles.contenu}>
        <header className={styles.entete}>
          <h1 className={styles.titre}>{partenaire.lieu_nom}</h1>
          <Badge state={partenaire.etat} />
        </header>

        <section className={styles.section}>
          <h2 className={styles.sousTitre}>What you offer</h2>
          <AdvantageCard label="For SiemPass holders" avantage={partenaire.avantage} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sousTitre}>Your venue</h2>
          <div className={styles.photo}>
            <p className={styles.photoLabel}>Photo</p>
            {/* FIGMA-MANQUANT: aucun nœud ne montre la vraie photo du lieu, seulement la
                vignette de remplacement. `lieu_photo` n'est donc pas encore rendue ici
                (PART-10 ne couvre que le cas « pas de photo »). Attend Alex. */}
            <PhotoThumb />
          </div>
          <DetailItem label="Address" value={partenaire.lieu_adresse} />
          <DetailItem label="Short description" value={partenaire.lieu_description} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sousTitre}>Your contact</h2>
          <DetailItem
            label="Name"
            value={`${partenaire.contact_prenom} ${partenaire.contact_nom}`}
          />
          <DetailItem label="Phone" value={partenaire.contact_telephone} />
          <DetailItem label="Email" value={partenaire.contact_email ?? "—"} />
        </section>

        <p className={styles.note}>Something to fix? Message the SiemPass team.</p>

        <Link
          href={`/p/${jeton}/scan`}
          className={classesBouton({ tone: "primary", size: "lg", pleineLargeur: true })}
        >
          Scan a pass
        </Link>
      </main>
    </div>
  );
}
