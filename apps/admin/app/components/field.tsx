"use client";

import type { FC } from "react";
import { ChevronDown, CircleAlert } from "lucide-react";
import styles from "./field.module.css";

type FieldCommun = {
  label: string;
  isOptional: boolean;
};

type FieldEditable = FieldCommun & {
  name: string;
  value: string;
  onChange: (valeur: string) => void;
  /* `null` tant que le champ n'est pas fautif : state=error du Figma (PART-11, VEN-23). */
  erreur: string | null;
};

type FieldSaisie = FieldEditable & {
  /* « password » n'est pas dans le Figma des formulaires partenaire : il sert à l'écran de
     connexion, qui n'est pas maquetté (voir app/login). Même champ, même style, type masqué. */
  kind: "text" | "password" | "multiline";
  /* Indication au gestionnaire de mots de passe du navigateur. Absent : comportement par défaut. */
  autoComplete?: string;
};

export type FieldOption = {
  readonly value: string;
  readonly label: string;
};

type FieldSelect = FieldEditable & {
  kind: "select";
  /* state=placeholder du Figma (160:1613) : le texte grisé tant que `value` est vide. */
  placeholder: string;
  options: readonly FieldOption[];
};

type FieldPhoto = FieldCommun & {
  kind: "photo";
  texte: string;
};

export type FieldProps = FieldSaisie | FieldSelect | FieldPhoto;

/* Champ de formulaire avec libellé (Figma « Field », 5:29). isOptional affiche « Optional ».
   L'état du Figma (default, error, placeholder) se déduit des données : `erreur` non nulle donne
   state=error, une liste sans valeur donne state=placeholder. */
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
      {props.kind === "select" && <ListeDeroulante {...props} />}
      {props.kind === "photo" && (
        /* L'envoi de fichier n'est pas fait : il demande un bucket Supabase Storage, donc une
           migration, et `supabase/` est hors de cette tâche. La zone du Figma est rendue telle
           quelle, inerte. `lieu_photo` reste nul, ce que PART-10 autorise. Voir « Attend Ghya ». */
        <div aria-disabled="true" className={styles.photo}>
          {props.texte}
        </div>
      )}
      {props.kind !== "photo" && props.erreur !== null && (
        <p className={styles.erreur}>
          <CircleAlert size={16} />
          {props.erreur}
        </p>
      )}
    </div>
  );
};

/* kind=select : la liste native du navigateur, habillée comme le champ du Figma (chevron à
   droite). Une liste native garde le clavier et les lecteurs d'écran sans rien réécrire. */
const ListeDeroulante: FC<FieldSelect> = ({ name, value, onChange, erreur, placeholder, options }) => {
  const classes = [
    styles.saisie,
    styles.liste,
    value === "" ? styles.listeVide : "",
    erreur !== null ? styles.saisieFautive : "",
  ].join(" ");

  return (
    <div className={styles.cadreListe}>
      <select
        aria-invalid={erreur !== null}
        className={classes}
        id={name}
        name={name}
        onChange={(evenement) => {
          onChange(evenement.target.value);
        }}
        value={value}
      >
        <option disabled value="">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={styles.chevron}>
        <ChevronDown size={20} />
      </span>
    </div>
  );
};
