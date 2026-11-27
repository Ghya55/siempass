"use client";

import { useState, type FC } from "react";
import { Button } from "../components/button";
import { Field } from "../components/field";
import { FormAlert } from "../components/form-alert";
import { PanelHeader } from "../components/panel-header";
import {
  champsManquants,
  erreursDesChamps,
  saisieDeLEvenement,
  SAISIE_VIDE,
  type ErreursSaisie,
  type Evenement,
  type LieuChoisissable,
  type SaisieEvenement,
} from "./evenement";
import styles from "./event-panel.module.css";

/* La fiche s'ouvre sur un événement existant, ou en création (bloc 3) : même formulaire. */
export type EventPanelMode =
  | { readonly kind: "creation" }
  | { readonly kind: "fiche"; readonly evenement: Evenement };

export type EventPanelProps = {
  mode: EventPanelMode;
  lieux: readonly LieuChoisissable[];
  enCours: boolean;
  /* EVT-14 : échec de l'enregistrement, affiché en haut du formulaire (237:765). */
  erreur: string | null;
  onSave: (saisie: SaisieEvenement) => void;
  onClose: () => void;
};

/* Fiche de l'événement, en panneau de droite (237:273 création, 237:438 fiche, 237:599 erreurs).
   Quatre champs, « Save » en pied ; aucune autre action (pas de « Delete », EVT-7). */
export const EventPanel: FC<EventPanelProps> = ({ mode, lieux, enCours, erreur, onSave, onClose }) => {
  const [saisie, setSaisie] = useState<SaisieEvenement>(() =>
    mode.kind === "creation" ? SAISIE_VIDE : saisieDeLEvenement(mode.evenement),
  );
  const [erreurs, setErreurs] = useState<ErreursSaisie>({});

  const champ = (nom: keyof SaisieEvenement) => ({
    name: nom,
    value: saisie[nom],
    erreur: erreurs[nom] ?? null,
    isOptional: false,
    onChange: (valeur: string): void => {
      setSaisie((precedente) => ({ ...precedente, [nom]: valeur }));
    },
  });

  /* EVT-6 : un champ vide empêche l'enregistrement et porte son message. */
  const envoyer = (): void => {
    const manquants = champsManquants(saisie);

    setErreurs(erreursDesChamps(manquants));

    if (manquants.length === 0) {
      onSave(saisie);
    }
  };

  return (
    <aside className={styles.panneau}>
      <PanelHeader
        closeLabel="Close"
        onClose={onClose}
        state={null}
        subtitle={null}
        title={mode.kind === "creation" ? "New event" : mode.evenement.nom}
      />
      <form
        className={styles.formulaire}
        noValidate
        onSubmit={(evenement) => {
          evenement.preventDefault();
          envoyer();
        }}
      >
        <div className={styles.contenu}>
          {erreur !== null && <FormAlert message={erreur} />}
          <Field {...champ("nom")} kind="text" label="Name" />
          <Field {...champ("jour")} kind="date" label="Date" />
          <Field
            {...champ("lieu_id")}
            kind="select"
            label="Venue"
            options={lieux.map((lieu) => ({ value: lieu.id, label: lieu.nom }))}
            placeholder="Choose a venue"
          />
          <Field {...champ("avantage")} kind="text" label="Perk for pass holders" />
        </div>
        <div className={styles.actionsBas}>
          <Button disabled={enCours} label="Save" tone="secondary" type="submit" />
        </div>
      </form>
    </aside>
  );
};
