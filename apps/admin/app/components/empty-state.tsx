import type { FC, ReactNode } from "react";
import { MapPin } from "lucide-react";
import styles from "./empty-state.module.css";

export type EmptyStateProps = {
  title: string;
  /* Instance swap `icon` du Figma : le calendrier des événements, l'alerte d'un échec de lecture
     (237:141, 237:212). Absent : l'épingle des lieux, comme avant. */
  icon?: ReactNode;
};

/* État vide d'une liste (description Figma). `hasBody` est à false sur l'écran 01 : la variante
   avec corps de texte n'est pas utilisée ici, elle n'est donc pas codée. */
export const EmptyState: FC<EmptyStateProps> = ({ title, icon = <MapPin size={24} /> }) => {
  return (
    <div className={styles.emptyState}>
      <span className={styles.icone}>{icon}</span>
      <p className={styles.titre}>{title}</p>
    </div>
  );
};
