#!/usr/bin/env bash
# VEN-34 : rejoue la reprise des lieux sur la base locale jetable (`supabase start` déjà lancé).
# Base remise juste avant la migration des lieux, partenaires fictifs posés, migration appliquée,
# résultat vérifié, puis base remise à jour. Ne touche jamais la base réelle.
set -euo pipefail
cd "$(dirname "$0")/../../.."
ici=supabase/verifications/reprise-venues
db="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

supabase db reset --version 20261110160000 --no-seed
psql "$db" -v ON_ERROR_STOP=1 -q -f "$ici/avant.sql"
supabase migration up
psql "$db" -v ON_ERROR_STOP=1 -q -f "$ici/apres.sql"
supabase db reset
