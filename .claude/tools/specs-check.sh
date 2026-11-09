#!/usr/bin/env bash
# specs-check.sh — contrôles de forme des specs (voir specs/_format.md). Zéro token.
# Imprime les écarts, un par ligne ; sort 1 s'il y en a.
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
DIR="${1:-$ROOT/specs}"; MAX_LINES="${MAX_LINES:-150}"
ERR="$(mktemp)"; LIST="$(mktemp)"; trap 'rm -f "$ERR" "$LIST"' EXIT
err() { echo "✗ $1" | tee -a "$ERR"; }
find "$DIR" -name '*.md' ! -name '_*' ! -name 'README.md' 2>/dev/null | sort > "$LIST"
[ -s "$LIST" ] || { echo "aucune spec"; exit 0; }

dups="$(while read -r f; do grep -oE '^\*\*[A-Z]{1,6}-[0-9]+ — ' "$f"; done < "$LIST" | sed -E 's/^\*\*([A-Z]+-[0-9]+) — /\1/' | sort | uniq -d)"
for d in $dups; do err "identifiant défini plusieurs fois : $d"; done

while read -r f; do
  rel="${f#$ROOT/}"
  [ "$(head -1 "$f")" = "---" ] || { err "$rel : pas d'en-tête YAML"; continue; }
  type="$(sed -n '2,15p' "$f" | sed -n 's/^type: *//p' | head -1)"
  for k in titre statut porteur maj; do grep -qE "^$k:" "$f" || err "$rel : clé « $k » absente de l'en-tête"; done
  n="$(wc -l < "$f" | tr -d ' ')"; [ "$n" -le "$MAX_LINES" ] || err "$rel : $n lignes (plafond $MAX_LINES)"
  case "$type" in
    objet)      want="Définition|Attributs|Règles|Cas limites|Ouvert pour Ghya|Détails techniques" ;;
    ecran|flux) want="Intention|Blocs|Règles|Cas limites|Fini quand|Ouvert pour Ghya|Détails techniques" ;;
    regle)      want="Énoncé|Cas|Cas limites|Ouvert pour Ghya|Détails techniques" ;;
    *)          err "$rel : type manquant ou inconnu (« $type »)"; want="" ;;
  esac
  if [ -n "$want" ]; then
    have="$(grep -E '^## ' "$f" | sed 's/^## //' | tr '\n' '|' | sed 's/|$//')"
    [ "$have" = "$want" ] || err "$rel : sections attendues « $want », trouvées « $have »"
  fi
  bad="$(awk '/^## Détails techniques/{skip=1} !skip' "$f" | grep -nE '(^|[^0-9])[0-9]+:[0-9]+([^0-9]|$)' | head -1 | cut -d: -f1)"
  [ -z "$bad" ] || err "$rel : identifiant de nœud Figma dans le corps (l.$bad) — il va dans l'en-tête figma:"
  grep -oE '\]\([^)]*\.md(#[^)]*)?\)' "$f" | sed -E 's/^\]\(//; s/\)$//' | while read -r link; do
    target="${link%%#*}"; case "$target" in http*) continue ;; esac
    [ -e "$(dirname "$f")/$target" ] || err "$rel : lien cassé → $target"
  done
done < "$LIST"
count="$(wc -l < "$ERR" | tr -d ' ')"
[ "$count" -eq 0 ] && { echo "✓ $(wc -l < "$LIST" | tr -d ' ') spec(s) conforme(s)"; exit 0; }
echo "$count écart(s)"; exit 1
