import type { ReactNode } from "react";
import { Icon } from "@siempass/core-icons";
import styles from "./VenueInfo.module.css";

/** Côté des icônes dans le gabarit Figma (19.992, arrondi). */
const TAILLE_ICONE = 20 as const;

/**
 * Figma `VenueInfo` (123:94) — « Infos pratiques d'un lieu : catégorie, adresse, « Open in Google
 * Maps », horaires. Lien Maps et horaires sont facultatifs ; catégorie absente pour un lieu repris
 * (VEN-27). »
 *
 * Les booléens Figma `hasCategory`, `hasMapsLink`, `hasHours` sont portés par la nullité de
 * `category`, `mapsUrl`, `hours` : une ligne affichée sans valeur ne peut pas exister.
 * `address` est toujours présente dans le Figma ; nulle (preview d'un brouillon), elle n'est pas
 * rendue, et le bloc entier disparaît s'il n'a plus aucune ligne.
 */
export type VenueInfoProps = {
  /** Libellé de la catégorie, déjà traduit (VEN-5). */
  readonly category: string | null;
  readonly address: string | null;
  readonly mapsUrl: string | null;
  readonly hours: string | null;
};

export function VenueInfo({ category, address, mapsUrl, hours }: VenueInfoProps) {
  const rows = [
    category === null ? null : <InfoRow key="category" icon={<Icon name="tag" size={TAILLE_ICONE} />}>{category}</InfoRow>,
    isBlank(address) ? null : <InfoRow key="address" icon={<Icon name="pin" size={TAILLE_ICONE} />}>{address}</InfoRow>,
    isBlank(mapsUrl) ? null : (
      <InfoRow key="maps" icon={<Icon name="external-link" size={TAILLE_ICONE} />} isAccent>
        <a className={styles.mapsLink} href={mapsUrl} target="_blank" rel="noopener noreferrer">
          Open in Google Maps
        </a>
      </InfoRow>
    ),
    isBlank(hours) ? null : <InfoRow key="hours" icon={<Icon name="clock" size={TAILLE_ICONE} />}>{hours}</InfoRow>,
  ].filter((row) => row !== null);

  if (rows.length === 0) {
    return null;
  }
  return <div className={styles.info}>{rows}</div>;
}

type InfoRowProps = {
  readonly icon: ReactNode;
  readonly children: ReactNode;
  readonly isAccent?: boolean;
};

function InfoRow({ icon, children, isAccent = false }: InfoRowProps) {
  return (
    <div className={styles.row}>
      <span className={isAccent ? styles.iconAccent : styles.icon}>{icon}</span>
      <div className={styles.value}>{children}</div>
    </div>
  );
}

function isBlank(value: string | null): value is null {
  return value === null || value.trim() === "";
}
