"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { Button } from "../components/button";
import { Field } from "../components/field";
import { CHEMIN_APRES_CONNEXION } from "../lib/chemins";
import { seConnecter } from "./actions";
import styles from "./page.module.css";

/**
 * Formulaire de connexion du back-office.
 *
 * FIGMA-MANQUANT: aucun écran de connexion n'existe dans le fichier Figma — DEMO-4 et DEMO-20
 * en interdisaient un jusqu'à la décision du 10/11. Rendu volontairement sobre, avec les
 * composants `Field` et `Button` existants et les variables de `@siempass/tokens` : rien n'est
 * inventé au-delà du strict nécessaire. Attend Alex.
 */
export const LoginForm: FC = () => {
  const router = useRouter();
  const [adresse, setAdresse] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const envoyer = async (): Promise<void> => {
    setEnCours(true);
    setErreur(null);
    const resultat = await seConnecter({ adresse, motDePasse });

    if (resultat.statut === "erreur") {
      setEnCours(false);
      setErreur(resultat.message);
      return;
    }

    /* `enCours` reste à vrai jusqu'à la navigation : le bouton ne redevient pas cliquable entre
       la connexion et l'arrivée sur la liste. */
    router.replace(CHEMIN_APRES_CONNEXION);
    router.refresh();
  };

  return (
    <form
      className={styles.formulaire}
      noValidate
      onSubmit={(evenement) => {
        evenement.preventDefault();
        void envoyer();
      }}
    >
      <Field
        autoComplete="username"
        erreur={null}
        isOptional={false}
        kind="text"
        label="Email"
        name="email"
        onChange={setAdresse}
        value={adresse}
      />
      <Field
        autoComplete="current-password"
        erreur={null}
        isOptional={false}
        kind="password"
        label="Password"
        name="password"
        onChange={setMotDePasse}
        value={motDePasse}
      />
      {/* Le refus porte sur le couple, pas sur un champ : il s'affiche sous le formulaire et non
          sous une saisie, pour ne pas désigner laquelle serait fautive. */}
      {erreur !== null && (
        <p aria-live="polite" className={styles.erreur} role="status">
          {erreur}
        </p>
      )}
      <Button disabled={enCours} label="Sign in" tone="primary" type="submit" />
    </form>
  );
};
