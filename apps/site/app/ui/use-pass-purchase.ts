"use client";

import { useCallback, useState } from "react";
import { acheterPass } from "@/app/lib/achat";
import type { PaymentFailure } from "./PaymentSheet";

/**
 * L'achat vu depuis la page pass : ouvrir la feuille, payer, et ce qui se passe ensuite.
 *
 * L'ordre de la réussite compte (VIS-9, VIS-31) : le pass est adopté — donc mémorisé et relu
 * en base — pendant que le bouton attend encore, et la feuille ne redescend qu'ensuite. Le
 * visiteur ne voit donc jamais l'argumentaire réapparaître entre le paiement et son pass,
 * et aucune page n'est visitée au passage (VIS-24).
 */
export type PassPurchase = {
  readonly isSheetOpen: boolean;
  /** Le paiement est en train de se jouer : c'est le `state=loading` du bouton (71:358). */
  readonly isPaying: boolean;
  readonly failure: PaymentFailure | null;
  readonly openSheet: () => void;
  readonly closeSheet: () => void;
  readonly pay: () => void;
};

export type UsePassPurchaseOptions = {
  /** `adoptPass` du navigateur : la seule façon de mémoriser un pass acheté (VIS-2). */
  readonly onPaid: (code: string) => Promise<void>;
};

export function usePassPurchase({ onPaid }: UsePassPurchaseOptions): PassPurchase {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [failure, setFailure] = useState<PaymentFailure | null>(null);

  const openSheet = useCallback(() => {
    setFailure(null);
    setIsSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    // Fermer pendant que le paiement se joue laisserait un achat sans écran pour l'annoncer :
    // la feuille résiste au fond, à Échap et au doigt tant que la réponse n'est pas là.
    if (isPaying) {
      return;
    }
    setIsSheetOpen(false);
  }, [isPaying]);

  const pay = useCallback(() => {
    if (isPaying) {
      return;
    }
    setIsPaying(true);
    void payer({ onPaid, setFailure, setIsSheetOpen }).finally(() => {
      setIsPaying(false);
    });
  }, [isPaying, onPaid]);

  return { isSheetOpen, isPaying, failure, openSheet, closeSheet, pay };
}

type PayerOptions = UsePassPurchaseOptions & {
  readonly setFailure: (failure: PaymentFailure | null) => void;
  readonly setIsSheetOpen: (ouverte: boolean) => void;
};

async function payer({ onPaid, setFailure, setIsSheetOpen }: PayerOptions): Promise<void> {
  const resultat = await acheterPass();

  if (resultat.resultat === "paye") {
    await onPaid(resultat.code);
    setFailure(null);
    setIsSheetOpen(false);
    return;
  }
  if (resultat.resultat === "refuse") {
    // VIS-15 : la feuille reste ouverte, l'échec s'y affiche, aucun pass n'est créé.
    setFailure({ kind: "declined" });
    return;
  }
  // Rien d'autre que « erreur » ne reste : une quatrième réponse casserait ici, à la
  // compilation, plutôt que de passer pour un refus de la banque.
  setFailure({ kind: "unavailable", detail: resultat.detail });
}
