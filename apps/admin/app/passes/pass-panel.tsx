"use client";

import { useState, type FC } from "react";
import type { ModeSelection } from "@siempass/db";
import { Badge, type EtatBadge } from "../components/badge";
import { Button } from "../components/button";
import { Field } from "../components/field";
import { FormAlert } from "../components/form-alert";
import { PanelHeader } from "../components/panel-header";
import { PickList, type PickItem } from "../components/pick-list";
import { ValidityField } from "../components/validity-field";
import { formatJourCourt } from "../lib/dates";
import type { Choix, Offre } from "./offre";
import {
  SAISIE_VIDE,
  saisieDeLOffre,
  verifierSaisie,
  type ErreursOffre,
  type OffreEnvoyee,
  type SaisieOffre,
} from "./saisie-offre";
import styles from "./pass-panel.module.css";

/* La fiche s'ouvre sur un pass existant, ou en création (bloc 3) : même formulaire. En création,
   aucune action en haut ; une fois créé, « Publish » (brouillon) ou « Back to draft » (en ligne). */
export type PassPanelMode =
  | { readonly kind: "creation" }
  | {
      readonly kind: "fiche";
      readonly offre: Offre;
      readonly etat: EtatBadge;
      readonly onPublish: (offre: OffreEnvoyee) => void;
      readonly onBackToDraft: () => void;
    };

export type PassPanelProps = {
  mode: PassPanelMode;
  choix: Choix;
  /* Le jour courant au Cambodge, `AAAA-MM-JJ`, lu sur le serveur (CAT-21). */
  aujourdhui: string;
  enCours: boolean;
  /* CAT-25 : échec de l'enregistrement, en haut du formulaire (240:2891). */
  erreur: string | null;
  onSave: (offre: OffreEnvoyee) => void;
  onClose: () => void;
};

type Refus = { readonly erreurs: ErreursOffre; readonly alerte: string | null };

const SANS_REFUS: Refus = { erreurs: {}, alerte: null };

/* Fiche du pass, en panneau de droite (239:325 création, 239:876 brouillon, 239:1334 recherche,
   239:1792 en ligne, 240:1839 erreurs de publication, 240:2397 date passée, 240:2891 échec). */
export const PassPanel: FC<PassPanelProps> = ({ mode, choix, aujourdhui, enCours, erreur, onSave, onClose }) => {
  const [saisie, setSaisie] = useState<SaisieOffre>(() =>
    mode.kind === "creation" ? SAISIE_VIDE : saisieDeLOffre(mode.offre),
  );
  const [refus, setRefus] = useState<Refus>(SANS_REFUS);

  const modifier = (changement: Partial<SaisieOffre>): void => {
    setSaisie((precedente) => ({ ...precedente, ...changement }));
  };

  const basculer = (liste: "lieux" | "evenements", modeDeLaListe: ModeSelection, id: string): void => {
    setSaisie((precedente) => {
      const actuelle = precedente[liste][modeDeLaListe];
      const suivante = actuelle.includes(id) ? actuelle.filter((autre) => autre !== id) : [...actuelle, id];

      return { ...precedente, [liste]: { ...precedente[liste], [modeDeLaListe]: suivante } };
    });
  };

  /* CAT-12 : « Save » d'un brouillon exige le nom ; CAT-22 : d'un pass en ligne, tout le minimum.
     CAT-21 : « Publish » exige le minimum et une date fixe à venir. */
  const envoyer = (publier: boolean, ecrire: (offre: OffreEnvoyee) => void): void => {
    const enLigne = publier || (mode.kind === "fiche" && mode.offre.etat === "en ligne");
    const verification = verifierSaisie(saisie, enLigne ? "en ligne" : "brouillon", publier, aujourdhui);

    if (verification.statut === "refus") {
      setRefus({ erreurs: verification.erreurs, alerte: verification.alerte });
      return;
    }

    setRefus(SANS_REFUS);
    ecrire(verification.offre);
  };

  const { erreurs } = refus;
  const contenuManquant = erreurs.contenu !== undefined;

  return (
    <aside className={styles.panneau}>
      <PanelHeader
        closeLabel="Close"
        onClose={onClose}
        state={mode.kind === "creation" ? null : mode.etat}
        subtitle={null}
        title={mode.kind === "creation" ? "New pass" : mode.offre.nom}
      />
      {mode.kind === "fiche" && (
        <div className={styles.actionsHaut}>
          {mode.offre.etat === "en ligne" ? (
            /* CAT-10 : retire le pass du site sans enregistrer la saisie en cours. */
            <Button disabled={enCours} label="Back to draft" onClick={mode.onBackToDraft} tone="secondary" />
          ) : (
            <Button
              disabled={enCours}
              label="Publish"
              onClick={() => {
                envoyer(true, mode.onPublish);
              }}
              tone="primary"
            />
          )}
        </div>
      )}
      <form
        className={styles.formulaire}
        noValidate
        onSubmit={(evenement) => {
          evenement.preventDefault();
          envoyer(false, onSave);
        }}
      >
        <div className={styles.contenu}>
          {erreur !== null && <FormAlert message={erreur} />}
          {refus.alerte !== null && <FormAlert message={refus.alerte} />}
          <Field
            erreur={erreurs.nom ?? null}
            isOptional={false}
            kind="text"
            label="Name"
            name="nom"
            onChange={(nom) => {
              modifier({ nom });
            }}
            value={saisie.nom}
          />
          <Field
            erreur={erreurs.prix ?? null}
            isOptional={false}
            kind="text"
            label="Price (USD)"
            name="prix"
            onChange={(prix) => {
              modifier({ prix });
            }}
            value={saisie.prix}
          />
          <ValidityField
            mode={saisie.validiteMode}
            numberOfDays={saisie.nombreDeJours}
            numberOfDaysError={erreurs.nombreDeJours ?? null}
            onModeChange={(validiteMode) => {
              modifier({ validiteMode });
            }}
            onNumberOfDaysChange={(nombreDeJours) => {
              modifier({ nombreDeJours });
            }}
            onValidUntilChange={(valideJusquAu) => {
              modifier({ valideJusquAu });
            }}
            validUntil={saisie.valideJusquAu}
            validUntilError={erreurs.valideJusquAu ?? null}
          />
          <PickList
            allLabel="All venues"
            checkedByMode={saisie.lieux}
            errorMessage={null}
            hasError={contenuManquant}
            items={choix.lieux.map(
              (lieu): PickItem => ({
                id: lieu.id,
                name: lieu.nom,
                meta: lieu.etat === "brouillon" ? <Badge state="brouillon" /> : null,
              }),
            )}
            label="Venues"
            mode={saisie.lieuxMode}
            onModeChange={(lieuxMode) => {
              modifier({ lieuxMode });
            }}
            onToggle={(id) => {
              basculer("lieux", saisie.lieuxMode, id);
            }}
            selectedLabel="Selected venues"
          />
          <PickList
            allLabel="All events"
            checkedByMode={saisie.evenements}
            errorMessage={erreurs.contenu ?? null}
            hasError={contenuManquant}
            items={choix.evenements.map(
              (evenement): PickItem => ({
                id: evenement.id,
                name: evenement.nom,
                meta: <span className={styles.date}>{formatJourCourt(evenement.jour)}</span>,
              }),
            )}
            label="Events"
            mode={saisie.evenementsMode}
            onModeChange={(evenementsMode) => {
              modifier({ evenementsMode });
            }}
            onToggle={(id) => {
              basculer("evenements", saisie.evenementsMode, id);
            }}
            selectedLabel="Selected events"
          />
        </div>
        <div className={styles.actionsBas}>
          <Button disabled={enCours} label="Save" tone="secondary" type="submit" />
        </div>
      </form>
    </aside>
  );
};
