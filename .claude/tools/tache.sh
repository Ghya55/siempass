#!/usr/bin/env bash
# tache.sh — le mécanique git d'une tâche, zéro token.
#   tache.sh etat                          PR ouvertes et leurs fichiers, derniers merges, ce qui attend Ghya
#   tache.sh debut <type>/<slug>           nouvelle branche depuis origin/staging (feat|fix|design|spec|chore)
#   tache.sh livrer "<titre>" [desc.md]    rebase sur staging, contrôles, push, PR, attente de la CI, merge
#   tache.sh prod --demande-par-ghya       promeut staging vers main (production) : seulement sur demande de Ghya
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
BASE=staging
REPO="$(git remote get-url origin | sed -E 's#.*github\.com[:/]##; s#\.git$##')"
fetch() { for b in "$@"; do git fetch -q origin "+refs/heads/$b:refs/remotes/origin/$b"; done; }
die() { echo "✗ $*" >&2; exit 1; }

controles() {
  [ -d specs ] && bash .claude/tools/specs-check.sh
  if [ -f package.json ] && grep -q '"check"' package.json; then
    if [ -f pnpm-lock.yaml ]; then pnpm -s check; else npm run -s check; fi
  fi
}

api() { gh api "$@"; }   # REST uniquement : GraphQL (gh pr …) est bloqué dans les sessions Claude

pr_de() { # $1 = branche, $2 = base → numéro de la PR ouverte, vide sinon
  api "repos/$REPO/pulls?state=open&head=${REPO%%/*}:$1&base=$2" --jq '.[0].number // empty'
}

attendre_ci() { # $1 = numéro de PR ; vrai si tout est vert ou s'il n'y a pas de CI
  local sha; sha="$(api "repos/$REPO/pulls/$1" --jq .head.sha)"
  sleep 20
  for _ in $(seq 1 120); do
    local etat; etat="$(api "repos/$REPO/commits/$sha/check-runs?per_page=100" --jq '
      if .total_count == 0 then "aucune"
      elif ([.check_runs[] | select(.status != "completed")] | length) > 0 then "en-cours"
      elif ([.check_runs[] | select(.conclusion as $c | ["success","skipped","neutral"] | index($c) | not)] | length) > 0 then "rouge"
      else "vert" end')"
    case "$etat" in
      aucune) echo "· pas de CI sur cette PR"; return 0 ;;
      vert) echo "· CI verte"; return 0 ;;
      rouge) api "repos/$REPO/commits/$sha/check-runs" --jq '.check_runs[] | select(.conclusion != "success") | "  ✗ \(.name) : \(.html_url)"'; return 1 ;;
    esac
    sleep 15
  done
  echo "· CI toujours en cours après 30 min"; return 1
}

case "${1:-}" in
  etat)
    fetch "$BASE"
    echo "## PR ouvertes"
    for n in $(api "repos/$REPO/pulls?state=open&per_page=50" --jq '.[].number'); do
      api "repos/$REPO/pulls/$n" --jq '"#\(.number) \(.title) [\(.head.ref) → \(.base.ref)]"'
      echo "    $(api "repos/$REPO/pulls/$n/files?per_page=100" --jq '[.[].filename] | .[:10] | join(", ")')"
    done
    echo; echo "## Derniers merges sur $BASE"; git log --oneline -8 "origin/$BASE"
    echo; echo "## Attend Ghya"
    git ls-tree -r --name-only "origin/$BASE" -- decisions specs 2>/dev/null | grep -E '\.md$' | grep -v '/_' | while read -r f; do
      c="$(git show "origin/$BASE:$f")"
      grep -qE '^statut: *(proposée|à valider)' <<<"$c" && { echo "  $f — statut à trancher"; continue; }
      n="$(awk '/^## Ouvert pour Ghya/{o=1;next} /^## /{o=0} o && /^[-*0-9]/ && !/Sans objet/' <<<"$c" | wc -l | tr -d ' ')"
      [ "$n" -gt 0 ] && echo "  $f — $n question(s) ouverte(s)"
    done || true
    ;;
  debut)
    name="${2:-}"; [[ "$name" =~ ^(feat|fix|design|spec|chore)/[a-z0-9-]+$ ]] || die "nom attendu : <feat|fix|design|spec|chore>/<slug-en-minuscules>"
    fetch "$BASE"
    git switch -q -c "$name" "origin/$BASE"
    echo "✓ branche $name, depuis $(git rev-parse --short "origin/$BASE")"
    ;;
  livrer)
    title="${2:-}"; desc="${3:-}"; [ -n "$title" ] || die "titre manquant"
    branch="$(git branch --show-current)"
    case "$branch" in ""|"$BASE"|main) die "on ne livre pas depuis « $branch » : tache.sh debut d'abord";; esac
    [ -z "$(git status --porcelain)" ] || die "des modifications ne sont pas commitées"
    fetch "$BASE"
    git rebase -q "origin/$BASE" || die "conflit avec $BASE : résous, git rebase --continue, puis relance livrer"
    controles || die "contrôles locaux rouges"
    git push -q --force-with-lease -u origin "$branch"
    pr="$(pr_de "$branch" "$BASE")"
    body="$title"; [ -n "$desc" ] && body="$(cat "$desc")"
    if [ -z "$pr" ]; then
      pr="$(api "repos/$REPO/pulls" -f title="$title" -f head="$branch" -f base="$BASE" -f body="$body" --jq .number)"
    elif [ -n "$desc" ]; then api -X PATCH "repos/$REPO/pulls/$pr" -f body="$body" >/dev/null; fi
    echo "· PR #$pr : https://github.com/$REPO/pull/$pr"
    attendre_ci "$pr" || die "CI rouge sur #$pr : corrige, commite, relance livrer"
    api -X PUT "repos/$REPO/pulls/$pr/merge" -f merge_method=squash -f commit_title="$title (#$pr)" >/dev/null \
      || die "merge refusé (conflit arrivé entre-temps ?) : relance livrer"
    git push -q origin --delete "$branch" 2>/dev/null || true
    echo "✓ #$pr mergée dans $BASE"
    ;;
  prod)
    [ "${2:-}" = "--demande-par-ghya" ] || die "la mise en prod se fait seulement sur demande explicite de Ghya"
    fetch main "$BASE"
    [ -n "$(git log --oneline "origin/main..origin/$BASE")" ] || die "rien à promouvoir"
    body="$(git log --format='- %s' "origin/main..origin/$BASE")"
    pr="$(pr_de "$BASE" main)"
    [ -n "$pr" ] || pr="$(api "repos/$REPO/pulls" -f title="Mise en prod du $(date +%F)" -f head="$BASE" -f base=main -f body="$body" --jq .number)"
    attendre_ci "$pr" || die "CI rouge sur la mise en prod #$pr"
    api -X PUT "repos/$REPO/pulls/$pr/merge" -f merge_method=merge >/dev/null || die "merge de la mise en prod refusé (#$pr)"
    echo "✓ en production (#$pr)"
    ;;
  *) sed -n '2,6p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
