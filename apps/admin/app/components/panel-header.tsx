"use client";

import type { FC } from "react";
import { Badge, type EtatBadge } from "./badge";
import { X } from "lucide-react";
import styles from "./panel-header.module.css";

export type PanelHeaderProps = {
  title: string;
  /* `null` sur la fiche d'un lieu en création (« New venue », 157:1851), qui n'a ni adresse
     ni état à montrer. */
  subtitle: string | null;
  /* `null` sur la modale d'ajout : le Figma n'y montre pas de badge d'état. */
  state: EtatBadge | null;
  onClose: () => void;
  closeLabel: string;
};

export const PanelHeader: FC<PanelHeaderProps> = ({ title, subtitle, state, onClose, closeLabel }) => {
  return (
    <header className={styles.header}>
      <div className={styles.texte}>
        <h2 className={styles.titre}>{title}</h2>
        {subtitle !== null && <p className={styles.sousTitre}>{subtitle}</p>}
        {state !== null && <Badge state={state} />}
      </div>
      <button aria-label={closeLabel} className={styles.fermer} onClick={onClose} type="button">
        <X size={20} />
      </button>
    </header>
  );
};
