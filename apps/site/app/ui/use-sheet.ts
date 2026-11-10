"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Le mouvement de la feuille de paiement (VIS-30, VIS-33).
 *
 * Quatre règles tiennent tout le fichier :
 *
 * 1. **Une seule grandeur, `--ouverture`** (0 = fermée, 1 = grande ouverte), posée sur la
 *    racine. La feuille en déduit son `translateY`, le fond son `opacity` : l'assombrissement
 *    ne peut donc pas se désynchroniser de la position, il en est calculé. Hors geste, les
 *    deux reviennent à leurs valeurs d'état et se transitionnent sur la même durée et la même
 *    courbe (`--duree-feuille`, `--ease-sortie`), ce qui est la même corrélation par un autre
 *    chemin. Tout est dans `PaymentSheet.module.css`, y compris le 55 % du fond : ce hook ne
 *    connaît aucune valeur d'apparence.
 * 2. **Jamais d'état React pendant le geste.** Le doigt écrit `--ouverture` directement sur le
 *    nœud ; React ne rend rien entre `pointerdown` et `pointerup`. Le hook n'a d'ailleurs
 *    aucun état du tout : la feuille reste montée, et c'est `data-open` qui la fait monter,
 *    descendre, puis disparaître du clavier et des lecteurs d'écran.
 * 3. **Transform et opacity, rien d'autre.** Aucune hauteur, aucune position animée, donc
 *    aucune mise en page recalculée à 60 Hz.
 * 4. **Le pointeur n'est pris qu'une fois le seuil franchi**, sinon un appui sur « Pay $20 »
 *    deviendrait un glissement d'un pixel et le bouton ne recevrait jamais son clic.
 */

/**
 * Distance (px) à parcourir vers le bas avant que le geste ne devienne un glissement. En deçà,
 * c'est un appui : la feuille ne bouge pas et le bouton touché reçoit bien son clic. Au-delà,
 * la feuille prend le pointeur, et le clic n'a plus lieu — on ne paie pas en voulant fermer.
 */
const SEUIL_GLISSEMENT = 6;

/** Part de la hauteur de la feuille au-delà de laquelle on lâche : en deçà, elle remonte. */
const FRACTION_FERMETURE = 0.3;

/**
 * Vitesse de chute (px/ms) qui ferme même sans avoir atteint la fraction ci-dessus : c'est le
 * geste bref et net. Il faut tout de même avoir descendu `COURSE_MINIMALE` : sinon un
 * tressaillement du doigt au moment du relâché ferait partir la feuille, alors que la règle est
 * que relâchée trop haut, elle revient en place (VIS-33).
 */
const VITESSE_FERMETURE = 0.8;
const COURSE_MINIMALE = 24;

export type SheetHandle = {
  readonly rootRef: React.RefObject<HTMLDivElement | null>;
  readonly sheetRef: React.RefObject<HTMLDivElement | null>;
  readonly dragHandlers: {
    readonly onPointerDown: React.PointerEventHandler<HTMLDivElement>;
    readonly onPointerMove: React.PointerEventHandler<HTMLDivElement>;
    readonly onPointerUp: React.PointerEventHandler<HTMLDivElement>;
    readonly onPointerCancel: React.PointerEventHandler<HTMLDivElement>;
  };
};

export type UseSheetOptions = {
  readonly open: boolean;
  readonly onClose: () => void;
};

type Geste = {
  readonly pointerId: number;
  readonly departY: number;
  /** Relevée une fois, au `pointerdown` : la relire à chaque frame forcerait une mise en page. */
  readonly hauteur: number;
  dernierY: number;
  dernierInstant: number;
  /** Vitesse de la dernière portion du geste, en px/ms. Mesurée au fil des `pointermove` :
      la relever entre le dernier mouvement et le relâché donnerait toujours zéro. */
  vitesse: number;
  /** Faux tant que le seuil n'est pas franchi : le geste est encore un appui, pas un glissement. */
  actif: boolean;
};

export function useSheet({ open, onClose }: UseSheetOptions): SheetHandle {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const geste = useRef<Geste | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("keydown", surTouche);
    };
  }, [open, onClose]);

  const onPointerDown = useCallback<React.PointerEventHandler<HTMLDivElement>>((evenement) => {
    const feuille = sheetRef.current;
    if (feuille === null || !evenement.isPrimary) {
      return;
    }
    geste.current = {
      pointerId: evenement.pointerId,
      departY: evenement.clientY,
      hauteur: feuille.offsetHeight,
      dernierY: evenement.clientY,
      dernierInstant: evenement.timeStamp,
      vitesse: 0,
      actif: false,
    };
  }, []);

  const onPointerMove = useCallback<React.PointerEventHandler<HTMLDivElement>>((evenement) => {
    const encours = geste.current;
    const racine = rootRef.current;
    if (encours === null || racine === null || evenement.pointerId !== encours.pointerId) {
      return;
    }
    const duree = evenement.timeStamp - encours.dernierInstant;
    if (duree > 0) {
      encours.vitesse = (evenement.clientY - encours.dernierY) / duree;
    }
    encours.dernierY = evenement.clientY;
    encours.dernierInstant = evenement.timeStamp;

    if (!encours.actif) {
      if (evenement.clientY - encours.departY < SEUIL_GLISSEMENT) {
        return;
      }
      encours.actif = true;
      sheetRef.current?.setPointerCapture(encours.pointerId);
      racine.setAttribute("data-dragging", "true");
    }
    // Vers le haut, la feuille ne suit pas : elle est déjà grande ouverte.
    racine.style.setProperty("--ouverture", String(ouvertureDepuis(encours, evenement.clientY)));
  }, []);

  const terminerGeste = useCallback(
    (clientY: number, pointerId: number) => {
      const encours = geste.current;
      const racine = rootRef.current;
      if (encours === null || racine === null || pointerId !== encours.pointerId) {
        return;
      }
      geste.current = null;
      if (!encours.actif) {
        // Simple appui : rien n'a bougé, rien à reposer.
        return;
      }
      // L'attribut et la valeur partent ensemble : la transition reprend la main depuis la
      // position où le doigt a lâché, vers celle de l'état — remontée ou descente.
      racine.removeAttribute("data-dragging");
      racine.style.removeProperty("--ouverture");

      if (doitFermer(encours, clientY)) {
        onClose();
      }
    },
    [onClose],
  );

  const onPointerUp = useCallback<React.PointerEventHandler<HTMLDivElement>>(
    (evenement) => {
      terminerGeste(evenement.clientY, evenement.pointerId);
    },
    [terminerGeste],
  );

  const onPointerCancel = useCallback<React.PointerEventHandler<HTMLDivElement>>(
    (evenement) => {
      // Geste interrompu (appel, notification) : on repose la feuille là où elle était.
      const encours = geste.current;
      terminerGeste(encours?.departY ?? evenement.clientY, evenement.pointerId);
    },
    [terminerGeste],
  );

  return {
    rootRef,
    sheetRef,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}

/** 1 quand la feuille est à sa place, 0 quand elle est descendue de toute sa hauteur. */
function ouvertureDepuis(geste: Geste, clientY: number): number {
  const descente = Math.max(0, clientY - geste.departY);
  return Math.max(0, 1 - descente / geste.hauteur);
}

/** Assez bas, ou assez vite : deux façons de lâcher la feuille. */
function doitFermer(geste: Geste, clientY: number): boolean {
  const descente = Math.max(0, clientY - geste.departY);
  if (descente > geste.hauteur * FRACTION_FERMETURE) {
    return true;
  }
  return descente > COURSE_MINIMALE && geste.vitesse > VITESSE_FERMETURE;
}

