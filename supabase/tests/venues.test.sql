-- Droits sur `venues`, sur le contact des partenaires et sur le bucket des photos.
--   specs/venues.md : VEN-16, VEN-35 (anon), § Détails techniques (authenticated, pas de
--   suppression), VEN-9 (auteur), VEN-10 et VEN-21 (adresse de la page).
-- Lancé par `supabase test db` (CI, base jetable). Tout se passe dans une transaction annulée.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(32);

-- Les lieux du seed (catalogue de démonstration) ne doivent fausser ni les comptes ni les
-- adresses : on part d'une table vide (annulé avec la transaction).
truncate public.venues cascade;

-- ── Données fictives ──────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin-test@siempass.com');

insert into public.partners (id, contact_nom, contact_prenom, contact_telephone, contact_email)
values ('00000000-0000-0000-0000-0000000000b1', 'Test', 'Dara', '+855 00 000 000', 'test@example.com');

insert into public.venues (id, partenaire_id, nom, tagline, avantage, etat) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b1',
   'Mango Bar', 'Cocktails on a wooden terrace', 'One free cocktail', 'en ligne'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000b1',
   'Mango Bar', 'Draft venue', 'One free shake', 'brouillon'),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000b1',
   'Café Ñoño', null, null, 'brouillon');

-- ── Adresse de la page (VEN-10, VEN-21) ───────────────────────────────────────
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c1'),
  'mango-bar', 'VEN-10 : adresse déduite du nom');
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c2'),
  'mango-bar-2', 'VEN-21 : le deuxième Mango Bar reçoit -2');
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c3'),
  'cafe-nono', 'VEN-10 : minuscules, sans accent');

update public.venues set nom = 'Mango Garden' where id = '00000000-0000-0000-0000-0000000000c2';
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c2'),
  'mango-garden', 'en brouillon, l''adresse suit le nom');
update public.venues set nom = 'Mango Bar Renamed' where id = '00000000-0000-0000-0000-0000000000c1';
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c1'),
  'mango-bar', 'en ligne, l''adresse est figée');
update public.venues set slug = 'choisie' where id = '00000000-0000-0000-0000-0000000000c2';
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c2'),
  'mango-garden', 'le client ne choisit pas l''adresse');

-- VEN-10 : figée dès la première publication, même après un retour en brouillon.
update public.venues set etat = 'brouillon' where id = '00000000-0000-0000-0000-0000000000c1';
update public.venues set nom = 'Mango Bar Again' where id = '00000000-0000-0000-0000-0000000000c1';
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c1'),
  'mango-bar', 'VEN-10 : publié puis repassé en brouillon, l''adresse reste figée');
update public.venues set etat = 'en ligne' where id = '00000000-0000-0000-0000-0000000000c1';

update public.venues set nom = 'Mango Grove', etat = 'en ligne' where id = '00000000-0000-0000-0000-0000000000c2';
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c2'),
  'mango-grove', 'VEN-10 : « Publish » enregistre le nom, l''adresse publiée est celle de ce nom');
select isnt((select premiere_publication from public.venues where id = '00000000-0000-0000-0000-0000000000c2'),
  null, 'VEN-10 : la première publication est datée');
update public.venues set etat = 'brouillon' where id = '00000000-0000-0000-0000-0000000000c2';
update public.venues set nom = 'Mango Elsewhere' where id = '00000000-0000-0000-0000-0000000000c2';
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c2'),
  'mango-grove', 'VEN-10 : renommé après un retour en brouillon, l''adresse ne change pas');
update public.venues set premiere_publication = null where id = '00000000-0000-0000-0000-0000000000c2';
select isnt((select premiere_publication from public.venues where id = '00000000-0000-0000-0000-0000000000c2'),
  null, 'le client n''efface pas la première publication');

update public.venues set premiere_publication = now() where id = '00000000-0000-0000-0000-0000000000c3';
select is((select premiere_publication from public.venues where id = '00000000-0000-0000-0000-0000000000c3'),
  null, 'le client ne date pas une publication qui n''a pas eu lieu');
update public.venues set nom = 'Café Ñoño Two' where id = '00000000-0000-0000-0000-0000000000c3';
select is((select slug from public.venues where id = '00000000-0000-0000-0000-0000000000c3'),
  'cafe-nono-two', 'jamais publié, l''adresse suit encore le nom');

-- ── anon : le site public (VEN-16, VEN-35) ────────────────────────────────────
set local role anon;
select is((select count(*)::int from public.venues), 1, 'VEN-16 : anon ne voit que les lieux en ligne');
select is((select slug from public.venues), 'mango-bar', 'VEN-16 : le lieu en ligne');
select is((select count(*)::int from public.venues where slug = 'mango-grove'), 0,
  'VEN-28 : un brouillon est introuvable par son adresse, même déjà publié');
select throws_ok($$ select premiere_publication from public.venues $$, '42501', null,
  'anon ne lit pas la date de première publication');
select throws_ok($$ select partenaire_id from public.venues $$, '42501', null,
  'VEN-35 : anon ne voit pas le partenaire d''un lieu');
select throws_ok($$ select auteur_id from public.venues $$, '42501', null,
  'anon ne voit pas l''auteur (identifiant de compte)');
select throws_ok($$ select contact_telephone from public.partners $$, '42501', null,
  'VEN-35 : anon ne lit pas le téléphone du contact');
select throws_ok($$ select contact_nom, contact_prenom, contact_email from public.partners $$, '42501', null,
  'VEN-35 : anon ne lit ni nom ni e-mail du contact');
select throws_ok($$ select acces_jeton from public.partners $$, '42501', null,
  'anon ne lit pas le jeton d''accès du partenaire');
select lives_ok($$ select id, lieu_nom, lieu_adresse, lieu_photo, lieu_description, avantage
  from public.partners where etat = 'en ligne' order by created_at desc $$,
  'le site de main lit toujours ses colonnes de partners');
select throws_ok($$ insert into public.venues (partenaire_id, nom)
  values ('00000000-0000-0000-0000-0000000000b1', 'Intrus') $$, '42501', null,
  'anon ne crée pas de lieu');
select throws_ok($$ update public.venues set nom = 'Vandalisé' $$, '42501', null,
  'anon ne modifie aucun lieu');
select throws_ok($$ insert into storage.objects (bucket_id, name) values ('venues', 'intrus.jpg') $$,
  '42501', null, 'anon n''envoie pas de photo');
reset role;

-- ── authenticated : le back-office ────────────────────────────────────────────
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-0000000000a1", "role": "authenticated"}';
select is((select count(*)::int from public.venues), 3, 'le back-office lit brouillons et lieux en ligne');
select lives_ok($$ insert into public.venues (id, partenaire_id, nom, auteur_id)
  values ('00000000-0000-0000-0000-0000000000c4', '00000000-0000-0000-0000-0000000000b1', 'New Spot',
          '00000000-0000-0000-0000-0000000000ff') $$,
  'le back-office crée un lieu');
select is((select auteur_id from public.venues where id = '00000000-0000-0000-0000-0000000000c4'),
  '00000000-0000-0000-0000-0000000000a1'::uuid, 'VEN-9 : l''auteur est le compte connecté, pas un choix du client');
select lives_ok($$ update public.venues set etat = 'en ligne' where id = '00000000-0000-0000-0000-0000000000c4' $$,
  'le back-office met un lieu en ligne');
delete from public.venues;
select is((select count(*)::int from public.venues), 4, 'pas de suppression de lieu');
select lives_ok($$ insert into storage.objects (bucket_id, name) values ('venues', 'test/photo.jpg') $$,
  'le back-office envoie une photo');
reset role;

select * from finish();
rollback;
