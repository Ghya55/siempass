"use client";

import Link from "next/link";
import { memo, type FC, type MouseEvent } from "react";
import type { EtatPartenaire } from "@siempass/db";
import { Badge } from "../../../components/badge";
import { Button } from "../../../components/button";
import { Icon } from "@siempass/core-icons";
import styles from "./editor-header.module.css";

const CHEVRON_SIZE = 16 as const;

/** « Back to venues » mène à la page Venues (partie 2 de specs/venues.md). */
export const VENUES_PATH = "/venues" as const;

export type EditorHeaderProps = {
  readonly name: string;
  /** Variante Figma `state` (brouillon, enLigne). */
  readonly state: EtatPartenaire;
  readonly isSaveDisabled: boolean;
  readonly onSave: () => void;
  /** Reçoit le clic sur « Back to venues » : l'écran l'arrête s'il faut demander (VEN-26). */
  readonly onBack: (event: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Figma `EditorHeader` (125:259) : « Back to venues », le nom du lieu (non modifiable ici),
 * l'état, « Save » (bloc 4 de la spec).
 */
export const EditorHeader: FC<EditorHeaderProps> = memo(function EditorHeader({
  name,
  state,
  isSaveDisabled,
  onSave,
  onBack,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.lead}>
        <Link className={styles.back} href={VENUES_PATH} onClick={onBack}>
          <Icon name="chevron-left" size={CHEVRON_SIZE} />
          Back to venues
        </Link>
        <span className={styles.divider} aria-hidden="true" />
        <h1 className={styles.name}>{name}</h1>
        <Badge state={state} />
      </div>
      {/* FIGMA-MANQUANT: aucun état « enregistrement en cours » ni « enregistré » n'est dessiné.
          Placeholder : « Save » est désactivé pendant l'enregistrement et pendant un envoi de photo. */}
      <Button label="Save" tone="secondary" onClick={onSave} disabled={isSaveDisabled} />
    </header>
  );
});
