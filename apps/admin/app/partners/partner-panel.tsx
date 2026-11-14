"use client";

import type { FC } from "react";
import { Button } from "../components/button";
import { DetailItem } from "../components/detail-item";
import { InviteBanner } from "../components/invite-banner";
import { PanelHeader } from "../components/panel-header";
import { nomDuContact, type Partenaire } from "./partenaire";
import styles from "./partner-panel.module.css";

export type PartnerPanelProps = {
  partenaire: Partenaire;
  lienAcces: string;
  onClose: () => void;
  onInvite: () => void;
  enCours: boolean;
};

/* Panneau du partenaire, allégé (VEN-36) : plus de « Publish » / « Back to draft », plus d'état,
   plus de lieu ni d'avantage (ils vivent sur le lieu) ; « Invite » reste.
   FIGMA-MANQUANT: le panneau (7:210) n'est pas redessiné après VEN-36. Retiré du Figma ce qui
   n'existe plus, sans rien inventer : le titre devient le nom du contact (le nom du lieu
   n'existe plus sur le partenaire), sans sous-titre ni badge, et la section « Contact » reste
   seule. Attend Alex. */
export const PartnerPanel: FC<PartnerPanelProps> = ({ partenaire, lienAcces, onClose, onInvite, enCours }) => {
  return (
    <aside className={styles.panneau}>
      <PanelHeader
        closeLabel="Close"
        onClose={onClose}
        state={null}
        subtitle={null}
        title={nomDuContact(partenaire)}
      />
      <div className={styles.contenu}>
        {/* L'invitation est rendue d'après la donnée (`invitation_envoyee_le`), pas d'après un
            état d'écran : c'est la seule façon qu'elle survive au `router.refresh()`. */}
        {partenaire.invitation_envoyee_le !== null && <InviteBanner link={lienAcces} />}
        <section className={styles.section}>
          <h3 className={styles.titreSection}>Contact</h3>
          <DetailItem label="Name" value={nomDuContact(partenaire)} />
          <DetailItem label="Phone" value={partenaire.contact_telephone} />
          {/* FIGMA-MANQUANT: le Figma ne montre pas le cas d'un e-mail absent, qui est pourtant
              permis (champ facultatif). Tiret cadratin, faute de maquette. */}
          <DetailItem label="Email" value={partenaire.contact_email ?? "—"} />
        </section>
      </div>
      <div className={styles.actions}>
        {/* « Inviter » reste visible après l'envoi (DEMO-28). */}
        <Button disabled={enCours} label="Invite" onClick={onInvite} tone="secondary" />
      </div>
    </aside>
  );
};
