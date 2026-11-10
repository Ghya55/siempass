import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseClient } from "@siempass/db";
import { classesBouton } from "@/app/buy/_composants/bouton";
import { formatPassDate } from "@/app/ui/pass-date";
import { SiteHeader } from "@/app/ui/SiteHeader";
import { QrCode } from "./_composants/qr-code";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Your SiemPass",
  description: "Show this QR code at the counter of a partner venue.",
};

/** Le pass se lit en base à chaque affichage : rien n'est mis en cache, le code est unique. */
export const dynamic = "force-dynamic";

/** Côté du QR dans le Figma (5:73). */
const TAILLE_QR = 200 as const;

type ProprietesPage = {
  readonly params: Promise<{ readonly code: string }>;
};

// Figma « 09.3 · Pass · votre pass » (7:710).
export default async function PassPage({ params }: ProprietesPage) {
  const { code } = await params;

  const supabase = createSupabaseClient();
  const { data: pass, error } = await supabase
    .from("passes")
    .select("code, valide_jusqu_au")
    .eq("code", code)
    .maybeSingle();

  if (error !== null || pass === null) {
    notFound();
  }

  return (
    <div className={styles.ecran}>
      <SiteHeader />
      <main className={styles.contenu}>
        <header className={styles.entete}>
          <h1 className={styles.titre}>Your pass is ready</h1>
          <p className={styles.lead}>Payment received. Keep this page open at the counter.</p>
        </header>

        <section className={styles.carte}>
          <div className={styles.haut}>
            <span className={styles.marque}>SiemPass</span>
            <span className={styles.gamme}>Siem Reap Pass</span>
          </div>

          <div className={styles.cadreQr}>
            <QrCode valeur={pass.code} taille={TAILLE_QR} />
          </div>

          <p className={styles.code}>{pass.code}</p>

          <div className={styles.validite}>
            <p className={styles.jusquAu}>Valid until {formatPassDate(pass.valide_jusqu_au)}</p>
            {/* DEMO-9 : toute date affichée porte sa mention de provisoire, tant que la durée
                de validité n'est pas tranchée (« Ouvert pour Ghya » 2 des deux specs). */}
            <p className={styles.provisoire}>Validity period not final</p>
          </div>

          <p className={styles.consigne}>
            Show this QR code at the counter of a partner venue.
          </p>
        </section>

        <Link
          href="/places"
          className={classesBouton({ tone: "secondary", size: "lg", pleineLargeur: true })}
        >
          See partner venues
        </Link>
      </main>
    </div>
  );
}
