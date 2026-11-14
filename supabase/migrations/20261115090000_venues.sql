-- Lieux : la table `venues`, la reprise des lieux portés jusqu'ici par `partners`, les photos.
--   specs/venues.md (VEN-1, VEN-6, VEN-9, VEN-10, VEN-16, VEN-17, VEN-21, VEN-34, VEN-35,
--   § Détails techniques)
--
-- Migration ADDITIVE (CLAUDE.md, une seule base) : rien n'est renommé ni supprimé. Les colonnes
-- `partners.lieu_*`, `avantage` et `etat` restent, lues par le code de `main` (site de prod, lien
-- partenaire, scan). Leur suppression viendra après la mise en prod du scan par lieu.
--
-- Nommage en français, comme `partners` et `passes`. `slug` est l'« adresse de la page » de la
-- spec : le mot « adresse » est déjà pris par l'adresse postale du lieu.

create extension if not exists unaccent with schema extensions;

-- ── Table ─────────────────────────────────────────────────────────────────────
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- VEN-1 : un lieu a exactement un partenaire. Pas de suppression en cascade : rien ne
  -- supprime un partenaire (aucune politique de suppression).
  partenaire_id uuid not null references public.partners (id),

  -- VEN-9 : le compte connecté qui crée le lieu, jamais saisi. Nul pour un lieu repris (VEN-17).
  auteur_id uuid references auth.users (id) on delete set null default auth.uid(),

  -- Seuls nom et partenaire sont exigés à l'enregistrement (VEN-23) ; le reste est exigé à la
  -- publication, par le back-office (tâche suivante), pas par la base.
  nom text not null,
  tagline text,
  photo_entete text,
  -- VEN-4 : blocs ordonnés, paragraphe ou photo. Un tableau sur la ligne : une écriture, un
  -- ordre. Forme d'un bloc : packages/feature-venue-page (`VenueBlock`).
  contenu jsonb not null default '[]'::jsonb check (jsonb_typeof(contenu) = 'array'),
  adresse text,
  lien_maps text,
  -- VEN-5 : liste fermée. Valeurs techniques ; les libellés (« Bar », « Café »…) sont dans
  -- packages/feature-venue-page. Nulle pour un lieu repris (VEN-17, VEN-27).
  categorie text check (categorie in ('bar', 'restaurant', 'cafe', 'shop', 'other')),
  horaires text,
  avantage text,

  -- VEN-10, VEN-21 : déduite du nom, unique parmi tous les lieux. Posée par le déclencheur
  -- ci-dessous, jamais par le client.
  slug text not null unique,

  -- VEN-6 : mêmes deux valeurs que `partners.etat`. Un lieu créé est en brouillon.
  etat text not null default 'brouillon' check (etat in ('brouillon', 'en ligne'))
);

comment on table public.venues is
  'Un lieu (bar, restaurant) rattaché à un partenaire, avec sa page publique (specs/venues.md).';
comment on column public.venues.slug is
  'Adresse de la page : /places/<slug> (VEN-10, VEN-21).';

create index venues_partenaire_idx on public.venues (partenaire_id);
create index venues_etat_idx on public.venues (etat);

-- ── Adresse de la page ────────────────────────────────────────────────────────
-- VEN-10 : minuscules, sans accent, mots reliés par des tirets. Un nom sans aucune lettre latine
-- (en khmer, par exemple) donnerait une adresse vide : on retombe sur « venue ».
create function public.slug_depuis_nom(nom text)
returns text
language sql
stable
set search_path = public, extensions
as $$
  select coalesce(
    nullif(trim(both '-' from regexp_replace(lower(unaccent(nom)), '[^a-z0-9]+', '-', 'g')), ''),
    'venue'
  );
$$;

-- VEN-21 : le deuxième « Mango Bar » reçoit `mango-bar-2`, puis `-3`. `lieu_exclu` : le lieu
-- qu'on renomme ne se compte pas comme doublon de lui-même.
create function public.slug_libre(nom text, lieu_exclu uuid)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  base constant text := public.slug_depuis_nom(nom);
  candidat text := base;
  rang integer := 1;
begin
  while exists (
    select 1 from public.venues as v
    where v.slug = candidat and v.id is distinct from lieu_exclu
  ) loop
    rang := rang + 1;
    candidat := base || '-' || rang;
  end loop;
  return candidat;
end;
$$;

-- Le déclencheur garantit l'unicité et la forme de l'adresse quel que soit l'écran qui écrit :
-- un client ne peut ni la choisir ni voir les lieux des autres pour éviter un doublon.
-- Elle suit le nom tant que le lieu est en brouillon, et se fige une fois le lieu mis en ligne
-- (« Ouvert pour Ghya » 3 : un lien partagé ne casse pas).
create function public.venues_poser_slug()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.slug := public.slug_libre(new.nom, new.id);
  elsif new.nom is distinct from old.nom and old.etat = 'brouillon' and new.etat = 'brouillon' then
    new.slug := public.slug_libre(new.nom, new.id);
  else
    new.slug := old.slug;
  end if;
  return new;
end;
$$;

create trigger venues_slug
  before insert or update on public.venues
  for each row execute function public.venues_poser_slug();

-- VEN-9 : l'auteur ne change pas quand un autre compte modifie le lieu. Le défaut de la colonne
-- le pose à la création ; ce déclencheur l'empêche d'être réécrit ensuite, et d'être choisi par
-- le client à la création (le client ne peut pas se faire passer pour un autre auteur).
create function public.venues_figer_auteur()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.auteur_id := auth.uid();
  else
    new.auteur_id := old.auteur_id;
  end if;
  return new;
end;
$$;

create trigger venues_auteur
  before insert or update on public.venues
  for each row execute function public.venues_figer_auteur();

-- ── Reprise des lieux existants (VEN-17, VEN-34) ──────────────────────────────
-- Chaque partenaire devient un lieu : nom, adresse, photo, description (en tagline), avantage et
-- état recopiés ; partenaire = lui-même ; ni auteur, ni catégorie. La date de création aussi :
-- la liste du site garde son ordre (le plus récent d'abord). Ligne à ligne, du plus ancien
-- au plus récent : le premier « Mango Bar » garde `mango-bar`, le suivant reçoit `mango-bar-2`.
-- Les déclencheurs posent l'adresse ; l'auteur est nul parce que la migration tourne sans session.
do $$
declare
  partenaire record;
begin
  for partenaire in
    select p.id, p.created_at, p.lieu_nom, p.lieu_adresse, p.lieu_photo, p.lieu_description, p.avantage, p.etat
    from public.partners as p
    order by p.created_at, p.id
  loop
    insert into public.venues (created_at, partenaire_id, nom, adresse, photo_entete, tagline, avantage, etat, slug)
    values (
      partenaire.created_at,
      partenaire.id,
      partenaire.lieu_nom,
      partenaire.lieu_adresse,
      partenaire.lieu_photo,
      partenaire.lieu_description,
      partenaire.avantage,
      partenaire.etat,
      ''  -- remplacé par le déclencheur `venues_slug`
    );
  end loop;
end
$$;

-- ── Le partenaire se passe de son lieu ────────────────────────────────────────
-- Le formulaire partenaire perd son groupe « The venue » (VEN-15) : ces colonnes ne sont plus
-- remplies pour un nouveau partenaire. Elles restent, pour le code de `main`.
alter table public.partners
  alter column lieu_nom drop not null,
  alter column lieu_adresse drop not null,
  alter column lieu_description drop not null,
  alter column avantage drop not null;

-- ── Droits ────────────────────────────────────────────────────────────────────
alter table public.venues enable row level security;

-- VEN-16, VEN-35 : le site public ne lit que les lieux en ligne.
create policy venues_lecture_publique on public.venues
  for select to anon
  using (etat = 'en ligne');

-- Back-office : la liste montre brouillons et lieux en ligne, la fiche crée et modifie.
create policy venues_lecture_admin on public.venues
  for select to authenticated
  using (true);

create policy venues_ajout_admin on public.venues
  for insert to authenticated
  with check (true);

create policy venues_modification_admin on public.venues
  for update to authenticated
  using (true)
  with check (true);

-- Aucune politique de suppression, pour aucun rôle : un lieu ne se supprime pas (« Ouvert pour
-- Ghya » 8).

-- VEN-35 : rien du contact ne sort sans session. Le RLS filtre des lignes, pas des colonnes :
-- jusqu'ici, un partenaire en ligne était lisible par `anon` en entier, contact et jeton d'accès
-- compris (seul le choix des colonnes par le site les cachait). Les droits par colonne ferment
-- cela. Les colonnes rendues à `anon` sont exactement celles que lit le site de `main`
-- (apps/site/app/places/places.ts : sélection, filtre sur `etat`, tri sur `created_at`) : il
-- continue de fonctionner tant que la prod n'a pas reçu ce code.
revoke select on public.partners from anon;
grant select (id, created_at, lieu_nom, lieu_adresse, lieu_photo, lieu_description, avantage, etat)
  on public.partners to anon;

-- Même principe sur `venues` : `anon` ne voit ni le partenaire ni l'auteur, seulement la page.
-- Pas de jointure possible vers le contact depuis le site.
revoke all on public.venues from anon;
grant select (
  id, created_at, nom, tagline, photo_entete, contenu, adresse, lien_maps, categorie, horaires,
  avantage, slug, etat
) on public.venues to anon;

-- Les fonctions d'adresse ne servent qu'aux déclencheurs.
revoke all on function public.slug_depuis_nom(text) from public, anon, authenticated;
revoke all on function public.slug_libre(text, uuid) from public, anon, authenticated;
revoke all on function public.venues_poser_slug() from public, anon, authenticated;
revoke all on function public.venues_figer_auteur() from public, anon, authenticated;

-- ── Photos ────────────────────────────────────────────────────────────────────
-- Photo d'en-tête et photos des blocs. Bucket public : le site sert les photos par leur URL
-- publique, sans session. Écriture réservée au back-office ; pas de suppression (une photo
-- remplacée reste dans le bucket, comme un lieu ne se supprime pas).
insert into storage.buckets (id, name, public)
values ('venues', 'venues', true)
on conflict (id) do nothing;

create policy venues_photos_lecture_admin on storage.objects
  for select to authenticated
  using (bucket_id = 'venues');

create policy venues_photos_ajout_admin on storage.objects
  for insert to authenticated
  with check (bucket_id = 'venues');

create policy venues_photos_modification_admin on storage.objects
  for update to authenticated
  using (bucket_id = 'venues')
  with check (bucket_id = 'venues');
