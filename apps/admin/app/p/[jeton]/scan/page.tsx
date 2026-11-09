import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { classesBouton } from "../_composants/bouton";
import { lirePartenaireParJeton } from "../_composants/partenaire";
import { ScannerCamera } from "./scanner-camera";
import { validerPass } from "./validation";
import type { ResultatScan } from "./validation";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Scan a pass — SiemPass",
  description: "Scan a SiemPass at the counter.",
};

/** Un scan ne se met jamais en cache : chaque passage interroge la fonction de validation. */
export const dynamic = "force-dynamic";

type ProprietesPage = {
  readonly params: Promise<{ readonly jeton: string }>;
  readonly searchParams: Promise<{ readonly code?: string }>;
};

/**
 * Écrans Figma 10.1 à 10.4, sous une seule route.
 *
 * Le code lu arrive en paramètre d'URL (`?code=…`) : la caméra n'est qu'une façon de le
 * fournir, et cette route n'affiche aucun champ de saisie (DEMO-7, DEMO-15). Conséquence
 * utile : les trois résultats sont vérifiables dans un navigateur sans appareil photo.
 */
export default async function ScanPage({ params, searchParams }: ProprietesPage) {
  const { jeton } = await params;
  const { code } = await searchParams;

  const partenaire = await lirePartenaireParJeton(jeton);
  if (partenaire === null) {
    notFound();
  }

  if (code === undefined || code === "") {
    return <ScannerCamera jeton={jeton} partner={partenaire.lieu_nom} />;
  }

  const resultat = await validerPass(code, jeton);
  return <ResultatDuScan resultat={resultat} jeton={jeton} />;
}

type ProprietesResultat = {
  readonly resultat: ResultatScan;
  readonly jeton: string;
};

/**
 * Composant Figma `ScanResult` (6:144), ses trois variantes.
 *
 * Le partenaire ne saisit rien et ne corrige rien : un seul bouton, « Scan another pass »
 * (DEMO-7).
 */
function ResultatDuScan({ resultat, jeton }: ProprietesResultat) {
  return (
    <div className={`${styles.resultat} ${styles[classeDuResultat(resultat.resultat)]}`}>
      <div className={styles.espace} />
      <PastilleResultat resultat={resultat.resultat} />

      {/* Pass valide : l'avantage en grand, AU-DESSUS du verdict (DEMO-6). Déjà utilisé :
          l'avantage n'est pas mis en avant. Invalide : le verdict seul, sans explication. */}
      {resultat.resultat === "valide" && <p className={styles.avantage}>{resultat.avantage}</p>}

      <p className={styles.verdict}>{VERDICTS[resultat.resultat]}</p>
      <div className={styles.espace} />

      <Link
        href={`/p/${jeton}/scan`}
        replace
        className={classesBouton({ tone: "primary", size: "lg", pleineLargeur: true })}
      >
        Scan another pass
      </Link>
    </div>
  );
}

/** Libellés anglais exacts du Figma (10.2 · 10.3 · 10.4). */
const VERDICTS = {
  valide: "Valid pass",
  "deja-utilise": "This pass has already been used",
  invalide: "Invalid pass",
} as const;

function classeDuResultat(resultat: ResultatScan["resultat"]): "estValide" | "estDejaUtilise" | "estInvalide" {
  switch (resultat) {
    case "valide":
      return "estValide";
    case "deja-utilise":
      return "estDejaUtilise";
    case "invalide":
      return "estInvalide";
  }
}

// FIGMA-MANQUANT: les SVG `icon/valide` (6:118), `icon/dejaUtilise` (6:128) et `icon/invalide`
// (6:138) n'ont pas pu être téléchargés — figma.com est refusé par le proxy de la session.
// Tracés approchés ; taille (40 dans une pastille de 88) et couleurs viennent de Figma.
function PastilleResultat({ resultat }: { readonly resultat: ResultatScan["resultat"] }) {
  return (
    <span className={styles.pastille}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        {resultat === "valide" && (
          <path
            d="M10 20.5 17 27.5 30 13"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {resultat === "deja-utilise" && (
          <>
            <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="3" />
            <path
              d="M20 12v8.5l5.5 3.5"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {resultat === "invalide" && (
          <path
            d="M13 13l14 14M27 13 13 27"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </span>
  );
}
