"use client";

import { useId, useState } from "react";
import { Button } from "./Button";
import { PaymentOption } from "./PaymentOption";
import { useFocusTrap } from "./use-focus-trap";
import { useSheet } from "./use-sheet";
import styles from "./PaymentSheet.module.css";

/** Libellés exacts des cadres 57:218 et 57:268, et de la spec (bloc 3, VIS-15). */
const TITRE = "Payment" as const;
const RECAPITULATIF_LIBELLE = "SiemPass pass" as const;
const RECAPITULATIF_MONTANT = "$20" as const;
const PAYER = "Pay $20" as const;
const REESSAYER = "Try again" as const;
const MENTION = "Secure payment by ABA PayWay." as const;
const ECHEC_TITRE = "Payment didn't go through" as const;
const ECHEC_CORPS = "No pass was created. You have not been charged." as const;

/** Les trois moyens du cadre `methods` (I71:234;56:13), dans l'ordre de la maquette. */
const MOYENS = [
  { nom: "KHQR", detail: "Scan with your banking app" },
  { nom: "ABA Pay", detail: "Open the ABA Mobile app" },
  { nom: "Bank card", detail: "Visa, Mastercard, UnionPay, JCB" },
] as const;

type Moyen = (typeof MOYENS)[number]["nom"];

/** KHQR est le moyen sélectionné sur les trois cadres de la feuille. */
const MOYEN_PAR_DEFAUT: Moyen = "KHQR";

/**
 * Ce qui a empêché le paiement d'aboutir. `declined` est l'état `declined` du Figma (57:268) ;
 * `unavailable` est la panne technique, que le Figma ne dessine pas.
 */
export type PaymentFailure =
  | { readonly kind: "declined" }
  | { readonly kind: "unavailable"; readonly detail: string };

/**
 * Figma `PaymentSheet` (56:75) — « Feuille de paiement ouverte par-dessus la page pass (VIS-8,
 * jamais une page). state=choose : moyens de paiement et « Pay $20 ». state=declined : l'échec
 * remplace le bouton (VIS-15). »
 *
 * La propriété Figma `state` se déduit de `failure` : absent, c'est `choose` ; présent, c'est
 * `declined`. `busy` est, lui, l'état `loading` du `Button` du cadre « paiement en cours »
 * (71:358) : la feuille ne change pas, seul son bouton attend (VIS-31).
 */
export type PaymentSheetProps = {
  readonly open: boolean;
  readonly busy: boolean;
  readonly failure: PaymentFailure | null;
  readonly onPay: () => void;
  readonly onClose: () => void;
};

export function PaymentSheet({ open, busy, failure, onPay, onClose }: PaymentSheetProps) {
  const [moyen, setMoyen] = useState<Moyen>(MOYEN_PAR_DEFAUT);
  const titreId = useId();
  const { rootRef, sheetRef, dragHandlers } = useSheet({ open, onClose });

  useFocusTrap(sheetRef, open);

  // La feuille reste montée, fermée comme ouverte : c'est ce qui lui permet de redescendre
  // jusqu'au bout quand la page est déjà passée au pass (VIS-9), et ce qui évite d'avoir à
  // compter les frames à l'ouverture. Fermée, `visibility: hidden` la retire du clavier et
  // des lecteurs d'écran, une fois sa descente finie.
  return (
    <div className={styles.root} ref={rootRef} data-open={open}>
      {/* Le fond ferme la feuille, comme la touche Échap et le glissement vers le bas. Il n'est
          pas annonçable : les mêmes sorties existent au clavier et au lecteur d'écran. */}
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
      <div
        className={styles.sheet}
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        tabIndex={-1}
        {...dragHandlers}
      >
        {/* Bloc `grabberRow` (I71:234;56:7) : la barre dit que la feuille se tire. Le geste,
            lui, est pris sur toute la feuille, pas seulement sur elle. */}
        <div className={styles.grabberRow}>
          <div className={styles.grabber} />
        </div>

        <h2 className={styles.title} id={titreId}>
          {TITRE}
        </h2>

        <div className={styles.summary}>
          <span>{RECAPITULATIF_LIBELLE}</span>
          <span>{RECAPITULATIF_MONTANT}</span>
        </div>

        <div className={styles.methods} role="radiogroup" aria-labelledby={titreId}>
          {MOYENS.map((option) => (
            <PaymentOption
              key={option.nom}
              label={option.nom}
              detail={option.detail}
              selected={option.nom === moyen}
              onSelect={() => {
                setMoyen(option.nom);
              }}
            />
          ))}
        </div>

        <div className={styles.action}>
          <PaymentFailureBlock failure={failure} />
          <Button
            label={failure === null ? PAYER : REESSAYER}
            size="lg"
            tone="primary"
            fullWidth
            state={busy ? "loading" : "default"}
            onClick={onPay}
          />
          <p className={styles.notice}>{MENTION}</p>
        </div>
      </div>
    </div>
  );
}

type PaymentFailureBlockProps = { readonly failure: PaymentFailure | null };

/**
 * L'échec s'affiche dans la feuille, qui reste ouverte, et aucun pass n'est créé (VIS-15).
 * Il reste affiché pendant la nouvelle tentative : la feuille garde ainsi sa hauteur du début
 * à la fin de l'attente (VIS-34).
 */
function PaymentFailureBlock({ failure }: PaymentFailureBlockProps) {
  if (failure === null) {
    return null;
  }
  return (
    <div className={styles.error} role="alert">
      <p className={styles.errorTitle}>{ECHEC_TITRE}</p>
      <p className={styles.errorBody}>{corpsDeLEchec(failure)}</p>
    </div>
  );
}

/**
 * FIGMA-MANQUANT: seul le refus de la banque est maquetté (57:268). Quand c'est la fonction
 * d'achat qui est injoignable, on ne sait pas si quelque chose a été débité : la phrase du
 * Figma, « You have not been charged. », deviendrait une affirmation que personne ne peut
 * tenir. Le détail technique prend donc sa place, le temps que Ghya tranche ce cas.
 */
function corpsDeLEchec(failure: PaymentFailure): string {
  return failure.kind === "declined" ? ECHEC_CORPS : failure.detail;
}
