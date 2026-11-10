-- Le back-office lit, rafraîchit et supprime les passes.
--
-- Outils de test, demandés par Ghya le 10/11 : pas de spec, pas de Figma, et ce ne sont pas des
-- gestes de production. Ils restent derrière l'authentification du back-office
-- (decisions/2026-11-10-authentification.md).
--
-- `anon` ne change pas : lecture seule par la politique `passes_lecture` de 20261110010000, et
-- la création d'un pass reste réservée à l'Edge Function `acheter-pass` sous `service_role` — un
-- pass naît d'un paiement, jamais d'un clic au back-office. D'où l'absence de politique
-- d'insertion ci-dessous : elle est volontaire.

create policy passes_lecture_admin on public.passes
  for select to authenticated
  using (true);

create policy passes_modification_admin on public.passes
  for update to authenticated
  using (true)
  with check (true);

-- Seule table du schéma à être supprimable, et seulement par le back-office : un partenaire ne
-- se supprime pas, un pass de test, oui. La suppression est définitive et la base est unique
-- (décision du 09/11) : l'écran demande confirmation avant d'appeler.
create policy passes_suppression_admin on public.passes
  for delete to authenticated
  using (true);

-- Remet un pass dans l'état « jamais utilisé », pour rejouer un scan sans racheter de pass
-- (DEMO-11 : un seul passage par pass, donc un pass validé est mort sans ce geste).
--
-- `valide_jusqu_au = default` et non une date calculée : la durée du pass est provisoire
-- (DEMO-9) et n'est écrite qu'à un seul endroit, le défaut de la colonne. Une date calculée ici
-- ou dans TypeScript ferait un deuxième endroit à tenir d'accord.
--
-- `security invoker` (le défaut, non écrit) : c'est la politique ci-dessus qui autorise, pas la
-- fonction. Appelée sans session, elle ne touche rien.
create function public.rafraichir_pass(pass_id uuid)
returns void
language sql
set search_path = public
as $$
  update public.passes
  set valide_jusqu_au = default,
      utilise_le = null,
      utilise_par = null
  where id = pass_id;
$$;

comment on function public.rafraichir_pass(uuid) is
  'Remet un pass dans l''état « jamais utilisé » et repousse sa validité au défaut de la colonne.';

revoke all on function public.rafraichir_pass(uuid) from public;
grant execute on function public.rafraichir_pass(uuid) to authenticated;
