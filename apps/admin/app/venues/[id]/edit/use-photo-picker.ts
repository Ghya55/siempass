"use client";

import { useCallback, useMemo, useRef, type ChangeEvent, type RefObject } from "react";

export type PhotoPicker = {
  /** À poser sur un `<input type="file">` caché. */
  readonly inputProps: {
    readonly ref: RefObject<HTMLInputElement | null>;
    readonly type: "file";
    readonly accept: string;
    readonly hidden: true;
    readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  };
  readonly open: () => void;
};

/** Images seulement : le bucket sert des photos. */
const ACCEPT = "image/*" as const;

/**
 * Le sélecteur de fichier d'une photo : « Add photo », le crayon, et « Try again » quand le
 * fichier n'est plus là. Le champ est vidé après chaque choix, pour que choisir deux fois le même
 * fichier relance l'envoi.
 */
export function usePhotoPicker(onPick: (file: File) => void): PhotoPicker {
  const ref = useRef<HTMLInputElement | null>(null);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      event.currentTarget.value = "";
      if (file !== undefined) {
        onPick(file);
      }
    },
    [onPick],
  );

  const open = useCallback(() => {
    ref.current?.click();
  }, []);

  const inputProps = useMemo(
    () => ({ ref, type: "file" as const, accept: ACCEPT, hidden: true as const, onChange }),
    [onChange],
  );

  return { inputProps, open };
}
