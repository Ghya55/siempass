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
