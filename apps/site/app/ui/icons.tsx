/**
 * Les icônes du Figma, tracées à la main.
 *
 * FIGMA-MANQUANT: aucun SVG d'icône n'est téléchargeable — `www.figma.com` est refusé par le
 * proxy de sortie des sessions de l'équipe (403 au CONNECT, revérifié le 10/11). Chaque tracé
 * ci-dessous est donc approché : ce sont des formes géométriques simples, dessinées à la taille
 * exacte du gabarit Figma et sur la couleur du texte qui les entoure (`currentColor`, comme le
 * veut la description de `icon/chevron-left` : « Couleur surchargée par l'usage »). À remplacer
 * en bloc par les SVG exacts le jour où le téléchargement passe.
 *
 * Gabarits Figma, frame `Icons` (64:11) : `icon/chevron-left` (64:12), `icon/chevron-right`
 * (64:14), `icon/arrow-right` (64:16), `icon/spinner` (64:18), `icon/qr` (64:20), tous dessinés
 * sur 24. `icon/check` (54:8) et `radio` (5:58 · 5:63) sont dessinés sur 20. `icon/photo` (5:45)
 * et `icon/pin` (5:32) n'ont pas de composant dans « 00 · Fondations » : seule leur place est
 * connue (32 et 24), leur dessin l'est encore moins que les autres.
 */
export type IconProps = {
  /** Côté exact du gabarit Figma, en pixels. */
  readonly size: number;
};

/** Épaisseur de trait des icônes linéaires, sur le gabarit de 24. */
const TRAIT = 2 as const;

type IconFrameProps = IconProps & {
  /** Côté du gabarit sur lequel le tracé est dessiné : 24 pour la frame `Icons`, 20 sinon. */
  readonly viewBoxSize: number;
  readonly children: React.ReactNode;
};

/** Le cadre commun : carré, à la taille demandée, invisible aux lecteurs d'écran. */
function IconFrame({ size, viewBoxSize, children }: IconFrameProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** FIGMA-MANQUANT: tracé approché, SVG exact à récupérer — `icon/chevron-left` (64:12). */
export function IconChevronLeft({ size }: IconProps) {
  return (
    <IconFrame size={size} viewBoxSize={24}>
      <path
        d="M15 5 8 12l7 7"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

/** FIGMA-MANQUANT: tracé approché, SVG exact à récupérer — `icon/chevron-right` (64:14). */
export function IconChevronRight({ size }: IconProps) {
  return (
    <IconFrame size={size} viewBoxSize={24}>
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

/** FIGMA-MANQUANT: tracé approché, SVG exact à récupérer — `icon/arrow-right` (64:16). */
export function IconArrowRight({ size }: IconProps) {
  return (
    <IconFrame size={size} viewBoxSize={24}>
      <path
        d="M4 12h15m-6-7 7 7-7 7"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

/**
 * FIGMA-MANQUANT: tracé approché, SVG exact à récupérer — `icon/spinner` (64:18), décrit dans
 * Figma comme « Chargement : arc 3/4. La rotation est côté développement. » L'arc fait donc
 * 270°, du haut jusqu'à la gauche ; la rotation est portée par le `Button`.
 */
export function IconSpinner({ size }: IconProps) {
  return (
    <IconFrame size={size} viewBoxSize={24}>
      <path
        d="M12 3a9 9 0 1 1-9 9"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinecap="round"
      />
    </IconFrame>
  );
}

/**
 * FIGMA-MANQUANT: tracé approché, SVG exact à récupérer — `icon/qr` (64:20). Trois repères
 * d'angle et quelques modules : une illustration, jamais quelque chose de scannable (VIS-3).
 */
export function IconQr({ size }: IconProps) {
  return (
    <IconFrame size={size} viewBoxSize={24}>
      <g stroke="currentColor" strokeWidth={TRAIT} strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </g>
      <g fill="currentColor">
        <rect x="5.5" y="5.5" width="2" height="2" />
        <rect x="16.5" y="5.5" width="2" height="2" />
        <rect x="5.5" y="16.5" width="2" height="2" />
        <rect x="14" y="14" width="3" height="3" />
        <rect x="18" y="18" width="3" height="3" />
      </g>
    </IconFrame>
  );
}

/** FIGMA-MANQUANT: tracé approché, SVG exact à récupérer — `icon/check` (54:8), gabarit de 20. */
export function IconCheck({ size }: IconProps) {
  return (
    <IconFrame size={size} viewBoxSize={20}>
      <path
        d="M4 10.5 8 14.5 16 6"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export type IconRadioProps = IconProps & {
  /** Propriété `selected` de `PaymentOption` (5:62 sélectionné, 5:57 non sélectionné). */
  readonly selected: boolean;
};

/**
 * FIGMA-MANQUANT: tracé approché, SVG exact à récupérer — `radio` de `PaymentOption`
 * (5:63 sélectionné, 5:58 non), gabarit de 20. L'anneau et la pastille prennent la couleur
 * autour d'eux : l'option sélectionnée porte déjà `--color-accent-default` sur son texte.
 */
export function IconRadio({ size, selected }: IconRadioProps) {
  return (
    <IconFrame size={size} viewBoxSize={20}>
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth={selected ? 2 : 1.5} />
      {selected ? <circle cx="10" cy="10" r="4" fill="currentColor" /> : null}
    </IconFrame>
  );
}

/**
 * FIGMA-MANQUANT: tracé approché, SVG exact à récupérer — `icon/photo` (5:45). Le composant
 * n'existe pas dans « 00 · Fondations », seule sa place (32) est connue.
 */
export function IconPhoto({ size }: IconProps) {
  return (
    <IconFrame size={size} viewBoxSize={24}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
      <path
        d="m4 17 5-5 4 4 3-3 4 4"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

/**
 * FIGMA-MANQUANT: tracé approché, SVG exact à récupérer — `icon/pin` (5:32). Le composant
 * n'existe pas dans « 00 · Fondations », seule sa place (24) est connue.
 */
export function IconPin({ size }: IconProps) {
  return (
    <IconFrame size={size} viewBoxSize={24}>
      <path
        d="M12 21c4-4.4 6-7.7 6-10a6 6 0 1 0-12 0c0 2.3 2 5.6 6 10Z"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth={TRAIT} />
    </IconFrame>
  );
}
