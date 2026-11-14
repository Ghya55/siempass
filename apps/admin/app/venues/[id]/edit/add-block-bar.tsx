"use client";

import { memo, type FC } from "react";
import { Icon } from "@siempass/core-icons";
import { usePhotoPicker } from "./use-photo-picker";
import styles from "./add-block-bar.module.css";

const PLUS_SIZE = 16 as const;

export type AddBlockBarProps = {
  readonly onAddParagraph: () => void;
  readonly onAddPhoto: (file: File) => void;
};

/** Figma `AddBlockBar` (125:196) : « Add paragraph » et « Add photo », toujours sous le dernier bloc. */
export const AddBlockBar: FC<AddBlockBarProps> = memo(function AddBlockBar({ onAddParagraph, onAddPhoto }) {
  const picker = usePhotoPicker(onAddPhoto);

  return (
    <div className={styles.bar}>
      <input {...picker.inputProps} />
      <button className={styles.button} type="button" onClick={onAddParagraph}>
        <Icon name="plus" size={PLUS_SIZE} />
        Add paragraph
      </button>
      <button className={styles.button} type="button" onClick={picker.open}>
        <Icon name="plus" size={PLUS_SIZE} />
        Add photo
      </button>
    </div>
  );
});
