/**
 * Les icônes de l'éditeur, tracées à la main.
 *
 * FIGMA-MANQUANT: les SVG des icônes de l'éditeur (chevron de « Back to venues », photo, crayon,
 * poignée, corbeille, plus, alerte, renvoi) ne sont pas téléchargeables : www.figma.com est
 * refusé par le proxy de sortie des sessions de l'équipe (403, revérifié le 15/11). Tracés
 * approchés sur le screenshot, en `currentColor`, à remplacer en bloc. Même parti que
 * packages/feature-venue-page/src/components/icons.tsx.
 */
import type { FC, ReactNode } from "react";

type IconProps = {
  /** Côté en pixels, relevé sur le gabarit Figma. */
  readonly size: number;
};

type IconFrameProps = IconProps & { readonly children: ReactNode };

const TRAIT = 1.75 as const;

const IconFrame: FC<IconFrameProps> = ({ size, children }) => {
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
};

export const IconChevronLeft: FC<IconProps> = ({ size }) => {
  return (
    <IconFrame size={size}>
      <path d="M15 5l-7 7 7 7" />
    </IconFrame>
  );
};

export const IconImage: FC<IconProps> = ({ size }) => {
  return (
    <IconFrame size={size}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-5-5L5 21" />
    </IconFrame>
  );
};

export const IconPencil: FC<IconProps> = ({ size }) => {
  return (
    <IconFrame size={size}>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
    </IconFrame>
  );
};

export const IconGrip: FC<IconProps> = ({ size }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
};

export const IconTrash: FC<IconProps> = ({ size }) => {
  return (
    <IconFrame size={size}>
      <path d="M4 7h16M10 3h4M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" />
    </IconFrame>
  );
};

export const IconPlus: FC<IconProps> = ({ size }) => {
  return (
    <IconFrame size={size}>
      <path d="M12 5v14M5 12h14" />
    </IconFrame>
  );
};

export const IconAlertCircle: FC<IconProps> = ({ size }) => {
  return (
    <IconFrame size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </IconFrame>
  );
};

export const IconRefresh: FC<IconProps> = ({ size }) => {
  return (
    <IconFrame size={size}>
      <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" />
    </IconFrame>
  );
};
