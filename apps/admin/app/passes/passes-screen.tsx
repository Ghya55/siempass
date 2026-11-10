"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { AdminSidebar } from "../components/admin-sidebar";
import { EmptyState } from "../components/empty-state";
import type { ResultatEcriture } from "../lib/ecriture";
import { rafraichirPass, supprimerPass } from "./actions";
import { PassRow } from "./pass-row";
import type { PassAffiche } from "./pass";
import styles from "./passes-screen.module.css";

export type PassesScreenProps = {
  passes: PassAffiche[];
  erreurChargement: string | null;
  adresseConnectee: string;
};

/**
 * Tableau des passes vendus, un pass par ligne, avec les deux gestes de test demandés par Ghya
 * le 10/11 : rafraîchir et supprimer.
 *
 * FIGMA-MANQUANT: écran non maquetté, et sans spec — c'est un outil de test, pas une
 * fonctionnalité de production. Tout est repris de l'écran des partenaires.
 *
 * Pas de colonne e-mail : un visiteur n'a ni compte ni adresse (VIS-2, et la décision du 10/11
 * sur l'authentification). Le pass est porté par le navigateur, rien d'autre n'est collecté à
 * l'achat. Voir la description de la PR.
 */
export const PassesScreen: FC<PassesScreenProps> = ({ passes, erreurChargement, adresseConnectee }) => {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreurEcriture, setErreurEcriture] = useState<string | null>(null);

  /* Même chemin que sur l'écran des partenaires : action serveur, puis rafraîchissement. */
  const ecrire = async (ecriture: () => Promise<ResultatEcriture>): Promise<void> => {
    setEnCours(true);
    setErreurEcriture(null);
    const resultat = await ecriture();
    setEnCours(false);

    if (resultat.statut === "erreur") {
      setErreurEcriture(resultat.message);
      return;
    }

    router.refresh();
  };

  return (
    <div className={styles.ecran}>
      <AdminSidebar adresse={adresseConnectee} />
      <main className={styles.principal}>
        <div className={styles.entete}>
          <h1 className={styles.titre}>Passes</h1>
          <span className={styles.compte}>
            {passes.length} {passes.length === 1 ? "pass" : "passes"}
          </span>
        </div>
        <p className={styles.note}>
          Test tools. <strong>Refresh</strong> makes a pass scannable again and pushes its expiry
          back; the QR code stays the same. <strong>Delete</strong> is permanent — there is one
          database for staging and production.
        </p>
        {erreurChargement !== null && <p className={styles.erreur}>{erreurChargement}</p>}
        {erreurEcriture !== null && <p className={styles.erreur}>{erreurEcriture}</p>}
        <div className={styles.tableau}>
          <EnteteTableau />
          {passes.length === 0 ? (
            <EmptyState title="No passes yet" />
          ) : (
            passes.map((pass) => (
              <PassRow
                enCours={enCours}
                key={pass.id}
                onDelete={() => {
                  void ecrire(() => supprimerPass(pass.id));
                }}
                onRefresh={() => {
                  void ecrire(() => rafraichirPass(pass.id));
                }}
                pass={pass}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

/* En-tête du tableau, dans le même fichier que l'écran : la grille est portée par la variable
   `--colonnes-passes` du conteneur, les deux lignes ne peuvent pas se désaccorder.
   « ICT » parce que les horodatages sont rendus à l'heure du Cambodge (voir `lib/dates`). */
const EnteteTableau: FC = () => {
  return (
    <div className={styles.ligneEntete}>
      <span>Code</span>
      <span>Bought (ICT)</span>
      <span>Valid until</span>
      <span>Status</span>
      <span>Used (ICT)</span>
      <span />
    </div>
  );
};
