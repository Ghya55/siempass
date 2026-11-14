-- VEN-34 : vérifications APRÈS la migration. Toute divergence lève une exception (psql sort en
-- erreur avec ON_ERROR_STOP).
do $$
declare
  ecart integer;
begin
  -- Chaque partenaire a exactement un lieu.
  select count(*) into ecart from public.partners as p
  where (select count(*) from public.venues as v where v.partenaire_id = p.id) <> 1;
  if ecart <> 0 then raise exception 'VEN-34 : % partenaire(s) sans exactement un lieu', ecart; end if;

  -- Même état, données recopiées (VEN-17), ni auteur ni catégorie.
  select count(*) into ecart from public.partners as p join public.venues as v on v.partenaire_id = p.id
  where v.etat <> p.etat or v.nom <> p.lieu_nom or v.adresse is distinct from p.lieu_adresse
     or v.photo_entete is distinct from p.lieu_photo or v.tagline is distinct from p.lieu_description
     or v.avantage is distinct from p.avantage or v.auteur_id is not null or v.categorie is not null;
  if ecart <> 0 then raise exception 'VEN-17 : % lieu(x) mal recopié(s)', ecart; end if;

  -- Date de création recopiée : la liste du site garde son ordre.
  select count(*) into ecart from public.partners as p join public.venues as v on v.partenaire_id = p.id where v.created_at <> p.created_at;
  if ecart <> 0 then raise exception 'VEN-17 : % date(s) de création non recopiée(s)', ecart; end if;

  -- Adresses de page (VEN-10, VEN-21) : le plus ancien garde l'adresse nue.
  if (select slug from public.venues where partenaire_id = '00000000-0000-0000-0000-00000000d001') <> 'mango-bar'
  or (select slug from public.venues where partenaire_id = '00000000-0000-0000-0000-00000000d002') <> 'mango-bar-2'
  or (select slug from public.venues where partenaire_id = '00000000-0000-0000-0000-00000000d003') <> 'cafe-ete' then
    raise exception 'VEN-21 : adresses de page inattendues';
  end if;

  -- Les lieux en ligne restent visibles depuis le site (rôle anon), les brouillons non.
  set local role anon;
  select count(*) into ecart from public.venues;
  reset role;
  if ecart <> 2 then raise exception 'VEN-34 : % lieu(x) visible(s) sans session au lieu de 2', ecart; end if;

  -- Le partenaire peut désormais être créé sans lieu (VEN-15).
  insert into public.partners (contact_nom, contact_prenom, contact_telephone)
  values ('Test', 'Quatre', '+855 00 000 004');

  raise notice 'VEN-34 : reprise vérifiée';
end
$$;
