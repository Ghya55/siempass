import styles from "./composants.module.css";

/** Variantes du composant Figma `Button` (5:10). Les noms des props sont ceux de Figma. */
export type TonBouton = "primary" | "secondary";
export type TailleBouton = "md" | "lg";

type OptionsBouton = {
  readonly tone?: TonBouton;
  readonly size?: TailleBouton;
  readonly pleineLargeur?: boolean;
};

/**
 * Copie de `apps/site/app/buy/_composants/bouton.tsx` : les deux apps sont deux paquets npm
 * distincts, partager ce composant demanderait un `packages/ui` qui n'existe pas et qui ne
 * fait pas partie de cette tâche. À mutualiser le jour où ce paquet est créé.
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
