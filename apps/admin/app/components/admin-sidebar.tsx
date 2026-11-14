"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { CHEMIN_CONNEXION } from "../lib/chemins";
import { seDeconnecter } from "../login/actions";
import { Button } from "./button";
import { Icon, type IconName } from "@siempass/core-icons";
import styles from "./admin-sidebar.module.css";

type Entree = {
  readonly chemin: string;
  readonly libelle: string;
  /** Absente : l'écran n'est pas maquetté, aucune icône n'existe pour lui dans Figma. */
  readonly icone?: IconName;
};

/* Les écrans du back-office, dans l'ordre de la barre (Figma : Partners, Venues). « Passes »
   n'est pas dans le Figma de la barre : c'est l'écran de test du 10/11, gardé en dernier. */
const ENTREES: readonly Entree[] = [
  { chemin: "/partners", libelle: "Partners", icone: "store" },
  { chemin: "/venues", libelle: "Venues", icone: "pin" },
  { chemin: "/passes", libelle: "Passes" },
];

export type AdminSidebarProps = {
  /** Adresse du compte connecté. Vide seulement si la session s'est éteinte entre-temps. */
  adresse: string;
  /**
   * Donné par un écran qui a des modifications non enregistrées (l'éditeur d'un lieu, VEN-26) :
   * une sortie par la barre (lien ou « Sign out ») lui est remise au lieu d'avoir lieu, et c'est
   * lui qui la confirme. Absent : la barre navigue sans rien demander.
   */
  demanderSortie?: ((sortir: () => void) => void) | undefined;
};

/* Navigation du back-office. */
export const AdminSidebar: FC<AdminSidebarProps> = ({ adresse, demanderSortie }) => {
  const router = useRouter();
  const chemin = usePathname();
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
        {ENTREES.map((entree) => {
          /* Une sous-page (l'éditeur d'un lieu) garde son écran actif. */
          const actif = chemin === entree.chemin || chemin.startsWith(`${entree.chemin}/`);

          return (
            <li key={entree.chemin}>
              <Link
                aria-current={actif ? "page" : undefined}
                className={actif ? styles.navItemActif : styles.navItem}
                href={entree.chemin}
                onClick={(evenement) => {
                  if (demanderSortie !== undefined) {
                    evenement.preventDefault();
                    demanderSortie(() => {
                      router.push(entree.chemin);
                    });
                  }
                }}
              >
                {entree.icone === undefined ? (
                  // FIGMA-MANQUANT: pas d'icône pour « Passes », écran de test non maquetté.
                  <span aria-hidden="true" className={styles.iconeAbsente} />
                ) : (
                  <Icon name={entree.icone} size={18} />
                )}
                {entree.libelle}
              </Link>
            </li>
          );
        })}
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
            if (demanderSortie === undefined) {
              void deconnecter();
              return;
            }
            demanderSortie(() => {
              void deconnecter();
            });
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
