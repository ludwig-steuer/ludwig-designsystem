# 0217 · CheckResult — „x von y bestanden" in der Zeile, die Prüfpunkte im Aufklapper

| | |
|---|---|
| Status | Abnahme — Nacharbeit 2026-10-01 nach der fremden Abnahme (M1–M6) |
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
- **Setzt auf:** `StateIcon` und `checkSummary` (für den `title`).
  Server-Component wie der Rest der Familie. `CheckItems` setzt erst T3 ein, im
  Zeilen-Aufklapper.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `items` | `readonly CheckItem[]` | ja | Die Prüfpunkte, wie `CheckItems` sie nimmt | `CheckResultTones` |
| `kind` | `CheckKind` | nein | Standard `rule` („bestanden"); `fact` sagt „geklärt" und zählt Fakten | `CheckResultTones` |

**Erweiterung T3** (`JournalEntryReviewList`, 0164):

| Feld / Verhalten | Bedeutung | Nachweis |
|---|---|---|
| `ProposalRow.checks?: readonly CheckItem[]` | Die Prüfpunkte des Satzes, wie in der Fall-Ansicht. `undefined`: keine Daten — in der Zelle erscheint nichts; hat die Liste einen Aufklapper, sagt er dort „Keine Prüfpunkte für diesen Fall." (der Leertext von `CheckItems`), statt leer aufzugehen | `Grouped`, `ChecksWithoutExpand` |
| `variant="compact"` | zeigt keine Prüfpunkte — weder Zeile noch Aufklapper (keine Spalte „Prüfbedarf") | `Compact` |
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
  6,06:1, `--color-warning` 5,52:1 auf Weiß). Bei Grün bleibt der Text in der
  Grundfarbe: Grün ist der Normalfall, das Signal ist die Abweichung, und 36
  grüne Zeilen hintereinander wären keine Ruhe (Farbe nur als Signal).
- **Nichts prüfbar** (nur `open`): kein „0 von 12 bestanden", das wie ein Befund
  läse, sondern „nicht prüfbar", Zeichen `open`, Text gedämpft — wie die dritte
  Gruppe in `CheckItems` (0148).
- **Leer** (`[]`): „Keine Prüfpunkte", gedämpft.
- **Fakten** (`kind="fact"`): dieselben Regeln mit den Wörtern der Familie —
  „x von y geklärt"; Rot „widersprüchlich", Gelb „zu klären" (nur im `title`
  gezählt), nichts erhoben → „nicht erhoben", leer → „Keine Fakten".
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
| T3 `ChecksWithoutExpand` | ohne Aufklapper des Aufrufers: die Liste klappt nur der Prüfpunkte wegen auf; die Zeile ohne `checks` sagt „Keine Prüfpunkte für diesen Fall." |
| T3 `Compact` | keine Prüfpunkte, kein Aufklapper |

Nicht anwendbar: lädt und Fehler — die Prüfpunkte kommen mit der Zeile; lädt die
Liste, zeigt T3 ihren Ladezustand. Leer nach Filter — der Baustein filtert
nicht; was die Liste filtert, sagt ihr eigener Leertext.

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

Fremde Abnahme, Stand `b13f3b4`. Gemessen mit Playwright, 1280 × 900, eigener
Browser-Kontext; Story-IDs ohne Präfix `v3-entitäten-buchungssatz-journalentryreviewlist--`
bzw. `v3-patterns-prüfen-checklist--`. Screenshots `.playwright-mcp/abn0217-*.png`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` nicht selbst gelaufen (parallele Sitzungen, Auftrag); der Erbauer meldet ihn für `b13f3b4` grün | ✓ (build übernommen) |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `CheckResult` in `patterns/Review.tsx` neben `CheckItems`/`checkSummary`; Story in `Review.stories.tsx`, Titel `v3/Patterns/Prüfen/Checklist`; T3-Stories `v3/Entitäten/Buchungssatz/JournalEntryReviewList` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0 („0 German comment lines"), `pnpm check:when` Exit 0; `CheckResult` trägt beide (`Review.tsx:457–460`). Rückverweis der Nachbarn → eigene Zeile unten (M3) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | CSS `.v2pp__result-line*` nur Tokens (`--space-2`, `--color-danger`, `--color-warning`, `--color-text-muted`); Wörter aus `SUMMARY_WORD` der Familie, keine Registry-Achse berührt; Spur `"156px"` folgt der `ColumnDef`-API wie alle Spalten der Datei; `pnpm check:type` Exit 0 | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | `check-result-tones`, `grouped`, `flat` vorhanden. Aber: Fakt nur in einem Ton (M4); „leer nach Filter" weder gezeigt noch begründet (M5); „ohne `expand` nur der Prüfpunkte wegen" ohne Story (M2) | ✗ |
| Prüfliste `design-guidelines.md` §9 | Rot nur bei verletztem Punkt, Grün nur am Zeichen; jedes Zeichen mit Wort; Schrift 13,5 px = `--fs-ui` wie die Gründe daneben; Lucide 1,5 px, 15 px; kein Hover auf Nichtklickbarem (Hintergrund/Farbe vor = nach Hover, `cursor: auto`); Zeilen ≤ 106 px; Kontraste unten. Fünf Zustände → Zeile davor | ✓ (bis auf fünf Zustände) |
| Im Browser angesehen | `check-result-tones`, `grouped`, `flat`, `compact`, `states` gerendert; 0 Konsolenfehler, 0 Warnungen im eigenen Kontext | ✓ |
| x/y wie die Gruppenzeile von `CheckItems`; Ton nach schlechtestem Punkt, `open` zählt nicht | `grouped` 39, `flat` 11 Zeilen mit `checks`: Text, Ton-Klasse und `title` gegen die Fixture `checksFor(i)` nachgerechnet — 0 Abweichungen. Fall 4: Zeile „6 von 8 bestanden" (1 rot, 1 nicht prüfbar), aufgeklappt „6 von 8 Prüfpunkten bestanden". „7 von 8 bestanden", `title` „1 nicht prüfbar · 7 bestanden" ist grün | ✓ |
| Rot/Gelb: Zeichen und Text im Ton, ≥ 4,5:1; Grün: Zeichen grün, Text Grundfarbe | T3 auf Weiß: Rot Text `rgb(168, 64, 60)` **6,06:1**, Zeichen `--color-danger`; Gelb `rgb(140, 96, 30)` 5,52:1, Zeichen `--color-warning`; Grün Text `rgb(45, 45, 45)`, Zeichen `--color-success`. `check-result-tones` auf `#F4F6F8`: 5,60:1 / 5,09:1 | ✓ |
| Nur `open` → „nicht prüfbar"; `[]` → „Keine Prüfpunkte" | `check-result-tones`: „nicht prüfbar", Zeichen `open` (`--color-text-subtle`), Text `rgb(92, 92, 92)`; `[]` „Keine Prüfpunkte" ohne Zeichen, gedämpft. T3 Fall 6: „nicht prüfbar", `title` „8 nicht prüfbar", 6,69:1 | ✓ |
| Eine Zeile auch bei „12 von 12 bestanden"; `title` = `checkSummary()` | Probetext „12 von 12 bestanden" in `flat` (Zeilen 1 und 4): 152,6 px in der 156-px-Spur, eine Zeilenbox, Zeile 20,9 px, Zeilenhöhe unverändert (87,8 / 66,8 px), kein Querscroll. `title` = `checkSummary()` in allen 50 T3-Zeilen und 6 Story-Zeilen (z. B. „1 verletzt · 2 offen · 9 bestanden") | ✓ |
| T3: „x von y" ohne Aufklappen sichtbar, Gründe darunter; Aufklapper zeigt `CheckItems` über dem `expand`, kein Satz doppelt | `flat` Zeile 11: `CheckResult` oben (y 909,9), Gründe darunter (y 930,9). Fall 12 ohne `checks`: nur „Ludwig ist unsicher / Betrag über 1.000,00 €". Aufgeklappt (`grouped` Fall 4; `flat` Fall 4, 6, 12): `.v3prop__checks` erstes Kind, 12 px über der Karte des Aufrufers (`v2je`); „Prüfpunkten bestanden" genau 1×; Fall 12 zeigt nur den Satz des Aufrufers. Siehe H1 | ✓ |
| T3 bei 1280 px ohne Querscroll, Zeilen ≤ 106 px | `.v2tbl__scroll`: `grouped` 1246 = 1246, `flat` 1246 = 1246. Zeilen `grouped` 66,8–105,6 px, `flat` 65,8–87,8 px; Prüfbedarf-Zelle 156 px | ✓ |
| `CheckResult` und `checkSummary` zwei Namen für zwei Dinge (Barrel, `@instead`) | Barrel `index.ts:275`/`:279` beide exportiert; `CheckResult` → `checkSummary` (`Review.tsx:459–460`). Rückweg fehlt: `checkSummary` (`Review.tsx:266`) nennt nur `CheckItems`, `CheckItems` (`Review.tsx:396`) sagt „The count alone → checkSummary" | ✗ M3 |
| Spec-Satz „Kann bewusst nicht: … in `compact` erscheinen" | `compact`: 6 Aufklapp-Knöpfe auf 6 Zeilen (die Story übergibt kein `expand`), der Aufklapper zeigt `CheckItems` („8 Prüfpunkte nicht prüfbar"). Screenshot `abn0217-compact-fold.png` | ✗ M1 |
| T3-Tabelle: `checks` `undefined` → „nichts erscheint"; „ohne `expand` nur der Prüfpunkte wegen" | Code `JournalEntryReviewList.tsx:405–416`: ohne `expand` bekommt jede Zeile einen Aufklapper, sobald irgendeine Zeile `checks` trägt — die Zeile ohne `checks` klappt ins Leere. Keine Story deckt den Fall | ✗ M2 |
| Spec Zeichen für Zeichen gegen den Code | Prop-Tabelle = `Review.tsx:462` (`items: readonly CheckItem[]`, `kind?: CheckKind`, Vorgabe `rule`); T3-Tabelle = `JournalEntryReviewList.tsx:75`, Spur `:314`; „Befund beim Bauen" nachgemessen (1246 = 1246, Prüfbedarf 156, Zeilen 67–106, Zeile 21 px, Töne). Abweichungen in Sätzen: M5, M6 | ✗ |

**Mängel**

| Nr. | Fundort | Befund · Messwert |
|---|---|---|
| M1 (blockierend) | `src/ui/v3/entities/journal-entry/JournalEntryReviewList.tsx:405` | `fold = expand \|\| rows.some((r) => r.checks)` fragt `variant` nicht ab. In `compact` (Drawer, Reiter „Zum Schließen") erscheinen die Prüfpunkte im Aufklapper — gemessen 6 Knöpfe auf 6 Zeilen, vor `b13f3b4` keiner. Widerspricht Spec Z. 59–61 und `befunde-app.md` §E („`compact` zeigt keine Prüfpunkte") |
| M2 | `JournalEntryReviewList.tsx:405–416` | Ohne `expand` und mit gemischten Zeilen bekommt auch die Zeile ohne `checks` einen Aufklapper mit leerem Inhalt. Spec Z. 53 „`undefined`: … nichts erscheint". Der Weg „ohne `expand`" (Z. 55) hat keine Story |
| M3 | `src/ui/v3/patterns/Review.tsx:264–266`, `:396` | Der Nachbarfall trägt keinen `@instead`-Verweis auf `CheckResult` (`CLAUDE.md` §3). `checkSummary` beginnt sein `@when` wie `CheckResult` („The result of a set of checks in …", dort „or an overview"); `CheckItems` schickt „the count alone" an `checkSummary`, für die Zeile einer Liste ist es jetzt `CheckResult` |
| M4 | `src/ui/v3/patterns/Review.stories.tsx:312` | `CheckResultTones` zeigt `kind="fact"` nur gelb („2 von 4 geklärt"). Spec Z. 84–85 verlangt rot · gelb · grün · nicht prüfbar · leer „je Regel und Fakt" — für Fakten fehlen vier |
| M5 | `docs/backlog/0217-check-result.md` Z. 47, 73–76, 93–94, 139 | Die Spec nennt für die Sonderfälle nur die Regel-Wörter; der Code sagt bei `fact` „nicht erhoben" und „Keine Fakten" (`Review.tsx:466–471`). „Leer nach Filter" ist weder gezeigt noch als nicht anwendbar begründet |
| M6 | Spec Z. 39 und Z. 69; `src/styles/v3.css:4250` | (a) „Setzt auf: `StateIcon`, `CheckItems`, `checkSummary`" — `CheckResult` nutzt `CheckItems` nicht, nur T3 tut es. (b) „`--color-danger` 6,07:1" (Spec und CSS-Kommentar) — gemessen 6,06:1, `design-guidelines.md:593` führt 6.06 |

**Hinweise** (kein Mangel, für den Owner)

- H1: Aufgeklappt stehen „6 von 8 bestanden" (Zeile, x 899 / y 281) und „6 von 8
  Prüfpunkten bestanden" (Gruppenzeile von `CheckItems`, x 93 / y 445) zugleich im
  Bild, 164 px tiefer und 806 px links. Wörtlich nicht derselbe Satz und von der Spec
  so gewollt („Befund beim Bauen"), aber dieselbe Aussage zweimal — genau das, was die
  Ausbau-Zeile der Klapp-Form verbietet.
- H2: `title` erreicht nur die Maus (die Zeile ist nicht fokussierbar); die Zahlen
  stehen aber vollständig im Aufklapper, es geht nichts verloren.
- H3: Die Zelle „Prüfbedarf" stapelt mit `.v3prop__who` (`JournalEntryReviewList.tsx:318`),
  der Klasse der Gegenpartei-Zelle — trägt, aber der Name sagt etwas anderes.

**Vier Linsen.** *Sprache:* „9 von 12 bestanden", „nicht prüfbar", „Keine
Prüfpunkte" sind kurz, Kanzleiwörter, dasselbe „bestanden" wie in `CheckItems`;
die Fakt-Wörter stehen nicht in der Spec (M5). *Bedienung:* nicht klickbar und
ohne Hover, das Zeichen trägt sein Wort als `aria-label`, aufgeklappt wird über
den Knopf der Zeile; `compact` bekommt ungefragt Aufklapper (M1). *Logik:* die
Rechnung hat einen Ort (`SUMMARY_WORD`, `PP_ICON`, `checkSummary` in der Familie),
der Aufklapper legt `CheckItems` einmal hinein; Zeilen ohne `checks` klappen ohne
`expand` ins Leere (M2), der Rückverweis im Barrel fehlt (M3). *Darstellung:* Farbe
nur als Kritikalität, Grün nur am Zeichen, Zeile 20,9 px in `--fs-ui`, `nowrap` in
156 px ohne Querscroll.

Abgenommen von / am: nicht abgenommen — Claude (Abnahme-Agent), 2026-10-01 ·
Offene Punkte: M1–M6 (M1 blockierend)

## Nacharbeit 2026-10-01 (nach der fremden Abnahme)

| Punkt | Änderung | Stand |
|---|---|---|
| M1 `compact` bekam Aufklapper mit Prüfpunkten | Aufklapper der Prüfpunkte nur, wenn `variant !== "compact"`; `Compact` gemessen: 0 Aufklapper, 0 Prüfzeilen bei 6 Zeilen | behoben |
| M2 leerer Aufklapper bei Zeile ohne `checks` | sie zeigt `CheckItems` mit `[]` → „Keine Prüfpunkte für diesen Fall."; neue Story `ChecksWithoutExpand` (vier Zeilen, darunter Fall 12 ohne Satz) | behoben |
| M3 Nachbarn ohne Rückverweis | `checkSummary`: `@when` „All counts … as plain text", `@instead` nennt `CheckResult`; `CheckItems`: `@instead` nennt `CheckResult` | behoben |
| M4 Fakten nur in Gelb | `CheckResultTones` zeigt Fakten in allen fünf Fällen (widersprüchlich · zu klären · geklärt · nicht erhoben · keine) | behoben |
| M5 Fakt-Wörter, „leer nach Filter" | Abschnitt „Verhalten" nennt die Fakt-Wörter; „leer nach Filter" unter „Nicht anwendbar" begründet | behoben |
| M6 „Setzt auf", Kontrast | „Setzt auf" ohne `CheckItems`; `--color-danger` 6,06:1 in Spec und CSS-Kommentar | behoben |
| H3 Klasse `.v3prop__who` in „Prüfbedarf" | eigene Klasse `.v3prop__stack` für mehrzeilige Zellen (Soll/Haben, Prüfbedarf); `.v3prop__who` bleibt der Gegenpartei | behoben |
| H1 aufgeklappt „6 von 8 bestanden" (Zeile) und „6 von 8 Prüfpunkten bestanden" (Gruppe in `CheckItems`) zugleich | bleibt: die Zeile ist der Stand ohne Aufklappen, die Gruppenzeile beschriftet den zugeklappten Block der bestandenen Punkte — zwei Orte mit zwei Aufgaben. Will der Owner sie trennen, ist der Weg ein kürzerer Gruppensatz in `CheckItems`, nicht eine zweite Zeile | offen, Owner |
| H2 `title` nur mit der Maus | bleibt: die Zahlen stehen vollständig im Aufklapper | — |

Gemessen nach der Nacharbeit (1280 × 900): `Grouped` 1246 = 1246, Zeilen 67–106 px;
`Compact` ohne Aufklapper; `ChecksWithoutExpand` vier Aufklapper, der dritte „Keine
Prüfpunkte für diesen Fall.".

