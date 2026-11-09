// Types de la base, à régénérer après chaque migration :
//   supabase gen types typescript --project-id ybcdppcdgbbujmlmimqs > packages/db/src/database.types.ts
// Jamais édité à la main. Vide pour l'instant : aucune table métier n'existe, le schéma suit les
// écrans validés (skill backend-supabase, « le schéma suit les écrans validés »).

import type { SupabaseClient } from "@supabase/supabase-js";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type SiemPassSupabaseClient = SupabaseClient<Database>;

export type Tables<Name extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Name] extends { Row: infer Row } ? Row : never;
