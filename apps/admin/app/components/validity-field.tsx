"use client";

import type { FC } from "react";
import type { ModeValidite } from "@siempass/db";
import { Chip } from "./chip";
import { Field } from "./field";
import { SegmentedControl, type SegmentedOption } from "./segmented-control";
import styles from "./validity-field.module.css";

const MODES: readonly SegmentedOption<ModeValidite>[] = [
  { value: "date", label: "Until a date" },
  { value: "jours", label: "Days after purchase" },
];

/* CAT-4 : quatre raccourcis ; mensuel = 30 jours, annuel = 365 jours. */
const RACCOURCIS = [
  { jours: 1, label: "1 day" },
  { jours: 7, label: "7 days" },
  { jours: 30, label: "30 days" },
  { jours: 365, label: "365 days" },
] as const;

export type ValidityFieldProps = {
  /* Variant `mode` du Figma : untilDate / daysAfter. */
  mode: ModeValidite;
  onModeChange: (mode: ModeValidite) => void;
  validUntil: string;
  onValidUntilChange: (date: string) => void;
  numberOfDays: string;
  onNumberOfDaysChange: (jours: string) => void;
  validUntilError: string | null;
  numberOfDaysError: string | null;
};

/* Figma `ValidityField` (234:470) : « Validity », deux modes, chacun avec son champ. Un raccourci
   remplit le nombre, qui reste modifiable (CAT-4). */
export const ValidityField: FC<ValidityFieldProps> = ({
  mode,
  onModeChange,
  validUntil,
  onValidUntilChange,
  numberOfDays,
  onNumberOfDaysChange,
  validUntilError,
  numberOfDaysError,
}) => {
  return (
    <div className={styles.champ}>
      <span className={styles.label}>Validity</span>
      <SegmentedControl label="Validity" onChange={onModeChange} options={MODES} value={mode} />
      {mode === "date" ? (
        <Field
          erreur={validUntilError}
          isOptional={false}
          kind="date"
          label="Valid until"
          name="valide_jusqu_au"
          onChange={onValidUntilChange}
          value={validUntil}
        />
      ) : (
        <>
          <Field
            erreur={numberOfDaysError}
            isOptional={false}
            kind="text"
            label="Number of days"
            name="validite_jours"
            onChange={onNumberOfDaysChange}
            value={numberOfDays}
          />
          <div className={styles.raccourcis}>
            {RACCOURCIS.map((raccourci) => (
              <Chip
                isSelected={numberOfDays.trim() === String(raccourci.jours)}
                key={raccourci.jours}
                label={raccourci.label}
                onClick={() => {
                  onNumberOfDaysChange(String(raccourci.jours));
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
