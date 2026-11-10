"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { CHEMIN_CONNEXION } from "../lib/chemins";
import { seDeconnecter } from "../login/actions";
import { Button } from "./button";
import { Icon } from "./icon-asset";
import styles from "./admin-sidebar.module.css";

export type AdminSidebarProps = {
  /** Adresse du compte connecté. Vide seulement si la session s'est éteinte entre-temps. */
  adresse: string;
};

/* Navigation du back-office. Une seule entrée au MVP (description Figma). */
export const AdminSidebar: FC<AdminSidebarProps> = ({ adresse }) => {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  const deconnecter = async (): Promise<void> => {
    setEnCours(true);
    await seDeconnecter();
    router.replace(CHEMIN_CONNEXION);
    router.refresh();
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.marque}>SiemPass</span>
        <span className={styles.sousTitre}>Back-office</span>
      </div>
      <ul className={styles.nav}>
        <li>
          <span aria-current="page" className={styles.navItemActif}>
            <Icon name="store" size={18} />
            Partners
          </span>
        </li>
      </ul>
      <div className={styles.spacer} />
      <div className={styles.compte}>
        <div className={styles.user}>
          {/* FIGMA-MANQUANT: le bloc du Figma montre un avatar et le nom « Admin », sans
              déconnexion — il a été maquetté quand aucun écran de connexion n'existait
              (DEMO-20). L'adresse connectée y prend la place du nom, et « Sign out » est
              ajouté avec le bouton existant : sans lui, on ne peut pas tester deux comptes.
              Attend Alex. */}
          <span className={styles.avatar}>{initiale(adresse)}</span>
          <span className={styles.userNom} title={adresse}>
            {adresse}
          </span>
        </div>
        <Button
          disabled={enCours}
          label="Sign out"
          onClick={() => {
            void deconnecter();
          }}
          tone="secondary"
        />
      </div>
    </nav>
  );
};

function initiale(adresse: string): string {
  return adresse === "" ? "?" : adresse.slice(0, 1).toUpperCase();
}
