"use server";

import type { Database, EtatPartenaire } from "@siempass/db";
import { echecEnregistrement } from "../lib/ecriture";
import { creerClientAdmin } from "../lib/supabase-serveur";
import {
  categorieSaisie,
  CHAMPS_DU_LIEU,
  champsManquants,
  REQUIS_POUR_ENREGISTRER,
  REQUIS_POUR_PUBLIER,
  type ChampDuLieu,
  type ResultatLieu,
  type SaisieLieu,
} from "./lieu";

/* Les écritures de la fiche d'un lieu (specs/venues.md, bloc 3). Les règles de VEN-23 et VEN-24
   sont tenues ICI, pas seulement dans le panneau : une action serveur est un point d'entrée
   public, appelable sans passer par le formulaire. Le rôle est `authenticated` (session lue dans
   les cookies) ; le RLS de `venues` ouvre la lecture et l'écriture, sans suppression.
   L'appelant rafraîchit la liste (`router.refresh()`) après un succès. */

type ColonnesDeLaFiche = Pick<
  Database["public"]["Tables"]["venues"]["Update"],
  "nom" | "tagline" | "partenaire_id" | "categorie" | "adresse" | "lien_maps" | "horaires" | "avantage"
>;

/** VEN-23 : nom et partenaire suffisent à enregistrer un brouillon. */
export async function creerLieu(saisieRecue: unknown): Promise<ResultatLieu> {
  const saisie = lireSaisie(saisieRecue);
  if (saisie === null) {
    return SAISIE_ILLISIBLE;
  }

  const manquants = champsManquants(saisie, REQUIS_POUR_ENREGISTRER);
  if (manquants.length > 0) {
    return incomplet(manquants, false);
  }

  const supabase = await creerClientAdmin();
  /* `etat`, `slug` et `auteur_id` ne sont pas passés : la base pose `brouillon` (VEN-6),
     l'adresse de la page (VEN-10) et le compte connecté (VEN-9). */
  const { data, error } = await supabase
    .from("venues")
    .insert({ ...colonnesDeLaFiche(saisie), nom: saisie.nom.trim(), partenaire_id: saisie.partenaire_id })
    .select("id")
    .single();

  return error === null ? { statut: "ok", id: data.id } : echecEnregistrement("création d'un lieu", error);
}

/** « Save » : brouillon (VEN-23) ou lieu en ligne, qui doit garder une fiche complète (VEN-24). */
export async function enregistrerLieu(id: string, saisieRecue: unknown): Promise<ResultatLieu> {
  const saisie = lireSaisie(saisieRecue);
  if (saisie === null) {
    return SAISIE_ILLISIBLE;
  }

  const supabase = await creerClientAdmin();
  /* L'état est lu en base, pas reçu du client : c'est lui qui décide des champs exigés. */
  const lu = await supabase.from("venues").select("etat").eq("id", id).maybeSingle();
  if (lu.error !== null) {
    return echecEnregistrement(`lecture de l'état du lieu ${id}`, lu.error);
  }
  if (lu.data === null) {
    return LIEU_INTROUVABLE;
  }

  const enLigne = lu.data.etat === "en ligne";
  const manquants = champsManquants(saisie, enLigne ? REQUIS_POUR_PUBLIER : REQUIS_POUR_ENREGISTRER);
  if (manquants.length > 0) {
    return incomplet(manquants, enLigne);
  }

  /* Condition sur l'état lu : si le lieu a changé d'état entre la lecture et l'écriture, rien
     n'est écrit plutôt que de laisser passer une fiche incomplète en ligne. */
  return ecrire(id, colonnesDeLaFiche(saisie), lu.data.etat);
}

/** « Publish » : enregistre la fiche et met le lieu en ligne (VEN-6), si elle est complète (VEN-23).
    Incomplète, rien n'est écrit : le lieu reste en brouillon, la saisie reste dans le panneau. */
export async function publierLieu(id: string, saisieRecue: unknown): Promise<ResultatLieu> {
  const saisie = lireSaisie(saisieRecue);
  if (saisie === null) {
    return SAISIE_ILLISIBLE;
  }

  const manquants = champsManquants(saisie, REQUIS_POUR_PUBLIER);
  if (manquants.length > 0) {
    return incomplet(manquants, true);
  }

  return ecrire(id, { ...colonnesDeLaFiche(saisie), etat: "en ligne" }, "brouillon");
}

/** « Back to draft » : retire le lieu du site (VEN-6). La saisie en cours n'est pas enregistrée. */
export async function repasserLieuEnBrouillon(id: string): Promise<ResultatLieu> {
  return ecrire(id, { etat: "brouillon" }, "en ligne");
}

async function ecrire(
  id: string,
  colonnes: ColonnesDeLaFiche & { etat?: EtatPartenaire },
  etatAttendu: EtatPartenaire,
): Promise<ResultatLieu> {
  const supabase = await creerClientAdmin();
  const { data, error } = await supabase
    .from("venues")
    .update(colonnes)
    .eq("id", id)
    .eq("etat", etatAttendu)
    .select("id");

  if (error !== null) {
    return echecEnregistrement(`fiche du lieu ${id}`, error);
  }

  return data.length === 0 ? LIEU_CHANGE : { statut: "ok", id };
}

/* Les colonnes que la fiche écrit. Un champ vide devient nul : « pas rempli » n'a qu'une forme
   en base. Le nom et le partenaire ne sont jamais vides ici (vérifiés avant). */
function colonnesDeLaFiche(saisie: SaisieLieu): ColonnesDeLaFiche {
  return {
    nom: saisie.nom.trim(),
    tagline: texteOuNull(saisie.tagline),
    partenaire_id: saisie.partenaire_id,
    categorie: categorieSaisie(saisie),
    adresse: texteOuNull(saisie.adresse),
    lien_maps: texteOuNull(saisie.lien_maps),
    horaires: texteOuNull(saisie.horaires),
    avantage: texteOuNull(saisie.avantage),
  };
}

function texteOuNull(valeur: string): string | null {
  const propre = valeur.trim();

  return propre === "" ? null : propre;
}

/* Frontière : ce qui arrive d'une action serveur n'a pas de type garanti à l'exécution. */
function lireSaisie(valeur: unknown): SaisieLieu | null {
  if (typeof valeur !== "object" || valeur === null) {
    return null;
  }

  const saisie: Partial<SaisieLieu> = {};
  for (const champ of CHAMPS_DU_LIEU) {
    const texte: unknown = champ in valeur ? Reflect.get(valeur, champ) : undefined;
    if (typeof texte !== "string") {
      return null;
    }
    saisie[champ] = texte;
  }

  return estComplete(saisie) ? saisie : null;
}

function estComplete(saisie: Partial<SaisieLieu>): saisie is SaisieLieu {
  return CHAMPS_DU_LIEU.every((champ) => typeof saisie[champ] === "string");
}

function incomplet(champs: readonly ChampDuLieu[], messagePublication: boolean): ResultatLieu {
  return { statut: "incomplet", champs, messagePublication };
}

/* FIGMA-MANQUANT: aucun de ces trois messages n'est maquetté ni écrit dans la spec. Ils
   s'affichent dans le bandeau d'erreur d'écriture de l'écran, comme sur Partners. */
const SAISIE_ILLISIBLE: ResultatLieu = { statut: "erreur", message: "The venue form could not be read." };
const LIEU_INTROUVABLE: ResultatLieu = { statut: "erreur", message: "This venue no longer exists." };
const LIEU_CHANGE: ResultatLieu = {
  statut: "erreur",
  message: "This venue changed in the meantime. Close the panel and open it again.",
};
