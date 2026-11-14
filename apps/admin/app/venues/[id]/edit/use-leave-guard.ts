"use client";

import { useCallback, useEffect, useState } from "react";

export type LeaveGuard = {
  /** Une sortie attend la réponse à « Leave without saving? ». */
  readonly isAsking: boolean;
  /** Retient la sortie demandée et ouvre la question. */
  readonly askToLeave: (leave: () => void) => void;
  /** « Leave » : la sortie retenue a lieu. */
  readonly confirmLeave: () => void;
  /** « Stay » : la sortie retenue est oubliée. */
  readonly cancelLeave: () => void;
};

/**
 * VEN-26, élargi par Ghya le 15/11 : avec des modifications non enregistrées, toute sortie de
 * l'éditeur demande confirmation. « Back to venues » et les liens de la barre latérale passent par
 * `askToLeave` (la boîte « Leave without saving? ») ; fermer ou recharger l'onglet, que le
 * navigateur seul peut interrompre, reçoit sa confirmation native.
 */
export function useLeaveGuard(hasUnsavedChanges: boolean): LeaveGuard {
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }
    const confirmTabExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Exigé par les navigateurs qui ignorent encore `preventDefault` ici.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", confirmTabExit);
    return () => {
      window.removeEventListener("beforeunload", confirmTabExit);
    };
  }, [hasUnsavedChanges]);

  const askToLeave = useCallback((leave: () => void) => {
    setPendingLeave(() => leave);
  }, []);

  const confirmLeave = useCallback(() => {
    setPendingLeave(null);
    pendingLeave?.();
  }, [pendingLeave]);

  const cancelLeave = useCallback(() => {
    setPendingLeave(null);
  }, []);

  return { isAsking: pendingLeave !== null, askToLeave, confirmLeave, cancelLeave };
}
