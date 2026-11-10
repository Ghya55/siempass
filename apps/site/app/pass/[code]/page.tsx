import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseClient } from "@siempass/db";
import { PassCard } from "@/app/ui/PassCard";
import { SiteHeader } from "@/app/ui/SiteHeader";
import { QrCode } from "./_composants/qr-code";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Your SiemPass",
  description: "Show this QR code at the counter of a partner venue.",
};

/** Le pass se lit en base à chaque affichage : rien n'est mis en cache, le code est unique. */
export const dynamic = "force-dynamic";

/** Côté du QR dans le gabarit `qrCode` du Figma (5:73). */
const TAILLE_QR = 200 as const;

type ProprietesPage = {
  readonly params: Promise<{ readonly code: string }>;
};

/**
 * L'adresse propre d'un pass (VIS-10). Elle affiche exactement ce que montre l'état « avec
 * pass » de `/pass` — même `PassCard`, même mise en page, cadre Figma « 11.1 · Pass · le
 * pass » (57:321) : un seul rendu du pass, pas deux à tenir d'accord.
 *
 * Ce qui la distingue : le navigateur n'adopte pas ce pass. La page ne passe pas par
 * `useBrowserPass`, elle lit la base et affiche ; l'accueil, lui, reste « sans pass »
 * (VIS-16).
 */
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
    <div className={styles.shell}>
      <SiteHeader hasBack />
      <main className={styles.stage}>
        <PassCard
          code={pass.code}
          validUntil={pass.valide_jusqu_au}
          qrCode={<QrCode valeur={pass.code} taille={TAILLE_QR} />}
        />
      </main>
    </div>
  );
}
