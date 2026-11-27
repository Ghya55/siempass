import type { FC } from "react";
import { formatJour, formatInstantVente } from "../lib/dates";
import { PassStatusBadge } from "./pass-status-badge";
import { codeAbrege, type VenteAffichee } from "./vente";
import styles from "./sale-row.module.css";

export type SaleRowProps = {
  vente: VenteAffichee;
};

/* Une ligne du tableau des ventes (240:3345). Le clic ne fait rien (PASS-3). */
export const SaleRow: FC<SaleRowProps> = ({ vente }) => {
  return (
    <div className={styles.ligne}>
      {/* Le code complet reste lisible au survol et à la recherche dans la page : c'est lui que
          le porteur lit sous son QR. */}
      <span className={styles.colonne} title={vente.code}>
        {codeAbrege(vente.code)}
      </span>
      {/* PASS-21 : « — » pour une vente sans pass du catalogue. */}
      <span className={styles.colonne}>{vente.nomDuPass ?? "—"}</span>
      <span className={styles.colonne}>{formatInstantVente(vente.created_at)}</span>
      <span className={styles.colonne}>{formatJour(vente.valide_jusqu_au)}</span>
      <span className={styles.colonne}>
        <PassStatusBadge statut={vente.statut} />
      </span>
      <span className={styles.colonne}>
        {vente.utilise_le === null ? (
          "—"
        ) : (
          <>
            <span>{formatInstantVente(vente.utilise_le)}</span>
            {/* PASS-12 : un lieu supprimé laisse `utilise_par` à null (on delete set null) : la
                validation a bien eu lieu, mais on ne sait plus où. */}
            <span className={styles.secondaire}>{vente.lieuValidation ?? "Unknown venue"}</span>
          </>
        )}
      </span>
    </div>
  );
};
