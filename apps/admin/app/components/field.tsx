"use client";

import type { FC } from "react";
import styles from "./field.module.css";

type FieldCommun = {
  label: string;
  isOptional: boolean;
};

type FieldSaisie = FieldCommun & {
  /* « password » n'est pas dans le Figma des formulaires partenaire : il sert à l'écran de
     connexion, qui n'est pas maquetté (voir app/login). Même champ, même style, type masqué. */
  kind: "text" | "password" | "multiline";
  name: string;
  value: string;
  onChange: (valeur: string) => void;
  /* `null` tant que le champ n'est pas fautif (PART-11). */
  erreur: string | null;
  /* Indication au gestionnaire de mots de passe du navigateur. Absent : comportement par défaut. */
  autoComplete?: string;
};

type FieldPhoto = FieldCommun & {
  kind: "photo";
  texte: string;
};

export type FieldProps = FieldSaisie | FieldPhoto;

/* Champ de formulaire avec libellé. isOptional affiche « Optional » (libellé du Figma). */
export const Field: FC<FieldProps> = (props) => {
  const { label, isOptional } = props;
  const idChamp = props.kind === "photo" ? undefined : props.name;

  return (
    <div className={styles.champ}>
      <label className={styles.ligneLabel} htmlFor={idChamp}>
        <span className={styles.label}>{label}</span>
        {isOptional && <span className={styles.facultatif}>Optional</span>}
      </label>
      {(props.kind === "text" || props.kind === "password") && (
        <input
          aria-invalid={props.erreur !== null}
          autoComplete={props.autoComplete}
          className={`${styles.saisie} ${props.erreur !== null ? styles.saisieFautive : ""}`}
          id={props.name}
          name={props.name}
          onChange={(evenement) => {
            props.onChange(evenement.target.value);
          }}
          type={props.kind === "password" ? "password" : "text"}
          value={props.value}
        />
      )}
      {props.kind === "multiline" && (
        <textarea
          aria-invalid={props.erreur !== null}
          className={`${styles.saisie} ${styles.multiligne} ${props.erreur !== null ? styles.saisieFautive : ""}`}
          id={props.name}
          name={props.name}
          onChange={(evenement) => {
            props.onChange(evenement.target.value);
          }}
          value={props.value}
        />
      )}
      {props.kind === "photo" && (
        /* L'envoi de fichier n'est pas fait : il demande un bucket Supabase Storage, donc une
           migration, et `supabase/` est hors de cette tâche. La zone du Figma est rendue telle
           quelle, inerte. `lieu_photo` reste nul, ce que PART-10 autorise. Voir « Attend Ghya ». */
        <div aria-disabled="true" className={styles.photo}>
          {props.texte}
        </div>
      )}
      {props.kind !== "photo" && props.erreur !== null && (
        /* FIGMA-MANQUANT: aucun état d'erreur de champ n'est maquetté. Rendu volontairement
           sobre, le texte dit ce que demande PART-11. */
        <p className={styles.erreur}>{props.erreur}</p>
      )}
    </div>
  );
};
