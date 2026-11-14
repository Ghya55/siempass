-- VEN-34 : partenaires fictifs posés AVANT la migration 20261115090000_venues.sql.
-- Cas couverts : en ligne / brouillon, sans photo, deux lieux du même nom, accents.
insert into public.partners
  (id, created_at, contact_nom, contact_prenom, contact_telephone, lieu_nom, lieu_adresse, lieu_photo,
   lieu_description, avantage, etat)
values
  ('00000000-0000-0000-0000-00000000d001', '2026-11-01', 'Test', 'Un', '+855 00 000 001',
   'Mango Bar', 'Street 9, Siem Reap', 'https://example.com/mango.jpg',
   'Cocktails on a wooden terrace', 'One free cocktail', 'en ligne'),
  ('00000000-0000-0000-0000-00000000d002', '2026-11-02', 'Test', 'Deux', '+855 00 000 002',
   'Mango Bar', 'Street 11, Siem Reap', null,
   'Another mango bar', 'Free shake', 'brouillon'),
  ('00000000-0000-0000-0000-00000000d003', '2026-11-03', 'Test', 'Trois', '+855 00 000 003',
   'Café Été', 'Pub Street, Siem Reap', null,
   'Coffee and pastries', '10% off', 'en ligne');
