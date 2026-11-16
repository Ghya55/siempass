"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { AdminListPage, AdminShell } from "../components/admin-shell";
import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";
import { PartnerRow } from "../components/partner-row";
import { TableHeaderRow } from "../components/table-header-row";
import { AddPartnerDialog } from "./add-partner-dialog";
import { PartnerPanel } from "./partner-panel";
import { cheminVenuesDuPartenaire } from "../lib/chemins";
import { creerPartenaire, inviterPartenaire } from "./actions";
import { lienAcces, type Partenaire, type SaisiePartenaire } from "./partenaire";
import styles from "./partners-screen.module.css";

export type PartnersScreenProps = {
  partenaires: Partenaire[];
  /** Nombre de lieux par identifiant de partenaire ; absent = 0 (VEN-22). */
  nombreDeLieux: Readonly<Record<string, number>>;
  origineAdmin: string;
  erreurChargement: string | null;
  /** Adresse du compte connecté, affichée dans la barre latérale. */
  adresseConnectee: string;
};

export const PartnersScreen: FC<PartnersScreenProps> = ({
  partenaires,
  nombreDeLieux,
  origineAdmin,
  erreurChargement,
  adresseConnectee,
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

  return (
    <AdminShell
      adresse={adresseConnectee}
      panneau={
        selectionne === null ? null : (
          <PartnerPanel
            enCours={enCours}
            lienAcces={lienAcces(origineAdmin, selectionne.acces_jeton)}
            onClose={() => {
              setIdSelectionne(null);
            }}
            onInvite={() => {
              void inviter();
            }}
            partenaire={selectionne}
          />
        )
      }
    >
      <AdminListPage
        entete={
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
        }
      >
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
                venueCount={nombreDeLieux[partenaire.id] ?? 0}
                venuesHref={cheminVenuesDuPartenaire(partenaire.id)}
              />
            ))
          )}
        </div>
      </AdminListPage>
      {ajoutOuvert && (
        <AddPartnerDialog
          enCours={enCours}
          onCancel={() => {
            setAjoutOuvert(false);
          }}
          onSave={enregistrer}
        />
      )}
    </AdminShell>
  );
};
