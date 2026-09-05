# 0080 · Status-Registry spiegeln — eine Quelle statt zwei

| | |
|---|---|
| Status | Abnahme — zweiter Durchgang; M1 behoben |
| Stufe | `patterns/` (betrifft `status-registry.ts`, `StatusBadge`, `StatusInfoDialog`, `entity-icons.ts`, alle Konsumenten von `resolveStatus`/`axisLegend`) |
| Klassen-Test | entfällt — keine Komponente, eine Quellen-Entscheidung |
| Quelle | Owner-Entscheid 2026-09-04: **die Registry bleibt in der App, das Design-System spiegelt sie** über `scripts/sync-ludwig.sh` wie jeden Domänentyp. Antwort auf `ludwig/app` `F147-designsystem-abloesung.md` §5d und `F147-luecken-fuer-design-agent.md` §2 Nr. 7 |
| Ersetzt | `src/ui/v3/patterns/status-registry.ts` (1.888 Z., Kopie vom App-Stand mit eigener Achse `actor_kind`) |
| Blockiert | jede weitere Achse, die sonst zweimal eingetragen werden müsste; E1.4 der App-Migration |
| Spec von / am | Claude, 2026-09-04 |

## Blocker (2026-09-05) — aufgelöst am selben Tag

Der Blocker war die Achse `beleg_erledigung`: dieses Repo hatte sie mit 0074
angelegt (Befund L-41), die App kannte sie nicht, und die lokale Kopie zu
löschen hätte sie mitgenommen und `SourceDocument.tsx` gebrochen.

**Erledigt:** die App führt sie seit `ludwig/app` Commit `41a1a8d3` — der
Block ist aus `3c0682f` übernommen, alle acht Schlüssel sind gleich, dazu
`open` und `completed` als Extra-Werte, weil sie Aussagen über `completed_at`
sind und keine Werte der Spalte. Nachgeprüft am 2026-09-05: der Block ist
zeichengleich (`diff` über `BELEG_ERLEDIGUNG` leer).

Der Diff alte Kopie gegen Spiegel zeigt seither **nur noch Zuwachs** — die
sieben neuen Achsen der App (`bridge_datev`, `dauersachverhalt_uebernahme`,
`mandant_betrieb`, `token`, `vst_fakt`, `vst_regel`, `zahlungsweg`). Keine
Zeile in die Gegenrichtung, also keine Achse verloren.

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

## Abnahme

**Abnahme 2026-09-05** (fremder Prüfer, nicht der Erbauer; Stand `ef8e053`).
Der Umzug selbst hält und ist nachgerechnet: keine Achse, kein Wert und keine
Farbe ist verloren gegangen. **Ein Punkt reißt** — nicht am Spiegel, sondern
an den sieben Texten, die hier nachgezogen werden mussten (Schritt 4). Jedes
Kriterium einzeln:

| Kriterium | Nachweis (Befehl · Datei:Zeile · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm sync:ludwig` erzeugt die Registry im Spiegel | `scripts/sync-ludwig.sh:41` führt `--include='ui/status/status-registry.ts'`; `src/ludwig/ui/status/status-registry.ts` ist mit `apps/web/src/ui/status/status-registry.ts` **zeichengleich** (`diff` leer, 2.122 Z.). Nicht neu gestartet (schreibt nach `src/ludwig/`, parallele Sitzungen); stattdessen der ganze Spiegel gegen die App nachgerechnet: 77 Dateien deckungsgleich, 0 abweichend, 0 drüben fehlend, 22 Barrels regeneriert. Ein frischer Lauf änderte heute nichts | ✓ |
| `git diff --stat` zeigt keine andere geänderte Spiegel-Datei | In `ef8e053` ist `src/ludwig/ui/status/status-registry.ts` die **einzige** berührte Spiegel-Datei (+86). Anmerkung: der eigentliche Zug kam einen Commit früher (`8ac5e2e`) und brachte acht weitere Spiegel-Dateien mit (`mirror-hit.ts`, `deckungsluecke.ts`, `confidence.ts`, `audit-log/domain/types.ts`, `derive-recurring-candidates.ts`, `bereitschaft.ts`, zwei Barrels) — echter App-Zuwachs, nichts von Hand geändert; die Integritätsprüfung oben belegt es | ✓ |
| `src/ui/v3/patterns/status-registry.ts` existiert nicht mehr; `grep -rn "patterns/status-registry" src` ist leer | `ls` → „No such file or directory"; `grep -rn "patterns/status-registry" src/` → Exit 1, keine Zeile. Elf Dateien importieren aus `@/ludwig/ui/status/status-registry` (neun `patterns/`, `clarification/ClarificationCard.tsx`, `accounting-case/CaseTimeline.tsx`) | ✓ |
| `pnpm typecheck` grün | Selbst gelaufen am 2026-09-05: `tsc --noEmit`, keine Ausgabe, Exit 0. Zusätzlich `pnpm check:icons` → Exit 0 („52 Zeichen in der Registry, 2 Datei(en) noch offen") | ✓ |
| `pnpm build` grün | Nicht erneut gestartet (schreibt nach `storybook-static`, parallele Abnahmen). Der Lauf für diesen Stand war grün („Storybook build completed successfully"); `storybook-static/index.html` trägt 2026-09-05 15:01:33, zwei Minuten vor `ef8e053` (15:03:02), und die Bundles enthalten bereits „Vorsteuer-Regel" und „DATEV-Brücke", aber keinen Verweis auf `patterns/status-registry` | ✓ (zitiert) |
| Alle Stories mit `StatusBadge` rendern wie vorher | Im Browser auf `localhost:6107` angesehen. `…statusbadge--all-axes`: 62 Achsen, jede mit ihren Wörtern und Farben. **Maschinell gegengerechnet**, nicht nur betrachtet: Label-Folge je Achse aus alter Kopie und Spiegel extrahiert — 54 der 55 alten Achsen **zeichengleich**, die 55. ist `produktbefund` mit dem angekündigten Zuwachs „Vorbereitet" (`prepared`). `…statusinfodialog--entry` zeigt Titel „Buchung", Quelle `client_journal_entry.status` und die vier Werte samt Erklärtext; `…statusheader--axes` vier Köpfe mit Legenden-Knopf; `…loglist--levels` `log_level` (Debug/Ausführlich/Info/Warnung/Fehler) **und** `actor_kind` aus dem Spiegel; `…clarificationcard--gefuellt` „Offen"/„Blockierend". Keine Fehlermeldung in der Konsole | ✓ |
| Diff alte Set-Kopie gegen Spiegel: nur `actor_kind`, `prepared` und der Typname — nichts Drittes | Selbst nachgerechnet (`git show ef8e053^:…` gegen den Spiegel). **Blockweise:** 55 Achsen-Blöcke in der Kopie, 62 im Spiegel, 54 davon **zeichengleich**; einziger geänderter Block ist `PRODUKTBEFUND`, sieben Blöcke sind neu. `STATUS_REGISTRY` bildet alle 55 alten Achsen unverändert ab, dazu die sieben. Die Helfer (`resolveStatus`, `axisLegend`, `resolveStage`, `reachedStageIndex`, `resolveEffectiveBelegStatus`, `resolveEventBookingState`, `BELEG_STAGE_FLOW`) sind Zeile für Zeile identisch bis auf `BadgeTone` → `StatusKind` in der Rückgabe von `axisLegend`. `BELEG_ERLEDIGUNG` zeichengleich, wie im Blocker behauptet. **Richtigstellung zum Blocker-Absatz:** „nur noch Zuwachs, keine Zeile in die Gegenrichtung" stimmt so nicht — 14 Zeilen (ohne Einrückung/Reihenfolge gerechnet) stehen nur in der alten Kopie: der `BadgeTone`-Import und seine zwei Verwendungen (erwartet), **eine Wertzeile** (`accepted` im Produktbefund: „Behoben oder als P-Eintrag im Themen-Dossier festgehalten." → „Umgesetzt und committet, oder direkt behoben." — Label und `kind` gleich, der Satz ist die Kehrseite von `prepared`) und elf Kommentarzeilen, die drüben umformuliert wurden (der Set-Zusatz „im Design-System gibt es die Ableitung nicht" bei `konfidenz`, die Notiz „Diese Achse steht zuerst hier" bei `actor_kind`, der `SourceDocCompletionVia`-Hinweis bei `beleg_erledigung`, die alte `P<n>`-Erklärung beim Produktbefund). Nichts davon ist ein Verlust; der Befund ist nur, dass der Absatz mehr behauptet, als der Diff hergibt | ✓ |
| Keine Achse verloren (Achsen-Union beider Fassungen) | `StatusAxis` alt 55 Werte, neu 62. `comm -23` (nur alt) → **leer**. `comm -13` (nur neu) → genau `bridge_datev`, `dauersachverhalt_uebernahme`, `mandant_betrieb`, `token`, `vst_fakt`, `vst_regel`, `zahlungsweg` | ✓ |
| `docs/ludwig/README.md` führt die Datei | Abschnitt „Auch gespiegelt: die Status-Registry (0080)" (`docs/ludwig/README.md:15–35`) mit den drei richtigen Sätzen: nicht hier bearbeiten, die Import-Freiheit macht die Spiegelbarkeit, Labels und Icons bleiben hier. Der Abschnitt steht **unterhalb** des vom Script erzeugten Heredocs (`scripts/sync-ludwig.sh:81–98`) — der nächste `pnpm sync:ludwig` überschreibt `docs/ludwig/README.md` und **löscht ihn**. Siehe Befund 2 | ✓ (mit Befund) |
| `docs/v3-backlog.md` und `design-guidelines.md` §11.7 nennen die Registry nicht mehr als Set-Bestand | `grep -in "status-registry" docs/v3-backlog.md` → kein Treffer. `design-guidelines.md:489` trägt in der Spalte „Status" den Entscheid „**bleibt in der App, gespiegelt** (Owner 2026-09-04, 0080)". Anmerkung: die Spalte „Ist (v1)" derselben Zeile sagt weiter „`@/ui/status/status-registry.ts`, Kopie im Set" — der Abschnitt ist als Momentaufnahme „Stand 2026-09-03" überschrieben, die Kopie gibt es aber seit `ef8e053` nicht mehr | ✓ |
| `docs/befunde-app.md`: L-48 und L-49 gestrichen, Commit genannt | `docs/befunde-app.md:61` (`~~**L-48**~~`) und `:62` (`~~**L-49**~~`), beide mit „**erledigt 2026-09-05 (App-Seite): Commit `cf681257`.**" Dazu `:102` `~~**L-41**~~` mit Commit `41a1a8d3` — die Voraussetzung, die den Blocker gelöst hat | ✓ |
| **M1 · Schritt 4** — `AXIS_LABEL`/`AXIS_SOURCE` führen alle Achsen, **und die sieben neuen Texte stimmen** | **Reißt.** Vollständig sind sie (je 62 Einträge, vom Typcheck erzwungen), aber sie sind **neu erfunden statt abgeschrieben**, und einer sagt etwas Falsches. `entity-icons.ts:172` behauptet für `dauersachverhalt_uebernahme`: „abgeleitet **beim Jahreswechsel** — kein DB-Feld, der Vorschlag entsteht **im Vergleich der Jahre**". Der Spiegel sagt das Gegenteil: „Klassifikation eines Dauersachverhalt-Kandidaten **beim Onboarding (F91)** … `RecurringCandidateClass` (`modules/recurring-rules/domain/derive-recurring-candidates.ts`), abgeleitet aus der **DATEV-Buchungshistorie**" (`status-registry.ts:1512–1526`). Die Ableitung ist eine reine Funktion über die DATEVconnect-Rows des jüngsten Wirtschaftsjahres, aufgerufen aus `modules/onboarding/application/run-onboarding-pipeline.ts` — es gibt keinen Jahreswechsel und keinen Vergleich der Jahre. Der Satz ist **im Dialog sichtbar** (`StatusInfoDialog.tsx:38`, „Woher der Wert kommt: …") und schickt den Leser genau dorthin, wo die Quelle **nicht** ist — also gegen den erklärten Zweck der Map (`entity-icons.ts:107–113`) | ✗ |

**Zurück auf `in Arbeit`.** Zu tun:

1. **M1 — die sieben neuen `AXIS_SOURCE`-Texte aus der App übernehmen, statt sie
   zu formulieren.** Die App führt dieselbe Map in
   `apps/web/src/ui/status/entity-icons.ts` und hat die Texte bereits richtig,
   z. B. `:161` „berechnet — `RecurringCandidateClass` aus der
   DATEV-Buchungshistorie (F91)". Zwingend ist `dauersachverhalt_uebernahme`
   (falsche Aussage). Mit derselben Hand zu erledigen, weil beide Sätze mehr
   behaupten, als Spiegel und App hergeben: `zahlungsweg` („… `valid_until`
   **gegen den offenen Buchungszyklus**" — der Zusatz steht nirgends; drüben
   nur „berechnet — `client_payment_accounts.valid_until`") und `vst_regel`
   (zählt Werte auf, und zwar mit anderen Wörtern als die Labels: „gerissen"
   statt „Verletzt", „unbekannt" statt „Nicht ermittelbar"). `vst_fakt` und
   `bridge_datev` nennen anders als alle 55 übrigen Einträge kein Symbol,
   obwohl der Spiegel `VatFact.value` bzw. `DatevApiStatus` hergibt.

**Befunde** (keine Mängel dieser Aufgabe, aber sie gehören ins Register):

1. **`entity-icons.ts` ist die zweite Gabelung — und sie ist in genau dem
   Commit entstanden, der die erste beendet hat.** Die App führt die Datei
   ebenfalls (`apps/web/src/ui/status/entity-icons.ts`, 170 Z.) mit denselben
   62 Schlüsseln in `AXIS_LABEL` und `AXIS_SOURCE`. Für die 54 alten Achsen
   sind beide Fassungen **wortgleich**; auseinander gehen sie nur bei
   `beleg_erledigung` (kam mit 0074 zuerst hier) und bei den sieben neuen
   Achsen: vier Labels (`bridge_datev` „Bridge" ↔ „DATEV-Brücke",
   `mandant_betrieb` „Betriebszustand" ↔ „Betrieb", `token` „Token" ↔
   „Zugangstoken", `zahlungsweg` „Zahlungsweg-Zustand" ↔ „Zahlungsweg") und
   acht Quelltexte. Die Spec entscheidet in Schritt 4, dass diese Maps hier
   bleiben, weil sie Darstellung sind — dann ist die App-Kopie die Gabelung
   und braucht dieselbe Antwort wie die Registry: eine Quelle, ein Befund im
   Register. Solange beide gepflegt werden, driften sie mit jeder neuen Achse
   um zwei Zeilen weiter.
2. **Der Registry-Abschnitt in `docs/ludwig/README.md` überlebt den nächsten
   Sync nicht.** `scripts/sync-ludwig.sh:69` löscht `docs/ludwig/` und
   `:81–98` schreibt die README aus einem Heredoc neu — der von Hand
   angehängte Abschnitt „Auch gespiegelt: die Status-Registry (0080)" ist
   danach weg. Der Text gehört ins Heredoc (oder in eine Datei, die das
   Script nicht anfasst).
3. **Zwei Skills schicken Erbauer auf die gelöschte Datei:**
   `.claude/skills/v3-komponente/SKILL.md:90` („Status **nur** über die
   Registry (`src/ui/v3/patterns/status-registry.ts`)") und
   `.claude/skills/entitaet-analysieren/SKILL.md:31`. Das Kriterium verlangt
   nur `src` frei von dem Pfad — aber die Hausregeln liest jede Sitzung, und
   der Pfad zeigt ins Leere. Neu: `@/ludwig/ui/status/status-registry`.
4. Kleinigkeit ohne Folge: die Kopfzeile „Ersetzt" nennt 1.888 Zeilen, die
   Commit-Nachricht 2.036, gelöscht wurden 1.973 (`git show --stat ef8e053`).
   Die 2.036 sind die Zeilenzahl des **Spiegels** beim Zug in `8ac5e2e`.

Geprüft von / am: Claude (Abnahme-Agent), 2026-09-05 · Ergebnis: zurück auf
`in Arbeit`, ein Mangel (M1). Der Umzug als solcher ist nachgerechnet und
verlustfrei — es fehlt nur die richtige Beschriftung der sieben neuen Achsen.

## M1 der Abnahme — behoben

Der Einwand war richtig und der Fehler mein eigener: ich hatte die sieben
neuen `AXIS_SOURCE`-Texte **plausibel formuliert statt abgeschrieben**, und
einer war schlicht falsch. `dauersachverhalt_uebernahme` stand auf
„abgeleitet beim Jahreswechsel … im Vergleich der Jahre"; richtig ist
„berechnet — `RecurringCandidateClass` aus der DATEV-Buchungshistorie (F91)",
Klassifikation beim Onboarding. Der Satz steht sichtbar im
`StatusInfoDialog` unter „Woher der Wert kommt" — er hätte den Leser genau
dorthin geschickt, wo die Quelle nicht ist.

Alle sieben Labels und alle sieben Quelltexte sind jetzt **wörtlich aus
`apps/web/src/ui/status/entity-icons.ts` übernommen**. Nachgeprüft: der Diff
beider `AXIS_LABEL`- und `AXIS_SOURCE`-Blöcke zeigt nur noch die
Reihenfolge, keinen Text. Dabei ist auch `beleg_erledigung` angeglichen
worden, wo dieses Repo eine ausführlichere Fassung führte.

Zwei der drei Nebenbefunde sind mit erledigt:

- Der Registry-Abschnitt in `docs/ludwig/README.md` hätte den nächsten Sync
  nicht überlebt — das Skript schreibt die Datei aus einem Heredoc neu. Der
  Text steht jetzt **im Heredoc**; `pnpm sync:ludwig` ist einmal gelaufen und
  die Datei trägt ihn danach.
- Dass `entity-icons.ts` die nächste Gabelung ist, hat eine eigene Aufgabe
  bekommen: **0105**, samt dem Vorschlag eines Wächters, der beide Dateien
  vergleicht — dreißig Zeilen, und M1 wäre nicht durchgekommen.

**Nicht erledigt und nicht von mir zu erledigen:** die zwei Skills
(`v3-komponente`, `entitaet-analysieren`) verweisen weiter auf die gelöschte
`src/ui/v3/patterns/status-registry.ts`. Skills ändere ich in dieser Runde
nicht; das ist gemeldet.
