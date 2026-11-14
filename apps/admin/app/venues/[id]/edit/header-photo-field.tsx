"use client";

import { memo, type FC } from "react";
import type { HeaderPhoto } from "./article";
import { IconImage, IconPencil } from "./icons";
import { UploadFailed } from "./upload-failed";
import { usePhotoPicker } from "./use-photo-picker";
import styles from "./header-photo-field.module.css";

/** Côté de l'icône photo du cadre vide (125:36) et du crayon (125:43). */
const FRAME_ICON_SIZE = 24 as const;
const PENCIL_SIZE = 18 as const;

export type HeaderPhotoFieldProps = {
  readonly headerPhoto: HeaderPhoto;
  readonly onPick: (file: File) => void;
  readonly onRetry: () => void;
};

/**
 * Figma `HeaderPhotoField` (125:83). La variante `state` (empty, filled, uploadFailed) n'est pas
 * une prop : elle se déduit de la photo et de son envoi, pour qu'aucun état impossible ne
 * s'écrive. Le cadre a le ratio 3:2 de l'en-tête de la fiche publique (VEN-14), en plus petit
 * (288 × 192 contre 390 × 260) ; le crayon est hors du cadre, à droite.
 */
export const HeaderPhotoField: FC<HeaderPhotoFieldProps> = memo(function HeaderPhotoField({
  headerPhoto,
  onPick,
  onRetry,
}) {
  const picker = usePhotoPicker(onPick);
  const { url, upload } = headerPhoto;
  // FIGMA-MANQUANT: aucun état « envoi en cours » n'est dessiné. Placeholder : le cadre s'atténue
  // et se déclare occupé, sans texte inventé.
  const isUploading = upload.status === "uploading";
  // Sans fichier gardé (premier envoi jamais lancé), « Try again » rouvre le sélecteur.
  const retry = upload.status === "failed" ? onRetry : picker.open;

  return (
    <div className={styles.field}>
      <input {...picker.inputProps} />
      <div className={styles.row}>
        {url === null ? (
          <button
            className={styles.empty}
            type="button"
            onClick={picker.open}
            aria-busy={isUploading}
            data-uploading={isUploading}
          >
            <IconImage size={FRAME_ICON_SIZE} />
            <span className={styles.emptyLabel}>Add photo</span>
          </button>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- même parti que VenuePhoto : la photo vient du bucket Supabase, hôte non déclaré à next/image. */}
            <img
              className={styles.photo}
              src={url}
              alt=""
              aria-busy={isUploading}
              data-uploading={isUploading}
            />
            {/* FIGMA-MANQUANT: le crayon n'a pas de libellé ; nom accessible « Change photo », non affiché. */}
            <button className={styles.pencil} type="button" onClick={picker.open} aria-label="Change photo">
              <IconPencil size={PENCIL_SIZE} />
            </button>
          </>
        )}
      </div>
      {upload.status === "failed" ? <UploadFailed onRetry={retry} /> : null}
    </div>
  );
});
