"use client";

import { useEffect, useState, type FC } from "react";
import { Button } from "../components/button";
import { Field } from "../components/field";
import { FormAlert } from "../components/form-alert";
import { PanelHeader } from "../components/panel-header";
import {
  champsManquants,
  erreursDesChamps,
  SAISIE_VIDE,
  type ErreursSaisie,
  type SaisieArtiste,
} from "./artiste";
import styles from "./add-artist-dialog.module.css";

export type AddArtistDialogProps = {
  onCancel: () => void;
  onSave: (saisie: SaisieArtiste) => Promise<boolean>;
  enCours: boolean;
  /* Échec de l'enregistrement : affiché dans la modale, qui reste ouverte avec la saisie. */
  erreur: string | null;
};

/* FIGMA-MANQUANT: la modale « Add artist » n'est pas maquettée (specs/artists.md). Elle reprend
   la modale « Add partner » : même en-tête, mêmes champs, mêmes boutons, en plus étroit. */
export const AddArtistDialog: FC<AddArtistDialogProps> = ({ onCancel, onSave, enCours, erreur }) => {
  const [saisie, setSaisie] = useState<SaisieArtiste>(SAISIE_VIDE);
  const [erreurs, setErreurs] = useState<ErreursSaisie>({});

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent): void => {
      if (evenement.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", surTouche);

    return () => {
      document.removeEventListener("keydown", surTouche);
    };
  }, [onCancel]);

  const changer = (champ: keyof SaisieArtiste) => {
    return (valeur: string): void => {
      setSaisie((precedente) => ({ ...precedente, [champ]: valeur }));
    };
  };

  /* ART-1 : un champ obligatoire vide empêche l'enregistrement et porte son message. */
  const envoyer = (): void => {
    const manquants = champsManquants(saisie);

    if (manquants.length > 0) {
      setErreurs(erreursDesChamps(manquants));
      return;
    }

    setErreurs({});
    void onSave(saisie);
  };

  return (
    <div className={styles.scrim}>
      <div aria-labelledby="titre-ajout" aria-modal="true" className={styles.modale} role="dialog">
        <PanelHeader closeLabel="Close" onClose={onCancel} state={null} subtitle={null} title="Add artist" />
        <form
          className={styles.formulaire}
          noValidate
          onSubmit={(evenement) => {
            evenement.preventDefault();
            envoyer();
          }}
        >
          <div className={styles.groupes}>
            <div className={styles.groupe}>
              {erreur !== null && <FormAlert message={erreur} />}
              <Field
                erreur={erreurs.nom ?? null}
                isOptional={false}
                kind="text"
                label="Name"
                name="nom"
                onChange={changer("nom")}
                value={saisie.nom}
              />
              <Field
                erreur={erreurs.categorie ?? null}
                isOptional={false}
                kind="text"
                label="Category"
                name="categorie"
                onChange={changer("categorie")}
                value={saisie.categorie}
              />
              <Field
                erreur={null}
                isOptional
                kind="text"
                label="Instagram or social link"
                name="reseau_social"
                onChange={changer("reseau_social")}
                value={saisie.reseau_social}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <Button disabled={enCours} label="Cancel" onClick={onCancel} tone="secondary" />
            <Button disabled={enCours} label="Save" tone="primary" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};
