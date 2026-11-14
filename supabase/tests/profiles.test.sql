-- Droits sur `profiles` (prénom d'un compte) et sur la fonction `prenom_auteur_du_lieu`.
--   specs/venues.md : VEN-9 (« Written by » par un prénom, jamais l'e-mail), VEN-27, VEN-35.
-- Lancé par `supabase test db` (CI, base jetable). Tout se passe dans une transaction annulée.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(12);

-- ── Données fictives ──────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'auteur-test@siempass.com'),
  ('00000000-0000-0000-0000-0000000000a2', 'sans-prenom-test@siempass.com');

insert into public.profiles (id, prenom) values ('00000000-0000-0000-0000-0000000000a1', 'Dara');

insert into public.partners (id, contact_nom, contact_prenom, contact_telephone, contact_email)
values ('00000000-0000-0000-0000-0000000000b1', 'Test', 'Sok', '+855 00 000 000', 'test@example.com');

-- L'auteur est le compte de la session (déclencheur `venues_auteur`, VEN-9).
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-0000000000a1", "role": "authenticated"}';
insert into public.venues (partenaire_id, nom, etat) values
  ('00000000-0000-0000-0000-0000000000b1', 'Written Bar', 'en ligne'),
  ('00000000-0000-0000-0000-0000000000b1', 'Draft Bar', 'brouillon');
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-0000000000a2", "role": "authenticated"}';
insert into public.venues (partenaire_id, nom, etat) values
  ('00000000-0000-0000-0000-0000000000b1', 'Nameless Author Bar', 'en ligne');
set local request.jwt.claims = '';
insert into public.venues (partenaire_id, nom, etat) values
  ('00000000-0000-0000-0000-0000000000b1', 'Legacy Bar', 'en ligne');

-- ── anon : le site public ─────────────────────────────────────────────────────
set local role anon;
select throws_ok($$ select prenom from public.profiles $$, '42501', null,
  'anon ne lit pas la table des prénoms');
select is(public.prenom_auteur_du_lieu('written-bar'), 'Dara',
  'VEN-9 : le prénom de l''auteur d''un lieu en ligne');
select is(public.prenom_auteur_du_lieu('draft-bar'), null,
  'VEN-35 : rien sur l''auteur d''un brouillon');
select is(public.prenom_auteur_du_lieu('nameless-author-bar'), null,
  'auteur sans prénom : pas de « Written by »');
select is(public.prenom_auteur_du_lieu('legacy-bar'), null,
  'VEN-27 : lieu repris sans auteur, pas de « Written by »');
select is(public.prenom_auteur_du_lieu('unknown'), null, 'lieu inconnu : nul');
select throws_ok($$ insert into public.profiles (id, prenom)
  values ('00000000-0000-0000-0000-0000000000a2', 'Intrus') $$, '42501', null,
  'anon ne pose pas de prénom');
reset role;

-- ── authenticated : le back-office ────────────────────────────────────────────
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-0000000000a2", "role": "authenticated"}';
select is((select prenom from public.profiles where id = '00000000-0000-0000-0000-0000000000a1'), 'Dara',
  'le back-office lit le prénom de l''auteur (preview, VEN-12)');
select throws_ok($$ insert into public.profiles (id, prenom)
  values ('00000000-0000-0000-0000-0000000000a2', 'Moi') $$, '42501', null,
  'le back-office ne pose pas de prénom par l''API');
select throws_ok($$ update public.profiles set prenom = 'Autre' $$, '42501', null,
  'le back-office ne change pas un prénom par l''API');
select throws_ok($$ delete from public.profiles $$, '42501', null,
  'le back-office ne supprime pas un prénom');
reset role;

select throws_ok($$ insert into public.profiles (id, prenom)
  values ('00000000-0000-0000-0000-0000000000a2', '  ') $$, '23514', null,
  'un prénom vide ne s''enregistre pas');

select * from finish();
rollback;
