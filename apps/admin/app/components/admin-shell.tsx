import type { FC, ReactNode } from "react";
import { AdminSidebar, type AdminSidebarProps } from "./admin-sidebar";
import styles from "./admin-shell.module.css";

export type AdminShellProps = AdminSidebarProps & {
  /**
   * Emplacement de l'en-tête de coquille, au-dessus du contenu et à droite de la barre latérale.
   * Vide aujourd'hui : rien n'est rendu tant qu'il n'est pas donné (la recherche globale viendra ici).
   */
  enteteCoquille?: ReactNode;
  /** Panneau de droite (fiche d'un lieu, d'un partenaire), à hauteur de la fenêtre. */
  panneau?: ReactNode;
  children: ReactNode;
};

/**
 * Coquille commune des écrans connectés : barre latérale pleine hauteur, colonne de contenu, panneau
 * optionnel. La fenêtre ne défile pas ; chaque écran décide quelle zone défile (`AdminListPage`
 * pour les tableaux, l'éditeur d'article pour ses deux colonnes).
 */
export const AdminShell: FC<AdminShellProps> = ({
  adresse,
  demanderSortie,
  enteteCoquille,
  panneau,
  children,
}) => {
  return (
    <div className={styles.coquille}>
      <AdminSidebar adresse={adresse} demanderSortie={demanderSortie} />
      <div className={styles.colonne}>
        {enteteCoquille === undefined ? null : (
          <header className={styles.enteteCoquille}>{enteteCoquille}</header>
        )}
        <main className={styles.contenu}>{children}</main>
      </div>
      {panneau}
    </div>
  );
};

export type AdminListPageProps = {
  /** Titre, bouton d'action et barre de filtre : reste fixe. */
  entete: ReactNode;
  /** Messages d'erreur et tableau : seule zone qui défile. */
  children: ReactNode;
};

/* Page de liste (Partners, Venues, Passes) : en-tête fixe, tableau qui défile. */
export const AdminListPage: FC<AdminListPageProps> = ({ entete, children }) => {
  return (
    <>
      <div className={styles.enteteFixe}>{entete}</div>
      <div className={styles.defilement}>{children}</div>
    </>
  );
};
