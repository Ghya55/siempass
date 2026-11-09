import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/**
 * Résultat de la vérification de connexion, affiché tel quel par la page de base des deux apps.
 * `detail` est toujours rempli : un écran qui dit « erreur » sans dire laquelle ne sert à rien.
 */
export type SupabaseConnection =
  | { readonly status: "connecte"; readonly detail: string }
  | { readonly status: "erreur"; readonly detail: string };

const CHECK_TIMEOUT_MS = 5_000 as const;
const MISSING_KEY_DETAIL =
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY absente de l'environnement : à poser dans Vercel (voir .env.example).";

/**
 * Interroge la racine de PostgREST (`/rest/v1/`), qui répond sans qu'aucune table existe.
 * C'est volontairement un `fetch` et non le client typé : au socle il n'y a aucune table
 * métier à interroger, et on veut prouver que l'URL et la clé passent vraiment le réseau,
 * pas qu'un objet client s'est construit en mémoire.
 */
export async function checkSupabaseConnection(): Promise<SupabaseConnection> {
  if (SUPABASE_PUBLISHABLE_KEY === "") {
    return { status: "erreur", detail: MISSING_KEY_DETAIL };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        status: "erreur",
        detail: `${SUPABASE_URL} a répondu HTTP ${response.status} (${response.statusText}).`,
      };
    }

    const serveur = response.headers.get("server") ?? "serveur non annoncé";
    return { status: "connecte", detail: `${SUPABASE_URL} · ${serveur}` };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { status: "erreur", detail: `${SUPABASE_URL} injoignable : ${message}` };
  }
}
