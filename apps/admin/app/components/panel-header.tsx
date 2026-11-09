"use client";

import type { FC } from "react";
import type { EtatPartenaire } from "@siempass/db";
import { Badge } from "./badge";
import { Icon } from "./icon-asset";
import styles from "./panel-header.module.css";

export type PanelHeaderProps = {
  title: string;
  subtitle: string;
  /* `null` sur la modale d'ajout : le Figma n'y montre pas de badge d'état. */
  state: EtatPartenaire | null;
  onClose: () => void;
  closeLabel: string;
};

export const PanelHeader: FC<PanelHeaderProps> = ({ title, subtitle, state, onClose, closeLabel }) => {
  return (
    <header className={styles.header}>
      <div className={styles.texte}>
        <h2 className={styles.titre}>{title}</h2>
        <p className={styles.sousTitre}>{subtitle}</p>
        {state !== null && <Badge state={state} />}
      </div>
      <button aria-label={closeLabel} className={styles.fermer} onClick={onClose} type="button">
        <Icon name="close" size={20} />
      </button>
    </header>
  );
};
