"use server";

import { parseVenueBlocks, type VenueBlock } from "@siempass/feature-venue-page";
import { isSentBlock } from "./article";
import { echecEnregistrement, type ResultatEcriture } from "../../../lib/ecriture";
import { creerClientAdmin } from "../../../lib/supabase-serveur";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * « Save » de l'éditeur : écrit la photo d'en-tête et les blocs, rien d'autre (VEN-38). L'état du
 * lieu ne change pas : un lieu en ligne voit sa fiche publique changer tout de suite (« Ouvert
 * pour Ghya » 2), un brouillon reste un brouillon.
 *
 * L'argument vient du navigateur : il est relu ici, à la frontière, plutôt que cru sur son type.
 * Un bloc mal formé est écarté (même lecture que celle du site), une adresse de photo qui n'est
 * pas en http(s) est refusée.
 */
export async function enregistrerArticle(venueId: string, article: unknown): Promise<ResultatEcriture> {
  const lu = lireArticle(article);
  if (!UUID.test(venueId) || lu === null) {
    return { statut: "erreur", message: "Invalid article." };
  }

  const supabase = await creerClientAdmin();
  const { data, error } = await supabase
    .from("venues")
    .update({ photo_entete: lu.headerPhotoUrl, contenu: lu.blocks })
    .eq("id", venueId)
    .select("id");

  if (error !== null) {
    return echecEnregistrement(`article du lieu ${venueId}`, error);
  }
  // Aucune ligne touchée : lieu inconnu, ou session refusée par le RLS.
  if (data.length === 0) {
    return { statut: "erreur", message: "Venue not found." };
  }
  return { statut: "ok" };
}

type ArticleLu = { headerPhotoUrl: string | null; blocks: VenueBlock[] };

function lireArticle(valeur: unknown): ArticleLu | null {
  if (typeof valeur !== "object" || valeur === null) {
    return null;
  }
  const headerPhotoUrl = "headerPhotoUrl" in valeur ? valeur.headerPhotoUrl : undefined;
  if (headerPhotoUrl !== null && !estAdresseDePhoto(headerPhotoUrl)) {
    return null;
  }
  // Une photo jamais envoyée n'est pas enregistrée (tranché par Ghya le 15/11).
  const blocks = parseVenueBlocks("blocks" in valeur ? valeur.blocks : undefined).filter(isSentBlock);
  const photosValides = blocks.every((block) => block.kind !== "photo" || estAdresseDePhoto(block.url));
  return photosValides ? { headerPhotoUrl, blocks } : null;
}

function estAdresseDePhoto(valeur: unknown): valeur is string {
  if (typeof valeur !== "string") {
    return false;
  }
  try {
    const { protocol } = new URL(valeur);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
