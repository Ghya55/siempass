"use client";

import { useEffect, useRef, type FC, type SyntheticEvent } from "react";
import { Button } from "../../../components/button";
import styles from "./leave-dialog.module.css";

export type LeaveDialogProps = {
  readonly isOpen: boolean;
  readonly onLeave: () => void;
  readonly onStay: () => void;
};

/**
 * VEN-26 : « Back to venues » avec des modifications non enregistrées demande « Leave without
 * saving? », « Leave » / « Stay ».
 *
 * FIGMA-MANQUANT: la boîte de confirmation n'est pas dessinée. Rendu volontairement sommaire :
 * `<dialog>` natif, la question, « Stay » en secondaire et « Leave » en primaire (choix du
 * placeholder, à trancher par Alex). Échap vaut « Stay ».
 */
export const LeaveDialog: FC<LeaveDialogProps> = ({ isOpen, onLeave, onStay }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const cancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onStay();
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} onCancel={cancel} aria-labelledby="leave-title">
      <p id="leave-title" className={styles.question}>
        Leave without saving?
      </p>
      <div className={styles.actions}>
        <Button label="Stay" tone="secondary" onClick={onStay} />
        <Button label="Leave" tone="primary" onClick={onLeave} />
      </div>
    </dialog>
  );
};
