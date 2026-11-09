"use client";

import type { FC, MouseEventHandler } from "react";
import styles from "./button.module.css";

export type ToneBouton = "primary" | "secondary";

export type ButtonProps = {
  label: string;
  tone: ToneBouton;
  /* Absent sur un bouton de type submit : c'est le formulaire qui reçoit l'envoi. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit";
};

export const Button: FC<ButtonProps> = ({ label, tone, onClick, disabled = false, type = "button" }) => {
  return (
    <button
      className={`${styles.button} ${tone === "primary" ? styles.primary : styles.secondary}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {label}
    </button>
  );
};
