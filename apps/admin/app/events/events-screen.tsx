"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { Calendar, CircleAlert } from "lucide-react";
import { AdminListPage, AdminShell } from "../components/admin-shell";
import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";
import { formatJour } from "../lib/dates";
import type { ResultatEcriture } from "../lib/ecriture";
import { creerEvenement, modifierEvenement } from "./actions";
import { EventPanel } from "./event-panel";
import type { EvenementAffiche, LieuChoisissable, SaisieEvenement } from "./evenement";
import styles from "./events-screen.module.css";

export type EventsScreenProps = {
  evenements: EvenementAffiche[];
  lieux: LieuChoisissable[];
  chargementEchoue: boolean;
  /** Adresse du compte connecté, affichée dans la barre latérale. */
  adresseConnectee: string;
};

type Panneau =
  | { readonly etat: "ferme" }
  | { readonly etat: "creation" }
  | { readonly etat: "fiche"; readonly id: string };

const PANNEAU_FERME: Panneau = { etat: "ferme" };

/* Page « Events » (237:2 tableau, 237:141 vide, 237:212 erreur de lecture). Même geste que
   Artists : tableau, fiche en panneau de droite ; ni suppression ni billetterie (EVT-7, EVT-18). */
export const EventsScreen: FC<EventsScreenProps> = ({
  evenements,
  lieux,
  chargementEchoue,
  adresseConnectee,
}) => {
  const router = useRouter();
  const [panneau, setPanneau] = useState<Panneau>(PANNEAU_FERME);
  const [enCours, setEnCours] = useState(false);
  const [erreurEcriture, setErreurEcriture] = useState<string | null>(null);

  const evenementOuvert =
    panneau.etat === "fiche" ? (evenements.find((evenement) => evenement.id === panneau.id) ?? null) : null;

  const ouvrir = (suivant: Panneau): void => {
    setErreurEcriture(null);
    setPanneau(suivant);
  };

  /* Toute écriture suit le même chemin : action serveur, puis rafraîchissement de la liste. */
  const ecrire = async <Resultat extends ResultatEcriture>(
    ecriture: () => Promise<Resultat>,
  ): Promise<Resultat> => {
    setEnCours(true);
    setErreurEcriture(null);
    const resultat = await ecriture();
    setEnCours(false);

    if (resultat.statut === "erreur") {
      setErreurEcriture(resultat.message);
    } else {
      router.refresh();
    }

    return resultat;
  };

  /* Bloc 3 : après « Save », le panneau montre la fiche de l'événement créé. */
  const creer = async (saisie: SaisieEvenement): Promise<void> => {
    const resultat = await ecrire(() => creerEvenement(saisie));

    if (resultat.statut === "ok") {
      setPanneau({ etat: "fiche", id: resultat.id });
    }
  };

  const fermer = (): void => {
    ouvrir(PANNEAU_FERME);
  };

  return (
    <AdminShell
      adresse={adresseConnectee}
      panneau={
        <>
          {panneau.etat === "creation" && (
            <EventPanel
              enCours={enCours}
              erreur={erreurEcriture}
              key="creation"
              lieux={lieux}
              mode={{ kind: "creation" }}
              onClose={fermer}
              onSave={(saisie) => {
                void creer(saisie);
              }}
            />
          )}
          {evenementOuvert !== null && (
            <EventPanel
              enCours={enCours}
              erreur={erreurEcriture}
              key={evenementOuvert.id}
              lieux={lieux}
              mode={{ kind: "fiche", evenement: evenementOuvert }}
              onClose={fermer}
              onSave={(saisie) => {
                void ecrire(() => modifierEvenement(evenementOuvert.id, saisie));
              }}
            />
          )}
        </>
      }
    >
      <AdminListPage
        entete={
          <div className={styles.entete}>
            <h1 className={styles.titre}>Events</h1>
            <Button
              label="Add an event"
              onClick={() => {
                ouvrir({ etat: "creation" });
              }}
              tone="primary"
            />
          </div>
        }
      >
        {chargementEchoue ? (
          <div className={styles.tableau}>
            <EmptyState icon={<CircleAlert size={24} />} title="Couldn't load events. Reload the page." />
          </div>
        ) : (
          <div className={styles.tableau}>
            <div className={styles.ligneEntete}>
              <span className={styles.colonneNom}>Event</span>
              <span className={styles.colonneDate}>Date</span>
              <span className={styles.colonne}>Venue</span>
              <span className={styles.colonne}>Perk</span>
            </div>
            {evenements.length === 0 ? (
              <EmptyState icon={<Calendar size={24} />} title="No events yet" />
            ) : (
              evenements.map((evenement) => {
                const selectionne = evenement.id === evenementOuvert?.id;

                return (
                  <button
                    aria-pressed={selectionne}
                    className={`${styles.ligne} ${selectionne ? styles.selectionnee : ""}`}
                    key={evenement.id}
                    onClick={() => {
                      ouvrir({ etat: "fiche", id: evenement.id });
                    }}
                    type="button"
                  >
                    <span className={`${styles.colonneNom} ${styles.nom}`}>{evenement.nom}</span>
                    <span className={styles.colonneDate}>{formatJour(evenement.jour)}</span>
                    <span className={styles.colonne}>{evenement.lieuNom}</span>
                    <span className={styles.colonne}>{evenement.avantage}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </AdminListPage>
    </AdminShell>
  );
};
