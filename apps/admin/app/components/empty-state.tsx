import type { FC } from "react";
import { Icon } from "./icon-asset";
import styles from "./empty-state.module.css";

export type EmptyStateProps = {
  title: string;
};

/* État vide d'une liste (description Figma). `hasBody` est à false sur l'écran 01 : la variante
   avec corps de texte n'est pas utilisée ici, elle n'est donc pas codée. */
export const EmptyState: FC<EmptyStateProps> = ({ title }) => {
  return (
    <div className={styles.emptyState}>
      <span className={styles.icone}>
        <Icon name="pin" size={24} />
      </span>
      <p className={styles.titre}>{title}</p>
    </div>
  );
};
