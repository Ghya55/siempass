-- Droits sur `artists`.
--   specs/artists.md : ART-1 (champs exigés), ART-4 (modification), ART-8 (suppression),
--   ART-5 (back-office seulement).
-- Lancé par `supabase test db` (CI, base jetable). Tout se passe dans une transaction annulée.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(11);

-- ── Données fictives ──────────────────────────────────────────────────────────
insert into public.artists (id, nom, categorie, reseau_social) values
  ('00000000-0000-0000-0000-0000000000d1', 'Test Artist', 'DJ', '@test.artist');

-- ── anon : le site public ─────────────────────────────────────────────────────
set local role anon;
select throws_ok($$ select nom from public.artists $$, '42501', null,
  'ART-5 : anon ne lit pas les artistes');
select throws_ok($$ insert into public.artists (nom, categorie) values ('Intrus', 'DJ') $$, '42501', null,
  'ART-5 : anon n''ajoute pas d''artiste');
select throws_ok($$ update public.artists set nom = 'Intrus' $$, '42501', null,
  'ART-5 : anon ne modifie pas un artiste');
select throws_ok($$ delete from public.artists $$, '42501', null,
  'ART-5 : anon ne supprime pas un artiste');
reset role;

-- ── authenticated : le back-office ────────────────────────────────────────────
set local role authenticated;
select is((select count(*)::int from public.artists), 1, 'le back-office lit les artistes');
select lives_ok($$ insert into public.artists (nom, categorie) values ('Second Artist', 'Band') $$,
  'ART-3 : le back-office ajoute un artiste, sans réseau social');
select throws_ok($$ insert into public.artists (nom, categorie) values ('  ', 'DJ') $$, '23514', null,
  'ART-1 : un nom vide ne s''enregistre pas');
select throws_ok($$ insert into public.artists (nom, categorie) values ('Sans catégorie', ' ') $$, '23514', null,
  'ART-1 : une catégorie vide ne s''enregistre pas');

update public.artists set nom = 'Renamed', reseau_social = null
  where id = '00000000-0000-0000-0000-0000000000d1';
select is((select nom from public.artists where id = '00000000-0000-0000-0000-0000000000d1'), 'Renamed',
  'ART-4 : le back-office modifie un artiste');
select throws_ok($$ update public.artists set categorie = ' '
  where id = '00000000-0000-0000-0000-0000000000d1' $$, '23514', null,
  'ART-1 : une modification ne vide pas la catégorie');
delete from public.artists where id = '00000000-0000-0000-0000-0000000000d1';
select is((select count(*)::int from public.artists), 1, 'ART-8 : le back-office supprime un artiste');
reset role;

select * from finish();
rollback;
