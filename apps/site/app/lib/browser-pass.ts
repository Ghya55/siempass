"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient, SUPABASE_PUBLISHABLE_KEY } from "@siempass/db";

/**
 * VIS-2 — « ai-je un pass ? », une seule fois pour tout le site.
 *
 * Le pass est porté par le navigateur du visiteur, sans compte ni mot de passe
 * (decisions/2026-11-10-authentification.md). Ce fichier est le seul endroit du site qui lit
 * ou écrit ce stockage : l'accueil et la page `/pass` appellent `useBrowserPass`, personne
 * d'autre n'y touche. La mémorisation d'un pass acheté s'ajoutera ici, avec la feuille de
 * paiement, et nulle part ailleurs.
 */
const CLE_STOCKAGE = "siempass.pass.code" as const;

export type BrowserPass =
  | { readonly status: "reading" }
  | { readonly status: "noPass" }
  | { readonly status: "hasPass"; readonly code: string; readonly validUntil: string };

const EN_LECTURE: BrowserPass = { status: "reading" };
const SANS_PASS: BrowserPass = { status: "noPass" };

/**
 * Trois réponses, jamais une erreur affichée : un pass introuvable retombe en silence sur
 * « pas de pass » (VIS-17). La lecture se fait après le montage, donc le serveur et le
 * premier rendu du navigateur disent tous les deux « en cours de lecture » — la carte du
 * pass part de son état de chargement, qui a la même hauteur que les deux autres (VIS-34).
 */
export function useBrowserPass(): BrowserPass {
  const [pass, setPass] = useState<BrowserPass>(EN_LECTURE);

  useEffect(() => {
    let monte = true;
    void lirePassDuNavigateur().then((reponse) => {
      if (monte) {
        setPass(reponse);
      }
    });
    return () => {
      monte = false;
    };
  }, []);

  return pass;
}

async function lirePassDuNavigateur(): Promise<BrowserPass> {
  const code = lireCodeMemorise();
  if (code === null || SUPABASE_PUBLISHABLE_KEY === "") {
    return SANS_PASS;
  }

  try {
    return await relirePassEnBase(code);
  } catch {
    // Base injoignable : ce n'est pas « ce pass n'existe plus », on ne l'oublie donc pas.
    // Le visiteur voit l'état « sans pass » le temps de cette visite, sans message (VIS-17).
    return SANS_PASS;
  }
}

async function relirePassEnBase(code: string): Promise<BrowserPass> {
  const { data, error } = await createSupabaseClient()
    .from("passes")
    .select("code, valide_jusqu_au")
    .eq("code", code)
    .maybeSingle();

  if (error !== null) {
    return SANS_PASS;
  }
  if (data === null) {
    // VIS-17 : le pass mémorisé n'existe plus, le navigateur l'oublie, sans rien dire.
    oublierCodeMemorise();
    return SANS_PASS;
  }
  return { status: "hasPass", code: data.code, validUntil: data.valide_jusqu_au };
}

/** `localStorage` lève quand le navigateur l'interdit (navigation privée, cookies bloqués). */
function lireCodeMemorise(): string | null {
  try {
    const code = window.localStorage.getItem(CLE_STOCKAGE);
    return code === null || code === "" ? null : code;
  } catch {
    return null;
  }
}

function oublierCodeMemorise(): void {
  try {
    window.localStorage.removeItem(CLE_STOCKAGE);
  } catch {
    // Rien à faire : le navigateur ne mémorise rien, il n'y a donc rien à oublier.
  }
}
