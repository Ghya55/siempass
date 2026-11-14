import type { VenueBlock as VenueBlockData } from "../venue";
import { VenuePhoto } from "./VenuePhoto";
import styles from "./VenueBlock.module.css";

/**
 * Figma `VenueBlock` (123:93) — « Un bloc du contenu d'un lieu (VEN-4) : paragraphe en texte brut
 * ou photo. » Le filtrage des blocs vides (VEN-20) est fait par `VenuePage`.
 */
export type VenueBlockProps = {
  readonly block: VenueBlockData;
};

export function VenueBlock({ block }: VenueBlockProps) {
  switch (block.kind) {
    case "paragraph":
      return <p className={styles.paragraph}>{block.text}</p>;
    case "photo":
      // FIGMA-MANQUANT: aucune légende ni texte alternatif n'est prévu pour une photo d'article
      // (VEN-3, champs fermés) : image décorative, `alt` vide.
      return <VenuePhoto shape="inset" photoUrl={block.url} alt="" />;
    default:
      return assertNever(block);
  }
}

function assertNever(value: never): never {
  throw new Error(`Bloc inattendu : ${JSON.stringify(value)}`);
}
