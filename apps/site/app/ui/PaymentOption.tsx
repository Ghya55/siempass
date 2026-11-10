"use client";

import { classNames } from "./class-names";
import { IconRadio } from "./icons";
import styles from "./PaymentOption.module.css";

/** Côté du gabarit `radio` du Figma (5:58 · 5:63). */
const TAILLE_RADIO = 20 as const;

/**
 * Figma `PaymentOption` (5:57 non sélectionné, 5:62 sélectionné) : `label`, `detail` et la
 * propriété booléenne `selected`.
 *
 * Deux états visuels dessinés, donc un vrai choix : un bouton radio, et non une image.
 * Ce que le moyen choisi change au paiement n'est pas encore tranché — voir `PaymentSheet`.
 */
export type PaymentOptionProps = {
  readonly label: string;
  readonly detail: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
};

export function PaymentOption({ label, detail, selected, onSelect }: PaymentOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={classNames(styles.option, selected ? styles.selected : undefined)}
      onClick={onSelect}
    >
      <span className={styles.radio}>
        <IconRadio size={TAILLE_RADIO} selected={selected} />
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.detail}>{detail}</span>
      </span>
    </button>
  );
}
