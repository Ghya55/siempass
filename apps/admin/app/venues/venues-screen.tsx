"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FC } from "react";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";
import type { FieldOption } from "../components/field";
import { VenueFilterBar } from "../components/venue-filter-bar";
import { VenueRow } from "../components/venue-row";
import { VenueTableHeaderRow } from "../components/venue-table-header-row";
import { CHEMIN_VENUES } from "../lib/chemins";
import { MESSAGE_ECHEC_ENREGISTREMENT } from "../lib/ecriture";
import { creerLieu, enregistrerLieu, publierLieu, repasserLieuEnBrouillon } from "./actions";
import {
  libelleDeCategorie,
  nomDuPartenaire,
  type Lieu,
  type PartenaireDuLieu,
  type ResultatLieu,
  type SaisieLieu,
} from "./lieu";
import { VenuePanel } from "./venue-panel";
import styles from "./venues-screen.module.css";

export type VenuesScreenProps = {
  lieux: Lieu[];
  partenaires: PartenaireDuLieu[];
  /** Le partenaire sur lequel la page est filtrée (VEN-15), ou `null`. */
  partenaireFiltre: PartenaireDuLieu | null;
  erreurChargement: string | null;
  /** Adresse du compte connecté, affichée dans la barre latérale. */
  adresseConnectee: string;
};

type Panneau = { readonly etat: "ferme" } | { readonly etat: "creation" } | { readonly etat: "fiche"; readonly id: string };

/* Page « Venues » (126:3 tableau, 126:137 vide, 126:195 filtrée, 126:272 filtrée sans lieu). */
export const VenuesScreen: FC<VenuesScreenProps> = ({
  lieux,
  partenaires,
  partenaireFiltre,
  erreurChargement,
  adresseConnectee,
}) => {
  const router = useRouter();
  const [panneau, setPanneau] = useState<Panneau>({ etat: "ferme" });
  const [enCours, setEnCours] = useState(false);
  const [erreurEcriture, setErreurEcriture] = useState<string | null>(null);

  const nomsDesPartenaires = useMemo(
    () => new Map(partenaires.map((partenaire) => [partenaire.id, nomDuPartenaire(partenaire)])),
    [partenaires],
  );
  const optionsDePartenaire = useMemo<FieldOption[]>(
    () => partenaires.map((partenaire) => ({ value: partenaire.id, label: nomDuPartenaire(partenaire) })),
    [partenaires],
  );

  const lieuOuvert = panneau.etat === "fiche" ? (lieux.find((lieu) => lieu.id === panneau.id) ?? null) : null;

  /* Toute écriture suit le même chemin : action serveur, puis rafraîchissement de la liste. Les
     champs manquants reviennent au panneau ; une autre erreur s'affiche au-dessus du tableau. */
  const ecrire = async (ecriture: () => Promise<ResultatLieu>): Promise<ResultatLieu> => {
    setEnCours(true);
    setErreurEcriture(null);
    const resultat = await ecriture().catch(sansReponse);
    setEnCours(false);

    if (resultat.statut === "erreur") {
      setErreurEcriture(resultat.message);
    }
    if (resultat.statut === "ok") {
      router.refresh();
    }

    return resultat;
  };

  /* VEN-37 : une fois créé, le panneau montre la fiche du lieu avec ses actions. */
  const creer = async (saisie: SaisieLieu): Promise<ResultatLieu> => {
    const resultat = await ecrire(() => creerLieu(saisie));

    if (resultat.statut === "ok") {
      setPanneau({ etat: "fiche", id: resultat.id });
    }

    return resultat;
  };

  return (
    <div className={styles.ecran}>
      <AdminSidebar adresse={adresseConnectee} />
      <main className={styles.principal}>
        <div className={styles.entete}>
          <h1 className={styles.titre}>Venues</h1>
          <Button
            label="Add a venue"
            onClick={() => {
              setPanneau({ etat: "creation" });
            }}
            tone="primary"
          />
        </div>
        {partenaireFiltre !== null && (
          <VenueFilterBar filterLabel={`Partner: ${nomDuPartenaire(partenaireFiltre)}`} showAllHref={CHEMIN_VENUES} />
        )}
        {/* FIGMA-MANQUANT: ni l'erreur de chargement ni l'erreur d'écriture ne sont maquettées
            (même rendu que Partners). */}
        {erreurChargement !== null && <p className={styles.erreur}>{erreurChargement}</p>}
        {erreurEcriture !== null && <p className={styles.erreur}>{erreurEcriture}</p>}
        <div className={styles.tableau}>
          <VenueTableHeaderRow />
          {lieux.length === 0 ? (
            /* VEN-22 : le Figma (126:272) ne met pas « Add a venue » dans l'état vide filtré ;
               c'est le bouton de l'en-tête qui ouvre la création avec ce partenaire choisi. */
            <EmptyState title={partenaireFiltre === null ? "No venues yet" : "No venues for this partner yet"} />
          ) : (
            lieux.map((lieu) => (
              <VenueRow
                category={libelleDeCategorie(lieu.categorie)}
                id={lieu.id}
                key={lieu.id}
                onSelect={(id) => {
                  setPanneau({ etat: "fiche", id });
                }}
                partnerName={nomsDesPartenaires.get(lieu.partenaire_id) ?? "—"}
                selected={lieu.id === lieuOuvert?.id}
                state={lieu.etat}
                venueName={lieu.nom}
              />
            ))
          )}
        </div>
      </main>
      {panneau.etat === "creation" && (
        <VenuePanel
          enCours={enCours}
          key="creation"
          mode={{ kind: "creation", partenaireId: partenaireFiltre?.id ?? "", onCreate: creer }}
          onClose={fermer(setPanneau)}
          partnerOptions={optionsDePartenaire}
        />
      )}
      {lieuOuvert !== null && (
        <VenuePanel
          enCours={enCours}
          key={lieuOuvert.id}
          mode={{
            kind: "fiche",
            lieu: lieuOuvert,
            onSave: (saisie) => ecrire(() => enregistrerLieu(lieuOuvert.id, saisie)),
            onPublish: (saisie) => ecrire(() => publierLieu(lieuOuvert.id, saisie)),
            onBackToDraft: () => ecrire(() => repasserLieuEnBrouillon(lieuOuvert.id)),
          }}
          onClose={fermer(setPanneau)}
          partnerOptions={optionsDePartenaire}
        />
      )}
    </div>
  );
};

function fermer(setPanneau: (panneau: Panneau) => void): () => void {
  return () => {
    setPanneau({ etat: "ferme" });
  };
}

/* L'action n'a pas répondu (réseau, serveur) : même message qu'un refus de la base. */
function sansReponse(): ResultatLieu {
  return { statut: "erreur", message: MESSAGE_ECHEC_ENREGISTREMENT };
}
