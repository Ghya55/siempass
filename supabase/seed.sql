-- Seed de la base locale et de la CI uniquement : rejoué à chaque `supabase db reset`.
-- Jamais appliqué à la base réelle (ybcdppcdgbbujmlmimqs).
--
-- Comptes du back-office — decisions/2026-11-10-authentification.md : adresses factices en
-- @siempass.com, e-mail déjà confirmé, aucun e-mail envoyé, aucune inscription en libre-service.
--
-- Le mot de passe ne vient jamais du dépôt : il est lu dans le réglage `siempass.mot_de_passe`,
-- posé une fois par base locale depuis une variable d'environnement (voir .env.example) :
--
--   psql "$(supabase status -o json | jq -r .DB_URL)" \
--     -c "alter role postgres set siempass.mot_de_passe = '$SIEMPASS_MOT_DE_PASSE_ADMIN'"
--
-- Posé sur le rôle et non sur la base : `supabase db reset` recrée la base, pas le rôle, donc le
-- réglage survit aux remises à zéro. Réglage absent — c'est le cas de la CI, qui ne se connecte à
-- aucun écran : aucun compte n'est créé, et le seed passe quand même.
--
-- Aucune donnée réelle de partenaire ou de client n'entre ici.

-- `crypt` et `gen_salt` viennent de pgcrypto, que l'image Supabase installe dans `extensions` :
-- on l'ajoute au chemin de recherche plutôt que de préfixer chaque appel, parce qu'une
-- installation locale peut l'avoir mise dans `public`.
set search_path = public, extensions;

do $$
declare
  -- Un compte par ligne. Celui de l'associé s'ajoute ici, et nulle part ailleurs : décommenter.
  adresses constant text[] := array[
    'jean-aurel@siempass.com'
    -- , 'associe@siempass.com'
  ];
  mot_de_passe constant text := nullif(current_setting('siempass.mot_de_passe', true), '');
  adresse text;
  identifiant uuid;
begin
  if mot_de_passe is null then
    raise notice 'siempass.mot_de_passe absent : aucun compte de back-office créé.';
    return;
  end if;

  foreach adresse in array adresses
  loop
    select u.id into identifiant from auth.users as u where u.email = adresse;

    -- Rejouable : un compte déjà là reprend simplement le mot de passe du réglage.
    if identifiant is not null then
      update auth.users
      set encrypted_password = crypt(mot_de_passe, gen_salt('bf')),
          updated_at = now()
      where id = identifiant;
      continue;
    end if;

    identifiant := gen_random_uuid();

    -- `email_confirmed_at` posé à la création : confirmation désactivée, aucun e-mail à cliquer.
    -- Les quatre colonnes de jeton sont mises à la chaîne vide plutôt que laissées nulles : des
    -- versions de GoTrue les lisent dans un `string` et échouent sur un NULL.
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      confirmation_token,
      recovery_token,
      email_change,
      email_change_token_new
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      identifiant,
      'authenticated',
      'authenticated',
      adresse,
      crypt(mot_de_passe, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      '',
      '',
      '',
      ''
    );

    -- Sans son identité `email`, le compte existe mais la connexion par mot de passe échoue.
    insert into auth.identities (
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      identifiant,
      identifiant::text,
      'email',
      jsonb_build_object(
        'sub', identifiant::text,
        'email', adresse,
        'email_verified', true,
        'phone_verified', false
      ),
      now(),
      now(),
      now()
    );

    raise notice 'compte de back-office créé : %', adresse;
  end loop;
end
$$;

-- Prénoms des comptes de test, affichés en « Written by » sur la fiche d'un lieu (VEN-9). Un
-- compte absent (CI, mot de passe non posé) n'en reçoit pas : la jointure ne rend rien.
insert into public.profiles (id, prenom)
select u.id, comptes.prenom
from (values
  ('jean-aurel@siempass.com', 'Ghya')
  -- , ('associe@siempass.com', '<prénom>')
) as comptes (adresse, prenom)
join auth.users as u on u.email = comptes.adresse
on conflict (id) do update set prenom = excluded.prenom;

-- ── Catalogue de démonstration (specs/events.md, specs/catalogue-passes.md) ────
-- Un partenaire, des lieux, des événements et des passes entièrement fictifs, pour voir les pages
-- Events, Passes et le bloc « Our passes » en local. Les dates suivent le jour du `db reset` :
-- des événements à venir et un passé, un pass à date fixe terminé. Identifiants fixes en
-- `5eed…` : rejouable, et repérable.
insert into public.partners (id, contact_nom, contact_prenom, contact_telephone, contact_email)
values ('5eed0000-0000-0000-0000-0000000000b1', 'Demo', 'Sokha', '+855 00 000 001', 'demo-partner@example.com')
on conflict (id) do nothing;

insert into public.venues (id, partenaire_id, nom, tagline, adresse, avantage, etat, slug) values
  ('5eed0000-0000-0000-0000-0000000000c1', '5eed0000-0000-0000-0000-0000000000b1', 'Demo Lantern Bar',
   'Cocktails under paper lanterns.', 'Street 08, Siem Reap', 'A free cocktail', 'en ligne', ''),
  ('5eed0000-0000-0000-0000-0000000000c2', '5eed0000-0000-0000-0000-0000000000b1', 'Demo River Grill',
   'Grilled fish by the river.', 'River Road, Siem Reap', '10% off the bill', 'en ligne', ''),
  ('5eed0000-0000-0000-0000-0000000000c3', '5eed0000-0000-0000-0000-0000000000b1', 'Demo Night Stage',
   null, null, null, 'brouillon', '')
on conflict (id) do nothing;

insert into public.events (id, nom, jour, lieu_id, avantage) values
  ('5eed0000-0000-0000-0000-0000000000e1', 'Demo Comedy Club', public.jour_cambodge() + 7,
   '5eed0000-0000-0000-0000-0000000000c3', 'Half-price entry'),
  ('5eed0000-0000-0000-0000-0000000000e2', 'Demo Comedy Club', public.jour_cambodge() + 14,
   '5eed0000-0000-0000-0000-0000000000c3', 'Half-price entry'),
  ('5eed0000-0000-0000-0000-0000000000e3', 'Demo Jazz Evening', public.jour_cambodge() + 3,
   '5eed0000-0000-0000-0000-0000000000c1', 'A free welcome drink'),
  ('5eed0000-0000-0000-0000-0000000000e4', 'Demo Open Mic', public.jour_cambodge() - 5,
   '5eed0000-0000-0000-0000-0000000000c2', 'A free soft drink')
on conflict (id) do nothing;

insert into public.pass_offers (id, created_at, nom, prix_centimes, validite_mode, valide_jusqu_au, validite_jours,
  lieux_mode, evenements_mode, etat) values
  -- Brouillon, nom seul.
  ('5eed0000-0000-0000-0000-0000000000f1', now() - interval '1 minute', 'Demo Draft Week', null, 'jours', null, null,
   'liste', 'liste', 'brouillon'),
  -- Le pass « comedy club » (CAT-30) : un événement, deux lieux.
  ('5eed0000-0000-0000-0000-0000000000f2', now() - interval '2 minutes', 'Demo Comedy Night', 1500, 'jours', null, 1,
   'liste', 'liste', 'en ligne'),
  -- Mensuel, tous les lieux et tous les événements (CAT-4).
  ('5eed0000-0000-0000-0000-0000000000f3', now() - interval '3 minutes', 'Demo Monthly', 2500, 'jours', null, 30,
   'tous', 'tous', 'en ligne'),
  -- Date fixe passée : « Ended » au back-office, absent du site (CAT-20).
  ('5eed0000-0000-0000-0000-0000000000f4', now() - interval '4 minutes', 'Demo Festival Weekend', 1050, 'date',
   public.jour_cambodge() - 1, null, 'tous', 'liste', 'en ligne')
on conflict (id) do nothing;

insert into public.pass_offer_venues (offre_id, lieu_id) values
  ('5eed0000-0000-0000-0000-0000000000f2', '5eed0000-0000-0000-0000-0000000000c1'),
  ('5eed0000-0000-0000-0000-0000000000f2', '5eed0000-0000-0000-0000-0000000000c2')
on conflict do nothing;

insert into public.pass_offer_events (offre_id, evenement_id) values
  ('5eed0000-0000-0000-0000-0000000000f2', '5eed0000-0000-0000-0000-0000000000e1')
on conflict do nothing;
