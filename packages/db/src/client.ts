import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";
import type { Database, SiemPassSupabaseClient } from "./database.types";

/**
 * Client Supabase typé, avec la clé publishable (droits du rôle `anon`, bornés par le RLS).
 *
 * Un client par appelant, sans singleton : côté serveur Next.js, un singleton de module
 * partagerait une session entre deux requêtes de deux visiteurs. Le jour où une page cliente
 * en a besoin, elle aura son propre accesseur mémoïsé, côté navigateur seulement.
 */
export function createSupabaseClient(): SiemPassSupabaseClient {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
