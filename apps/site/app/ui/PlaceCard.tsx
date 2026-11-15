import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import styles from "./PlaceCard.module.css";

/**
 * Figma `PlaceCard` (5:43) — « Carte d'un lieu partenaire en ligne, liste des lieux du site.
 * Sans photo : visuel de remplacement (PART-10). »
 *
 * Les noms de props sont ceux du Figma : `name`, `address`, `description`, `avantage`.
 * `photoUrl` s'y ajoute : la carte du Figma ne montre que l'état sans photo. `href` aussi : la
 * carte mène à la fiche du lieu (VEN-16).
 *
 * Depuis les lieux (specs/venues.md), `description` reçoit la tagline (« Ouvert pour Ghya » 7).
 * Les textes peuvent être nuls (un lieu repris sans adresse, par exemple) : une ligne vide
 * n'est pas rendue.
 */
/** Côté de `icon/photo` dans le gabarit Figma `photo` (5:44). */
const TAILLE_ICONE_PHOTO = 32 as const;

export type PlaceCardProps = {
  readonly href: string;
  readonly name: string;
  readonly address: string | null;
  readonly description: string | null;
  readonly avantage: string | null;
  readonly photoUrl: string | null;
};

export function PlaceCard({ href, name, address, description, avantage, photoUrl }: PlaceCardProps) {
  return (
    // FIGMA-MANQUANT: aucun état survol / focus / pression de la carte cliquable n'est dessiné.
    // Seul l'anneau de focus du navigateur est gardé (accessibilité clavier).
    <Link href={href} className={styles.link}>
      <article className={styles.card}>
        <PlacePhoto name={name} photoUrl={photoUrl} />
        <div className={styles.body}>
          <h3 className={styles.name}>{name}</h3>
          {isBlank(address) ? null : <p className={styles.address}>{address}</p>}
          {isBlank(description) ? null : <p className={styles.description}>{description}</p>}
          {isBlank(avantage) ? null : (
            <p className={styles.avantage}>
              <span className={styles.avantageLabel}>With the pass:</span>
              <span>{avantage}</span>
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

function isBlank(value: string | null): value is null {
  return value === null || value.trim() === "";
}

function PlacePhoto({ name, photoUrl }: Pick<PlaceCardProps, "name" | "photoUrl">) {
  // PART-10 : un partenaire sans photo peut être en ligne, le site met un visuel de remplacement.
  // C'est l'état dessiné dans le Figma (nœud 5:44), avantage et nom gardant toute la carte.
  if (photoUrl === null || photoUrl === "") {
    return (
      <div className={styles.photoPlaceholder}>
        <ImageIcon size={TAILLE_ICONE_PHOTO} />
        <span className={styles.photoCaption}>Storefront photo</span>
      </div>
    );
  }

  // FIGMA-MANQUANT: le Figma ne dessine pas la carte avec une vraie photo, seulement l'état de
  // remplacement. Le cadre (hauteur, rayon, recadrage) reprend celui du bloc `photo` (5:44).
  // Pas de `next/image` : les domaines distants se déclarent dans `next.config.ts`, hors de
  // cette tâche, et une photo de partenaire peut venir de n'importe quel hôte.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={styles.photo} src={photoUrl} alt={name} loading="lazy" decoding="async" />;
}
