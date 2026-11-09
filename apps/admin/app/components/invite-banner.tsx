"use client";

import { useState, type FC } from "react";
import { Button } from "./button";
import { Icon } from "./icon-asset";
import styles from "./invite-banner.module.css";

export type InviteBannerProps = {
  link: string;
};

/* Confirmation d'invitation. Démo : le lien est affiché à l'écran (DEMO-25, description Figma). */
export const InviteBanner: FC<InviteBannerProps> = ({ link }) => {
  const [copie, setCopie] = useState(false);

  const copier = (): void => {
    void navigator.clipboard.writeText(link).then(() => {
      setCopie(true);
    });
  };

  return (
    <section className={styles.banniere}>
      <p className={styles.titre}>
        <Icon name="check" size={18} />
        Invite sent
      </p>
      <p className={styles.texte}>Access link to their page, no account or password needed:</p>
      <div className={styles.ligneLien}>
        <span className={styles.lien}>{link}</span>
        {/* FIGMA-MANQUANT: le Figma ne montre pas d'état « copié » du bouton Copy. */}
        <Button label={copie ? "Copied" : "Copy"} onClick={copier} tone="secondary" />
      </div>
    </section>
  );
};
