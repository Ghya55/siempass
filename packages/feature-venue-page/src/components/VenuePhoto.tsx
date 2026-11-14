import styles from "./VenuePhoto.module.css";

/**
 * Figma `VenuePhoto` (123:80) — « Photo d'un lieu (en-tête : shape=bleed ; bloc : shape=inset).
 * state=photo : la photo posée remplit le cadre. state=fallback : visuel neutre quand le lieu n'a
 * pas de photo d'en-tête (VEN-19). Jamais de légende rendue en code. »
 *
 * `state` n'est pas une prop : il se déduit de `photoUrl` (nulle = `fallback`), pour qu'une photo
 * « posée » sans adresse ne puisse pas exister.
 */
export type VenuePhotoProps = {
  readonly shape: "bleed" | "inset";
  readonly photoUrl: string | null;
  /** Texte alternatif : le nom du lieu pour l'en-tête, vide pour une photo d'article. */
  readonly alt: string;
};

export function VenuePhoto({ shape, photoUrl, alt }: VenuePhotoProps) {
  const frameClass = shape === "bleed" ? styles.bleed : styles.inset;

  if (photoUrl === null || photoUrl === "") {
    // Seul l'en-tête a un état `fallback` dessiné (123:70). Un bloc photo sans photo n'est pas
    // rendu du tout (VEN-20) : `VenueBlock` ne l'appelle pas.
    return (
      <div className={`${frameClass} ${styles.fallback}`} aria-hidden="true">
        <p className={styles.fallbackBrand}>SiemPass</p>
      </div>
    );
  }

  // Pas de `next/image` : le package sert aussi le back-office, et une photo reprise d'un
  // partenaire peut venir de n'importe quel hôte (domaines à déclarer dans chaque `next.config`).
  // La photo d'en-tête est le premier visuel de la page : chargée tout de suite.
  const isHeader = shape === "bleed";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`${frameClass} ${styles.photo}`}
      src={photoUrl}
      alt={alt}
      loading={isHeader ? "eager" : "lazy"}
      fetchPriority={isHeader ? "high" : "auto"}
      decoding="async"
    />
  );
}
