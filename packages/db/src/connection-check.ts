import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "./client";
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

// Table qui n'existe pas, volontairement : PostgREST doit répondre « table inconnue » (PGRST205),
// ce qui prouve que l'URL et la clé ont été acceptées, sans qu'aucune table métier existe.
const UNKNOWN_TABLE = "_sonde_connexion_table_inexistante" as const;

// PostgREST répond PGRST2xx quand la requête a été comprise mais ne correspond à rien dans le
// schéma (table, colonne, fonction inconnue) ; 42P01 est l'équivalent côté Postgres.
const SCHEMA_ERROR_CODE = /^(PGRST2\d\d|42P01)$/;
const AUTH_ERROR_MESSAGE = /invalid api key|no api key found|jwt|unauthorized/i;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const NO_HTTP_RESPONSE = 0;

type ProbeFailure = {
  readonly status: number;
  readonly error: {
    readonly message: string;
    readonly code: string | undefined;
    readonly hint: string | undefined;
  } | null;
};

/**
 * Interroge PostgREST via le client `supabase-js`, qui pose lui-même les en-têtes (la clé
 * publishable ne voyage que dans `apikey`, jamais dans `Authorization`). La requête vise une
 * table inexistante : une erreur de schéma est la réponse attendue, une erreur d'authentification
 * est la vraie panne.
 */
export async function checkSupabaseConnection(): Promise<SupabaseConnection> {
  if (SUPABASE_PUBLISHABLE_KEY === "") {
    return { status: "erreur", detail: MISSING_KEY_DETAIL };
  }

  // Le client typé n'accepte que les tables du schéma, qui est vide au socle : on le voit
  // comme un client non typé, c'est une affectation vers un type plus large, sans cast.
  const client: SupabaseClient = createSupabaseClient();
  try {
    const response = await client
      .from(UNKNOWN_TABLE)
      .select("*")
      .limit(1)
      .retry(false)
      .abortSignal(AbortSignal.timeout(CHECK_TIMEOUT_MS));
    return interpretProbe(response);
  } catch (cause) {
    // supabase-js renvoie les échecs réseau dans `error` ; ce filet ne sert que si le client lève.
    const message = cause instanceof Error ? cause.message : String(cause);
    return { status: "erreur", detail: `${SUPABASE_URL} injoignable : ${message}` };
  }
}

function interpretProbe(response: ProbeFailure): SupabaseConnection {
  const { status, error } = response;

  if (error === null) {
    return { status: "connecte", detail: `${SUPABASE_URL} · requête acceptée (HTTP ${status}).` };
  }

  if (status === NO_HTTP_RESPONSE) {
    return { status: "erreur", detail: `${SUPABASE_URL} injoignable : ${error.message}` };
  }

  const isAuthError =
    status === HTTP_UNAUTHORIZED || status === HTTP_FORBIDDEN || AUTH_ERROR_MESSAGE.test(error.message);
  if (isAuthError) {
    return {
      status: "erreur",
      detail: `${SUPABASE_URL} a refusé la clé (HTTP ${status}) : ${error.message}${hintSuffix(error.hint)}`,
    };
  }

  if (typeof error.code === "string" && SCHEMA_ERROR_CODE.test(error.code)) {
    return {
      status: "connecte",
      detail: `${SUPABASE_URL} · clé acceptée, PostgREST a répondu ${error.code} (attendu : aucune table au socle).`,
    };
  }

  return {
    status: "erreur",
    detail: `${SUPABASE_URL} a répondu HTTP ${status}${codeSuffix(error.code)} : ${error.message}${hintSuffix(error.hint)}`,
  };
}

// Le gateway Supabase (réponse 401) n'envoie pas toujours `hint` ni `code`, malgré le type du client.
function hintSuffix(hint: string | undefined): string {
  return typeof hint === "string" && hint !== "" ? ` — ${hint}` : "";
}

function codeSuffix(code: string | undefined): string {
  return typeof code === "string" && code !== "" ? ` (${code})` : "";
}
