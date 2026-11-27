-- Droits sur le catalogue des passes (`pass_offers` et ses deux listes), sur `passes_en_vente`
-- et sur `enregistrer_pass_offer`.
--   specs/catalogue-passes.md : CAT-10 à CAT-13, CAT-15 à CAT-17, CAT-20 à CAT-23, CAT-26 à
--   CAT-31 ; specs/sales.md : PASS-21.
-- Lancé par `supabase test db` (CI, base jetable). Tout se passe dans une transaction annulée.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(36);

-- Les passes et événements du seed ne doivent pas fausser les comptes : on part d'un catalogue
-- vide (annulé avec la transaction).
truncate public.pass_offers, public.pass_offer_venues, public.pass_offer_events cascade;

-- ── Données fictives ──────────────────────────────────────────────────────────
insert into public.partners (id, contact_nom, contact_prenom, contact_telephone, contact_email)
values ('00000000-0000-0000-0000-0000000000b1', 'Test', 'Dara', '+855 00 000 000', 'test@example.com');

insert into public.venues (id, partenaire_id, nom, etat) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b1', 'Test Mango', 'en ligne'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000b1', 'Test Grill', 'en ligne'),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000b1', 'Test Secret', 'brouillon');

insert into public.events (id, nom, jour, lieu_id, avantage) values
  ('00000000-0000-0000-0000-0000000000e1', 'Test Comedy', public.jour_cambodge() + 7,
   '00000000-0000-0000-0000-0000000000c3', 'Half-price entry'),
  ('00000000-0000-0000-0000-0000000000e2', 'Test Past Gig', public.jour_cambodge() - 1,
   '00000000-0000-0000-0000-0000000000c1', 'A free drink');

-- Le nombre de lieux en ligne avant le test : « All venues » les compte tous, seed compris.
create temporary table reference_lieux as
  select count(*)::int as lieux_en_ligne from public.venues where etat = 'en ligne';
grant select on reference_lieux to anon, authenticated;

-- ── authenticated : le back-office compose ────────────────────────────────────
set local role authenticated;

select lives_ok($$ select public.enregistrer_pass_offer(
    null, 'Draft Only', null, 'jours', null, null, 'liste', '{}', 'liste', '{}', false) $$,
  'CAT-26 : un nom suffit pour enregistrer un brouillon');
select is((select etat from public.pass_offers where nom = 'Draft Only'), 'brouillon',
  'CAT-10 : un pass créé est en brouillon');
select throws_ok($$ select public.enregistrer_pass_offer(
    null, '  ', null, 'jours', null, null, 'liste', '{}', 'liste', '{}', false) $$, '23514', null,
  'CAT-12 : sans nom, rien ne s''enregistre');
select throws_ok($$ select public.enregistrer_pass_offer(
    (select id from public.pass_offers where nom = 'Draft Only'),
    'Draft Only', null, 'jours', null, 30, 'tous', '{}', 'liste', '{}', true) $$, '23514', null,
  'CAT-27 : sans prix, « Publish » refuse');
select is((select etat from public.pass_offers where nom = 'Draft Only'), 'brouillon',
  'CAT-21 : un refus de publier ne publie rien');
select throws_ok($$ select public.enregistrer_pass_offer(
    (select id from public.pass_offers where nom = 'Draft Only'),
    'Draft Only', 1500, 'jours', null, 30, 'liste', '{}', 'liste', '{}', true) $$, '23514', null,
  'CAT-21 : sans lieu ni événement, « Publish » refuse');
select throws_ok($$ select public.enregistrer_pass_offer(
    (select id from public.pass_offers where nom = 'Draft Only'),
    'Draft Only', 1500, 'date', public.jour_cambodge() - 1, null, 'tous', '{}', 'liste', '{}', true) $$,
  '23514', null, 'CAT-21 : une date fixe passée ne se publie pas');
select throws_ok($$ select public.enregistrer_pass_offer(
    (select id from public.pass_offers where nom = 'Draft Only'),
    'Draft Only', 0, 'jours', null, 30, 'tous', '{}', 'liste', '{}', true) $$, '23514', null,
  'CAT-13 : un prix nul ne s''enregistre pas');
select throws_ok($$ select public.enregistrer_pass_offer(
    (select id from public.pass_offers where nom = 'Draft Only'),
    'Draft Only', 1500, 'jours', null, 0, 'tous', '{}', 'liste', '{}', true) $$, '23514', null,
  'CAT-4 : au moins un jour');

-- CAT-30 : le pass « comedy club », un événement et deux lieux choisis.
select lives_ok($$ select public.enregistrer_pass_offer(
    null, 'Test Comedy Night', 1500, 'jours', null, 1, 'liste',
    array['00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c2']::uuid[],
    'liste', array['00000000-0000-0000-0000-0000000000e1']::uuid[], false) $$,
  'CAT-30 : le pass comedy club s''enregistre');
select lives_ok($$ select public.enregistrer_pass_offer(
    (select id from public.pass_offers where nom = 'Test Comedy Night'), 'Test Comedy Night', 1500, 'jours',
    null, 1, 'liste',
    array['00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c2']::uuid[],
    'liste', array['00000000-0000-0000-0000-0000000000e1']::uuid[], true) $$,
  'CAT-30 : et se publie');
select is((select count(*)::int from public.pass_offer_venues as l
  join public.pass_offers as o on o.id = l.offre_id where o.nom = 'Test Comedy Night'), 2,
  'les lieux choisis sont enregistrés');

-- CAT-28 : « All venues » sauf Test Mango.
select lives_ok($$ select public.enregistrer_pass_offer(
    null, 'Test All Venues', 2500, 'jours', null, 30, 'tous',
    array['00000000-0000-0000-0000-0000000000c1']::uuid[], 'liste', '{}', true) $$,
  'CAT-28 : un pass « All venues » avec exclusion se publie en une écriture depuis la création');

-- CAT-20 : une date fixe d'hier, en ligne au back-office (publié avant, date passée depuis).
insert into public.pass_offers (id, nom, prix_centimes, validite_mode, valide_jusqu_au, lieux_mode, etat)
values ('00000000-0000-0000-0000-0000000000f1', 'Test Ended', 1000, 'date', public.jour_cambodge() - 1, 'tous', 'en ligne');
-- CAT-23 : en ligne, mais ne couvre que des événements passés et aucun lieu en ligne.
insert into public.pass_offers (id, nom, prix_centimes, validite_mode, validite_jours, etat)
values ('00000000-0000-0000-0000-0000000000f2', 'Test Nothing To Show', 1000, 'jours', 7, 'brouillon');
insert into public.pass_offer_events (offre_id, evenement_id)
values ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-0000000000e2');
update public.pass_offers set etat = 'en ligne' where id = '00000000-0000-0000-0000-0000000000f2';

select throws_ok($$ update public.pass_offers set prix_centimes = null where nom = 'Test Comedy Night' $$,
  '23514', null, 'CAT-22 : un pass en ligne ne perd pas son prix');
select throws_ok($$ select public.enregistrer_pass_offer(
    (select id from public.pass_offers where nom = 'Test Comedy Night'), 'Test Comedy Night', 1500, 'jours',
    null, 1, 'liste', '{}', 'liste', '{}', false) $$, '23514', null,
  'CAT-22 : « Save » ne vide pas le contenu d''un pass en ligne');
select throws_ok($$ delete from public.pass_offers where nom = 'Draft Only' $$, '42501', null,
  'CAT-11 : un pass ne se supprime pas');
reset role;

-- ── anon : le site public ─────────────────────────────────────────────────────
set local role anon;
select throws_ok($$ select nom from public.pass_offers $$, '42501', null,
  'CAT-31 : anon ne lit pas le catalogue');
select throws_ok($$ select lieu_id from public.pass_offer_venues $$, '42501', null,
  'CAT-31 : anon ne lit pas les listes de lieux');
select throws_ok($$ select evenement_id from public.pass_offer_events $$, '42501', null,
  'CAT-31 : anon ne lit pas les listes d''événements');
select throws_ok($$ insert into public.pass_offers (nom) values ('Intrus') $$, '42501', null,
  'CAT-15 : anon ne crée pas de pass');
select throws_ok($$ select public.enregistrer_pass_offer(
    null, 'Intrus', 100, 'jours', null, 1, 'tous', '{}', 'liste', '{}', true) $$, '42501', null,
  'CAT-15 : anon n''appelle pas l''enregistrement');

select is((select array_agg(nom order by nom) from public.passes_en_vente() where nom like 'Test%'),
  array['Test All Venues', 'Test Comedy Night'],
  'CAT-16, CAT-20, CAT-23 : ni brouillon, ni date fixe passée, ni pass sans rien à montrer');
select is((select lieux_en_ligne from public.passes_en_vente() where nom = 'Test Comedy Night'), 2,
  'CAT-30 : « 2 partner venues »');
select is((select evenements from public.passes_en_vente() where nom = 'Test Comedy Night'),
  jsonb_build_array(jsonb_build_object('nom', 'Test Comedy', 'jour', public.jour_cambodge() + 7)),
  'CAT-17 : l''événement, son nom et sa date, sans le nom de son lieu en brouillon');
select is((select tous_les_lieux from public.passes_en_vente() where nom = 'Test All Venues'), false,
  'CAT-17 : une exclusion empêche « All partner venues »');
select is((select lieux_en_ligne from public.passes_en_vente() where nom = 'Test All Venues'),
  (select lieux_en_ligne - 1 from reference_lieux),
  'CAT-28, CAT-9 : tous les lieux en ligne sauf l''exclu, sans les brouillons');
select is((select evenements from public.passes_en_vente() where nom = 'Test All Venues'), '[]'::jsonb,
  'CAT-8 : « Selected events » vide, aucun événement');
reset role;

-- CAT-28 : un nouveau lieu publié entre dans « All venues » ; l'exclu n'y entre jamais.
insert into public.venues (partenaire_id, nom, etat)
values ('00000000-0000-0000-0000-0000000000b1', 'Test New Spot', 'en ligne');
update public.venues set etat = 'en ligne' where id = '00000000-0000-0000-0000-0000000000c1';
set local role anon;
select is((select lieux_en_ligne from public.passes_en_vente() where nom = 'Test All Venues'),
  (select lieux_en_ligne from reference_lieux),
  'CAT-28 : un lieu publié après augmente le compte de un');
reset role;

-- CAT-17 : un pass « All events » montre les événements à venir, y compris ceux créés après.
set local role authenticated;
select lives_ok($$ select public.enregistrer_pass_offer(
    (select id from public.pass_offers where nom = 'Test All Venues'), 'Test All Venues', 2500, 'jours',
    null, 30, 'tous', array['00000000-0000-0000-0000-0000000000c1']::uuid[], 'tous', '{}', false) $$,
  'CAT-8 : « All events » s''enregistre sur un pass en ligne');
reset role;
set local role anon;
select ok((select evenements from public.passes_en_vente() where nom = 'Test All Venues')
    @> jsonb_build_array(jsonb_build_object('nom', 'Test Comedy', 'jour', public.jour_cambodge() + 7)),
  'CAT-17 : « All events » montre l''événement à venir');
select ok(not (select evenements from public.passes_en_vente() where nom = 'Test All Venues')
    @> jsonb_build_array(jsonb_build_object('nom', 'Test Past Gig')),
  'EVT-10 : un événement passé ne se montre pas');
reset role;

-- CAT-10 : « Back to draft » retire le pass du site.
set local role authenticated;
select lives_ok($$ update public.pass_offers set etat = 'brouillon' where nom = 'Test Comedy Night' $$,
  'CAT-10 : « Back to draft »');
reset role;
set local role anon;
select is((select count(*)::int from public.passes_en_vente() where nom = 'Test Comedy Night'), 0,
  'CAT-27 : un pass retourné en brouillon quitte le site');
reset role;

-- ── Les ventes (PASS-21) ──────────────────────────────────────────────────────
insert into public.passes (id) values ('00000000-0000-0000-0000-0000000000a9');
select is((select offre_id from public.passes where id = '00000000-0000-0000-0000-0000000000a9'), null,
  'PASS-21 : une vente du site n''a pas de pass du catalogue');
select lives_ok($$ update public.passes set offre_id = (select id from public.pass_offers where nom = 'Test Comedy Night')
  where id = '00000000-0000-0000-0000-0000000000a9' $$,
  'PASS-21 : une vente peut désigner un pass du catalogue');
select ok((select valide_jusqu_au from public.passes where id = '00000000-0000-0000-0000-0000000000a9') = current_date + 7,
  'la date de validité d''une vente garde son défaut (CAT-24)');

select * from finish();
rollback;
