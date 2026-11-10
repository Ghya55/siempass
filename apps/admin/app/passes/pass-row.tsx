"use client";

import { useState, type FC } from "react";
import { Button } from "../components/button";
import { formatDateSeule, formatInstant } from "../lib/dates";
import { PassStatusBadge } from "./pass-status-badge";
import type { PassAffiche } from "./pass";
import styles from "./pass-row.module.css";

export type PassRowProps = {
  pass: PassAffiche;
  enCours: boolean;
  onRefresh: () => void;
  onDelete: () => void;
};

/**
 * Ligne du tableau des passes.
 *
 * FIGMA-MANQUANT: cet écran n'est pas maquetté (outil de test). La ligne reprend la grille, les
 * variables et les composants de la ligne des partenaires, sans rien inventer de nouveau.
 *
 * La suppression se fait en deux temps. Elle est définitive, et la base est unique pour staging
 * et la production (décision du 09/11) : un clic de travers sur le pass d'un vrai client ne doit
 * pas suffire.
 */
export const PassRow: FC<PassRowProps> = ({ pass, enCours, onRefresh, onDelete }) => {
  const [confirmation, setConfirmation] = useState(false);

  return (
    <div className={styles.ligne}>
      <span className={styles.code}>{pass.code}</span>
      <span className={styles.colonne}>{formatInstant(pass.created_at)}</span>
      <span className={styles.colonne}>{formatDateSeule(pass.valide_jusqu_au)}</span>
      <span className={styles.colonne}>
        <PassStatusBadge statut={pass.statut} />
      </span>
      <span className={styles.colonne}>
        {pass.utilise_le === null ? (
          <span className={styles.vide}>—</span>
        ) : (
          <>
            <span className={styles.principal}>{formatInstant(pass.utilise_le)}</span>
            {/* Un lieu supprimé laisse `utilise_par` à null (on delete set null) : la validation
                a bien eu lieu, mais on ne sait plus où. */}
            <span className={styles.secondaire}>{pass.lieuValidation ?? "Unknown venue"}</span>
          </>
        )}
      </span>
      <span className={styles.actions}>
        {confirmation ? (
          <>
            <Button
              disabled={enCours}
              label="Confirm"
              onClick={() => {
                setConfirmation(false);
                onDelete();
              }}
              tone="primary"
            />
            <Button
              disabled={enCours}
              label="Cancel"
              onClick={() => {
                setConfirmation(false);
              }}
              tone="secondary"
            />
          </>
        ) : (
          <>
            <Button disabled={enCours} label="Refresh" onClick={onRefresh} tone="secondary" />
            <Button
              disabled={enCours}
              label="Delete"
              onClick={() => {
                setConfirmation(true);
              }}
              tone="secondary"
            />
          </>
        )}
      </span>
    </div>
  );
};
