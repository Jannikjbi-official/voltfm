#!/usr/bin/env bash
# Baut eine ZIP mit allem, was sich seit einem Stand geändert hat — für den
# eigenen Server (VoltFM läuft nicht mehr auf Vercel).
#
#   bash scripts/aenderungs-zip.sh <basis> [ziel.zip]
#
# <basis> ist der Stand, der gerade auf dem Server läuft (Commit, Tag oder
# Branch, z. B. origin/main). Die ZIP enthält:
#   dateien/        alle neuen und geänderten Dateien mit ihrem Pfad im Projekt
#   geloescht.txt   Dateien, die auf dem Server gelöscht werden müssen
#   aenderungen.patch  derselbe Unterschied als Git-Patch (git apply)
#   dateiliste.txt  A = neu, M = geändert, D = gelöscht, R = umbenannt
#   ANLEITUNG.md    was auf dem Server zu tun ist (aus docs/server-anleitung.md)
set -euo pipefail

basis="${1:?Bitte den Stand angeben, der auf dem Server läuft, z. B. origin/main}"
ziel="${2:-voltfm-aenderungen-$(date +%Y-%m-%d-%H%M).zip}"
wurzel="$(git rev-parse --show-toplevel)"
cd "$wurzel"

git rev-parse --verify --quiet "$basis^{commit}" >/dev/null || { echo "Unbekannter Stand: $basis" >&2; exit 1; }

arbeit="$(mktemp -d)"
trap 'rm -rf "$arbeit"' EXIT
paket="$arbeit/voltfm-aenderungen"
mkdir -p "$paket/dateien"

git diff --name-status -M "$basis" HEAD > "$paket/dateiliste.txt"
git diff --binary -M "$basis" HEAD > "$paket/aenderungen.patch"
: > "$paket/geloescht.txt"

while IFS=$'\t' read -r status a b; do
  case "$status" in
    D) echo "$a" >> "$paket/geloescht.txt" ;;
    R*) echo "$a" >> "$paket/geloescht.txt"; mkdir -p "$paket/dateien/$(dirname "$b")"; git show "HEAD:$b" > "$paket/dateien/$b" ;;
    *) mkdir -p "$paket/dateien/$(dirname "$a")"; git show "HEAD:$a" > "$paket/dateien/$a" ;;
  esac
done < "$paket/dateiliste.txt"

{
  echo "# VoltFM – Änderungen für den Server"
  echo
  echo "Von \`$(git rev-parse --short "$basis")\` bis \`$(git rev-parse --short HEAD)\` ($(git log -1 --format=%cd --date=format:'%d.%m.%Y %H:%M' HEAD))."
  echo
  echo "## Enthaltene Commits"
  echo
  git log --reverse --format='- %s' "$basis..HEAD"
  echo
  echo "## Dateien"
  echo
  echo '```'
  cat "$paket/dateiliste.txt"
  echo '```'
  echo
  cat docs/server-anleitung.md
} > "$paket/ANLEITUNG.md"

(cd "$arbeit" && zip -qr "$wurzel/$ziel" voltfm-aenderungen)
echo "Fertig: $ziel ($(wc -l < "$paket/dateiliste.txt") Dateien)"
