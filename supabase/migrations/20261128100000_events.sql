-- Événements : la table `events`, saisie au back-office.
--   specs/events.md (EVT-1 à EVT-8, EVT-19, § Détails techniques)
--
-- Migration ADDITIVE (CLAUDE.md, une seule base) : une table nouvelle, rien d'existant n'est
-- touché. Le code de `main` ne la lit pas.
--
-- Nommage en français, comme `partners`, `passes`, `venues` et `artists`. `jour` plutôt que
-- `date` : un événement tient sur un jour, sans heure (EVT-2), et `date` est un mot réservé.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- EVT-6 : les quatre données sont exigées ; un texte fait d'espaces ne compte pas.
  nom text not null check (btrim(nom) <> ''),
  -- EVT-2 : un jour, sans heure ni récurrence. EVT-12 : une date passée est permise.
  jour date not null,
  -- EVT-2 : un lieu existant, brouillon compris (EVT-11). Pas de suppression en cascade : un lieu
  -- ne se supprime pas (aucune politique de suppression sur `venues`).
  lieu_id uuid not null references public.venues (id),
  -- EVT-1 : ce que le porteur du pass y gagne ; ni prix, ni places, ni billet.
  avantage text not null check (btrim(avantage) <> '')
);

comment on table public.events is
  'Un événement (comedy club, concert) d''un jour, dans un lieu, sans billetterie (specs/events.md).';

create index events_lieu_idx on public.events (lieu_id);
create index events_jour_idx on public.events (jour);

-- ── Droits ────────────────────────────────────────────────────────────────────
alter table public.events enable row level security;

-- EVT-8 : back-office seulement. La page lit, « Add an event » crée, la fiche modifie.
create policy events_lecture_admin on public.events
  for select to authenticated
  using (true);

create policy events_ajout_admin on public.events
  for insert to authenticated
  with check (true);

create policy events_modification_admin on public.events
  for update to authenticated
  using (true)
  with check (true);

-- EVT-7 : pas de suppression, pour aucun rôle. Le droit est retiré en plus de l'absence de
-- politique : une suppression échoue au lieu de ne rien faire en silence.
revoke delete, truncate on public.events from authenticated;

-- EVT-4, EVT-19 : `anon` ne lit rien ici. Le site ne voit le nom et la date d'un événement qu'à
-- travers un pass en vente, par la fonction `passes_en_vente` (migration suivante).
revoke all on public.events from anon;
