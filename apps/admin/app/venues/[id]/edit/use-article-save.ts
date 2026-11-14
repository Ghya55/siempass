"use client";

import { useCallback, useState } from "react";
import { articleFingerprint, type StoredArticle } from "./article";
import { MESSAGE_ECHEC_ENREGISTREMENT } from "../../../lib/ecriture";
import { enregistrerArticle } from "./actions";

export type ArticleSave = {
  readonly save: () => void;
  readonly isSaving: boolean;
  readonly error: string | null;
  /** L'article diffère de ce qui est enregistré : « Back to venues » demande confirmation (VEN-26). */
  readonly hasUnsavedChanges: boolean;
};

/**
 * « Save » : écrit l'article et retient ce qui a été écrit. Les changements non enregistrés se
 * mesurent par comparaison avec ce dernier enregistrement, pas par un drapeau : défaire une
 * modification ramène à « rien à enregistrer ».
 */
export function useArticleSave(venueId: string, initial: StoredArticle, current: StoredArticle): ArticleSave {
  const [savedFingerprint, setSavedFingerprint] = useState(() => articleFingerprint(initial));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(() => {
    const fingerprint = articleFingerprint(current);
    setIsSaving(true);
    setError(null);
    void enregistrerArticle(venueId, current)
      .then((result) => {
        if (result.statut === "ok") {
          setSavedFingerprint(fingerprint);
        } else {
          setError(result.message);
        }
      })
      // L'action n'a pas répondu (réseau, serveur) : même message qu'un refus de la base.
      .catch(() => {
        setError(MESSAGE_ECHEC_ENREGISTREMENT);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [current, venueId]);

  return {
    save,
    isSaving,
    error,
    hasUnsavedChanges: articleFingerprint(current) !== savedFingerprint,
  };
}
