-- Partenaires et passes : les deux tables du parcours de démonstration.
--   specs/partenaire.md     (PART-1 à PART-12)
--   specs/parcours-demo.md  (DEMO-1 à DEMO-28)
--
-- Nommage en français, comme les « Détails techniques » des deux specs ; l'interface, elle,
-- est en anglais (DEMO-27). Migration purement additive : compatible avec le code de `main`.

create extension if not exists pgcrypto;

-- ── Partenaires ───────────────────────────────────────────────────────────────
-- Un partenaire porte exactement un contact et un lieu (PART-1) : une seule table, pas de
-- `places` ni d'`offers` séparées. La liste d'attributs est fermée (PART-2).
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Contact : jamais rendu sur le site public (PART-8).
  contact_nom text not null,
  contact_prenom text not null,
  contact_telephone text not null,
  contact_email text,

  -- Lieu : rendu sur le site public quand l'état est « en ligne ».
  lieu_nom text not null,
  lieu_adresse text not null,
  lieu_photo text,
  lieu_description text not null,

  -- Avantage : saisi au back-office, lu seulement par le partenaire (PART-6).
  avantage text not null,

  -- Deux valeurs, pas un booléen : un troisième état n'imposera pas de migration de type
  -- (PART-3 création en brouillon, PART-4 mise en ligne explicite, PART-5 retour possible).
  etat text not null default 'brouillon' check (etat in ('brouillon', 'en ligne')),

  -- Lien d'accès du partenaire : jeton opaque, à la place d'un compte (PART-7).
  acces_jeton text not null unique default encode(gen_random_bytes(16), 'hex'),
  invitation_envoyee_le timestamptz
);

comment on table public.partners is
  'Un lieu de Siem Reap qui offre un avantage aux porteurs du pass (specs/partenaire.md).';
comment on column public.partners.acces_jeton is
  'Jeton du lien d''accès : tient lieu de connexion pour le partenaire (PART-7).';

-- Le site public ne lit que les partenaires en ligne (DEMO-3) : index sur l''état.
create index partners_etat_idx on public.partners (etat);

-- ── Passes ────────────────────────────────────────────────────────────────────
-- Un pass acheté sur le site public, validé au comptoir par le partenaire (DEMO-6).
create table public.passes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Contenu du QR code : opaque, sans information déductible.
  code text not null unique default encode(gen_random_bytes(12), 'hex'),

  -- Date affichée sur le pass, provisoire tant que la durée n'est pas tranchée (DEMO-9).
  -- La validation ne la regarde pas : trois résultats, et trois seulement (DEMO-6).
  valide_jusqu_au date not null default (current_date + 7),

  -- Validation : un seul passage par pass dans le MVP (DEMO-11). « Avantage unique ou
  -- répétable » est reporté (specs/parcours-demo.md, « Ouvert pour Ghya » 3).
  utilise_le timestamptz,
  utilise_par uuid references public.partners (id) on delete set null
);

comment on table public.passes is
  'Pass vendu au porteur, validé une fois au comptoir (specs/parcours-demo.md).';

-- ── Droits ────────────────────────────────────────────────────────────────────
-- Il n'y a pas d'écran de connexion (PART-7, DEMO-4, DEMO-20) : pas d'`auth.users`, donc
-- pas de rôles `admin` / `partner` lisibles dans une table `profiles`. Tout passe par le
-- rôle `anon` de la clé publishable. Conséquence assumée et bornée à la démonstration :
-- decisions/2026-11-10-droits-sans-authentification.md.
alter table public.partners enable row level security;
alter table public.passes enable row level security;

-- Back-office : liste, fiche, ajout, mise en ligne, retour en brouillon, invitation.
-- Site public : les lieux en ligne. Même rôle pour les deux, faute d'authentification.
create policy partners_lecture on public.partners for select to anon using (true);
create policy partners_ajout on public.partners for insert to anon with check (true);
create policy partners_modification on public.partners for update to anon using (true) with check (true);
-- Pas de politique de suppression : rien ne supprime un partenaire.

-- Le pass se lit par son code (page du pass, QR). Il ne s'écrit jamais depuis le navigateur :
-- la création (paiement) et la validation passent par une Edge Function en `service_role`
-- (skill backend-supabase, « le client ne crée jamais un pass »).
create policy passes_lecture on public.passes for select to anon using (true);
