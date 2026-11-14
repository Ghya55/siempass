import type { FC } from "react";
import { Icon } from "@siempass/core-icons";
import styles from "./form-alert.module.css";

export type FormAlertProps = {
  message: string;
};

/* Message d'erreur en haut d'un formulaire (Figma « FormAlert », 125:210 ; VEN-23). */
export const FormAlert: FC<FormAlertProps> = ({ message }) => {
  return (
    <p className={styles.alerte} role="alert">
      <Icon name="alert" size={20} />
      {message}
    </p>
  );
};
