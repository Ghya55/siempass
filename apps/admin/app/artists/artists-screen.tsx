"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { AdminListPage, AdminShell } from "../components/admin-shell";
import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";
import { creerArtiste } from "./actions";
import { AddArtistDialog } from "./add-artist-dialog";
import type { Artiste, SaisieArtiste } from "./artiste";
import styles from "./artists-screen.module.css";

export type ArtistsScreenProps = {
  artistes: Artiste[];
  chargementEchoue: boolean;
  /** Adresse du compte connecté, affichée dans la barre latérale. */
  adresseConnectee: string;
};

/* FIGMA-MANQUANT: la page « Artists » n'est pas maquettée (specs/artists.md). Elle reprend la
   page Partners : même en-tête, même tableau, mêmes tokens. Pas de panneau : la ligne dit tout
   ce que la base sait d'un artiste (ART-4). */
export const ArtistsScreen: FC<ArtistsScreenProps> = ({ artistes, chargementEchoue, adresseConnectee }) => {
  const router = useRouter();
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreurEcriture, setErreurEcriture] = useState<string | null>(null);

  const enregistrer = async (saisie: SaisieArtiste): Promise<boolean> => {
    setEnCours(true);
    setErreurEcriture(null);
    const resultat = await creerArtiste(saisie);
    setEnCours(false);

    /* En cas d'échec la modale reste ouverte, avec la saisie et le message. */
    if (resultat.statut === "erreur") {
      setErreurEcriture(resultat.message);
      return false;
    }

    setAjoutOuvert(false);
    router.refresh();
    return true;
  };

  return (
    <AdminShell adresse={adresseConnectee}>
      <AdminListPage
        entete={
          <div className={styles.entete}>
            <h1 className={styles.titre}>Artists</h1>
            <Button
              label="Add artist"
              onClick={() => {
                setAjoutOuvert(true);
              }}
              tone="primary"
            />
          </div>
        }
      >
        {chargementEchoue && <p className={styles.erreur}>Couldn&apos;t load artists. Reload the page.</p>}
        {!chargementEchoue && (
          <div className={styles.tableau}>
            <div className={styles.ligneEntete}>
              <span className={styles.colonne}>Name</span>
              <span className={styles.colonne}>Category</span>
              <span className={styles.colonne}>Social</span>
            </div>
            {artistes.length === 0 ? (
              <EmptyState title="No artists yet" />
            ) : (
              artistes.map((artiste) => (
                <div className={styles.ligne} key={artiste.id}>
                  <span className={styles.colonne}>{artiste.nom}</span>
                  <span className={styles.colonne}>{artiste.categorie}</span>
                  <span className={`${styles.colonne} ${styles.secondaire}`}>
                    {artiste.reseau_social ?? "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </AdminListPage>
      {ajoutOuvert && (
        <AddArtistDialog
          enCours={enCours}
          erreur={erreurEcriture}
          onCancel={() => {
            setAjoutOuvert(false);
            setErreurEcriture(null);
          }}
          onSave={enregistrer}
        />
      )}
    </AdminShell>
  );
};
