// URL du projet et clé « publishable » de Supabase : publiques par conception (elles partent dans
// le navigateur de chaque visiteur). La sécurité tient aux politiques RLS (supabase/migrations/).
// La clé service_role ne vit que dans les secrets Vercel/GitHub et les Edge Functions.
//
// L'URL a un repli en dur : elle est publique et ne change pas (projet ybcdppcdgbbujmlmimqs).
// La clé n'en a pas : rien de ce qui ressemble à une clé n'entre dans le dépôt, même public.
// Les deux variables sont posées dans Vercel sur chacune des deux apps (voir .env.example).

const FALLBACK_SUPABASE_URL = "https://ybcdppcdgbbujmlmimqs.supabase.co";

export const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY: string =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
