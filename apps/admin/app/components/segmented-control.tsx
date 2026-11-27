"use client";

import type { FC } from "react";
import styles from "./segmented-control.module.css";

export type SegmentedOption<Valeur extends string> = {
  readonly value: Valeur;
  readonly label: string;
};

export type SegmentedControlProps<Valeur extends string> = {
  /* Nom accessible du groupe : le libellé du champ (« Validity », « Venues »). */
  label: string;
  options: readonly SegmentedOption<Valeur>[];
  value: Valeur;
  onChange: (valeur: Valeur) => void;
};

/* Figma `SegmentedControl` (instance de `ValidityField` 234:470 et de `PickList` 234:434) : deux
   choix exclusifs, le choisi en blanc sur le fond atténué. Rendu en groupe de boutons radio. */
export const SegmentedControl = <Valeur extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<Valeur>): ReturnType<FC> => {
  return (
    <div aria-label={label} className={styles.groupe} role="radiogroup">
      {options.map((option) => {
        const choisi = option.value === value;

        return (
          <button
            aria-checked={choisi}
            className={choisi ? styles.optionChoisie : styles.option}
            key={option.value}
            onClick={() => {
              onChange(option.value);
            }}
            role="radio"
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
