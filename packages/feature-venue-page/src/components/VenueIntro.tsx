import styles from "./VenueIntro.module.css";

/** Figma `VenueIntro` (123:81) — « Nom (h1) et tagline d'un lieu, fiche publique. » */
export type VenueIntroProps = {
  readonly name: string;
  readonly tagline: string | null;
};

export function VenueIntro({ name, tagline }: VenueIntroProps) {
  return (
    <div className={styles.intro}>
      <h1 className={styles.name}>{name}</h1>
      {tagline === null || tagline === "" ? null : <p className={styles.tagline}>{tagline}</p>}
    </div>
  );
}
