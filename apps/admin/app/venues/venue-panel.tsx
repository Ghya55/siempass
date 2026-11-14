"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { Button } from "../components/button";
import { Field, type FieldOption } from "../components/field";
import { FormAlert } from "../components/form-alert";
import { PanelHeader } from "../components/panel-header";
import { cheminEditeurDuLieu } from "../lib/chemins";
import {
  erreursDesChamps,
  MESSAGE_PUBLICATION_INCOMPLETE,
  OPTIONS_DE_CATEGORIE,
  saisieDuLieu,
  SAISIE_VIDE,
  type ChampDuLieu,
  type ErreursLieu,
  type Lieu,
  type ResultatLieu,
  type SaisieLieu,
} from "./lieu";
import styles from "./venue-panel.module.css";

type Ecriture = (saisie: SaisieLieu) => Promise<ResultatLieu>;

/* La fiche s'ouvre sur un lieu existant, ou en création (VEN-37). En création, le partenaire
   peut être déjà choisi : la page est filtrée sur lui (VEN-22) ; seule « Save » existe. */
export type VenuePanelMode =
  | { readonly kind: "creation"; readonly partenaireId: string; readonly onCreate: Ecriture }
  | {
      readonly kind: "fiche";
      readonly lieu: Lieu;
      readonly onSave: Ecriture;
      readonly onPublish: Ecriture;
      readonly onBackToDraft: () => Promise<ResultatLieu>;
    };

export type VenuePanelProps = {
  mode: VenuePanelMode;
  partnerOptions: readonly FieldOption[];
  enCours: boolean;
  onClose: () => void;
};

/* Fiche du lieu, en panneau de droite (157:1571 brouillon, 157:1801 en ligne, 157:1851 création,
   160:1872 création avec partenaire, 157:1901 erreurs de publication).
   Les champs exigés sont vérifiés par l'action serveur ; le panneau affiche ce qu'elle répond.
   Fermer le panneau avec des modifications non enregistrées ne demande rien (VEN-26). */
export const VenuePanel: FC<VenuePanelProps> = ({
  mode,
  partnerOptions,
  enCours,
  onClose,
}) => {
  const router = useRouter();
  const [saisie, setSaisie] = useState<SaisieLieu>(() => saisieInitiale(mode));
  const [erreurs, setErreurs] = useState<ErreursLieu>({});
  const [alertePublication, setAlertePublication] = useState(false);

  const changer = (champ: ChampDuLieu) => {
    return (valeur: string): void => {
      setSaisie((precedente) => ({ ...precedente, [champ]: valeur }));
    };
  };

  /* Une seule lecture de la réponse pour les trois écritures : champs fautifs et message de
     publication (VEN-23, VEN-24), ou rien si tout est passé. */
  const afficher = (resultat: ResultatLieu): void => {
    if (resultat.statut === "incomplet") {
      setErreurs(erreursDesChamps(resultat.champs));
      setAlertePublication(resultat.messagePublication);
      return;
    }

    setErreurs({});
    setAlertePublication(false);
  };

  const ecrire = async (ecriture: () => Promise<ResultatLieu>): Promise<void> => {
    afficher(await ecriture());
  };

  const enCreation = mode.kind === "creation";
  const champ = (nom: ChampDuLieu) => ({
    name: nom,
    value: saisie[nom],
    onChange: changer(nom),
    erreur: erreurs[nom] ?? null,
  });

  return (
    <aside className={styles.panneau}>
      {mode.kind === "creation" ? (
        <PanelHeader closeLabel="Close" onClose={onClose} state={null} subtitle={null} title="New venue" />
      ) : (
        <>
          <PanelHeader
            closeLabel="Close"
            onClose={onClose}
            state={mode.lieu.etat}
            subtitle={mode.lieu.adresse}
            title={mode.lieu.nom}
          />
          <div className={styles.actionsHaut}>
            {mode.lieu.etat === "en ligne" ? (
              <Button
                disabled={enCours}
                label="Back to draft"
                onClick={() => {
                  void ecrire(mode.onBackToDraft);
                }}
                tone="secondary"
              />
            ) : (
              <Button
                disabled={enCours}
                label="Publish"
                onClick={() => {
                  void ecrire(() => mode.onPublish(saisie));
                }}
                tone="primary"
              />
            )}
            <Button
              disabled={enCours}
              label="Edit page"
              onClick={() => {
                router.push(cheminEditeurDuLieu(mode.lieu.id));
              }}
              tone="secondary"
            />
          </div>
        </>
      )}
      <form
        className={styles.formulaire}
        noValidate
        onSubmit={(evenement) => {
          evenement.preventDefault();
          void ecrire(() => (mode.kind === "creation" ? mode.onCreate(saisie) : mode.onSave(saisie)));
        }}
      >
        <div className={styles.contenu}>
          {alertePublication && <FormAlert message={MESSAGE_PUBLICATION_INCOMPLETE} />}
          <Field {...champ("nom")} isOptional={false} kind="text" label="Name" />
          <Field {...champ("tagline")} isOptional={false} kind="text" label="Tagline" />
          <Field
            {...champ("partenaire_id")}
            isOptional={false}
            kind="select"
            label="Partner"
            options={partnerOptions}
            placeholder="Choose a partner"
          />
          <Field
            {...champ("categorie")}
            isOptional={false}
            kind="select"
            label="Category"
            options={OPTIONS_DE_CATEGORIE}
            placeholder="Choose a category"
          />
          <Field {...champ("adresse")} isOptional={false} kind="text" label="Address" />
          <Field {...champ("lien_maps")} isOptional kind="text" label="Google Maps link" />
          <Field {...champ("horaires")} isOptional kind="text" label="Opening hours" />
          <Field {...champ("avantage")} isOptional={false} kind="text" label="Perk for pass holders" />
        </div>
        <div className={styles.actionsBas}>
          {/* Figma : « Save » est l'action principale en création (157:1851), secondaire sur la
              fiche, où « Publish » tient ce rôle (157:1571). */}
          <Button disabled={enCours} label="Save" tone={enCreation ? "primary" : "secondary"} type="submit" />
        </div>
      </form>
    </aside>
  );
};

function saisieInitiale(mode: VenuePanelMode): SaisieLieu {
  return mode.kind === "creation" ? { ...SAISIE_VIDE, partenaire_id: mode.partenaireId } : saisieDuLieu(mode.lieu);
}
