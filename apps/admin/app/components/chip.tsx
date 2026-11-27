"use client";

import type { FC } from "react";
import styles from "./chip.module.css";

export type ChipProps = {
  label: string;
  /* Le raccourci qui correspond au nombre saisi (« 30 days » pour 30, 234:470). */
  isSelected: boolean;
  onClick: () => void;
};

/* Figma `Chip` (raccourcis de `ValidityField`, CAT-4). */
export const Chip: FC<ChipProps> = ({ label, isSelected, onClick }) => {
  return (
    <button
      aria-pressed={isSelected}
      className={isSelected ? styles.chipChoisi : styles.chip}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
};
