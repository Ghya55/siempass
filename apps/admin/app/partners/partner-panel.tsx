"use client";

import type { FC } from "react";
import { AdvantageCard } from "../components/advantage-card";
import { Button } from "../components/button";
import { DetailItem } from "../components/detail-item";
import { InviteBanner } from "../components/invite-banner";
import { PanelHeader } from "../components/panel-header";
import { PhotoThumb } from "../components/photo-thumb";
import { nomDuContact, type Partenaire } from "./partenaire";
import styles from "./partner-panel.module.css";

export type PartnerPanelProps = {
  partenaire: Partenaire;
  lienAcces: string;
  onClose: () => void;
  onInvite: () => void;
  onPublish: () => void;
  onBackToDraft: () => void;
  enCours: boolean;
};

export const PartnerPanel: FC<PartnerPanelProps> = ({
  partenaire,
  lienAcces,
  onClose,
  onInvite,
  onPublish,
  onBackToDraft,
  enCours,
}) => {
  const enLigne = partenaire.etat === "en ligne";

  return (
    <aside className={styles.panneau}>
      <PanelHeader
        closeLabel="Close"
        onClose={onClose}
        state={partenaire.etat}
        subtitle={partenaire.lieu_adresse}
        title={partenaire.lieu_nom}
      />
      <div className={styles.contenu}>
        {/* L'invitation est rendue d'après la donnée (`invitation_envoyee_le`), pas d'après un
            état d'écran : c'est la seule façon qu'elle survive au `router.refresh()`. */}
        {partenaire.invitation_envoyee_le !== null && <InviteBanner link={lienAcces} />}
        <AdvantageCard avantage={partenaire.avantage} label="Perk for pass holders" />
        <section className={styles.section}>
          <h3 className={styles.titreSection}>The venue</h3>
          <DetailItem label="Short description" value={partenaire.lieu_description} />
          <DetailItem label="Photo" value={<PhotoThumb />} />
        </section>
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
        {enLigne ? (
          <Button disabled={enCours} label="Back to draft" onClick={onBackToDraft} tone="secondary" />
        ) : (
          <Button disabled={enCours} label="Publish" onClick={onPublish} tone="primary" />
        )}
      </div>
    </aside>
  );
};
