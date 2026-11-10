import { buttonClassNames, type ButtonSize, type ButtonTone } from "@/app/ui/Button";

/** Variantes du composant Figma `Button` (5:10). Les noms des props sont ceux de Figma. */
export type TonBouton = ButtonTone;
export type TailleBouton = Extract<ButtonSize, "md" | "lg">;

type OptionsBouton = {
  readonly tone?: TonBouton | undefined;
  readonly size?: TailleBouton | undefined;
  readonly pleineLargeur?: boolean | undefined;
};

/**
 * Les classes du `Button` du socle (`app/ui/Button.tsx`), sous le nom que portent encore les
 * écrans `buy`. Ces écrans sortent du flow (VIS-10) mais restent en place tant que Ghya n'a pas
 * donné son feu vert pour les supprimer : plutôt que de garder une deuxième définition du même
 * bouton Figma, cette fonction pointe sur le socle — un seul `Button` dessiné, un seul codé.
 * Elle disparaîtra avec les écrans qu'elle sert.
 */
export function classesBouton({
  tone = "primary",
  size = "md",
  pleineLargeur = false,
}: OptionsBouton = {}): string {
  return buttonClassNames({ tone, size, fullWidth: pleineLargeur });
}
