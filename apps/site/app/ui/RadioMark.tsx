export type RadioMarkProps = {
  /** Côté exact du gabarit Figma, en pixels. */
  readonly size: number;
  /** Propriété `selected` de `PaymentOption` (5:62 sélectionné, 5:57 non sélectionné). */
  readonly selected: boolean;
};

/**
 * `radio` de `PaymentOption`, tel que Figma l'exporte (5:58 non sélectionné, 5:63 sélectionné) :
 * un disque blanc de 20, bordé à l'intérieur — 1,5 au repos, 6 une fois choisi. La bordure prend
 * la couleur autour d'elle (`currentColor`), posée par `PaymentOption`.
 */
export function RadioMark({ size, selected }: RadioMarkProps) {
  const bordure = selected ? 6 : 1.5;

  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle
        cx="10"
        cy="10"
        r={10 - bordure / 2}
        fill="var(--color-surface-default)"
        stroke="currentColor"
        strokeWidth={bordure}
      />
    </svg>
  );
}
