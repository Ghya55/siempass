-- Artistes : la table `artists`, saisie au back-office.
--   specs/artists.md (ART-1 à ART-6)
--
-- Migration ADDITIVE (CLAUDE.md, une seule base) : une table nouvelle, rien d'existant n'est
-- touché. Le code de `main` ne la lit pas.
--
-- Nommage en français, comme `partners`, `passes` et `venues`.

create table public.artists (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- ART-1 : le nom et la catégorie sont exigés ; un texte fait d'espaces ne compte pas.
  nom text not null check (btrim(nom) <> ''),
  -- ART-2 : texte libre, pas de liste fermée (« DJ », « Band », « Comedian »…).
  categorie text not null check (btrim(categorie) <> ''),
  -- ART-3 : un seul réseau social, facultatif, saisi tel quel (lien ou identifiant).
  reseau_social text check (reseau_social is null or btrim(reseau_social) <> '')
);

comment on table public.artists is
  'Un artiste (DJ, groupe, humoriste) saisi au back-office (specs/artists.md).';

-- ── Droits ────────────────────────────────────────────────────────────────────
alter table public.artists enable row level security;

-- ART-5 : back-office seulement. La liste lit, « Add artist » ajoute.
create policy artists_lecture_admin on public.artists
  for select to authenticated
  using (true);

create policy artists_ajout_admin on public.artists
  for insert to authenticated
  with check (true);

-- Aucune politique de modification ni de suppression : aucun écran ne modifie ni ne supprime un
-- artiste (ART-4). Elles s'ouvriront avec l'écran qui en aura besoin.

-- ART-5 : rien pour le site public tant qu'aucune page ne montre un artiste.
revoke all on public.artists from anon;
