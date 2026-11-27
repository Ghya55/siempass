import type { PassesEnVenteResult } from "@/app/lib/passes-en-vente";
import { formatEvent, formatPrice, formatValidity, formatVenues } from "./pass-offer";
import { PassOfferCard } from "./PassOfferCard";
import { SectionHeader } from "./SectionHeader";
import styles from "./PassesSection.module.css";

/** Libellé exact de la spec (bloc 4) et du Figma (240:4157). */
const TITRE = "Our passes" as const;

/**
 * Le bloc « Our passes » de l'accueil (240:4157) : une carte par pass en vente (CAT-16), du plus
 * récent au plus ancien. Sans pass en vente, le bloc entier disparaît (bloc 4).
 *
 * Une lecture en échec le fait disparaître aussi : aucun état d'erreur n'est maquetté ni écrit,
 * et la carte du pass et la liste des lieux restent utilisables. Attend Ghya (description de PR).
 */
export type PassesSectionProps = { readonly result: PassesEnVenteResult };

export function PassesSection({ result }: PassesSectionProps) {
  if (result.status === "erreur" || result.passes.length === 0) {
    return null;
  }
  return (
    <section className={styles.passes}>
      <SectionHeader title={TITRE} />
      <ul className={styles.list}>
        {result.passes.map((pass) => (
          <li key={pass.id}>
            <PassOfferCard
              events={pass.evenements.map((evenement) => formatEvent(evenement.nom, evenement.jour))}
              name={pass.nom}
              price={formatPrice(pass.prixCentimes)}
              validity={formatValidity(pass.validiteMode, pass.valideJusquAu, pass.validiteJours)}
              venues={formatVenues(pass.tousLesLieux, pass.lieuxEnLigne)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
