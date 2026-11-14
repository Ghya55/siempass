import { ICONS, type IconName } from "./icons";

export type IconProps = {
  readonly name: IconName;
  /** Côté en pixels, relevé sur l'instance Figma. Le trait suit l'échelle, comme dans Figma. */
  readonly size: number;
};

/**
 * Une icône du Figma, à la couleur du texte qui l'entoure (`currentColor`) : c'est l'usage qui
 * porte la couleur, comme les instances du Figma surchargent celle du composant.
 */
export function Icon({ name, size }: IconProps) {
  const { box, paths, paint } = ICONS[name];
  const peinture =
    paint.kind === "fill"
      ? { fill: "currentColor" }
      : {
          fill: "none",
          stroke: "currentColor",
          strokeWidth: paint.width,
          strokeLinecap: paint.cap,
          strokeLinejoin: paint.join,
        };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${box} ${box}`}
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
      {...peinture}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
