"use client";

import { useEffect, useState, type FC } from "react";
import { Button } from "../components/button";

const DELAI_DE_CONFIRMATION_MS = 4000;

export type DeleteButtonProps = {
  disabled: boolean;
  onDelete: () => void;
};

/* ART-8 : « Delete » en deux clics. Le premier arme le bouton (« Confirm delete »), le second
   supprime ; sans second clic, le bouton se désarme seul.
   FIGMA-MANQUANT: pas de bouton destructif dans la bibliothèque : le bouton secondaire sert. */
export const DeleteButton: FC<DeleteButtonProps> = ({ disabled, onDelete }) => {
  const [arme, setArme] = useState(false);

  useEffect(() => {
    if (!arme) {
      return undefined;
    }

    const minuterie = setTimeout(() => {
      setArme(false);
    }, DELAI_DE_CONFIRMATION_MS);

    return () => {
      clearTimeout(minuterie);
    };
  }, [arme]);

  return (
    <Button
      disabled={disabled}
      label={arme ? "Confirm delete" : "Delete"}
      onClick={() => {
        if (!arme) {
          setArme(true);
          return;
        }

        setArme(false);
        onDelete();
      }}
      tone="secondary"
    />
  );
};
