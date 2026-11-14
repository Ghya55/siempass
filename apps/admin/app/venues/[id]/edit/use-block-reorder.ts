"use client";

import { useCallback, useState, type DragEvent, type KeyboardEvent } from "react";
import { isNoOpInsertion } from "./article";

export type BlockReorder = {
  /** Le bloc en déplacement : il laisse son emplacement en creux (`dropSlot`, Figma 128:740). */
  readonly draggedId: string | null;
  /** Où l'indicateur de dépôt s'affiche, en position d'insertion ; `null` : nulle part. */
  readonly dropIndex: number | null;
  readonly startDrag: (id: string, event: DragEvent<HTMLElement>, preview: HTMLElement | null) => void;
  readonly overBlock: (index: number, event: DragEvent<HTMLElement>) => void;
  /** Sur la liste entière : le dépôt reste permis entre deux blocs. */
  readonly overList: (event: DragEvent<HTMLElement>) => void;
  readonly drop: (event: DragEvent<HTMLElement>) => void;
  readonly endDrag: () => void;
  readonly moveWithKeyboard: (id: string, event: KeyboardEvent<HTMLElement>) => void;
};

type Params = {
  readonly blockIds: readonly string[];
  readonly onMove: (id: string, insertionIndex: number) => void;
};

/**
 * Glisser-déposer des blocs par leur poignée (VEN-13), en HTML5 natif : pas de dépendance pour
 * une liste verticale d'une dizaine de blocs, sur un back-office desktop. Le navigateur dessine
 * le bloc qui suit le pointeur (image de glisser = le bloc entier) ; l'écran dessine le creux
 * laissé et l'indicateur de dépôt. L'ordre ne change qu'au dépôt : la preview suit au dépôt, pas
 * pendant le glisser (« Ouvert pour Ghya » 9).
 *
 * Au clavier, la poignée déplace son bloc d'un cran avec les flèches haut et bas.
 */
export function useBlockReorder({ blockIds, onMove }: Params): BlockReorder {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);

  const startDrag = useCallback((id: string, event: DragEvent<HTMLElement>, preview: HTMLElement | null) => {
    event.dataTransfer.effectAllowed = "move";
    // Firefox ne lance pas le glisser sans donnée.
    event.dataTransfer.setData("text/plain", id);
    if (preview !== null) {
      // `state=dragging` du Figma : le bloc est marqué le temps que le navigateur capture
      // l'image de glisser, puis rendu à son état ; c'est cette image qui suit le pointeur.
      preview.dataset.lifted = "true";
      const handleBox = event.currentTarget.getBoundingClientRect();
      const previewBox = preview.getBoundingClientRect();
      event.dataTransfer.setDragImage(
        preview,
        handleBox.left - previewBox.left + handleBox.width / 2,
        handleBox.top - previewBox.top + handleBox.height / 2,
      );
    }
    // Après la capture de l'image de glisser : sinon le navigateur photographierait le creux.
    requestAnimationFrame(() => {
      if (preview !== null) {
        delete preview.dataset.lifted;
      }
      setDraggedId(id);
    });
  }, []);

  const overBlock = useCallback(
    (index: number, event: DragEvent<HTMLElement>) => {
      if (draggedId === null) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const box = event.currentTarget.getBoundingClientRect();
      const isLowerHalf = event.clientY > box.top + box.height / 2;
      setInsertionIndex(isLowerHalf ? index + 1 : index);
    },
    [draggedId],
  );

  const overList = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (draggedId !== null) {
        event.preventDefault();
      }
    },
    [draggedId],
  );

  const endDrag = useCallback(() => {
    setDraggedId(null);
    setInsertionIndex(null);
  }, []);

  const drop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (draggedId !== null && insertionIndex !== null) {
        onMove(draggedId, insertionIndex);
      }
      endDrag();
    },
    [draggedId, insertionIndex, onMove, endDrag],
  );

  const moveWithKeyboard = useCallback(
    (id: string, event: KeyboardEvent<HTMLElement>) => {
      const index = blockIds.indexOf(id);
      if (event.key === "ArrowUp" && index > 0) {
        event.preventDefault();
        onMove(id, index - 1);
      } else if (event.key === "ArrowDown" && index >= 0 && index < blockIds.length - 1) {
        event.preventDefault();
        onMove(id, index + 2);
      }
    },
    [blockIds, onMove],
  );

  const fromIndex = draggedId === null ? -1 : blockIds.indexOf(draggedId);
  const dropIndex =
    insertionIndex === null || fromIndex < 0 || isNoOpInsertion(fromIndex, insertionIndex) ? null : insertionIndex;

  return { draggedId, dropIndex, startDrag, overBlock, overList, drop, endDrag, moveWithKeyboard };
}
