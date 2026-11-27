import type { FC } from "react";
import { CircleAlert, Receipt } from "lucide-react";
import { AdminListPage, AdminShell } from "../components/admin-shell";
import { EmptyState } from "../components/empty-state";
import { SaleRow } from "./sale-row";
import type { VenteAffichee } from "./vente";
import styles from "./sales-screen.module.css";

export type SalesScreenProps = {
  ventes: VenteAffichee[];
  chargementEchoue: boolean;
  adresseConnectee: string;
};

/**
 * Page « Sales » (240:3345 tableau, 240:3475 vide, 240:3544 erreur de lecture) : les passes
 * vendus, un par ligne, en lecture seule (PASS-1). Ni panneau (PASS-3), ni suppression (PASS-6),
 * ni remise à zéro (PASS-7).
 *
 * Pas de colonne du porteur : on ne recueille rien à l'achat (PASS-5).
 */
export const SalesScreen: FC<SalesScreenProps> = ({ ventes, chargementEchoue, adresseConnectee }) => {
  return (
    <AdminShell adresse={adresseConnectee}>
      <AdminListPage
        entete={
          <div className={styles.entete}>
            <h1 className={styles.titre}>Sales</h1>
            {/* Choix d'Alex : pas de compte sans vente ; PASS-11 : ni en cas d'échec de lecture. */}
            {!chargementEchoue && ventes.length > 0 && (
              <span className={styles.compte}>
                {ventes.length === 1 ? "1 pass sold" : `${ventes.length} passes sold`}
              </span>
            )}
          </div>
        }
      >
        {chargementEchoue ? (
          <div className={styles.tableau}>
            <EmptyState icon={<CircleAlert size={24} />} title="Couldn't load sales. Reload the page." />
          </div>
        ) : (
          <div className={styles.tableau}>
            <EnteteTableau />
            {ventes.length === 0 ? (
              <EmptyState icon={<Receipt size={24} />} title="No sales yet" />
            ) : (
              ventes.map((vente) => <SaleRow key={vente.id} vente={vente} />)
            )}
          </div>
        )}
      </AdminListPage>
    </AdminShell>
  );
};

/* En-tête du tableau, dans le même fichier que l'écran : la grille est portée par la variable
   `--colonnes-ventes` du conteneur, les deux lignes ne peuvent pas se désaccorder.
   « ICT » parce que les horodatages sont rendus à l'heure du Cambodge (voir `lib/dates`). */
const EnteteTableau: FC = () => {
  return (
    <div className={styles.ligneEntete}>
      <span>Code</span>
      <span>Pass</span>
      <span>Bought (ICT)</span>
      <span>Valid until</span>
      <span>Status</span>
      <span>Used (ICT)</span>
    </div>
  );
};
