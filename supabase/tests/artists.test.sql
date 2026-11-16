-- Droits sur `artists`.
--   specs/artists.md : ART-1 (champs exigés), ART-4 (ni modification ni suppression),
--   ART-5 (back-office seulement).
-- Lancé par `supabase test db` (CI, base jetable). Tout se passe dans une transaction annulée.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(9);

-- ── Données fictives ──────────────────────────────────────────────────────────
insert into public.artists (id, nom, categorie, reseau_social) values
  ('00000000-0000-0000-0000-0000000000d1', 'Test Artist', 'DJ', '@test.artist');

-- ── anon : le site public ─────────────────────────────────────────────────────
set local role anon;
select throws_ok($$ select nom from public.artists $$, '42501', null,
  'ART-5 : anon ne lit pas les artistes');
select throws_ok($$ insert into public.artists (nom, categorie) values ('Intrus', 'DJ') $$, '42501', null,
  'ART-5 : anon n''ajoute pas d''artiste');
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

-- Sans politique, une modification ou une suppression ne touche aucune ligne (pas d'erreur).
update public.artists set nom = 'Renamed' where id = '00000000-0000-0000-0000-0000000000d1';
select is((select nom from public.artists where id = '00000000-0000-0000-0000-0000000000d1'), 'Test Artist',
  'ART-4 : le back-office ne modifie pas un artiste');
delete from public.artists where id = '00000000-0000-0000-0000-0000000000d1';
select is((select count(*)::int from public.artists), 2, 'ART-4 : le back-office ne supprime pas un artiste');
reset role;

select is((select reseau_social from public.artists where id = '00000000-0000-0000-0000-0000000000d1'),
  '@test.artist', 'ART-3 : le réseau social est gardé tel que saisi');

select * from finish();
rollback;
