-- Droits sur `events`.
--   specs/events.md : EVT-6 (tout est exigé), EVT-7 (pas de suppression), EVT-8 (back-office
--   seulement), EVT-19 (rien de lisible depuis le site hors d'un pass en vente).
-- Lancé par `supabase test db` (CI, base jetable). Tout se passe dans une transaction annulée.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(14);

-- ── Données fictives ──────────────────────────────────────────────────────────
insert into public.partners (id, contact_nom, contact_prenom, contact_telephone, contact_email)
values ('00000000-0000-0000-0000-0000000000b1', 'Test', 'Dara', '+855 00 000 000', 'test@example.com');

insert into public.venues (id, partenaire_id, nom, etat) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b1', 'Test Bar', 'en ligne'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000b1', 'Test Draft Bar', 'brouillon');

insert into public.events (id, nom, jour, lieu_id, avantage) values
  ('00000000-0000-0000-0000-0000000000e1', 'Test Comedy', current_date + 7,
   '00000000-0000-0000-0000-0000000000c1', 'Half-price entry');

-- ── anon : le site public ─────────────────────────────────────────────────────
set local role anon;
select throws_ok($$ select nom from public.events $$, '42501', null,
  'EVT-19 : anon ne lit pas les événements');
select throws_ok($$ insert into public.events (nom, jour, lieu_id, avantage)
  values ('Intrus', current_date, '00000000-0000-0000-0000-0000000000c1', 'Rien') $$, '42501', null,
  'EVT-8 : anon ne crée pas d''événement');
select throws_ok($$ update public.events set nom = 'Intrus' $$, '42501', null,
  'EVT-8 : anon ne modifie pas un événement');
select throws_ok($$ delete from public.events $$, '42501', null,
  'EVT-7 : anon ne supprime pas un événement');
reset role;

-- ── authenticated : le back-office ────────────────────────────────────────────
set local role authenticated;
select is((select count(*)::int from public.events where id = '00000000-0000-0000-0000-0000000000e1'), 1,
  'EVT-8 : le back-office lit les événements');
select lives_ok($$ insert into public.events (nom, jour, lieu_id, avantage)
  values ('Draft Venue Night', current_date - 3, '00000000-0000-0000-0000-0000000000c2', 'A free drink') $$,
  'EVT-11, EVT-12 : un événement dans un lieu en brouillon, à une date passée');
select throws_ok($$ insert into public.events (nom, jour, lieu_id, avantage)
  values (' ', current_date, '00000000-0000-0000-0000-0000000000c1', 'A free drink') $$, '23514', null,
  'EVT-6 : un nom vide ne s''enregistre pas');
select throws_ok($$ insert into public.events (nom, jour, lieu_id, avantage)
  values ('No Venue', current_date, null, 'A free drink') $$, '23502', null,
  'EVT-16 : un événement sans lieu ne s''enregistre pas');
select throws_ok($$ insert into public.events (nom, jour, lieu_id, avantage)
  values ('No Date', null, '00000000-0000-0000-0000-0000000000c1', 'A free drink') $$, '23502', null,
  'EVT-6 : un événement sans date ne s''enregistre pas');
select throws_ok($$ insert into public.events (nom, jour, lieu_id, avantage)
  values ('No Perk', current_date, '00000000-0000-0000-0000-0000000000c1', '  ') $$, '23514', null,
  'EVT-6 : un événement sans avantage ne s''enregistre pas');
select lives_ok($$ update public.events set nom = 'Renamed Comedy'
  where id = '00000000-0000-0000-0000-0000000000e1' $$,
  'EVT-17 : le back-office renomme un événement');
select is((select nom from public.events where id = '00000000-0000-0000-0000-0000000000e1'), 'Renamed Comedy',
  'EVT-17 : le nouveau nom est enregistré');
select throws_ok($$ delete from public.events where id = '00000000-0000-0000-0000-0000000000e1' $$, '42501', null,
  'EVT-7 : le back-office ne supprime pas un événement');
reset role;

-- Un partenaire n'a pas de compte (PART-7) : il n'a que son lien, qui ne lit pas `events`.
select is((select count(*)::int from information_schema.role_table_grants
  where table_name = 'events' and grantee = 'anon'), 0, 'EVT-8 : aucun droit pour anon sur events');

select * from finish();
rollback;
