-- Catalogue des passes : les types de pass que l'admin compose et met en vente.
--   specs/catalogue-passes.md (CAT-3, CAT-4, CAT-7 à CAT-13, CAT-16, CAT-17, CAT-20 à CAT-23,
--   CAT-31, § Détails techniques) ; specs/sales.md (PASS-21)
--
-- Migration ADDITIVE (CLAUDE.md, une seule base) : trois tables nouvelles, une colonne nullable
-- sur `passes`, trois fonctions. Rien n'est renommé ni supprimé ; aucune politique existante
-- n'est touchée. Le code de `main` ne lit aucune de ces tables, et `passes` garde ses colonnes,
-- ses défauts et ses politiques.
--
-- `passes` désigne déjà les ventes et ne se renomme pas : le catalogue s'appelle `pass_offers`,
-- comme le composant du site qui l'affiche (`PassOfferCard`). Colonnes en français, comme le
-- reste du schéma.

-- ── Le jour courant au Cambodge ───────────────────────────────────────────────
-- CAT-16, CAT-20, EVT-10 : une date fixe ou un événement tombe à minuit, heure du Cambodge, quel
-- que soit le fuseau du serveur.
create function public.jour_cambodge()
returns date
language sql
stable
as $$
  select (now() at time zone 'Asia/Phnom_Penh')::date;
$$;

-- ── Table du catalogue ────────────────────────────────────────────────────────
create table public.pass_offers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- CAT-12 : seul le nom est exigé pour enregistrer un brouillon.
  nom text not null check (btrim(nom) <> ''),
  -- CAT-13 : dollars US en centimes entiers, supérieur à zéro.
  prix_centimes integer check (prix_centimes is null or prix_centimes > 0),

  -- CAT-4 : deux modes. Chaque mode garde sa valeur ; seule celle du mode choisi compte.
  validite_mode text not null default 'jours' check (validite_mode in ('date', 'jours')),
  valide_jusqu_au date,
  validite_jours integer check (validite_jours is null or validite_jours >= 1),

  -- CAT-7, CAT-8 : « tous » (la liste liée est celle des exclusions, « Except ») ou « liste »
  -- (la liste liée est celle des choisis). Défaut : « Selected … », choix d'Alex.
  lieux_mode text not null default 'liste' check (lieux_mode in ('tous', 'liste')),
  evenements_mode text not null default 'liste' check (evenements_mode in ('tous', 'liste')),

  -- CAT-10 : mêmes deux valeurs que `venues.etat`. Un pass créé est en brouillon.
  etat text not null default 'brouillon' check (etat in ('brouillon', 'en ligne')),

  -- CAT-12, CAT-22 : un pass en ligne a un prix et la valeur de son mode de validité. Le contenu
  -- (au moins un lieu ou un événement) se vérifie dans `enregistrer_pass_offer`, qui voit les
  -- listes.
  constraint pass_offers_en_ligne_complet check (
    etat = 'brouillon'
    or (
      prix_centimes is not null
      and case validite_mode
        when 'date' then valide_jusqu_au is not null
        else validite_jours is not null
      end
    )
  )
);

comment on table public.pass_offers is
  'Le catalogue : un type de pass (nom, prix, validité, lieux, événements) mis en vente ou non (specs/catalogue-passes.md).';

create index pass_offers_etat_idx on public.pass_offers (etat);

-- Les listes de lieux et d'événements d'un pass. Leur sens dépend du mode du pass (voir
-- ci-dessus) : inclus en « liste », exclus en « tous ».
create table public.pass_offer_venues (
  offre_id uuid not null references public.pass_offers (id) on delete cascade,
  lieu_id uuid not null references public.venues (id),
  primary key (offre_id, lieu_id)
);

create table public.pass_offer_events (
  offre_id uuid not null references public.pass_offers (id) on delete cascade,
  evenement_id uuid not null references public.events (id),
  primary key (offre_id, evenement_id)
);

create index pass_offer_venues_lieu_idx on public.pass_offer_venues (lieu_id);
create index pass_offer_events_evenement_idx on public.pass_offer_events (evenement_id);

-- ── La vente dit de quel pass il s'agit (PASS-21) ─────────────────────────────
-- Nullable : toutes les ventes d'avant le catalogue, et celles du site tant que l'achat d'un pass
-- précis n'existe pas (CAT-24), restent sans pass. Rien d'autre ne change sur `passes`.
alter table public.passes
  add column offre_id uuid references public.pass_offers (id);

create index passes_offre_idx on public.passes (offre_id);

-- ── Enregistrer un pass ───────────────────────────────────────────────────────
-- Une écriture, une transaction : le pass et ses deux listes. « Save » (publier = false) garde
-- l'état ; « Publish » (publier = true) enregistre et met en ligne (CAT-10). Sans identifiant,
-- crée un brouillon (CAT-26).
--
-- `security invoker` : les politiques des tables s'appliquent, c'est le rôle `authenticated` qui
-- écrit. La fonction ne fait que garantir l'atomicité et la règle de contenu (CAT-12, CAT-22),
-- que la contrainte de ligne ne peut pas voir. Le back-office vérifie avant, pour placer ses
-- messages ; ce contrôle est le garde-fou.
create function public.enregistrer_pass_offer(
  offre_id uuid,
  nom text,
  prix_centimes integer,
  validite_mode text,
  valide_jusqu_au date,
  validite_jours integer,
  lieux_mode text,
  lieux uuid[],
  evenements_mode text,
  evenements uuid[],
  publier boolean
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  identifiant uuid := offre_id;
  etat_final text;
begin
  if identifiant is null then
    insert into public.pass_offers as o (nom, prix_centimes, validite_mode, valide_jusqu_au,
      validite_jours, lieux_mode, evenements_mode)
    values (enregistrer_pass_offer.nom, enregistrer_pass_offer.prix_centimes,
      enregistrer_pass_offer.validite_mode, enregistrer_pass_offer.valide_jusqu_au,
      enregistrer_pass_offer.validite_jours, enregistrer_pass_offer.lieux_mode,
      enregistrer_pass_offer.evenements_mode)
    returning o.id into identifiant;
  else
    update public.pass_offers as o
    set nom = enregistrer_pass_offer.nom,
        prix_centimes = enregistrer_pass_offer.prix_centimes,
        validite_mode = enregistrer_pass_offer.validite_mode,
        valide_jusqu_au = enregistrer_pass_offer.valide_jusqu_au,
        validite_jours = enregistrer_pass_offer.validite_jours,
        lieux_mode = enregistrer_pass_offer.lieux_mode,
        evenements_mode = enregistrer_pass_offer.evenements_mode
    where o.id = identifiant;

    if not found then
      raise exception 'pass introuvable : %', identifiant using errcode = 'no_data_found';
    end if;
  end if;

  delete from public.pass_offer_venues as l where l.offre_id = identifiant;
  insert into public.pass_offer_venues (offre_id, lieu_id)
  select distinct identifiant, l from unnest(coalesce(lieux, '{}')) as l;

  delete from public.pass_offer_events as e where e.offre_id = identifiant;
  insert into public.pass_offer_events (offre_id, evenement_id)
  select distinct identifiant, e from unnest(coalesce(evenements, '{}')) as e;

  if publier then
    -- CAT-21 : une date fixe déjà passée ne se publie pas.
    if enregistrer_pass_offer.validite_mode = 'date'
       and enregistrer_pass_offer.valide_jusqu_au < public.jour_cambodge() then
      raise exception 'date de validité passée' using errcode = 'check_violation';
    end if;
    -- La contrainte `pass_offers_en_ligne_complet` refuse un prix ou une validité manquants.
    update public.pass_offers as o set etat = 'en ligne' where o.id = identifiant;
  end if;

  select o.etat into etat_final from public.pass_offers as o where o.id = identifiant;

  -- CAT-12, CAT-22 : en ligne, au moins un lieu ou un événement (« All … » compte, même vide).
  if etat_final = 'en ligne'
     and enregistrer_pass_offer.lieux_mode = 'liste' and cardinality(coalesce(lieux, '{}')) = 0
     and enregistrer_pass_offer.evenements_mode = 'liste' and cardinality(coalesce(evenements, '{}')) = 0 then
    raise exception 'un pass en ligne couvre au moins un lieu ou un événement' using errcode = 'check_violation';
  end if;

  return identifiant;
end;
$$;

-- ── Ce que le site lit : les passes en vente ──────────────────────────────────
-- CAT-16, CAT-17, CAT-23, CAT-31 : exactement ce que le bloc « Our passes » affiche, et rien
-- d'autre. `anon` n'a aucun droit sur les tables du catalogue ni sur `events` : il ne voit ni
-- brouillon, ni nom de lieu, ni liste de sélection, ni événement passé ou hors d'un pass en vente.
--
-- `security definer` parce qu'elle lit par-dessus des tables fermées à `anon` ; c'est elle, et non
-- le client, qui décide de ce qui sort. Même ordre qu'au back-office, le plus récent d'abord.
create function public.passes_en_vente()
returns table (
  id uuid,
  nom text,
  prix_centimes integer,
  validite_mode text,
  valide_jusqu_au date,
  validite_jours integer,
  -- CAT-17 : « All partner venues » (tous, sans exclusion) ; sinon le compte des lieux en ligne.
  tous_les_lieux boolean,
  lieux_en_ligne integer,
  -- CAT-17 : nom et jour des seuls événements à venir, du plus proche au plus lointain.
  evenements jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  with en_vente as (
    select o.*
    from public.pass_offers as o
    where o.etat = 'en ligne'
      and (o.validite_mode = 'jours' or o.valide_jusqu_au >= public.jour_cambodge())
  ),
  contenu as (
    select
      o.*,
      (o.lieux_mode = 'tous'
        and not exists (select 1 from public.pass_offer_venues as x where x.offre_id = o.id)) as tous_sans_exclusion,
      (
        select count(*)::integer
        from public.venues as v
        where v.etat = 'en ligne'
          and case o.lieux_mode
            when 'tous' then not exists (
              select 1 from public.pass_offer_venues as x where x.offre_id = o.id and x.lieu_id = v.id)
            else exists (
              select 1 from public.pass_offer_venues as x where x.offre_id = o.id and x.lieu_id = v.id)
          end
      ) as nombre_lieux,
      (
        select coalesce(jsonb_agg(jsonb_build_object('nom', e.nom, 'jour', e.jour) order by e.jour, e.nom), '[]'::jsonb)
        from public.events as e
        where e.jour >= public.jour_cambodge()
          and case o.evenements_mode
            when 'tous' then not exists (
              select 1 from public.pass_offer_events as x where x.offre_id = o.id and x.evenement_id = e.id)
            else exists (
              select 1 from public.pass_offer_events as x where x.offre_id = o.id and x.evenement_id = e.id)
          end
      ) as liste_evenements
    from en_vente as o
  )
  select c.id, c.nom, c.prix_centimes, c.validite_mode, c.valide_jusqu_au, c.validite_jours,
    c.tous_sans_exclusion, c.nombre_lieux, c.liste_evenements
  from contenu as c
  -- CAT-23 : rien à montrer, pas de carte.
  where c.nombre_lieux > 0 or jsonb_array_length(c.liste_evenements) > 0
  order by c.created_at desc;
$$;

-- ── Droits ────────────────────────────────────────────────────────────────────
alter table public.pass_offers enable row level security;
alter table public.pass_offer_venues enable row level security;
alter table public.pass_offer_events enable row level security;

-- CAT-15 : back-office seulement. La page lit, « Add a pass » crée, la fiche modifie.
create policy pass_offers_lecture_admin on public.pass_offers
  for select to authenticated
  using (true);

create policy pass_offers_ajout_admin on public.pass_offers
  for insert to authenticated
  with check (true);

create policy pass_offers_modification_admin on public.pass_offers
  for update to authenticated
  using (true)
  with check (true);

-- CAT-11 : un pass ne se supprime pas. Le droit est retiré en plus de l'absence de politique.
revoke delete, truncate on public.pass_offers from authenticated;

-- Les listes se réécrivent à chaque « Save » : lecture, ajout et retrait d'une ligne de liste.
-- Retirer un lieu d'un pass n'est pas supprimer un pass.
create policy pass_offer_venues_lecture_admin on public.pass_offer_venues
  for select to authenticated
  using (true);

create policy pass_offer_venues_ajout_admin on public.pass_offer_venues
  for insert to authenticated
  with check (true);

create policy pass_offer_venues_retrait_admin on public.pass_offer_venues
  for delete to authenticated
  using (true);

create policy pass_offer_events_lecture_admin on public.pass_offer_events
  for select to authenticated
  using (true);

create policy pass_offer_events_ajout_admin on public.pass_offer_events
  for insert to authenticated
  with check (true);

create policy pass_offer_events_retrait_admin on public.pass_offer_events
  for delete to authenticated
  using (true);

-- CAT-31 : rien du catalogue pour `anon`, sinon par `passes_en_vente`.
revoke all on public.pass_offers from anon;
revoke all on public.pass_offer_venues from anon;
revoke all on public.pass_offer_events from anon;

revoke all on function public.enregistrer_pass_offer(uuid, text, integer, text, date, integer, text, uuid[], text, uuid[], boolean)
  from public, anon;
grant execute on function public.enregistrer_pass_offer(uuid, text, integer, text, date, integer, text, uuid[], text, uuid[], boolean)
  to authenticated;

revoke all on function public.passes_en_vente() from public;
grant execute on function public.passes_en_vente() to anon, authenticated;

grant execute on function public.jour_cambodge() to anon, authenticated;
