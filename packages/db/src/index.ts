export { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";
export { createSupabaseClient } from "./client";
export { checkSupabaseConnection } from "./connection-check";
export type { SupabaseConnection } from "./connection-check";
export type { Database, EtatPartenaire, SiemPassSupabaseClient, Tables } from "./database.types";
