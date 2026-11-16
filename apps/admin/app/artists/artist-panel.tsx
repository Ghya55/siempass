"use client";

import { useState, type FC } from "react";
import { Button } from "../components/button";
import { Field } from "../components/field";
import { FormAlert } from "../components/form-alert";
import { PanelHeader } from "../components/panel-header";
import {
  champsManquants,
  erreursDesChamps,
  saisieDeLArtiste,
  SAISIE_VIDE,
  type Artiste,
  type ErreursSaisie,
  type SaisieArtiste,
} from "./artiste";
import { DeleteButton } from "./delete-button";
import styles from "./artist-panel.module.css";

/* La fiche s'ouvre sur un artiste existant, ou en création (ART-4) : même formulaire. */
export type ArtistPanelMode =
  | { readonly kind: "creation" }
  | { readonly kind: "fiche"; readonly artiste: Artiste; readonly onDelete: () => void };

export type ArtistPanelProps = {
  mode: ArtistPanelMode;
  enCours: boolean;
  /* Échec de l'enregistrement ou de la suppression : affiché en haut du formulaire. */
  erreur: string | null;
  onSave: (saisie: SaisieArtiste) => void;
  onClose: () => void;
};

/* Fiche de l'artiste, en panneau de droite.
   FIGMA-MANQUANT: pas de maquette (specs/artists.md). Reprend la fiche d'un lieu : même panneau,
   même en-tête, mêmes champs, « Save » en bas ; « Delete » en bas à gauche sur une fiche. */
export const ArtistPanel: FC<ArtistPanelProps> = ({ mode, enCours, erreur, onSave, onClose }) => {
  const [saisie, setSaisie] = useState<SaisieArtiste>(() =>
    mode.kind === "creation" ? SAISIE_VIDE : saisieDeLArtiste(mode.artiste),
  );
  const [erreurs, setErreurs] = useState<ErreursSaisie>({});

  const champ = (nom: keyof SaisieArtiste) => ({
    name: nom,
    value: saisie[nom],
    onChange: (valeur: string): void => {
      setSaisie((precedente) => ({ ...precedente, [nom]: valeur }));
    },
  });

  /* ART-1 : un champ obligatoire vide empêche l'enregistrement et porte son message. */
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
        subtitle={mode.kind === "creation" ? null : mode.artiste.categorie}
        title={mode.kind === "creation" ? "New artist" : mode.artiste.nom}
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
          <Field {...champ("nom")} erreur={erreurs.nom ?? null} isOptional={false} kind="text" label="Name" />
          <Field
            {...champ("categorie")}
            erreur={erreurs.categorie ?? null}
            isOptional={false}
            kind="text"
            label="Category"
          />
          <Field
            {...champ("reseau_social")}
            erreur={null}
            isOptional
            kind="text"
            label="Instagram or social link"
          />
        </div>
        <div className={styles.actionsBas}>
          {/* Un élément vide en création : « Save » reste à droite. */}
          {mode.kind === "fiche" ? <DeleteButton disabled={enCours} onDelete={mode.onDelete} /> : <span />}
          <Button disabled={enCours} label="Save" tone="primary" type="submit" />
        </div>
      </form>
    </aside>
  );
};
