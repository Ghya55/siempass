"use client";

import { useState, type FC, type ReactNode } from "react";
import { Check, CircleAlert, Search } from "lucide-react";
import type { ModeSelection } from "@siempass/db";
import { SegmentedControl } from "./segmented-control";
import styles from "./pick-list.module.css";

export type PickItem = {
  readonly id: string;
  readonly name: string;
  /* À droite de la ligne : le badge « Draft » d'un lieu, la date d'un événement (234:434). */
  readonly meta: ReactNode;
};

export type PickListProps = {
  label: string;
  allLabel: string;
  selectedLabel: string;
  /* Variant `mode` du Figma : all (« All … », la liste est celle des exclusions, « Except ») ou
     selected (« Selected … », la liste est celle des choisis). */
  mode: ModeSelection;
  onModeChange: (mode: ModeSelection) => void;
  items: readonly PickItem[];
  /* Chaque mode garde sa propre liste pendant la saisie (choix d'Alex). */
  checkedByMode: Readonly<Record<ModeSelection, readonly string[]>>;
  onToggle: (id: string) => void;
  /* Variant `state=error` du Figma (CAT-21) : bordure danger. */
  hasError: boolean;
  /* Message sous la liste (« Add at least one venue or event. », 240:1839). */
  errorMessage: string | null;
};

/**
 * Figma `PickList` (234:434) : cocher vite plusieurs éléments parmi quelques dizaines, en retrouver
 * un par son nom, voir combien sont cochés (CAT-7, CAT-8). Choix d'Alex : recherche sans texte
 * indicatif, compte des cochés, lignes cochées en tête.
 *
 * Les lignes cochées remontent à l'ouverture et au changement de mode, pas à chaque clic : une
 * ligne qui sauterait sous le pointeur ferait cocher la suivante par erreur.
 */
export const PickList: FC<PickListProps> = ({
  label,
  allLabel,
  selectedLabel,
  mode,
  onModeChange,
  items,
  checkedByMode,
  onToggle,
  hasError,
  errorMessage,
}) => {
  const [recherche, setRecherche] = useState("");
  const [enTete, setEnTete] = useState<ReadonlySet<string>>(() => new Set(checkedByMode[mode]));
  const coches = new Set(checkedByMode[mode]);

  const changerDeMode = (suivant: ModeSelection): void => {
    setEnTete(new Set(checkedByMode[suivant]));
    onModeChange(suivant);
  };

  const cle = normaliser(recherche);
  const visibles = items
    .filter((item) => cle === "" || normaliser(item.name).includes(cle))
    .sort((a, b) => Number(enTete.has(b.id)) - Number(enTete.has(a.id)));

  return (
    <div className={styles.champ}>
      <span className={styles.label}>{label}</span>
      <SegmentedControl
        label={label}
        onChange={changerDeMode}
        options={[
          { value: "tous", label: allLabel },
          { value: "liste", label: selectedLabel },
        ]}
        value={mode}
      />
      {mode === "tous" && <span className={styles.except}>Except</span>}
      <div className={hasError ? styles.boiteFautive : styles.boite}>
        <label className={styles.recherche}>
          <Search aria-hidden="true" className={styles.iconeRecherche} size={16} />
          <input
            aria-label={`Search ${label.toLowerCase()}`}
            className={styles.saisieRecherche}
            onChange={(evenement) => {
              setRecherche(evenement.target.value);
            }}
            type="search"
            value={recherche}
          />
          <CountPill count={coches.size} />
        </label>
        <ul className={styles.lignes}>
          {visibles.map((item) => (
            <PickRow
              id={item.id}
              isChecked={coches.has(item.id)}
              key={item.id}
              meta={item.meta}
              name={item.name}
              onToggle={onToggle}
            />
          ))}
        </ul>
      </div>
      {errorMessage !== null && (
        <p className={styles.erreur}>
          <CircleAlert size={16} />
          {errorMessage}
        </p>
      )}
    </div>
  );
};

type CountPillProps = {
  count: number;
};

/* Figma `CountPill` : le nombre de lignes cochées dans le mode courant. */
const CountPill: FC<CountPillProps> = ({ count }) => {
  return (
    <span aria-label={`${count} checked`} className={styles.compte}>
      <Check aria-hidden="true" size={12} strokeWidth={3} />
      {count}
    </span>
  );
};

type PickRowProps = {
  id: string;
  name: string;
  meta: ReactNode;
  isChecked: boolean;
  onToggle: (id: string) => void;
};

/* Figma `PickRow` : case, nom, et à droite le badge ou la date. */
const PickRow: FC<PickRowProps> = ({ id, name, meta, isChecked, onToggle }) => {
  return (
    <li>
      <label className={styles.ligne}>
        <input
          checked={isChecked}
          className={styles.case}
          onChange={() => {
            onToggle(id);
          }}
          type="checkbox"
        />
        <span className={styles.nom}>{name}</span>
        {meta}
      </label>
    </li>
  );
};

/* Recherche par nom : sans casse ni accent (« cafe » trouve « Café »). */
function normaliser(texte: string): string {
  return texte.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}
