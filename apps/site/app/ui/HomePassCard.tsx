import Link from "next/link";
import { Button } from "./Button";
import { MissingIcon } from "./MissingIcon";
import { formatPassDate } from "./pass-date";
import styles from "./HomePassCard.module.css";

/** Côtés des gabarits Figma `qr` (69:52) et `chevron` (69:54) de la carte « avec pass ». */
const TAILLE_QR = 80 as const;
const TAILLE_CHEVRON = 24 as const;

/** La page du pass, pour les trois états : la carte y mène, le bouton aussi (VIS-4). */
const LIEN_PASS = "/pass" as const;

/**
 * Texte de la propriété `pitch` du Figma, qui est aussi le libellé exact de la spec (bloc 1).
 * Il ne varie pas d'un visiteur à l'autre : constante plutôt que prop.
 */
const PROMESSE = "One pass, a perk at every partner venue." as const;

/**
 * Figma `HomePassCard` (55:131) — « Carte du pass en haut de l'accueil. state=noPass :
 * promesse + « Get the Pass ». state=hasPass : carte sombre, illustration de QR (jamais
 * scannable, VIS-3), code et validité ; toute la carte mène à la page pass (VIS-4). »
 *
 * `state` est l'axe du Figma ; `code` et `validUntil` sont les données que l'état « avec
 * pass » affiche — Figma les porte comme deux textes déjà écrits (`code`, `validity`).
 * Les trois états ont la même hauteur, fixée par la carte : l'arrivée de la réponse à
 * « ai-je un pass ? » ne décale pas la liste des lieux (VIS-31, VIS-34).
 */
export type HomePassCardProps =
  | { readonly state: "loading" }
  | { readonly state: "noPass" }
  | { readonly state: "hasPass"; readonly code: string; readonly validUntil: string };

export function HomePassCard(props: HomePassCardProps) {
  if (props.state === "loading") {
    return <CarteEnChargement />;
  }
  if (props.state === "noPass") {
    return <CarteSansPass />;
  }
  return <CarteAvecPass code={props.code} validUntil={props.validUntil} />;
}

/** Figma « 10.2 · Home · carte en chargement » (69:56) : deux barres et la place du bouton. */
function CarteEnChargement() {
  return (
    <div className={`${styles.card} ${styles.brandCard}`} aria-hidden="true">
      <div className={styles.pitchSkeleton}>
        <span className={styles.bar} />
        <span className={`${styles.bar} ${styles.barShort}`} />
      </div>
      <span className={styles.actionSkeleton} />
    </div>
  );
}

/** Figma « 10 · Home · sans pass » (55:129). */
function CarteSansPass() {
  return (
    <div className={`${styles.card} ${styles.brandCard}`}>
      <p className={styles.pitch}>{PROMESSE}</p>
      <Button label="Get the Pass" href={LIEN_PASS} size="lg" tone="primary" fullWidth />
    </div>
  );
}

type CarteAvecPassProps = { readonly code: string; readonly validUntil: string };

/** Figma « 10.1 · Home · avec pass » (55:130). Toute la carte est le lien (VIS-4). */
function CarteAvecPass({ code, validUntil }: CarteAvecPassProps) {
  return (
    <Link href={LIEN_PASS} className={`${styles.card} ${styles.passCard}`}>
      {/* VIS-3 : illustration, jamais un vrai QR. Rien n'est scannable sur l'accueil. */}
      <span className={styles.qr}>
        <MissingIcon size={TAILLE_QR} />
      </span>
      <span className={styles.details}>
        <span className={styles.heading}>Your SiemPass</span>
        <span className={styles.code}>{code}</span>
        <span className={styles.validity}>Valid until {formatPassDate(validUntil)}</span>
        {/* VIS-12 : toute date affichée porte sa mention tant que la durée n'est pas tranchée. */}
        <span className={styles.provisional}>Validity period not final</span>
      </span>
      <span className={styles.chevron}>
        <MissingIcon size={TAILLE_CHEVRON} />
      </span>
    </Link>
  );
}
