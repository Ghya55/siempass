import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, type IconName } from "@siempass/core-icons";
import { classesBouton } from "../_composants/bouton";
import { lirePartenaireParJeton, texteOuTiret } from "../_composants/partenaire";
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
    return <ScannerCamera jeton={jeton} partner={texteOuTiret(partenaire.lieu_nom)} />;
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

const ICONE_RESULTAT = {
  valide: "scan-valide",
  "deja-utilise": "scan-deja-utilise",
  invalide: "scan-invalide",
} as const satisfies Record<ResultatScan["resultat"], IconName>;

/** Pastille de 88 du Figma, icône de 40 (6:118 · 6:128 · 6:138). */
function PastilleResultat({ resultat }: { readonly resultat: ResultatScan["resultat"] }) {
  return (
    <span className={styles.pastille}>
      <Icon name={ICONE_RESULTAT[resultat]} size={40} />
    </span>
  );
}
