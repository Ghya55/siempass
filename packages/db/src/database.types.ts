// Types de la base. Normalement générés :
//   supabase gen types typescript --project-id ybcdppcdgbbujmlmimqs > packages/db/src/database.types.ts
//
// Écrits à la main pour la démonstration du 10/11 : ni Docker ni la CLI Supabase ne tournent
// dans les sessions de l'équipe, et la génération suppose la migration déjà appliquée — or elle
// ne l'est qu'au merge dans `staging`. À régénérer d'un bloc dès qu'une session peut le faire ;
// d'ici là, toute colonne ajoutée se reporte ici dans la même PR que sa migration.

import type { SupabaseClient } from "@supabase/supabase-js";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Les deux valeurs de `partners.etat` (PART-3 à PART-5), reprises par `venues.etat` (VEN-6). */
export type EtatPartenaire = "brouillon" | "en ligne";

/** Les valeurs de `venues.categorie` (VEN-5). Les libellés sont dans packages/feature-venue-page. */
export type CategorieLieu = "bar" | "restaurant" | "cafe" | "shop" | "other";

export type Database = {
  public: {
    Tables: {
      /* `lieu_nom`, `lieu_adresse`, `lieu_description` et `avantage` sont nullables depuis
         20261115090000 (VEN-15) : le formulaire partenaire ne les écrit plus (PART-2). Elles
         restent en base, lues par le code de `main` (lien partenaire, scan), jusqu'à la tâche du
         scan par lieu. `etat` aussi : plus aucun écran du back-office ne l'écrit (VEN-36). */
      partners: {
        Row: {
          id: string;
          created_at: string;
          contact_nom: string;
          contact_prenom: string;
          contact_telephone: string;
          contact_email: string | null;
          lieu_nom: string | null;
          lieu_adresse: string | null;
          lieu_photo: string | null;
          lieu_description: string | null;
          avantage: string | null;
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
          lieu_nom?: string | null;
          lieu_adresse?: string | null;
          lieu_photo?: string | null;
          lieu_description?: string | null;
          avantage?: string | null;
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
          lieu_nom?: string | null;
          lieu_adresse?: string | null;
          lieu_photo?: string | null;
          lieu_description?: string | null;
          avantage?: string | null;
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
      /* Lieux (migrations 20261115090000 et 20261115140000, specs/venues.md). `slug`,
         `auteur_id` et `premiere_publication` sont posés par des déclencheurs : ce que le client y
         écrit est ignoré. `contenu` : tableau de blocs, lu
         par `parseVenueBlocks` (packages/feature-venue-page). */
      venues: {
        Row: {
          id: string;
          created_at: string;
          partenaire_id: string;
          auteur_id: string | null;
          nom: string;
          tagline: string | null;
          photo_entete: string | null;
          contenu: Json;
          adresse: string | null;
          lien_maps: string | null;
          categorie: CategorieLieu | null;
          horaires: string | null;
          avantage: string | null;
          slug: string;
          etat: EtatPartenaire;
          premiere_publication: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          partenaire_id: string;
          auteur_id?: string | null;
          nom: string;
          tagline?: string | null;
          photo_entete?: string | null;
          contenu?: Json;
          adresse?: string | null;
          lien_maps?: string | null;
          categorie?: CategorieLieu | null;
          horaires?: string | null;
          avantage?: string | null;
          slug?: string;
          etat?: EtatPartenaire;
          premiere_publication?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          partenaire_id?: string;
          auteur_id?: string | null;
          nom?: string;
          tagline?: string | null;
          photo_entete?: string | null;
          contenu?: Json;
          adresse?: string | null;
          lien_maps?: string | null;
          categorie?: CategorieLieu | null;
          horaires?: string | null;
          avantage?: string | null;
          slug?: string;
          etat?: EtatPartenaire;
          premiere_publication?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "venues_partenaire_id_fkey";
            columns: ["partenaire_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
        ];
      };
      /* Prénom d'un compte, pour « Written by » (migration 20261115140000, VEN-9). Lisible par
         `authenticated` seulement ; aucune écriture par l'API. */
      profiles: {
        Row: {
          id: string;
          prenom: string;
        };
        Insert: {
          id: string;
          prenom: string;
        };
        Update: {
          id?: string;
          prenom?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      /* Fiche du partenaire derrière son jeton d'accès (PART-7), ajoutée par la migration
         20261110120000 : `partners` n'est plus lisible en entier avec la seule clé publishable.
         `etat` est rendu en `text` par la fonction, comme la colonne : même type côté TypeScript. */
      /* Remet un pass dans l'état « jamais utilisé » (migration 20261110160000). `void` côté
         Postgres, donc aucune donnée en retour : seule l'erreur est à lire. */
      /* Prénom de l'auteur d'un lieu en ligne, par son adresse de page (migration 20261115140000,
         VEN-9) : la seule lecture de `profiles` ouverte à `anon`. Nul sinon. */
      prenom_auteur_du_lieu: {
        Args: { lieu_slug: string };
        Returns: string | null;
      };
      rafraichir_pass: {
        Args: { pass_id: string };
        Returns: undefined;
      };
      partenaire_par_jeton: {
        Args: { jeton_demande: string };
        Returns: {
          id: string;
          contact_nom: string;
          contact_prenom: string;
          contact_telephone: string;
          contact_email: string | null;
          lieu_nom: string | null;
          lieu_adresse: string | null;
          lieu_photo: string | null;
          lieu_description: string | null;
          avantage: string | null;
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
