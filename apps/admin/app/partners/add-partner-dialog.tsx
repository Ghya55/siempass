"use client";

import { useEffect, useState, type FC } from "react";
import { Button } from "../components/button";
import { Field } from "../components/field";
import { PanelHeader } from "../components/panel-header";
import {
  champsManquants,
  erreursDesChamps,
  SAISIE_VIDE,
  type ErreursSaisie,
  type SaisiePartenaire,
} from "./partenaire";
import styles from "./add-partner-dialog.module.css";

export type AddPartnerDialogProps = {
  onCancel: () => void;
  onSave: (saisie: SaisiePartenaire) => Promise<boolean>;
  enCours: boolean;
};

export const AddPartnerDialog: FC<AddPartnerDialogProps> = ({ onCancel, onSave, enCours }) => {
  const [saisie, setSaisie] = useState<SaisiePartenaire>(SAISIE_VIDE);
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

  const changer = (champ: keyof SaisiePartenaire) => {
    return (valeur: string): void => {
      setSaisie((precedente) => ({ ...precedente, [champ]: valeur }));
    };
  };

  /* PART-11 : un champ obligatoire vide empêche l'enregistrement et porte son message. */
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
        <PanelHeader
          closeLabel="Close"
          onClose={onCancel}
          state={null}
          subtitle="It will be created as a draft: nothing goes live on the site."
          title="Add partner"
        />
        <form
          className={styles.formulaire}
          noValidate
          onSubmit={(evenement) => {
            evenement.preventDefault();
            envoyer();
          }}
        >
          <div className={styles.groupes}>
            <fieldset className={styles.groupe}>
              <legend className={styles.titreGroupe}>
                <span className={styles.nomGroupe}>Contact</span>
                <span className={styles.sousTitreGroupe}>Never shown to the public.</span>
              </legend>
              <Field
                erreur={erreurs.contact_prenom ?? null}
                isOptional={false}
                kind="text"
                label="First name"
                name="contact_prenom"
                onChange={changer("contact_prenom")}
                value={saisie.contact_prenom}
              />
              <Field
                erreur={erreurs.contact_nom ?? null}
                isOptional={false}
                kind="text"
                label="Last name"
                name="contact_nom"
                onChange={changer("contact_nom")}
                value={saisie.contact_nom}
              />
              <Field
                erreur={erreurs.contact_telephone ?? null}
                isOptional={false}
                kind="text"
                label="Phone"
                name="contact_telephone"
                onChange={changer("contact_telephone")}
                value={saisie.contact_telephone}
              />
              <Field
                erreur={null}
                isOptional
                kind="text"
                label="Email"
                name="contact_email"
                onChange={changer("contact_email")}
                value={saisie.contact_email}
              />
            </fieldset>
            <div className={styles.separateur} />
            <fieldset className={styles.groupe}>
              <legend className={styles.titreGroupe}>
                <span className={styles.nomGroupe}>The venue</span>
                <span className={styles.sousTitreGroupe}>What visitors will see on the site.</span>
              </legend>
              <Field
                erreur={erreurs.lieu_nom ?? null}
                isOptional={false}
                kind="text"
                label="Venue name"
                name="lieu_nom"
                onChange={changer("lieu_nom")}
                value={saisie.lieu_nom}
              />
              <Field
                erreur={erreurs.lieu_adresse ?? null}
                isOptional={false}
                kind="text"
                label="Address"
                name="lieu_adresse"
                onChange={changer("lieu_adresse")}
                value={saisie.lieu_adresse}
              />
              <Field isOptional kind="photo" label="Photo" texte="Add a photo of the storefront" />
              <Field
                erreur={erreurs.lieu_description ?? null}
                isOptional={false}
                kind="multiline"
                label="Short description"
                name="lieu_description"
                onChange={changer("lieu_description")}
                value={saisie.lieu_description}
              />
              <Field
                erreur={erreurs.avantage ?? null}
                isOptional={false}
                kind="text"
                label="Perk for pass holders"
                name="avantage"
                onChange={changer("avantage")}
                value={saisie.avantage}
              />
            </fieldset>
          </div>
          <div className={styles.actions}>
            <Button disabled={enCours} label="Cancel" onClick={onCancel} tone="secondary" />
            {/* Bouton d'envoi : le contrôle des champs se fait dans onSubmit du formulaire. */}
            <Button disabled={enCours} label="Save" tone="primary" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};
