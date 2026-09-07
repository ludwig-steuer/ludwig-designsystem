#!/usr/bin/env bash
# Spiegelt aus Ludwig herüber, was hier gebraucht, aber drüben gepflegt wird:
# die Interfaces (Datenmodell + Domänen-Typen) nach src/ludwig/ und die
# maßgebliche Doku nach docs/ludwig/.
#
# Beides sind KOPIEN — nie hier bearbeiten, Änderungen gehören nach
# ludwig/app. Dieses Script neu laufen lassen, wenn sich drüben etwas ändert.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
# Die App liegt neben dem Repo (Werkstatt) oder zwei Ebenen höher (als
# Submodule unter app/packages/designsystem) — erster Treffer gewinnt.
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

rm -rf "$DST"
mkdir -p "$DST"

# Pures Domänenwissen: DATEV-Regeln, geteilte Helfer, Fachtypen je Modul.
# Dazu die Status-Registry (0080): sie liegt in der App unter `ui/status/`,
# ist aber reines Vokabular und seit ludwig/app cf681257 importfrei — der
# Ordner macht die Spiegelbarkeit nicht, die Import-Freiheit macht sie.
rsync -a --prune-empty-dirs \
  --exclude='__tests__/' \
  --exclude='*.test.ts' \
  --include='*/' \
  --include='core/datev/**.ts' \
  --include='core/documents/*.ts' \
  --include='shared/*.ts' \
  --include='modules/*/domain/**.ts' \
  --include='ui/status/status-registry.ts' \
  --exclude='*' \
  "$SRC/" "$DST/"

# Server-gekoppelte Domain-Dateien gehören nicht ins Design-System. Entschieden
# wird am **Import**, nicht am Text: ein Volltext-Grep hat zweimal in zwei Tagen
# eine reine Datei aussortiert, weil das Wort in einem Kommentar oder an einer
# Nachbarfunktion stand (`scripts/mirror-filter.mjs`, dort auch die Selbstprüfung).
node "$(dirname "$0")/mirror-filter.mjs" "$DST" | xargs -r rm -f

# Import-Pfade auf den Spiegel umbiegen.
find "$DST" -name '*.ts' -exec sed -i '' \
  -e 's|from "@/core/|from "@/ludwig/core/|g' \
  -e 's|from "@/shared|from "@/ludwig/shared|g' \
  -e 's|from "@/modules/|from "@/ludwig/modules/|g' {} +

# Modul-Barrels neu erzeugen: der echte Barrel in ludwig exportiert auch
# Infrastruktur (DB, Server Actions) — hier soll er nur die Fachtypen zeigen.
node "$(dirname "$0")/mirror-barrels.mjs" "$DST"

echo "$(find "$DST" -name '*.ts' | wc -l | tr -d ' ') Interface-Dateien gespiegelt nach src/ludwig/"

# --- Stand festhalten -------------------------------------------------------
# Der Spiegel ist seit 2026-09-07 eingefroren (Owner: das Set wird fertig, dann
# zieht die App in einem Zug nach). Damit niemand raten muss, auf welchem Stand
# er steht, schreibt der Zug ihn hin — `check:mirror` vergleicht ihn mit dem
# Arbeitsbaum der App und meldet eine Abweichung als **Hinweis**, nicht als
# Fehler.
if [ -d "$APP/.git" ]; then
  HASH="$(git -C "$APP" rev-parse HEAD)"
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
