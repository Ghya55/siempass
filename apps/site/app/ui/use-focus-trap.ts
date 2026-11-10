"use client";

import { useEffect } from "react";

/**
 * Garde le clavier dans la feuille tant qu'elle est ouverte, et rend le focus d'où il venait
 * en sortant. Sans cela, la tabulation s'échappe derrière le fond assombri, sur des commandes
 * que le visiteur ne voit plus.
 */
const SELECTEUR_FOCUSABLES = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    const conteneur = containerRef.current;
    if (!active || conteneur === null) {
      return undefined;
    }

    const precedent = document.activeElement;
    // Le conteneur lui-même d'abord : la feuille s'annonce avant ses commandes, et le visiteur
    // qui tabule part de son titre plutôt que du moyen de paiement déjà choisi.
    conteneur.focus();

    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key !== "Tab") {
        return;
      }
      const focusables = listerFocusables(conteneur);
      const premier = focusables.at(0);
      const dernier = focusables.at(-1);
      if (premier === undefined || dernier === undefined) {
        evenement.preventDefault();
        return;
      }
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault();
        dernier.focus();
        return;
      }
      if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault();
        premier.focus();
      }
    };

    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("keydown", surTouche);
      if (precedent instanceof HTMLElement) {
        precedent.focus();
      }
    };
  }, [containerRef, active]);
}

function listerFocusables(conteneur: HTMLElement): readonly HTMLElement[] {
  return Array.from(conteneur.querySelectorAll<HTMLElement>(SELECTEUR_FOCUSABLES));
}
