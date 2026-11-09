import styles from "./bouton.module.css";

/** Variantes du composant Figma `Button` (5:10). Les noms des props sont ceux de Figma. */
export type TonBouton = "primary" | "secondary";
export type TailleBouton = "md" | "lg";

type OptionsBouton = {
  readonly tone?: TonBouton;
  readonly size?: TailleBouton;
  readonly pleineLargeur?: boolean;
};

/**
 * Le `Button` de Figma apparaît tantôt comme lien (« Get the pass »), tantôt comme bouton de
 * formulaire (« Pay $20 »). On expose donc ses classes plutôt qu'un composant qui imposerait
 * la balise : un lien déguisé en <button> casse la navigation, l'inverse casse la soumission.
 */
export function classesBouton({
  tone = "primary",
  size = "md",
  pleineLargeur = false,
}: OptionsBouton = {}): string {
  const classes = [styles.bouton, styles[tone], styles[size]];
  if (pleineLargeur) {
    classes.push(styles.pleineLargeur);
  }
  return classes.join(" ");
}
