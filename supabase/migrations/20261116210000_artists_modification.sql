-- Artistes : la fiche modifie et supprime.
--   specs/artists.md (ART-4, ART-8)
--
-- Migration ADDITIVE : deux politiques de plus sur `artists`, rien n'est retiré. Le code de
-- `main` ne lit pas cette table.

-- ART-4 : la fiche d'un artiste reste modifiable à tout moment.
create policy artists_modification_admin on public.artists
  for update to authenticated
  using (true)
  with check (true);

-- ART-8 : « Delete », sur la ligne et dans la fiche. Première table du back-office qui se
-- supprime : un artiste n'est rattaché à rien (ni lieu, ni pass), sa suppression n'emporte rien.
create policy artists_suppression_admin on public.artists
  for delete to authenticated
  using (true);
