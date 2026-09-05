# 0080 · Status-Registry spiegeln — eine Quelle statt zwei

| | |
|---|---|
| Status | **blockiert** — der Spiegel führt `beleg_erledigung` nicht, siehe Abschnitt Blocker |
| Stufe | `patterns/` (betrifft `status-registry.ts`, `StatusBadge`, `StatusInfoDialog`, `entity-icons.ts`, alle Konsumenten von `resolveStatus`/`axisLegend`) |
| Klassen-Test | entfällt — keine Komponente, eine Quellen-Entscheidung |
| Quelle | Owner-Entscheid 2026-09-04: **die Registry bleibt in der App, das Design-System spiegelt sie** über `scripts/sync-ludwig.sh` wie jeden Domänentyp. Antwort auf `ludwig/app` `F147-designsystem-abloesung.md` §5d und `F147-luecken-fuer-design-agent.md` §2 Nr. 7 |
| Ersetzt | `src/ui/v3/patterns/status-registry.ts` (1.888 Z., Kopie vom App-Stand mit eigener Achse `actor_kind`) |
| Blockiert | jede weitere Achse, die sonst zweimal eingetragen werden müsste; E1.4 der App-Migration |
| Spec von / am | Claude, 2026-09-04 |

## Blocker (2026-09-05)

Die App hat mit `cf681257` geliefert, was L-48 und L-49 verlangten: die
Registry ist importfrei, `actor_kind` ist übernommen, der Pfad bleibt
`apps/web/src/ui/status/status-registry.ts`. Das Sync-Skript nimmt sie seither
mit (`--include='ui/status/status-registry.ts'`), und `pnpm sync:ludwig` legt
sie unter `src/ludwig/ui/status/` ab.

**Der letzte Schritt geht trotzdem noch nicht:** die lokale Kopie
`src/ui/v3/patterns/status-registry.ts` kann nicht gelöscht werden, weil sie
**eine Achse mehr** führt als der Spiegel.

Der Diff alte Kopie gegen Spiegel zeigt genau das, was er zeigen darf — die
sieben neuen Achsen der App (`zahlungsweg`, `mandant_betrieb`,
`dauersachverhalt_uebernahme`, `token`, `bridge_datev`, `vst_fakt`,
`vst_regel`), `actor_kind`, `prepared` und den Typnamen `StatusKind` — **und
eine Zeile in die andere Richtung**:

```
7d6
< beleg_erledigung
```

`beleg_erledigung` ist die Achse aus **L-41**, die dieses Repo mit 0074
angelegt hat und die die App noch nicht übernommen hat (`grep -c
beleg_erledigung` in der App: 0). Sie hat einen lebenden Aufrufer:
`src/ui/v3/entities/source-document/SourceDocument.tsx` Z. 207 zeigt die
Erledigung als Wort über diese Achse — genau das, was 0074 gegen das Häkchen
der App durchgesetzt hat (V7/V11).

Die Kopie zu löschen hieße also, diese Achse zu verlieren und einen
abgenommenen Baustein zu brechen. Die Achse in den Spiegel zu schreiben
verbietet sich: `src/ludwig/` ist eine Kopie, hier wird nie darin bearbeitet.
Und eine lokale Ergänzung neben dem Spiegel wäre wieder die zweite Quelle,
die diese Aufgabe gerade beendet.

**Reihenfolge ist damit:** erst L-41 in der App (Achse `beleg_erledigung` mit
ihren sechs `completed_via`-Werten plus `open`), dann `pnpm sync:ludwig`, dann
der Rest dieser Aufgabe. Der Rest steht unverändert bereit — Importe
umbiegen, Kopie löschen, `AXIS_LABEL`/`AXIS_SOURCE` für die sieben neuen
Achsen nachziehen.

**Was heute schon erledigt ist:** das Sync-Skript nimmt die Registry auf (mit
Begründung im Kopf, warum der Ordner `ui/status/` die Spiegelbarkeit nicht
verhindert), und der Spiegel liegt gezogen im Baum. Der Diff oben ist damit
jederzeit wiederholbar.

## Ziel

Die Registry liegt heute zweimal und ist bereits gegabelt: das Set hat die
Achse `actor_kind` (0053), die App nicht; die App hat den Wert `prepared` in
der Produktbefund-Achse, das Set nicht. 42 Diff-Zeilen nach wenigen Tagen. Die
App ist die richtige Quelle — sie kennt die DB-CHECKs und hat den
Deckungsgleichheits-Test gegen Enum und Schema; das Design-System darf beides
nicht kennen. Nach dieser Aufgabe gibt es eine Datei, die drüben gepflegt und
hier gelesen wird.

## Voraussetzung (App, Register `docs/befunde-app.md`)

- **L-48** — `status-registry.ts` verliert `import type { BadgeKind } from
  "@/ui/components"` und definiert `export type StatusKind = "info" |
  "success" | "warning" | "danger" | "neutral"` selbst; `Badge` der App
  darf `BadgeKind = StatusKind` aliasen. Ohne diesen Schritt streicht
  `sync-ludwig.sh` die Datei (Filter „server-gekoppelt/UI-gekoppelt") oder
  der Spiegel kompiliert hier nicht. Der Pfad bleibt `ui/status/`, oder die
  App zieht die Datei nach `core/status/` — beides geht, die App entscheidet.
- **L-49** — Achse `actor_kind` aus dem Set übernehmen (Block in
  `src/ui/v3/patterns/status-registry.ts`, mit Kommentar), samt Eintrag im
  Deckungsgleichheits-Test.

## Schritte hier (nach L-48/L-49)

1. `scripts/sync-ludwig.sh`: den Pfad der Registry in die `--include`-Liste
   aufnehmen (`ui/status/status-registry.ts` oder `core/status/*.ts`, je
   nach App-Entscheid); `pnpm sync:ludwig` laufen lassen.
2. `src/ui/v3/patterns/status-registry.ts` löschen. Alle Importe auf
   `@/ludwig/…/status-registry` umbiegen: `StatusBadge`, `StatusInfoDialog`,
   `StatusInfoButton`, `entity-icons.ts`, `Log.tsx`, `Account.tsx`,
   `Clarification*.tsx`, Stories.
3. `StatusDescriptor.kind` ist drüben `StatusKind`, hier nimmt `Badge`
   `BadgeTone` — dieselben fünf Wörter, strukturell gleich; kein Alias, kein
   Cast. Bricht der Typcheck, ist ein Wert abgewichen, und das ist der Befund.
4. `AXIS_LABEL`/`AXIS_SOURCE`/`ENTITY_ICON` in `entity-icons.ts` bleiben
   hier — sie sind Darstellung. Sie sind auf `StatusAxis` getypt: eine neue
   Achse drüben macht den Typcheck hier rot, bis Label und Icon nachgezogen
   sind. Das ist gewollt.
5. `docs/ludwig/README.md`: die Registry in die Tabelle der gespiegelten
   Dateien aufnehmen („nicht hier bearbeiten, sondern drüben").

## Abnahmekriterien

- [ ] `pnpm sync:ludwig` erzeugt die Registry im Spiegel; `git diff --stat` zeigt keine andere geänderte Spiegel-Datei
- [ ] `src/ui/v3/patterns/status-registry.ts` existiert nicht mehr; `grep -rn "patterns/status-registry" src` ist leer
- [ ] `pnpm typecheck` und `pnpm build` grün; alle Stories mit `StatusBadge` rendern wie vorher (Stichprobe: `StatusBadge`, `Log`, `Clarification`)
- [ ] Diff alte Set-Kopie gegen Spiegel: nur `actor_kind` (jetzt drüben), `prepared` (jetzt auch hier) und der Typname — nichts Drittes
- [ ] `docs/ludwig/README.md` führt die Datei; `docs/v3-backlog.md` und `design-guidelines.md` §11.7 nennen die Registry nicht mehr als Set-Bestand
- [ ] `docs/befunde-app.md`: L-48 und L-49 gestrichen, Commit genannt

## Offene Fragen

1. Bleibt der Pfad `ui/status/` oder zieht die Datei nach `core/status/`?
   *Ohne Antwort: bleibt; der Spiegel bekommt einen Include je Datei.*
