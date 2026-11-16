"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { AdminListPage, AdminShell } from "../components/admin-shell";
import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";
import type { ResultatEcriture } from "../lib/ecriture";
import { creerArtiste, modifierArtiste, supprimerArtiste } from "./actions";
import { ArtistPanel } from "./artist-panel";
import type { Artiste, SaisieArtiste } from "./artiste";
import { DeleteButton } from "./delete-button";
import styles from "./artists-screen.module.css";

export type ArtistsScreenProps = {
  artistes: Artiste[];
  chargementEchoue: boolean;
  /** Adresse du compte connecté, affichée dans la barre latérale. */
  adresseConnectee: string;
};

type Panneau =
  | { readonly etat: "ferme" }
  | { readonly etat: "creation" }
  | { readonly etat: "fiche"; readonly id: string };

const PANNEAU_FERME: Panneau = { etat: "ferme" };

/* FIGMA-MANQUANT: la page « Artists » n'est pas maquettée (specs/artists.md). Elle reprend la
   page Venues : en-tête, tableau, fiche en panneau de droite, mêmes tokens. */
export const ArtistsScreen: FC<ArtistsScreenProps> = ({ artistes, chargementEchoue, adresseConnectee }) => {
  const router = useRouter();
  const [panneau, setPanneau] = useState<Panneau>(PANNEAU_FERME);
  const [enCours, setEnCours] = useState(false);
  const [erreurEcriture, setErreurEcriture] = useState<string | null>(null);

  const artisteOuvert =
    panneau.etat === "fiche" ? (artistes.find((artiste) => artiste.id === panneau.id) ?? null) : null;
  const panneauVisible = panneau.etat === "creation" || artisteOuvert !== null;

  const ouvrir = (suivant: Panneau): void => {
    setErreurEcriture(null);
    setPanneau(suivant);
  };

  /* Toute écriture suit le même chemin : action serveur, puis rafraîchissement de la liste. */
  const ecrire = async <Resultat extends ResultatEcriture>(
    ecriture: () => Promise<Resultat>,
  ): Promise<Resultat> => {
    setEnCours(true);
    setErreurEcriture(null);
    const resultat = await ecriture();
    setEnCours(false);

    if (resultat.statut === "erreur") {
      setErreurEcriture(resultat.message);
    } else {
      router.refresh();
    }

    return resultat;
  };

  /* ART-4 : une fois créé, le panneau montre la fiche de l'artiste. */
  const creer = async (saisie: SaisieArtiste): Promise<void> => {
    const resultat = await ecrire(() => creerArtiste(saisie));

    if (resultat.statut === "ok") {
      setPanneau({ etat: "fiche", id: resultat.id });
    }
  };

  const supprimer = async (id: string): Promise<void> => {
    const resultat = await ecrire(() => supprimerArtiste(id));

    if (resultat.statut === "ok" && panneau.etat === "fiche" && panneau.id === id) {
      setPanneau(PANNEAU_FERME);
    }
  };

  return (
    <AdminShell
      adresse={adresseConnectee}
      panneau={
        <>
          {panneau.etat === "creation" && (
            <ArtistPanel
              enCours={enCours}
              erreur={erreurEcriture}
              key="creation"
              mode={{ kind: "creation" }}
              onClose={() => {
                ouvrir(PANNEAU_FERME);
              }}
              onSave={(saisie) => {
                void creer(saisie);
              }}
            />
          )}
          {artisteOuvert !== null && (
            <ArtistPanel
              enCours={enCours}
              erreur={erreurEcriture}
              key={artisteOuvert.id}
              mode={{
                kind: "fiche",
                artiste: artisteOuvert,
                onDelete: () => {
                  void supprimer(artisteOuvert.id);
                },
              }}
              onClose={() => {
                ouvrir(PANNEAU_FERME);
              }}
              onSave={(saisie) => {
                void ecrire(() => modifierArtiste(artisteOuvert.id, saisie));
              }}
            />
          )}
        </>
      }
    >
      <AdminListPage
        entete={
          <div className={styles.entete}>
            <h1 className={styles.titre}>Artists</h1>
            <Button
              label="Add artist"
              onClick={() => {
                ouvrir({ etat: "creation" });
              }}
              tone="primary"
            />
          </div>
        }
      >
        {chargementEchoue && <p className={styles.erreur}>Couldn&apos;t load artists. Reload the page.</p>}
        {/* Panneau ouvert : l'erreur s'affiche dans le panneau (ART-6). */}
        {erreurEcriture !== null && !panneauVisible && <p className={styles.erreur}>{erreurEcriture}</p>}
        {!chargementEchoue && (
          <div className={styles.tableau}>
            <div className={styles.ligneEntete}>
              <span className={styles.colonne}>Name</span>
              <span className={styles.colonne}>Category</span>
              <span className={styles.colonne}>Social</span>
              <span className={styles.colonneAction} />
            </div>
            {artistes.length === 0 ? (
              <EmptyState title="No artists yet" />
            ) : (
              artistes.map((artiste) => {
                const selectionne = artiste.id === artisteOuvert?.id;

                return (
                  <div className={`${styles.ligne} ${selectionne ? styles.selectionnee : ""}`} key={artiste.id}>
                    <button
                      aria-pressed={selectionne}
                      className={styles.ouvrir}
                      onClick={() => {
                        ouvrir({ etat: "fiche", id: artiste.id });
                      }}
                      type="button"
                    >
                      <span className={`${styles.colonne} ${styles.nom}`}>{artiste.nom}</span>
                      <span className={styles.colonne}>{artiste.categorie}</span>
                      <span className={`${styles.colonne} ${styles.secondaire}`}>
                        {artiste.reseau_social ?? "—"}
                      </span>
                    </button>
                    <span className={styles.colonneAction}>
                      <DeleteButton
                        disabled={enCours}
                        onDelete={() => {
                          void supprimer(artiste.id);
                        }}
                      />
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </AdminListPage>
    </AdminShell>
  );
};
