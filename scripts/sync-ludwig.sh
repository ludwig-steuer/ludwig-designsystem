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
| `web-ui.md` | Was von den Code-Regeln der Web-App fachlich ist. Die Design-Anteile (R2, R3, R4, R7, R9, R15, R18, R21) sind am 2026-09-03 hierher gezogen und stehen in `docs/web-ui-regeln.md` — drüben sind die Nummern Lücken. |

**Pfade darin zeigen auf die App**, nicht auf dieses Repo. Übersetzung:
`apps/web/src/ui/v2` → `src/ui/v3` hier, `src/styles/v2.css` → `src/styles/v3.css`.
MD

echo "$n Dokumente gespiegelt nach docs/ludwig/"

# --- Drift-Wache für die Design-Doku ----------------------------------------
# Die gehört uns und wird NICHT überschrieben. Solange die alten Fassungen
# drüben liegen, kann dort jemand ergänzen — das bliebe sonst unbemerkt.
# Beim Einbinden als Submodule fallen die Quellen weg und die Wache schweigt.
STAMPS="$REPO/.design-doc-stamps"
declare -a OWNED=(
  "docs/ludwig-UX-guidelines-v2.md|design-guidelines.md"
  "apps/web/DESIGN.md|ton-und-sprache.md"
)

drift=0
for pair in "${OWNED[@]}"; do
  src="$APP/${pair%%|*}"
  name="${pair##*|}"
  [ -f "$src" ] || continue                 # drüben weg -> nichts zu wachen
  now="$(shasum -a 256 "$src" | cut -d' ' -f1)"
  was="$(grep "^$name " "$STAMPS" 2>/dev/null | cut -d' ' -f2 || true)"
  if [ -z "$was" ]; then
    printf '%s %s\n' "$name" "$now" >> "$STAMPS"
  elif [ "$was" != "$now" ]; then
    drift=1
    echo
    echo "  ACHTUNG: ${pair%%|*} hat sich in ludwig/app geändert."
    echo "           Diese Datei gehört jetzt uns (docs/$name) — die Änderung"
    echo "           drüben ist NICHT eingeflossen. Vergleichen:"
    echo "             diff \"$src\" \"$REPO/docs/$name\""
    echo "           Danach den Stand quittieren:"
    echo "             sed -i '' \"s|^$name .*|$name $now|\" .design-doc-stamps"
  fi
done
[ $drift -eq 0 ] && echo "Design-Doku: keine Änderung drüben."

exit 0
