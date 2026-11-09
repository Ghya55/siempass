import type { FC } from "react";
import { Icon } from "./icon-asset";
import styles from "./admin-sidebar.module.css";

/* Navigation du back-office (rôle admin). Une seule entrée au MVP (description Figma). */
export const AdminSidebar: FC = () => {
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
      <div className={styles.user}>
        {/* FIGMA-MANQUANT: aucun écran de connexion n'existe (DEMO-20), l'utilisateur affiché
            est donc celui du Figma, en dur. */}
        <span className={styles.avatar}>A</span>
        <span className={styles.userNom}>Admin</span>
      </div>
    </nav>
  );
};
