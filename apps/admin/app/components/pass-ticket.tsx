"use client";

import type { FC } from "react";
import { Calendar, Clock, MapPin, QrCode } from "lucide-react";
import { Badge, type EtatBadge } from "./badge";
import styles from "./pass-ticket.module.css";

/* Variant `state` du Figma : brouillon, enLigne, termine. */
export type PassTicketState = "brouillon" | "enLigne" | "termine";

const BADGE: Record<PassTicketState, EtatBadge> = {
  brouillon: "brouillon",
  enLigne: "en ligne",
  termine: "termine",
};

const CLASSE: Record<PassTicketState, string | undefined> = {
  brouillon: styles.brouillon,
  enLigne: styles.enLigne,
  termine: styles.termine,
};

export type PassTicketProps = {
  state: PassTicketState;
  isSelected: boolean;
  name: string;
  /* Nul tant que le brouillon n'a pas de prix, de validité, de lieu ou d'événement : la ligne
     n'est pas affichée (choix d'Alex, 238:2 « Angkor Week »). */
  price: string | null;
  validity: string | null;
  venues: string | null;
  events: string | null;
  onClick: () => void;
};

/* Figma `PassTicket` (235:501) : la carte d'un pass du catalogue, en forme de billet. La tête
   porte nom, prix et validité ; le talon, détaché par une perforation, le contenu et l'état. */
export const PassTicket: FC<PassTicketProps> = ({
  state,
  isSelected,
  name,
  price,
  validity,
  venues,
  events,
  onClick,
}) => {
  return (
    <button
      aria-pressed={isSelected}
      className={`${styles.ticket} ${CLASSE[state] ?? ""} ${isSelected ? styles.selectionne : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className={styles.tete}>
        <span className={styles.ligneTitre}>
          <span className={styles.nom}>{name}</span>
          {price !== null && <span className={styles.prix}>{price}</span>}
        </span>
        {validity !== null && (
          <span className={styles.validite}>
            <Clock aria-hidden="true" size={14} strokeWidth={2.5} />
            {validity}
          </span>
        )}
      </span>
      <span aria-hidden="true" className={styles.perforation}>
        <span className={`${styles.encoche} ${styles.encocheGauche}`} />
        <span className={`${styles.encoche} ${styles.encocheDroite}`} />
      </span>
      <span className={styles.talon}>
        {venues !== null && (
          <span className={styles.ligne}>
            <MapPin aria-hidden="true" className={styles.icone} size={16} />
            {venues}
          </span>
        )}
        {events !== null && (
          <span className={styles.ligne}>
            <Calendar aria-hidden="true" className={styles.icone} size={16} />
            {events}
          </span>
        )}
        <span className={styles.pied}>
          <Badge state={BADGE[state]} />
          <QrCode aria-hidden="true" className={styles.qr} size={20} />
        </span>
      </span>
    </button>
  );
};
