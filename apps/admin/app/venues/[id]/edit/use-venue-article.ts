"use client";

import { useCallback, useMemo, useState } from "react";
import {
  moveBlock,
  toEditorBlocks,
  toStoredArticle,
  UPLOAD_IDLE,
  type EditorBlock,
  type HeaderPhoto,
  type StoredArticle,
} from "./article";
import { uploadVenuePhoto } from "./upload-photo";

export type VenueArticle = {
  readonly headerPhoto: HeaderPhoto;
  readonly blocks: readonly EditorBlock[];
  /** Ce que « Save » écrirait maintenant, et ce que la preview rend (VEN-30). */
  readonly stored: StoredArticle;
  readonly isUploading: boolean;
  readonly changeHeaderPhoto: (file: File) => void;
  readonly retryHeaderPhoto: () => void;
  readonly addParagraph: () => void;
  readonly addPhoto: (file: File) => void;
  readonly changeText: (id: string, text: string) => void;
  readonly changeBlockPhoto: (id: string, file: File) => void;
  readonly retryBlockPhoto: (id: string) => void;
  readonly removeBlock: (id: string) => void;
  readonly moveBlockTo: (id: string, insertionIndex: number) => void;
};

/**
 * L'état de l'article dans l'éditeur. Rien n'est enregistré ici : chaque changement ne touche
 * que l'état local, que la preview rend aussitôt (VEN-30) ; « Save » est dans `useArticleSave`.
 *
 * Envoi d'une photo (VEN-25) : l'adresse précédente n'est remplacée qu'au succès. En échec, le
 * fichier est gardé pour « Try again » et la photo précédente reste en place. Un envoi qui revient
 * après qu'un autre l'a remplacé (ou après la suppression du bloc) est ignoré.
 */
export function useVenueArticle(venueId: string, initial: StoredArticle): VenueArticle {
  const [headerPhoto, setHeaderPhoto] = useState<HeaderPhoto>({
    url: initial.headerPhotoUrl,
    upload: UPLOAD_IDLE,
  });
  const [blocks, setBlocks] = useState<readonly EditorBlock[]>(() => toEditorBlocks(initial.blocks));

  const sendHeaderPhoto = useCallback(
    (file: File) => {
      setHeaderPhoto((current) => ({ url: current.url, upload: { status: "uploading", file } }));
      void uploadVenuePhoto(venueId, file).then((result) => {
        setHeaderPhoto((current) => {
          if (current.upload.status !== "uploading" || current.upload.file !== file) {
            return current;
          }
          return result.status === "ok"
            ? { url: result.url, upload: UPLOAD_IDLE }
            : { url: current.url, upload: { status: "failed", file } };
        });
      });
    },
    [venueId],
  );

  const retryHeaderPhoto = useCallback(() => {
    if (headerPhoto.upload.status === "failed") {
      sendHeaderPhoto(headerPhoto.upload.file);
    }
  }, [headerPhoto.upload, sendHeaderPhoto]);

  const sendBlockPhoto = useCallback(
    (id: string, file: File) => {
      setBlocks((current) => updatePhotoBlock(current, id, (block) => ({ ...block, upload: { status: "uploading", file } })));
      void uploadVenuePhoto(venueId, file).then((result) => {
        setBlocks((current) =>
          updatePhotoBlock(current, id, (block) => {
            if (block.upload.status !== "uploading" || block.upload.file !== file) {
              return block;
            }
            return result.status === "ok"
              ? { ...block, url: result.url, upload: UPLOAD_IDLE }
              : { ...block, upload: { status: "failed", file } };
          }),
        );
      });
    },
    [venueId],
  );

  const addParagraph = useCallback(() => {
    setBlocks((current) => [...current, { id: crypto.randomUUID(), kind: "paragraph", text: "" }]);
  }, []);

  const addPhoto = useCallback(
    (file: File) => {
      const id = crypto.randomUUID();
      setBlocks((current) => [...current, { id, kind: "photo", url: null, upload: UPLOAD_IDLE }]);
      sendBlockPhoto(id, file);
    },
    [sendBlockPhoto],
  );

  const changeText = useCallback((id: string, text: string) => {
    setBlocks((current) =>
      current.map((block) => (block.id === id && block.kind === "paragraph" ? { ...block, text } : block)),
    );
  }, []);

  const retryBlockPhoto = useCallback(
    (id: string) => {
      const block = blocks.find((candidate) => candidate.id === id);
      if (block?.kind === "photo" && block.upload.status === "failed") {
        sendBlockPhoto(id, block.upload.file);
      }
    },
    [blocks, sendBlockPhoto],
  );

  const removeBlock = useCallback((id: string) => {
    setBlocks((current) => current.filter((block) => block.id !== id));
  }, []);

  const moveBlockTo = useCallback((id: string, insertionIndex: number) => {
    setBlocks((current) => moveBlock(current, id, insertionIndex));
  }, []);

  const stored = useMemo(() => toStoredArticle(headerPhoto, blocks), [headerPhoto, blocks]);
  const isUploading =
    headerPhoto.upload.status === "uploading" ||
    blocks.some((block) => block.kind === "photo" && block.upload.status === "uploading");

  return {
    headerPhoto,
    blocks,
    stored,
    isUploading,
    changeHeaderPhoto: sendHeaderPhoto,
    retryHeaderPhoto,
    addParagraph,
    addPhoto,
    changeText,
    changeBlockPhoto: sendBlockPhoto,
    retryBlockPhoto,
    removeBlock,
    moveBlockTo,
  };
}

type PhotoBlock = Extract<EditorBlock, { kind: "photo" }>;

function updatePhotoBlock(
  blocks: readonly EditorBlock[],
  id: string,
  update: (block: PhotoBlock) => PhotoBlock,
): readonly EditorBlock[] {
  return blocks.map((block) => (block.id === id && block.kind === "photo" ? update(block) : block));
}
