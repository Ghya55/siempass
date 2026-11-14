import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, type Database } from "@siempass/db";

/** Bucket des photos des lieux (migration 20261115090000) : lecture publique, écriture `authenticated`. */
const BUCKET = "venues" as const;

export type UploadResult = { readonly status: "ok"; readonly url: string } | { readonly status: "failed" };

/**
 * Envoie une photo dans le bucket, depuis le navigateur, avec la session de l'admin (cookies
 * posés par la connexion) : le fichier ne transite pas par une action serveur, dont le corps est
 * limité à 1 Mo. Rend l'adresse publique, celle que le site sert sans session.
 *
 * Un nom neuf par envoi, rangé sous le lieu : une photo remplacée reste dans le bucket (rien ne
 * s'y supprime), et l'adresse d'une photo déjà publiée ne change jamais de contenu.
 *
 * Toute erreur (réseau, RLS, fichier refusé) donne `failed` : l'écran n'affiche que « Upload
 * failed. » (VEN-25).
 */
export async function uploadVenuePhoto(venueId: string, file: File): Promise<UploadResult> {
  try {
    const supabase = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const path = `${venueId}/${crypto.randomUUID()}${extensionOf(file)}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error !== null) {
      return { status: "failed" };
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { status: "ok", url: data.publicUrl };
  } catch {
    return { status: "failed" };
  }
}

function extensionOf(file: File): string {
  const match = /\.[a-z0-9]{1,5}$/i.exec(file.name);
  return match === null ? "" : match[0].toLowerCase();
}
