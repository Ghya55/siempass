import type { FC } from "react";
import { Icon } from "./icon-asset";
import styles from "./photo-thumb.module.css";

/* Vignette de photo de lieu : visuel de remplacement sable + icône photo (description Figma).
   Le Figma ne montre que ce remplacement — aucune variante avec une vraie photo n'est maquettée,
   et aucun partenaire n'a de photo tant que l'envoi de fichier n'est pas fait (voir Field). */
export const PhotoThumb: FC = () => {
  return (
    <span className={styles.thumb}>
      <Icon name="photo" size={24} />
    </span>
  );
};
