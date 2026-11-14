/**
 * Les icônes de la fiche d'un lieu, tracées à la main.
 *
 * FIGMA-MANQUANT: les SVG de `icon/tag` (122:47), `icon/pin` (122:34), `icon/external-link`
 * (122:43) et `icon/clock` (122:38) ne sont pas téléchargeables :
 * `www.figma.com` est refusé par le proxy de sortie des sessions de l'équipe (403, revérifié le
 * 15/11). Tracés approchés, à la taille du gabarit Figma (20 dans `VenueInfo`), sur la couleur du
 * texte autour (`currentColor` : « Couleur surchargée par l'usage »). À remplacer en bloc.
 */
import type { ReactNode } from "react";

type IconProps = {
  /** Côté exact du gabarit Figma, en pixels. */
  readonly size: number;
};

type IconFrameProps = IconProps & { readonly children: ReactNode };

const TRAIT = 1.75 as const;

function IconFrame({ size, children }: IconFrameProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={TRAIT}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function IconTag({ size }: IconProps) {
  return (
    <IconFrame size={size}>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" />
      <circle cx="8" cy="8" r="1.5" />
    </IconFrame>
  );
}

export function IconPin({ size }: IconProps) {
  return (
    <IconFrame size={size}>
      <path d="M12 21c4-4.4 6-7.7 6-10a6 6 0 1 0-12 0c0 2.3 2 5.6 6 10Z" />
      <circle cx="12" cy="11" r="2.25" />
    </IconFrame>
  );
}

export function IconExternalLink({ size }: IconProps) {
  return (
    <IconFrame size={size}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </IconFrame>
  );
}

export function IconClock({ size }: IconProps) {
  return (
    <IconFrame size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconFrame>
  );
}
