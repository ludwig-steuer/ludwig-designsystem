#!/usr/bin/env bash
# Spiegelt die Ludwig-Interfaces (Datenmodell + Domänen-Typen) nach src/ludwig/.
#
# src/ludwig/ ist eine KOPIE — nie hier bearbeiten, Änderungen gehören in
# ludwig/app/apps/web/src. Dieses Script neu laufen lassen, wenn sich das
# Datenmodell drüben ändert.
set -euo pipefail

SRC="${LUDWIG_SRC:-$(cd "$(dirname "$0")/../../app/apps/web/src" && pwd)}"
DST="$(cd "$(dirname "$0")/.." && pwd)/src/ludwig"

[ -d "$SRC" ] || { echo "Ludwig-Quelle nicht gefunden: $SRC (LUDWIG_SRC setzen)"; exit 1; }

rm -rf "$DST"
mkdir -p "$DST"

# Pures Domänenwissen: DATEV-Regeln, geteilte Helfer, Fachtypen je Modul.
rsync -a --prune-empty-dirs \
  --exclude='__tests__/' \
  --exclude='*.test.ts' \
  --include='*/' \
  --include='core/datev/**.ts' \
  --include='core/documents/*.ts' \
  --include='shared/*.ts' \
  --include='modules/*/domain/**.ts' \
  --exclude='*' \
  "$SRC/" "$DST/"

# Server-gekoppelte Domain-Dateien gehören nicht ins Design-System.
grep -rl 'server-only\|from "@/core/db\|from "@/core/auth\|drizzle-orm' "$DST" --include='*.ts' 2>/dev/null | xargs -r rm -f

# Import-Pfade auf den Spiegel umbiegen.
find "$DST" -name '*.ts' -exec sed -i '' \
  -e 's|from "@/core/|from "@/ludwig/core/|g' \
  -e 's|from "@/shared|from "@/ludwig/shared|g' \
  -e 's|from "@/modules/|from "@/ludwig/modules/|g' {} +

# Modul-Barrels neu erzeugen: der echte Barrel in ludwig exportiert auch
# Infrastruktur (DB, Server Actions) — hier soll er nur die Fachtypen zeigen.
node "$(dirname "$0")/mirror-barrels.mjs" "$DST"

echo "$(find "$DST" -name '*.ts' | wc -l | tr -d ' ') Interface-Dateien gespiegelt nach src/ludwig/"
