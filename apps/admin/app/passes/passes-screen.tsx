"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { CircleAlert, Ticket } from "lucide-react";
import type { EtatBadge } from "../components/badge";
import { AdminListPage, AdminShell } from "../components/admin-shell";
import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";
import { PassTicket, type PassTicketState } from "../components/pass-ticket";
import type { ResultatEcriture } from "../lib/ecriture";
import { enregistrerOffre, retourEnBrouillon } from "./actions";
import {
  etatAffiche,
  evenementsAffiches,
  lieuxAffiches,
  prixAffiche,
  validiteAffichee,
  type Choix,
  type Offre,
} from "./offre";
import { PassPanel } from "./pass-panel";
import type { OffreEnvoyee } from "./saisie-offre";
import styles from "./passes-screen.module.css";

export type PassesScreenProps = {
  offres: Offre[];
  choix: Choix;
  aujourdhui: string;
  chargementEchoue: boolean;
  /** Adresse du compte connecté, affichée dans la barre latérale. */
  adresseConnectee: string;
};

type Panneau =
  | { readonly etat: "ferme" }
  | { readonly etat: "creation" }
  | { readonly etat: "fiche"; readonly id: string };

const PANNEAU_FERME: Panneau = { etat: "ferme" };

const VARIANTE: Record<EtatBadge, PassTicketState> = {
  brouillon: "brouillon",
  "en ligne": "enLigne",
  termine: "termine",
};

/* Page « Passes » : le catalogue (238:2 cartes, 238:276 vide, 238:338 erreur de lecture). Une carte
   par pass, du plus récent au plus ancien (CAT-2) ; la fiche s'ouvre à droite. */
export const PassesScreen: FC<PassesScreenProps> = ({
  offres,
  choix,
  aujourdhui,
  chargementEchoue,
  adresseConnectee,
}) => {
  const router = useRouter();
  const [panneau, setPanneau] = useState<Panneau>(PANNEAU_FERME);
  const [enCours, setEnCours] = useState(false);
  const [erreurEcriture, setErreurEcriture] = useState<string | null>(null);

  const offreOuverte = panneau.etat === "fiche" ? (offres.find((offre) => offre.id === panneau.id) ?? null) : null;

  const ouvrir = (suivant: Panneau): void => {
    setErreurEcriture(null);
    setPanneau(suivant);
  };

  const fermer = (): void => {
    ouvrir(PANNEAU_FERME);
  };

  /* Toute écriture suit le même chemin : action serveur, puis rafraîchissement du catalogue. */
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

  /* CAT-26 : une fois créé, le panneau montre la fiche avec ses actions. */
  const creer = async (offre: OffreEnvoyee): Promise<void> => {
    const resultat = await ecrire(() => enregistrerOffre(null, offre, false));

    if (resultat.statut === "ok") {
      setPanneau({ etat: "fiche", id: resultat.id });
    }
  };

  return (
    <AdminShell
      adresse={adresseConnectee}
      panneau={
        <>
          {panneau.etat === "creation" && (
            <PassPanel
              aujourdhui={aujourdhui}
              choix={choix}
              enCours={enCours}
              erreur={erreurEcriture}
              key="creation"
              mode={{ kind: "creation" }}
              onClose={fermer}
              onSave={(offre) => {
                void creer(offre);
              }}
            />
          )}
          {offreOuverte !== null && (
            <PassPanel
              aujourdhui={aujourdhui}
              choix={choix}
              enCours={enCours}
              erreur={erreurEcriture}
              key={offreOuverte.id}
              mode={{
                kind: "fiche",
                offre: offreOuverte,
                etat: etatAffiche(offreOuverte, aujourdhui),
                onPublish: (offre) => {
                  void ecrire(() => enregistrerOffre(offreOuverte.id, offre, true));
                },
                onBackToDraft: () => {
                  void ecrire(() => retourEnBrouillon(offreOuverte.id));
                },
              }}
              onClose={fermer}
              onSave={(offre) => {
                void ecrire(() => enregistrerOffre(offreOuverte.id, offre, false));
              }}
            />
          )}
        </>
      }
    >
      <AdminListPage
        entete={
          <div className={styles.entete}>
            <h1 className={styles.titre}>Passes</h1>
            <Button
              label="Add a pass"
              onClick={() => {
                ouvrir({ etat: "creation" });
              }}
              tone="primary"
            />
          </div>
        }
      >
        {chargementEchoue && (
          <div className={styles.boite}>
            <EmptyState icon={<CircleAlert size={24} />} title="Couldn't load passes. Reload the page." />
          </div>
        )}
        {!chargementEchoue && offres.length === 0 && (
          <div className={styles.boite}>
            <EmptyState icon={<Ticket size={24} />} title="No passes yet" />
          </div>
        )}
        {!chargementEchoue && offres.length > 0 && (
          <ul className={styles.cartes}>
            {offres.map((offre) => (
              <li key={offre.id}>
                <PassTicket
                  events={evenementsAffiches(offre, choix.evenements.length)}
                  isSelected={offre.id === offreOuverte?.id}
                  name={offre.nom}
                  onClick={() => {
                    ouvrir({ etat: "fiche", id: offre.id });
                  }}
                  price={offre.prix_centimes === null ? null : prixAffiche(offre.prix_centimes)}
                  state={VARIANTE[etatAffiche(offre, aujourdhui)]}
                  validity={validiteAffichee(offre.validite_mode, offre.valide_jusqu_au, offre.validite_jours)}
                  venues={lieuxAffiches(offre, choix.lieux.length)}
                />
              </li>
            ))}
          </ul>
        )}
      </AdminListPage>
    </AdminShell>
  );
};
