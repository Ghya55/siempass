import { BenefitRow } from "./BenefitRow";
import styles from "./PassPitch.module.css";

/**
 * Libellés exacts du Figma (57:31, 57:33, 57:34) et de la spec (bloc 2) : ils ne varient pas
 * d'un visiteur à l'autre, ce sont des constantes et non des props.
 */
const TITRE = "One pass. Perks all over Siem Reap." as const;
const PRIX = "$20," as const;
const PRIX_DETAIL = "one-time payment" as const;

/**
 * Les trois arguments du cadre `benefits` (57:35), dans l'ordre de la maquette. VIS-6 : « Un
 * quatrième argument remplacerait un des trois, il ne s'ajoute pas. »
 */
const ARGUMENTS = [
  "Pays for itself in 3 visits",
  "A perk at every partner venue",
  "No app to install: your pass opens in your browser",
] as const;

/**
 * Figma `PassPitch` (57:48) — « Corps de l'argumentaire : bande pleine largeur, titre, prix et
 * carte des arguments répartis sur la hauteur. Le bouton d'achat est posé sous la bande par
 * l'écran. »
 *
 * Aucune prop : le composant Figma n'en a aucune, tout son contenu y est écrit en dur.
 * Le titre est le `h1` de la page pass — il n'y en a qu'un, et c'est celui-là.
 */
export function PassPitch() {
  return (
    <div className={styles.passPitch}>
      <div className={styles.head}>
        <h1 className={styles.title}>{TITRE}</h1>
        <p className={styles.price}>
          <span className={styles.amount}>{PRIX}</span>
          <span className={styles.priceDetail}>{PRIX_DETAIL}</span>
        </p>
      </div>
      <ul className={styles.benefits}>
        {ARGUMENTS.map((argument) => (
          <BenefitRow key={argument} label={argument} />
        ))}
      </ul>
    </div>
  );
}
