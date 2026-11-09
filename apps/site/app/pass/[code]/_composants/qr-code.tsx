import qrcode from "qrcode-generator";

type ProprietesQrCode = {
  /** Ce que le scanner lira : le `code` du pass, rien d'autre. */
  readonly valeur: string;
  /** Côté du carré rendu, en pixels (200 dans le Figma 5:73). */
  readonly taille: number;
};

/** Correction d'erreur moyenne : lisible même si le téléphone est un peu sale ou de travers. */
const NIVEAU_CORRECTION = "M" as const;
/** 0 = la bibliothèque choisit la plus petite version qui contient la donnée. */
const VERSION_AUTOMATIQUE = 0 as const;

/**
 * QR code rendu sur le serveur, en SVG : pas de canvas, pas de JavaScript côté navigateur,
 * et un rendu net à n'importe quelle taille d'écran — le pass doit être lisible au soleil,
 * sur le comptoir, par un téléphone qui n'est pas celui du porteur.
 */
export function QrCode({ valeur, taille }: ProprietesQrCode) {
  const qr = qrcode(VERSION_AUTOMATIQUE, NIVEAU_CORRECTION);
  qr.addData(valeur);
  qr.make();

  const modules = qr.getModuleCount();
  let chemin = "";
  for (let ligne = 0; ligne < modules; ligne += 1) {
    for (let colonne = 0; colonne < modules; colonne += 1) {
      if (qr.isDark(ligne, colonne)) {
        chemin += `M${colonne} ${ligne}h1v1h-1z`;
      }
    }
  }

  return (
    <svg
      width={taille}
      height={taille}
      viewBox={`0 0 ${modules} ${modules}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Pass QR code ${valeur}`}
    >
      <path d={chemin} fill="currentColor" />
    </svg>
  );
}
