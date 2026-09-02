#!/usr/bin/env bash
# Spiegelt aus Ludwig herüber, was hier gebraucht, aber drüben gepflegt wird:
# die Interfaces (Datenmodell + Domänen-Typen) nach src/ludwig/ und die
# maßgebliche Doku nach docs/ludwig/.
#
# Beides sind KOPIEN — nie hier bearbeiten, Änderungen gehören nach
# ludwig/app. Dieses Script neu laufen lassen, wenn sich drüben etwas ändert.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${LUDWIG_SRC:-$REPO/../app/apps/web/src}"
APP="$(cd "$SRC/../../.." 2>/dev/null && pwd || true)"   # ludwig/app
DST="$REPO/src/ludwig"
DOCS="$REPO/docs/ludwig"

[ -d "$SRC" ] || { echo "Ludwig-Quelle nicht gefunden: $SRC (LUDWIG_SRC setzen)"; exit 1; }
SRC="$(cd "$SRC" && pwd)"

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

# --- Doku aus der App -------------------------------------------------------
# NUR was drüben SSOT ist: App-Architektur und App-Bestand. Die Designsprache
# gehört diesem Repo (docs/design-guidelines.md) und wird NICHT gespiegelt.
# Erweitern: eine Zeile "<pfad relativ zu ludwig/app>" ergänzen.
DOCS_TO_MIRROR=(
  "GLOSSARY.md"                                          # Namens-SSOT: DE/EN je Begriff
  "docs/topics/web-ui.md"                                # Code-Regeln R1–R21
  "docs/reference/datenmodell/ui-repraesentationen.md"   # Entität -> UI-Inventar
)

rm -rf "$DOCS"
mkdir -p "$DOCS"
n=0
for d in "${DOCS_TO_MIRROR[@]}"; do
  if [ -f "$APP/$d" ]; then
    cp "$APP/$d" "$DOCS/$(basename "$d")"
    n=$((n + 1))
  else
    echo "  fehlt drüben, ausgelassen: $d"
  fi
done

cat > "$DOCS/README.md" <<'MD'
# App-Doku (gespiegelt)

Kopien aus `ludwig/app` — **nicht hier bearbeiten**, sondern drüben, dann
`pnpm sync:ludwig`. Welche Dateien gespiegelt werden, steht in
`scripts/sync-ludwig.sh` (`DOCS_TO_MIRROR`).

Hier liegt nur, was **drüben** maßgeblich ist. Die Designsprache gehört
diesem Repo und steht in `docs/design-guidelines.md`.

| Datei | Was drinsteht |
|---|---|
| `GLOSSARY.md` | Das Namens-SSOT: je Begriff englischer und deutscher Name, Definition, Datentyp. **Maßgeblich für Props, Typnamen und UI-Labels** — ein neuer Prop-Name wird hier nachgeschlagen, nicht erfunden. |
| `web-ui.md` | Code-Regeln R1–R21 der Web-App — u. a. die Dreiteilung primitives / patterns / entities, auf die `src/ui/v3/index.ts` verweist. |
| `ui-repraesentationen.md` | Inventar: welche Entität welche UI-Repräsentation hat, wo doppelt gebaut wurde. Beschreibt den v1-Bestand der App. |

**Pfade darin zeigen auf die App**, nicht auf dieses Repo. Übersetzung:
`apps/web/src/ui/v2` → `src/ui/v3` hier, `src/styles/v2.css` → `src/styles/v3.css`.
MD

echo "$n Dokumente gespiegelt nach docs/ludwig/"
