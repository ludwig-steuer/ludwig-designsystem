#!/usr/bin/env bash
# Mirrors what ludwig/app maintains but this repo needs: the interfaces
# (data model + domain types) into src/ludwig/ and the authoritative docs into
# docs/ludwig/. Both are COPIES — never edit them here; rerun this script.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
# The app sits next to this repo or two levels up (as the submodule under
# app/packages/designsystem) — first hit wins.
if [ -z "${LUDWIG_SRC:-}" ]; then
  for cand in "$REPO/../app/apps/web/src" "$REPO/../../apps/web/src"; do
    [ -d "$cand" ] && { LUDWIG_SRC="$cand"; break; }
  done
fi
SRC="${LUDWIG_SRC:-$REPO/../app/apps/web/src}"
APP="$(cd "$SRC/../../.." 2>/dev/null && pwd || true)"   # ludwig/app
DST="$REPO/src/ludwig"
DOCS="$REPO/docs/ludwig"

[ -d "$SRC" ] || { echo "Ludwig-Quelle nicht gefunden: $SRC (LUDWIG_SRC setzen)"; exit 1; }
SRC="$(cd "$SRC" && pwd)"

# --- Mirror from HEAD, not from the working tree ------------------------------
# Uncommitted files of another session once ended up in the mirror.
#
#   pnpm sync:ludwig              → the app's HEAD
#   LUDWIG_REF=<sha> pnpm sync:…  → exactly this commit
#
# Without a git repo over there it falls back to the working tree and logs it.
REF="${LUDWIG_REF:-HEAD}"
if [ -d "$APP/.git" ]; then
  REF_HASH="$(git -C "$APP" rev-parse --verify "$REF^{commit}")"
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  REL="${SRC#$APP/}"
  git -C "$APP" archive "$REF_HASH" "$REL" | tar -x -C "$TMP"
  SRC="$TMP/$REL"
  echo "Quelle: $APP @ ${REF_HASH:0:8} (aus dem Commit, nicht aus dem Arbeitsbaum)"
else
  REF_HASH=""
  echo "ACHTUNG: kein Git-Repo unter $APP — gespiegelt wird der Arbeitsbaum."
fi

rm -rf "$DST"
mkdir -p "$DST"

# Pure domain knowledge: DATEV rules, shared helpers, domain types per module,
# and the status registry (0080) — mirrorable because it has no imports.
rsync -a --prune-empty-dirs \
  --exclude='__tests__/' \
  --exclude='*.test.ts' \
  --include='*/' \
  --include='core/datev/**.ts' \
  --include='core/documents/*.ts' \
  --include='core/accounting/clearing-account.ts' \
  --include='shared/*.ts' \
  --include='modules/*/domain/**.ts' \
  --include='ui/status/status-registry.ts' \
  --exclude='*' \
  "$SRC/" "$DST/"

# Server-coupled domain files stay out. Imports decide, not text
# (`scripts/mirror-filter.mjs`, self-test there).
node "$(dirname "$0")/mirror-filter.mjs" "$DST" | xargs -r rm -f

# Point import paths at the mirror.
find "$DST" -name '*.ts' -exec sed -i '' \
  -e 's|from "@/core/|from "@/ludwig/core/|g' \
  -e 's|from "@/shared|from "@/ludwig/shared|g' \
  -e 's|from "@/modules/|from "@/ludwig/modules/|g' {} +

# Regenerate module barrels: the app's barrel also exports infrastructure;
# here it shows only the domain types.
node "$(dirname "$0")/mirror-barrels.mjs" "$DST"

echo "$(find "$DST" -name '*.ts' | wc -l | tr -d ' ') Interface-Dateien gespiegelt nach src/ludwig/"

# --- Record the commit --------------------------------------------------------
# The mirror is frozen since 2026-09-07; `check:mirror` compares this note with
# the app and reports a difference as a hint, not an error.
if [ -d "$APP/.git" ]; then
  # The mirrored commit, not the app's current one — with LUDWIG_REF they differ.
  HASH="$REF_HASH"
  ZWEIG="$(git -C "$APP" branch --show-current || echo '?')"
  cat > "$DST/GESPIEGELT_AUS.json" <<JSON
{
  "appHash": "$HASH",
  "zweig": "$ZWEIG",
  "datum": "$(date +%Y-%m-%d)",
  "hinweis": "Kopien aus ludwig/app — nie hier bearbeiten. Eingefroren bis zur Migration (Owner-Entscheid 2026-09-07)."
}
JSON
  echo "Stand vermerkt: $ZWEIG ${HASH:0:8}"
fi

# --- Docs from the app --------------------------------------------------------
# Only what is the app's single source of truth: architecture and inventory.
# The design language belongs to this repo and is not mirrored.
# To extend: add a line "<path relative to ludwig/app>".
DOCS_TO_MIRROR=(
  "GLOSSARY.md"                                          # Namens-SSOT: DE/EN je Begriff
  "docs/topics/web-ui.md"                                # Code-Regeln R1–R21
)

rm -rf "$DOCS"
mkdir -p "$DOCS"
n=0
for d in "${DOCS_TO_MIRROR[@]}"; do
  # Same commit as the code — otherwise types from yesterday meet docs from today.
  if [ -n "$REF_HASH" ] && git -C "$APP" cat-file -e "$REF_HASH:$d" 2>/dev/null; then
    git -C "$APP" show "$REF_HASH:$d" > "$DOCS/$(basename "$d")"
    n=$((n + 1))
  elif [ -z "$REF_HASH" ] && [ -f "$APP/$d" ]; then
    cp "$APP/$d" "$DOCS/$(basename "$d")"
    n=$((n + 1))
  else
    echo "  fehlt drüben, ausgelassen: $d"
  fi
done

cat > "$DOCS/README.md" <<'MD'
# App-Doku (gespiegelt)

> **Diese Datei wird bei jedem Lauf neu geschrieben** (`sync-ludwig.sh` macht
> `rm -rf docs/ludwig`). Notizen gehören deshalb nicht hierher, sondern nach
> `docs/spiegel-vormerkungen.md` — dort steht, was beim nächsten Lauf fällig
> ist.

Kopien aus `ludwig/app` — **nicht hier bearbeiten**, sondern drüben, dann
`pnpm sync:ludwig`. Welche Dateien gespiegelt werden, steht in
`scripts/sync-ludwig.sh` (`DOCS_TO_MIRROR`).

Hier liegt nur, was **drüben** maßgeblich ist. Die Designsprache gehört
diesem Repo und steht in `docs/design-guidelines.md`.

| Datei | Was drinsteht |
|---|---|
| `GLOSSARY.md` | Das Namens-SSOT: je Begriff englischer und deutscher Name, Definition, Datentyp. **Maßgeblich für Props, Typnamen und UI-Labels** — ein neuer Prop-Name wird hier nachgeschlagen, nicht erfunden. |
| `web-ui.md` | Was von den Code-Regeln der Web-App fachlich ist. Die Design-Anteile (R2, R3, R4, R7, R9, R15, R18, R21) sind am 2026-09-03 hierher gezogen und stehen in `docs/web-ui-regeln.md` — drüben sind die Nummern Lücken. |

## Auch gespiegelt: die Status-Registry (0080)

Seit 2026-09-05 liegt neben der Doku ein **Code**-Spiegel:
`src/ludwig/ui/status/status-registry.ts`. Er kommt aus
`apps/web/src/ui/status/status-registry.ts` und ist die **einzige** Quelle für
Achsen, Labels, Farben und Erklärtexte jedes Status — dieses Repo hatte bis
dahin eine eigene Kopie, die schon gegabelt war.

- **Nicht hier bearbeiten.** Eine neue Achse entsteht drüben und kommt mit
  `pnpm sync:ludwig` herüber. Was das Set zusätzlich braucht, ist ein Befund
  in `docs/befunde-app.md` — so ist `beleg_erledigung` entstanden (L-41), die
  den Umzug bis zum 2026-09-05 aufgehalten hat.
- **Der Ordner `ui/status/` macht die Spiegelbarkeit nicht** — die
  Import-Freiheit macht sie. Die Datei hat drüben keinen einzigen Import.
- **`AXIS_LABEL`, `AXIS_SOURCE` und die Icons bleiben hier**
  (`src/ui/v3/patterns/entity-icons.ts`): sie sind Darstellung, nicht
  Wertebereich. Kommt drüben eine Achse dazu, meldet der Typcheck die Lücke —
  und die Texte werden **abgeschrieben, nicht erfunden** (Abnahme 0080, M1).

**Pfade darin zeigen auf die App**, nicht auf dieses Repo. Übersetzung:
`apps/web/src/ui/v2` → `src/ui/v3` hier, `src/styles/v2.css` → `src/styles/v3.css`.
MD

echo "$n Dokumente gespiegelt nach docs/ludwig/"

# --- Drift watch for the design docs -----------------------------------------
# They are ours and are not overwritten. While the old versions still sit in the
# app, someone could extend them there unnoticed. As a submodule the sources
# disappear and the watch goes quiet.
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
