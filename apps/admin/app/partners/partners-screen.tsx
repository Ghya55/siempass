"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import type { EtatPartenaire } from "@siempass/db";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";
import { PartnerRow } from "../components/partner-row";
import { TableHeaderRow } from "../components/table-header-row";
import { AddPartnerDialog } from "./add-partner-dialog";
import { PartnerPanel } from "./partner-panel";
import { changerEtatPartenaire, creerPartenaire, inviterPartenaire } from "./actions";
import { lienAcces, type Partenaire, type SaisiePartenaire } from "./partenaire";
import styles from "./partners-screen.module.css";

export type PartnersScreenProps = {
  partenaires: Partenaire[];
  origineAdmin: string;
  erreurChargement: string | null;
};

export const PartnersScreen: FC<PartnersScreenProps> = ({
  partenaires,
  origineAdmin,
  erreurChargement,
}) => {
  const router = useRouter();
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [idSelectionne, setIdSelectionne] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreurEcriture, setErreurEcriture] = useState<string | null>(null);

  const selectionne = partenaires.find((partenaire) => partenaire.id === idSelectionne) ?? null;

  /* Toute écriture suit le même chemin : action serveur, puis rafraîchissement de la liste. */
  const ecrire = async (ecriture: () => Promise<{ statut: "ok" } | { statut: "erreur"; message: string }>) => {
    setEnCours(true);
    setErreurEcriture(null);
    const resultat = await ecriture();
    setEnCours(false);

    if (resultat.statut === "erreur") {
      setErreurEcriture(resultat.message);
      return false;
    }

    router.refresh();
    return true;
  };

  const enregistrer = async (saisie: SaisiePartenaire): Promise<boolean> => {
    const enregistre = await ecrire(() => creerPartenaire(saisie));

    if (enregistre) {
      setAjoutOuvert(false);
    }

    return enregistre;
  };

  const inviter = async (): Promise<void> => {
    if (selectionne !== null) {
      await ecrire(() => inviterPartenaire(selectionne.id));
    }
  };

  const changerEtat = async (etat: EtatPartenaire): Promise<void> => {
    if (selectionne !== null) {
      await ecrire(() => changerEtatPartenaire(selectionne.id, etat));
    }
  };

  return (
    <div className={styles.ecran}>
      <AdminSidebar />
      <main className={styles.principal}>
        <div className={styles.entete}>
          <h1 className={styles.titre}>Partners</h1>
          <Button
            label="Add partner"
            onClick={() => {
              setAjoutOuvert(true);
            }}
            tone="primary"
          />
        </div>
        {/* FIGMA-MANQUANT: ni l'erreur de chargement ni l'erreur d'écriture ne sont maquettées.
            Rendu sobre, mais visible : pendant la démonstration, une liste vide par erreur de
            connexion ne doit pas passer pour une liste vide. */}
        {erreurChargement !== null && <p className={styles.erreur}>{erreurChargement}</p>}
        {erreurEcriture !== null && <p className={styles.erreur}>{erreurEcriture}</p>}
        <div className={styles.tableau}>
          <TableHeaderRow />
          {partenaires.length === 0 ? (
            <EmptyState title="No partners yet" />
          ) : (
            partenaires.map((partenaire) => (
              <PartnerRow
                key={partenaire.id}
                onSelect={setIdSelectionne}
                partenaire={partenaire}
                selected={partenaire.id === idSelectionne}
              />
            ))
          )}
        </div>
      </main>
      {selectionne !== null && (
        <PartnerPanel
          enCours={enCours}
          lienAcces={lienAcces(origineAdmin, selectionne.acces_jeton)}
          onBackToDraft={() => {
            void changerEtat("brouillon");
          }}
          onClose={() => {
            setIdSelectionne(null);
          }}
          onInvite={() => {
            void inviter();
          }}
          onPublish={() => {
            void changerEtat("en ligne");
          }}
          partenaire={selectionne}
        />
      )}
      {ajoutOuvert && (
        <AddPartnerDialog
          enCours={enCours}
          onCancel={() => {
            setAjoutOuvert(false);
          }}
          onSave={enregistrer}
        />
      )}
    </div>
  );
};
