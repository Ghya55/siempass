import type { FC } from "react";
import { Icon } from "@siempass/core-icons";
import styles from "./form-alert.module.css";

const ICON_SIZE = 18 as const;

export type FormAlertProps = {
  readonly message: string;
};

/**
 * Figma `FormAlert` (125:210). Ici, l'échec de « Save » : son texte n'est spécifié nulle part,
 * c'est le message renvoyé par la base (placeholder, attend Ghya). Composant local à l'éditeur :
 * le panneau de la fiche (partie 2) a le sien, en parallèle.
 */
export const FormAlert: FC<FormAlertProps> = ({ message }) => {
  return (
    <p className={styles.alert} role="alert">
      <Icon name="alert" size={ICON_SIZE} />
      {message}
    </p>
  );
};
