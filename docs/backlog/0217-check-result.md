# 0217 · CheckResult — „x von y bestanden" in der Zeile, die Prüfpunkte im Aufklapper

| | |
|---|---|
| Status | Abnahme — gebaut 2026-10-01 |
| Stufe | `patterns/` — Gruppe Prüfen (Familie `Review.tsx`, neben `CheckItems` und `checkSummary`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: jedes Prüfergebnis eines Antrags mit Regeln |
| Quelle | Anfrage llcto 2026-10-01, Owner-Wunsch: Prüfpunkte auch in der Vorschlagsliste (Schritt 3, T3, Ansichten „Übersicht" und „Liste"), als eigener Baustein, damit sie überall gleich erscheinen |
| Ersetzt | nichts — heute zeigt nur die Fall-Ansicht von Schritt 3 `CheckItems`; die Liste zeigt keine Prüfpunkte |
| Blockiert | App: Prüfpunkte in T3 (`Step3Single`, Übersicht/Liste) |
| Spec von / am | Claude (designsystem), 2026-10-01 |

## Ziel

Die Sachbearbeiterin geht 40 Vorschläge durch und will je Zeile sehen, ob die
Prüfpunkte durchgelaufen sind, ohne jeden Fall zu öffnen. Heute sieht sie sie
nur in der Fall-Ansicht. Gewünscht: je Zeile **eine** Zeile „x von y
Prüfpunkten bestanden" im Ton des schlechtesten Punkts, aufklappbar auf die
vollen Prüfpunkte wie in `CheckItems`.

## Einordnung

- **Wiederverwenden:** `CheckItems` (Größe M: Befunde einzeln, bestandene und
  nicht prüfbare je gruppiert) trägt den aufgeklappten Teil unverändert.
  `checkSummary()` (Größe XS, reiner Text „1 verletzt · 2 offen · 9 bestanden")
  liefert den Tooltip. Keiner trägt „eine Zeile mit Ton, aufklappbar".
- **Neu, weil:** der Owner will die Prüfpunkte ausdrücklich als **einen**
  Baustein, der überall gleich erscheint; „x von y" im Ton des schlechtesten
  Punkts kann keine vorhandene Form (`checkSummary` ist reiner Text ohne Ton).
  Die Zeile kommt in jede Liste mit Prüfpunkten (T3 heute; Fall-Liste,
  Drawer-Kopf später).
- **Name `CheckResult`, nicht `CheckSummary`:** `checkSummary` ist schon die
  Textfunktion im selben Barrel. Zwei Exporte, die sich nur in der
  Großschreibung unterscheiden, wären ein Wort für zwei Dinge.
- **Zuschnitt:** ein Export in der Familie `Review.tsx`: die Zeile (XS). Das
  Aufklappen trägt der Ort, an dem sie steht — in T3 der Zeilen-Aufklapper,
  darin `CheckItems`. Eine eigene Klapp-Form ist geplant, aber nicht gebaut
  (Befund beim Bauen, Ausbau).
- **Setzt auf:** `StateIcon`, `CheckItems`, `checkSummary`. Server-Component wie
  der Rest der Familie.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `items` | `readonly CheckItem[]` | ja | Die Prüfpunkte, wie `CheckItems` sie nimmt | `CheckResultTones` |
| `kind` | `CheckKind` | nein | Standard `rule` („bestanden"); `fact` sagt „geklärt" und zählt Fakten | `CheckResultTones` |

**Erweiterung T3** (`JournalEntryReviewList`, 0164):

| Feld / Verhalten | Bedeutung | Nachweis |
|---|---|---|
| `ProposalRow.checks?: readonly CheckItem[]` | Die Prüfpunkte des Satzes, wie in der Fall-Ansicht. `undefined`: keine Daten, nichts erscheint | `Grouped` |
| Spalte „Prüfbedarf" | Erste Zeile `CheckResult`, darunter wie bisher die Gründe bzw. „entschieden". Spur 124 → **156 px** („12 von 12 bestanden" mit Zeichen misst 153 px, auf einer Zeile) | `Grouped`, `Flat` |
| Zeilen-Aufklapper | Oben `CheckItems` mit den Prüfpunkten des Satzes, darunter der Aufklapper des Aufrufers (`expand`). Ohne `expand` gibt es den Aufklapper nur der Prüfpunkte wegen. Der Aufrufer legt die Prüfpunkte nicht noch einmal hinein | `Grouped` |

Keine Typen aus `src/ludwig/`: `CheckItem` ist der Typ der Familie.

**Kann bewusst nicht:** Prüfpunkte laden oder rechnen (die App liefert sie),
quittieren (das tun `gate`/`jump` in `CheckItems`), in `compact` erscheinen
(dort gibt es keine Spalte „Prüfbedarf").

## Verhalten

- **Zählen:** x = bestandene (`green`), y = alle Prüfpunkte — dieselbe Rechnung
  wie die Gruppenzeile in `CheckItems` („9 von 12 Prüfpunkten bestanden").
- **Ton = schlechtester Punkt:** `red` vor `yellow` vor `green`. „Nicht prüfbar"
  (`open`) zählt nicht als Befund. Das Zeichen ist `StateIcon` (error · warning
  · done); bei Rot und Gelb trägt auch der Text die Farbe (`--color-danger`
  6,07:1, `--color-warning` 5,52:1 auf Weiß). Bei Grün bleibt der Text in der
  Grundfarbe: Grün ist der Normalfall, das Signal ist die Abweichung, und 36
  grüne Zeilen hintereinander wären keine Ruhe (Farbe nur als Signal).
- **Nichts prüfbar** (nur `open`): kein „0 von 12 bestanden", das wie ein Befund
  läse, sondern „nicht prüfbar", Zeichen `open`, Text gedämpft — wie die dritte
  Gruppe in `CheckItems` (0148).
- **Leer** (`[]`): „Keine Prüfpunkte", gedämpft.
- **Text kurz** („9 von 12 bestanden" — „Prüfpunkte" sagt die Umgebung), auf
  einer Zeile; `title` = `checkSummary()` („1 verletzt · 2 offen · 9 bestanden").
  Keine Interaktion, kein Hover — aufgeklappt wird die Zeile der Liste.

## Stories

Titel: die Familie `v3/Patterns/Prüfen/Checklist` (wie `CheckItems*`). Nach §6:
Zustände in einer Story nebeneinander (rot · gelb · grün · nicht prüfbar · leer,
je Regel und Fakt) = 1; der Einsatz in T3 beweist Zeile und Aufklapper.

| Story | Beweist |
|---|---|
| `CheckResultTones` | alle Töne nebeneinander, `kind` rule und fact, `title` mit allen Zahlen |
| T3 `Grouped` | Zeile in „Prüfbedarf" ohne Aufklappen sichtbar; im Zeilen-Aufklapper die vollen Prüfpunkte über dem Satz |
| T3 `Flat` | dieselbe Zeile in der flachen Ansicht |

Nicht anwendbar: lädt und Fehler — die Prüfpunkte kommen mit der Zeile; lädt die
Liste, zeigt T3 ihren Ladezustand.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Eine eigene Klapp-Form (die Zeile als Kopf eines Aufklappers, innen `CheckItems`) für einen Ort ohne Zeilen-Aufklapper | `variant?: "fold"` — der Kopf darf dann nicht „x von y Prüfpunkten bestanden" sagen, denn das sagt die Gruppenzeile von `CheckItems` beim Aufklappen noch einmal; Kopf mit `checkSummary()` | eine Karte oder ein Drawer will die Prüfpunkte eingeklappt |
| Sprung aus der Zeile direkt zu den Befunden | `onOpen?` | ein Screen will den Zeilen-Aufklapper per Klick auf die Zeile öffnen |

## Befund beim Bauen (2026-10-01)

- **Derselbe Satz zweimal.** Gebaut war zuerst eine Klapp-Form: die Zeile als
  Kopf, innen `CheckItems`. Aufgeklappt stand „6 von 8 Prüfpunkten bestanden"
  zweimal untereinander — als Kopf und als Gruppenzeile der bestandenen Punkte.
  Owner-Regel: nie derselbe Satz an zwei Orten. In T3 sagt die Zeile der Liste
  „x von y" schon, also zeigt der Aufklapper `CheckItems` direkt. Die
  Klapp-Form ist gestrichen und steht unter „Ausbau", mit dem Hinweis, wie ihr
  Kopf lauten muss.
- **Die Zeile brach um.** In der 124-px-Spur von „Prüfbedarf" stand „7 von 8 /
  bestanden" auf zwei Zeilen (42 px). Jetzt `white-space: nowrap` und 156 px —
  „12 von 12 bestanden" mit Zeichen misst 153 px.

Gemessen (Playwright, 1280 × 900): `Grouped` 1246 = 1246 ohne Querscroll,
Spuren Gegenpartei 123, Kontoname je 88, Prüfbedarf 156; kein Gegenparteiname
gekürzt; Zeilen 67–106 px; die Zeile 21 px hoch. `CheckResultTones`: Rot
`rgb(168, 64, 60)`, Gelb `rgb(140, 96, 30)`, Grün Text in Grundfarbe mit grünem
Zeichen, „nicht prüfbar" und „Keine Prüfpunkte" gedämpft; `title` z. B. „1
verletzt · 2 offen · 9 bestanden".

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] x/y wie die Gruppenzeile von `CheckItems`; Ton nach schlechtestem Punkt, `open` zählt nicht (`CheckResultTones`)
- [ ] Rot/Gelb: Zeichen und Text im Ton, Kontrast ≥ 4,5:1 gemessen; Grün: Zeichen grün, Text Grundfarbe (`CheckResultTones`)
- [ ] Nur `open` → „nicht prüfbar", nie „0 von y bestanden"; `[]` → „Keine Prüfpunkte" (`CheckResultTones`)
- [ ] Eine Zeile auch bei „12 von 12 bestanden", `title` = `checkSummary()` (`CheckResultTones`, T3 gemessen)
- [ ] T3: „x von y" in „Prüfbedarf" ohne Aufklappen sichtbar, Gründe darunter; Aufklapper zeigt `CheckItems` über dem `expand` des Aufrufers, kein Satz doppelt (`Grouped`, `Flat`)
- [ ] T3 bei 1280 px weiter ohne Querscroll, Zeilenhöhen nicht über 106 px (`Grouped`, `Flat`, gemessen)
- [ ] `CheckResult` und `checkSummary` sind zwei Namen für zwei Dinge (Barrel, `@instead`)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
