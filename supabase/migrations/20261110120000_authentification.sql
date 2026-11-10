-- Authentification du back-office : les politiques ouvertes au rôle `anon` se referment.
--   decisions/2026-11-10-authentification.md
--
-- Trois rôles en jeu, et trois seulement :
--   `anon`          le site public — les lieux « en ligne », en lecture, rien d'autre ;
--   `authenticated` le back-office — toute la table `partners`, lecture et écriture ;
--   `service_role`  les Edge Functions — hors RLS, inchangé (achat et validation des passes).
--
-- Pas de table `profiles`, pas de rôle `admin` ni `partner` lisible en base : il n'y a qu'un
-- seul rôle authentifié tant que le back-office est le seul écran derrière un mot de passe
-- (décision du 10/11, « Ce qu'on ne fait pas »). Le skill backend-supabase décrit le schéma à
-- trois rôles : il décrira celui-ci quand un deuxième rôle authentifié existera.
--
-- `passes` n'est pas touchée : elle est déjà en lecture seule pour `anon`, ses écritures ne
-- passent que par les Edge Functions en `service_role`.

-- ── Partenaires ───────────────────────────────────────────────────────────────
-- Remplace les trois politiques de 20261110010000, qui ouvraient la table entière à `anon`
-- faute d'authentification. Les noms changent pour dire à qui chaque règle s'adresse.
drop policy partners_lecture on public.partners;
drop policy partners_ajout on public.partners;
drop policy partners_modification on public.partners;

-- Site public : seulement l'état « en ligne » (PART-3, DEMO-3). Un brouillon n'est plus lisible
-- avec la seule clé publishable — c'est le but : elle part dans le navigateur de chaque visiteur.
create policy partners_lecture_publique on public.partners
  for select to anon
  using (etat = 'en ligne');

-- Back-office : la liste montre les brouillons comme les lignes en ligne (PART-3 à PART-5),
-- l'ajout crée un brouillon, la mise à jour couvre la mise en ligne, le retour en brouillon et
-- l'horodatage de l'invitation.
create policy partners_lecture_admin on public.partners
  for select to authenticated
  using (true);

create policy partners_ajout_admin on public.partners
  for insert to authenticated
  with check (true);

create policy partners_modification_admin on public.partners
  for update to authenticated
  using (true)
  with check (true);

-- Toujours aucune politique de suppression, pour aucun rôle : rien ne supprime un partenaire.

-- ── Lien d'accès du partenaire ────────────────────────────────────────────────
-- PART-7 ne change pas : le partenaire n'a ni compte ni mot de passe, son jeton opaque tient
-- lieu de connexion. Mais sa fiche s'affiche aussi en brouillon (DEMO-14), que la politique
-- publique ci-dessus ne laisse plus passer. D'où cette fonction : le jeton reste la seule clé,
-- et c'est elle, et non le client, qui décide des colonnes qui sortent.
--
-- `security definer` parce qu'elle doit lire par-dessus la politique publique. Ce qu'elle ne
-- rend pas : `acces_jeton` (aucun jeton ne ressort d'ici, rien à énumérer) et
-- `invitation_envoyee_le` (le partenaire n'en a pas l'usage). Un jeton inconnu rend zéro ligne,
-- l'appelant répond 404 — surtout pas un écran qui expliquerait ce qu'est un bon jeton.
create function public.partenaire_par_jeton(jeton_demande text)
returns table (
  id uuid,
  contact_nom text,
  contact_prenom text,
  contact_telephone text,
  contact_email text,
  lieu_nom text,
  lieu_adresse text,
  lieu_photo text,
  lieu_description text,
  avantage text,
  etat text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.contact_nom,
    p.contact_prenom,
    p.contact_telephone,
    p.contact_email,
    p.lieu_nom,
    p.lieu_adresse,
    p.lieu_photo,
    p.lieu_description,
    p.avantage,
    p.etat
  from public.partners as p
  where p.acces_jeton = jeton_demande;
$$;

comment on function public.partenaire_par_jeton(text) is
  'Fiche du partenaire derrière son jeton d''accès (PART-7) : le jeton tient lieu de connexion.';

-- `create function` donne l'exécution à `public` : on la retire, puis on la rend aux deux rôles
-- qui ouvrent l'espace partenaire (le lien est ouvert avec ou sans session au back-office).
revoke all on function public.partenaire_par_jeton(text) from public;
grant execute on function public.partenaire_par_jeton(text) to anon, authenticated;
