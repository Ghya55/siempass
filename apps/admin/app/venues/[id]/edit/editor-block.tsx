"use client";

import { memo, useCallback, useRef, type ChangeEvent, type DragEvent, type FC, type KeyboardEvent } from "react";
import { assertNever, type EditorBlock as EditorBlockData } from "./article";
import { IconGrip, IconImage, IconTrash } from "./icons";
import { UploadFailed } from "./upload-failed";
import { usePhotoPicker } from "./use-photo-picker";
import styles from "./editor-block.module.css";

/** Côtés des icônes, relevés sur 125:84 et 125:118. */
const GRIP_SIZE = 20 as const;
const TRASH_SIZE = 20 as const;
const FRAME_ICON_SIZE = 24 as const;

export type EditorBlockProps = {
  readonly block: EditorBlockData;
  readonly index: number;
  /** Le bloc est en cours de déplacement : son emplacement reste en creux (`dropSlot`, 128:931). */
  readonly isDropSlot: boolean;
  readonly onTextChange: (id: string, text: string) => void;
  readonly onRemove: (id: string) => void;
  readonly onPhotoPick: (id: string, file: File) => void;
  readonly onPhotoRetry: (id: string) => void;
  readonly onDragStart: (id: string, event: DragEvent<HTMLElement>, preview: HTMLElement | null) => void;
  readonly onDragOver: (index: number, event: DragEvent<HTMLElement>) => void;
  readonly onDragEnd: () => void;
  readonly onHandleKeyDown: (id: string, event: KeyboardEvent<HTMLElement>) => void;
};

/**
 * Figma `EditorBlock` (125:194) : poignée, contenu, corbeille (VEN-13). `kind` est la variante
 * Figma ; `state=dragging` est l'image que le navigateur fait suivre au pointeur (le bloc est
 * marqué `data-lifted` le temps de la capture), `state=uploadFailed` se déduit de l'envoi.
 */
export const EditorBlock: FC<EditorBlockProps> = memo(function EditorBlock({
  block,
  index,
  isDropSlot,
  onTextChange,
  onRemove,
  onPhotoPick,
  onPhotoRetry,
  onDragStart,
  onDragOver,
  onDragEnd,
  onHandleKeyDown,
}) {
  const blockRef = useRef<HTMLDivElement | null>(null);
  const { id } = block;

  const remove = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);
  const startDrag = useCallback(
    (event: DragEvent<HTMLElement>) => {
      onDragStart(id, event, blockRef.current);
    },
    [id, onDragStart],
  );
  const dragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      onDragOver(index, event);
    },
    [index, onDragOver],
  );
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      onHandleKeyDown(id, event);
    },
    [id, onHandleKeyDown],
  );

  return (
    <div ref={blockRef} className={isDropSlot ? styles.dropSlot : styles.block} onDragOver={dragOver}>
      {/* FIGMA-MANQUANT: la poignée et la corbeille n'ont pas de libellé ; noms accessibles
          « Move block » et « Delete block », non affichés. */}
      <button
        className={styles.handle}
        type="button"
        draggable
        onDragStart={startDrag}
        onDragEnd={onDragEnd}
        onKeyDown={handleKeyDown}
        aria-label="Move block"
      >
        <IconGrip size={GRIP_SIZE} />
      </button>
      <div className={styles.content}>
        <BlockContent block={block} onTextChange={onTextChange} onPhotoPick={onPhotoPick} onPhotoRetry={onPhotoRetry} />
      </div>
      <button className={styles.remove} type="button" onClick={remove} aria-label="Delete block">
        <IconTrash size={TRASH_SIZE} />
      </button>
    </div>
  );
});

type BlockContentProps = Pick<EditorBlockProps, "block" | "onTextChange" | "onPhotoPick" | "onPhotoRetry">;

const BlockContent: FC<BlockContentProps> = ({ block, onTextChange, onPhotoPick, onPhotoRetry }) => {
  switch (block.kind) {
    case "paragraph":
      return <ParagraphInput id={block.id} text={block.text} onTextChange={onTextChange} />;
    case "photo":
      return <PhotoContent block={block} onPhotoPick={onPhotoPick} onPhotoRetry={onPhotoRetry} />;
    default:
      return assertNever(block);
  }
};

type ParagraphInputProps = {
  readonly id: string;
  readonly text: string;
  readonly onTextChange: (id: string, text: string) => void;
};

/** Zone de texte de plusieurs lignes, texte brut (VEN-4, VEN-13). */
const ParagraphInput: FC<ParagraphInputProps> = ({ id, text, onTextChange }) => {
  const change = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onTextChange(id, event.currentTarget.value);
    },
    [id, onTextChange],
  );

  // « Paragraph » est le texte du composant 125:84 : l'invite d'un paragraphe vide.
  return (
    <textarea className={styles.paragraph} value={text} onChange={change} placeholder="Paragraph" rows={1} aria-label="Paragraph" />
  );
};

type PhotoContentProps = {
  readonly block: Extract<EditorBlockData, { kind: "photo" }>;
  readonly onPhotoPick: (id: string, file: File) => void;
  readonly onPhotoRetry: (id: string) => void;
};

const PhotoContent: FC<PhotoContentProps> = ({ block, onPhotoPick, onPhotoRetry }) => {
  const { id, url, upload } = block;
  const pick = useCallback(
    (file: File) => {
      onPhotoPick(id, file);
    },
    [id, onPhotoPick],
  );
  const picker = usePhotoPicker(pick);
  const retry = useCallback(() => {
    if (upload.status === "failed") {
      onPhotoRetry(id);
    } else {
      // Photo jamais envoyée et sans fichier gardé (article rechargé) : on en choisit une.
      picker.open();
    }
  }, [id, onPhotoRetry, picker, upload.status]);

  // FIGMA-MANQUANT: aucun état « envoi en cours » ni « premier envoi en échec » (pas de photo
  // précédente) n'est dessiné. Placeholder : cadre vide atténué pendant l'envoi ; en échec sans
  // photo, cadre vide et la ligne d'échec de 125:160.
  const isUploading = upload.status === "uploading";
  const hasFailed = upload.status === "failed" || (url === null && !isUploading);

  return (
    <div className={styles.photoField}>
      <input {...picker.inputProps} />
      {url === null ? (
        <div className={styles.photoEmpty} aria-busy={isUploading} data-uploading={isUploading}>
          <IconImage size={FRAME_ICON_SIZE} />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- photo du bucket Supabase, comme VenuePhoto.
        <img className={styles.photo} src={url} alt="" aria-busy={isUploading} data-uploading={isUploading} />
      )}
      {hasFailed ? <UploadFailed onRetry={retry} /> : null}
    </div>
  );
};
