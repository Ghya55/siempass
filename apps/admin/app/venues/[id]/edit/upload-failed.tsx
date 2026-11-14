import type { FC } from "react";
import { IconAlertCircle, IconRefresh } from "./icons";
import styles from "./upload-failed.module.css";

/** Côté des icônes de la ligne d'échec, relevé sur 125:58. */
const ICON_SIZE = 16 as const;

export type UploadFailedProps = {
  readonly onRetry: () => void;
};

/**
 * La ligne d'échec d'envoi d'une photo, sous le cadre (HeaderPhotoField `state=uploadFailed`
 * 125:58, EditorBlock `kind=photo, state=uploadFailed` 125:160) : « Upload failed. » et
 * « Try again » (VEN-25, libellés exacts de VEN-18).
 */
export const UploadFailed: FC<UploadFailedProps> = ({ onRetry }) => {
  return (
    <p className={styles.line} role="alert">
      <span className={styles.message}>
        <IconAlertCircle size={ICON_SIZE} />
        Upload failed.
      </span>
      <button className={styles.retry} type="button" onClick={onRetry}>
        <IconRefresh size={ICON_SIZE} />
        <span className={styles.retryLabel}>Try again</span>
      </button>
    </p>
  );
};
