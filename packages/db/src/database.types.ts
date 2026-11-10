// Types de la base. Normalement générés :
//   supabase gen types typescript --project-id ybcdppcdgbbujmlmimqs > packages/db/src/database.types.ts
//
// Écrits à la main pour la démonstration du 10/11 : ni Docker ni la CLI Supabase ne tournent
// dans les sessions de l'équipe, et la génération suppose la migration déjà appliquée — or elle
// ne l'est qu'au merge dans `staging`. À régénérer d'un bloc dès qu'une session peut le faire ;
// d'ici là, toute colonne ajoutée se reporte ici dans la même PR que sa migration.

import type { SupabaseClient } from "@supabase/supabase-js";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Les deux valeurs de `partners.etat` (PART-3 à PART-5). */
export type EtatPartenaire = "brouillon" | "en ligne";

export type Database = {
  public: {
    Tables: {
      partners: {
        Row: {
          id: string;
          created_at: string;
          contact_nom: string;
          contact_prenom: string;
          contact_telephone: string;
          contact_email: string | null;
          lieu_nom: string;
          lieu_adresse: string;
          lieu_photo: string | null;
          lieu_description: string;
          avantage: string;
          etat: EtatPartenaire;
          acces_jeton: string;
          invitation_envoyee_le: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          contact_nom: string;
          contact_prenom: string;
          contact_telephone: string;
          contact_email?: string | null;
          lieu_nom: string;
          lieu_adresse: string;
          lieu_photo?: string | null;
          lieu_description: string;
          avantage: string;
          etat?: EtatPartenaire;
          acces_jeton?: string;
          invitation_envoyee_le?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          contact_nom?: string;
          contact_prenom?: string;
          contact_telephone?: string;
          contact_email?: string | null;
          lieu_nom?: string;
          lieu_adresse?: string;
          lieu_photo?: string | null;
          lieu_description?: string;
          avantage?: string;
          etat?: EtatPartenaire;
          acces_jeton?: string;
          invitation_envoyee_le?: string | null;
        };
        Relationships: [];
      };
      passes: {
        Row: {
          id: string;
          created_at: string;
          code: string;
          valide_jusqu_au: string;
          utilise_le: string | null;
          utilise_par: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          code?: string;
          valide_jusqu_au?: string;
          utilise_le?: string | null;
          utilise_par?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          code?: string;
          valide_jusqu_au?: string;
          utilise_le?: string | null;
          utilise_par?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "passes_utilise_par_fkey";
            columns: ["utilise_par"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      /* Fiche du partenaire derrière son jeton d'accès (PART-7), ajoutée par la migration
         20261110120000 : `partners` n'est plus lisible en entier avec la seule clé publishable.
         `etat` est rendu en `text` par la fonction, comme la colonne : même type côté TypeScript. */
      partenaire_par_jeton: {
        Args: { jeton_demande: string };
        Returns: {
          id: string;
          contact_nom: string;
          contact_prenom: string;
          contact_telephone: string;
          contact_email: string | null;
          lieu_nom: string;
          lieu_adresse: string;
          lieu_photo: string | null;
          lieu_description: string;
          avantage: string;
          etat: EtatPartenaire;
        }[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type SiemPassSupabaseClient = SupabaseClient<Database>;

export type Tables<Name extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Name] extends { Row: infer Row } ? Row : never;
