-- Lieux, finitions : adresse de page figée dès la première publication, prénom des comptes pour
-- « Written by ».
--   specs/venues.md : VEN-9, VEN-10, VEN-27, « Ouvert pour Ghya » 3 et 6, tranchés le 15/11.
--
-- Migration ADDITIVE (CLAUDE.md, une seule base) : une colonne, une table, une fonction, et la
-- fonction du déclencheur d'adresse remplacée. Rien n'est renommé ni supprimé ; le code de `main`
-- ne lit ni `venues` ni `profiles`.

-- ── Adresse de page figée dès la première publication ─────────────────────────
-- Tranché par Ghya le 15/11 : l'adresse suit le nom tant que le lieu n'a jamais été en ligne, et
-- se fige à la première publication, même après un retour en brouillon (un lien partagé ne casse
-- pas). L'état seul ne suffit pas à le savoir : un brouillon peut avoir déjà été publié.
alter table public.venues add column premiere_publication timestamptz;

comment on column public.venues.premiere_publication is
  'Date de la première mise en ligne, posée par le déclencheur `venues_slug`. Non nulle : l''adresse de la page est figée.';

-- Le déclencheur garantit l'unicité et la forme de l'adresse quel que soit l'écran qui écrit :
-- un client ne peut ni la choisir ni voir les lieux des autres pour éviter un doublon. Il pose
-- aussi `premiere_publication`, que le client ne peut ni choisir ni effacer.
-- La publication elle-même renomme encore : « Publish » enregistre le nom et met en ligne dans la
-- même écriture, l'adresse publiée est donc celle du nom publié.
create or replace function public.venues_poser_slug()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.slug := public.slug_libre(new.nom, new.id);
    new.premiere_publication := case when new.etat = 'en ligne' then now() end;
    return new;
  end if;

  new.premiere_publication := coalesce(
    old.premiere_publication,
    case when new.etat = 'en ligne' then now() end
  );
  if old.premiere_publication is null and new.nom is distinct from old.nom then
    new.slug := public.slug_libre(new.nom, new.id);
  else
    new.slug := old.slug;
  end if;
  return new;
end;
$$;

revoke all on function public.venues_poser_slug() from public, anon, authenticated;

-- Les lieux déjà en ligne sont figés : le déclencheur pose la date (maintenant ; la vraie date
-- de mise en ligne n'est connue nulle part). Un brouillon qui a été en ligne avant cette
-- migration n'est pas reconnaissable : il reste libre jusqu'à sa prochaine publication.
update public.venues set premiere_publication = now() where etat = 'en ligne';

-- `anon` lit les lieux par une liste de colonnes (migration 20261115090000) : celle-ci n'y est
-- pas ajoutée, le site n'en a pas l'usage.

-- ── Prénom d'un compte (« Written by ») ───────────────────────────────────────
-- VEN-9 : l'auteur d'un lieu s'affiche par un prénom porté par son compte, jamais par son e-mail
-- (« Ouvert pour Ghya » 6). Une ligne par compte qui en a un ; sans ligne, pas de « Written by ».
-- Écrite seulement en SQL (seed, ou à la main sur la base réelle) : aucun écran ne la modifie,
-- donc aucune politique d'écriture.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null check (btrim(prenom) <> '')
);

comment on table public.profiles is
  'Prénom d''un compte du back-office, affiché en « Written by » sur la fiche d''un lieu (specs/venues.md, VEN-9).';

alter table public.profiles enable row level security;

-- Le back-office lit le prénom de l'auteur pour la preview de l'éditeur (VEN-12).
create policy profiles_lecture_admin on public.profiles
  for select to authenticated
  using (true);

-- `anon` ne lit jamais la table : il n'a que la fonction ci-dessous, qui passe par un lieu en
-- ligne. Pas d'écriture depuis l'API, pour personne.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

-- Le prénom de l'auteur d'un lieu en ligne, par son adresse de page : la seule porte de `anon`
-- vers `profiles`. Brouillon, lieu inconnu, lieu repris ou auteur sans prénom : nul.
-- `security definer` : `anon` n'a de droit ni sur `profiles` ni sur `venues.auteur_id`.
create function public.prenom_auteur_du_lieu(lieu_slug text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.prenom
  from public.venues as v
  join public.profiles as p on p.id = v.auteur_id
  where v.slug = lieu_slug and v.etat = 'en ligne';
$$;

comment on function public.prenom_auteur_du_lieu(text) is
  'Prénom de l''auteur d''un lieu en ligne, pour « Written by » sur le site (VEN-9). Nul sinon.';

revoke all on function public.prenom_auteur_du_lieu(text) from public;
grant execute on function public.prenom_auteur_du_lieu(text) to anon, authenticated;
