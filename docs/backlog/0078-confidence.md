# 0078 · Confidence — die Konfidenz als ein Punkt mit Wort

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` — Gruppe Prüfen (neben `StatusBadge`); Pattern statt Primitive, weil die Farbe und das Wort aus der Registry kommen und die in `patterns/` liegt |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, jede App mit Modell-Vorschlägen zeigt, wie sicher der Vorschlag ist; kennt die Achse `konfidenz`, keine Entität |
| Quelle | Soll-Katalog §11.7 Stufe 1 „Konfidenz (Punkt · Band · Meter) → heben → eine Primitive" · `ludwig/app` `F147-luecken-fuer-design-agent.md` §4 Nr. 21 · GLOSSARY „Confidence band" |
| Ersetzt | `ui/booking/ConfidenceDot.tsx` (3 Dateien) · `ConfidenceMeter`/`ConfidenceBand` in `ui/booking/ConfidenceMeter.tsx` (5 + 4) · `Confidence` in `modules/invoices/ui/invoice-detail-format.tsx` (3) — zwölf Dateien; im Set die Inline-`confdot` in `AiBookingNotes` samt lokaler Map `KONFIDENZ_TEXT` (R1-Verstoß) |
| Blockiert | `AiBookingNotes` (Bereinigung), 0044 `JournalEntryCard` („Konfidenz neben der Karte"), 0072 `InvoiceLines` (Kontenkandidaten mit Konfidenz), 0073 (Fakten mit Provenienz und Konfidenz) |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

Die Sachbearbeiterin liest an einem Vorschlag, wie sicher der Agent war — in
einer Form, überall gleich: ein Punkt in der Farbe der Stufe, das Wort dazu
(„Sicher", „Plausibel", „Unsicher", „Geraten") und, wo es einen Rohwert gibt,
die Prozentzahl. Heute gibt es vier Darstellungen mit drei Schwellensätzen
(85/70/50 · 80/50 · 85/60) und dem fünfstufigen Band aus dem GLOSSARY als
vierten: derselbe Wert 0,62 heißt je nach Screen „orange", „med" oder
„mittel". Der Baustein stellt dar; die Ableitung Wert → Stufe gehört in die
Domäne (Befund L-50) und nicht in ihn.

## Einordnung

- **Wiederverwenden:** `StatusBadge axis="konfidenz"` rendert die Stufe als
  Pill mit Wort — richtig für einen Zustand, zu schwer in einer Buchungszeile
  oder Tabellenzelle, und eine Konfidenz ist eine Bewertung, kein Zustand
  des Dings. `DotStatus` (Primitive) rendert Punkt und Wort mit `tone` —
  das ist die Form, aber Farbe und Wort müssen aus der Achse kommen.
- **Neu, weil:** `spec-schreiben` §3 Regel 2 — `DotStatus` deckt vier
  Fünftel; das Fehlende (Wort und Farbe aus der Achse, Prozent daneben, das
  „kein Signal") ist eine Designentscheidung, die zwölfmal wiederkommt.
- **Zuschnitt:** eine Datei, ein Export. **Kein Meter** (drei Balken sind
  Dekoration ohne Mehrinformation, V7), **kein Band** — ein Anteil als Balken
  ist `Progress` mit `tone`, sollte ein Screen ihn je brauchen.
- **Setzt auf:** `DotStatus`, `resolveStatus("konfidenz", …)`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `level` | `ConfidenceLevel \| null` — die Werte der Achse `konfidenz` (`green` · `yellow` · `orange` · `red`) | ja | Die gebandete Stufe; `null` heißt kein Signal → „—" mit Titel „keine Angabe" | `Levels`, `NoSignal` |
| `value` | `number` | nein | Rohwert 0…1; als ganze Prozentzahl hinter dem Wort („Plausibel · 62 %"), `tnum` | `WithValue` |
| `compact` | `boolean` | nein | Nur der Punkt, Wort als `title` und `aria-label` — für Buchungszeile und Tabellenzelle | `DotOnly` |

Typen: `ConfidenceLevel` zieht aus `AiBookingNotes.tsx` in diese Datei um;
der heutige Wert `"none"` wird `null`. Der Rohwert ist in `src/ludwig/`
vorhanden (`proposalConfidence`, `docDirectionConfidence`, … in
`modules/invoices/domain/invoice.ts`, je `number | null`). Die **Ableitung**
Rohwert → Stufe fehlt dort (L-50); bis sie gespiegelt ist, bandet der
Aufrufer selbst.

**Kann bewusst nicht:**

- **Schwellen kennen.** Wer `value` gibt, gibt auch `level` — der Baustein
  rechnet nicht, sonst hätte Ludwig einen vierten Schwellensatz.
- **„Manuell gebucht = grün" entscheiden.** Diese Regel (`entryConfLevel`,
  Owner 2026-08-29) ist Domäne und bleibt beim Aufrufer.
- **Ein Balken sein.** Siehe Zuschnitt.

## Verhalten

Server-Component: kein Zustand, kein Ereignis. Kein Hover (§2 — was nicht
klickt, bekommt keinen), kein Fokus. Im `compact`-Modus trägt der Punkt das
Wort als `title` (Z3) und `aria-label`; sonst steht das Wort daneben, und
Farbe allein ist nie das Signal (V7). Zustände: gefüllt (`level`), kein
Signal (`null`), kompakt. Lädt und Fehler gibt es nicht — ein Wert ist da oder
nicht.

## Stories

Titel `v3/Patterns/Prüfen/Confidence`.

| Story | Beweist |
|---|---|
| `Levels` | Alle vier Stufen untereinander mit Wort — Farbe und Wort aus der Registry, keine Map in der Story |
| `WithValue` | Stufe mit Rohwert: „Plausibel · 62 %", Ziffern tabellarisch |
| `DotOnly` | `compact` in einer Tabellenzeile neben `AmountCell`; `title` sichtbar im Hover |
| `NoSignal` | `level={null}` → „—" mit Titel „keine Angabe"; daneben ein Import-Satz ohne Konfidenz |
| `InUse` | In einer `FieldList`-Zeile „Konfidenz" und im Kopf von `AiBookingNotes` — beides über diesen Baustein |

Nicht anwendbare Zustände: lädt, Fehler, leer nach Filter (Begründung im
Verhalten).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Fünf Stufen wie das GLOSSARY-Band (`sehr_niedrig` … `sehr_hoch`) | `level` nimmt die Band-Werte, sobald die Achse `konfidenz` sie führt — keine Prop-Änderung, eine Registry-Änderung | L-50 ist entschieden |
| Wer hat bewertet — Agent oder Judge | `source?: "agent" \| "judge"` als Präfix im Titel | `AiBookingNotes` zeigt beides nebeneinander |

## Befunde für `ludwig/app`

- **B1** — Drei Schwellensätze für dieselbe Größe: `entryConfLevel`
  (85/70/50, `ui/booking/format.ts`), `Confidence` in
  `invoice-detail-format.tsx` (0,8/0,5), `confLevel` (85/60). Dazu das
  fünfstufige Band aus dem GLOSSARY (`confidence_to_band`, Python-SSOT) mit
  eigenen Schwellen. **Eine** Ableitung `confidenceLevel(value)` in
  `shared/` (spiegelbar), gegen die Python-Schwellen geprüft. Register: L-50.
- **B2** — Die Achse `konfidenz` hat vier Farbwerte, das GLOSSARY-Band fünf
  Wörter. Entscheiden, ob die Achse auf die fünf Band-Werte geht oder das
  Band auf vier Farben abgebildet wird. Teil von L-50.
- **B3** — Im Set: `AiBookingNotes` führt `KONFIDENZ_TEXT` als lokale Map
  neben der Registry (R1). Diese Aufgabe löscht sie.

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

- [ ] `level` liefert Wort und Farbe aus `resolveStatus("konfidenz")`, keine Map in der Datei (Story `Levels`)
- [ ] `level={null}` rendert „—" mit Titel „keine Angabe" (Story `NoSignal`)
- [ ] `value` erscheint als ganze Prozentzahl mit `tnum` hinter dem Wort (Story `WithValue`)
- [ ] `compact` zeigt nur den Punkt; `aria-label` und `title` tragen das Wort (Story `DotOnly`)
- [ ] `AiBookingNotes` nutzt `Confidence`; `KONFIDENZ_TEXT` ist gelöscht; `ConfidenceLevel` wird aus `Confidence.tsx` exportiert, der Barrel folgt
- [ ] Die Punkt-Farben stehen in `v3.css` über Tokens (`--color-success` …), Klassenpräfix vor dem Benennen gegrept (`v2conf` ist frei); die vier Hex-Werte von `.confdot--*` in `app-chrome.css` werden nicht kopiert
- [ ] offen (App): ersetzt die vier Darstellungen in zwölf Dateien; `.confdot`/`.conf`/`.confband` in `app-chrome.css`/`booking.css` fallen danach

## Abnahme

### Story-Deckung

Jede Prop hat ihre Story, jede in der Spec genannte Story existiert. Gezählt
über `http://localhost:6107/index.json`: fünf Einträge unter dem Titel
`v3/Patterns/Prüfen/Confidence` — `…--levels`, `…--with-value`,
`…--dot-only`, `…--no-signal`, `…--in-use`. Zuordnung:
`level` → `Levels` + `NoSignal`, `value` → `WithValue`, `compact` →
`DotOnly`; `InUse` zeigt beide Einbauorte. Die ausgeschlossenen Zustände
(lädt, Fehler, leer nach Filter) sind unter „Verhalten" begründet — „ein Wert
ist da oder nicht"; das trägt, weil der Baustein nichts lädt und nichts
sammelt. Keine Story zu viel, keine zu wenig.

### Fest

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; `pnpm build` → `storybook build`, „Storybook build completed successfully", Exit 0. Zweimal gelaufen: vor der Korrektur von M1 und danach, beide Male grün (2026-09-05) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/Confidence.tsx` + `Confidence.stories.tsx`; Titel `v3/Patterns/Prüfen/Confidence` (`Confidence.stories.tsx:14`) — dieselbe Gruppe wie `StatusBadge.stories.tsx:9`; Barrel `src/ui/v3/index.ts:366–371` unter dem Gruppen-Kommentar „Status" | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `Confidence.tsx:40–42` trägt beide Zeilen am einzigen Komponenten-Export; Bezeichner, Props, Typen und die Kommentare der Komponente sind englisch (`Confidence.tsx:1–76`), deutsch nur die sichtbaren Strings („keine Angabe", `Confidence.tsx:47`). Typen-Exports ohne `@when` folgen der Hausform (`StatusHeader.tsx:4` ebenso). Die Story-JSDoc ist deutsch — Repo-Konvention, siehe `StatusHeader.stories.tsx:24` | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,6}\|[0-9]+px\|fontSize" src/ui/v3/patterns/Confidence.tsx` → keine Treffer; `grep -nE "Record<\|const [A-Z_]+" Confidence.tsx` → keine Treffer, also keine Map; Wort **und** `kind` kommen aus `resolveStatus("konfidenz", level)` (`Confidence.tsx:53`), das Achsenwort aus `AXIS_LABEL.konfidenz` (`entity-icons.ts:52`). Das einzige `px` liegt im `cols`-Grid der Story (`Confidence.stories.tsx:62`) — so wie in 27 weiteren Story-Dateien des Sets | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Siehe „Story-Deckung" | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Punkt für Punkt: Stufe `patterns/`, Importe nur abwärts (`Confidence.tsx:1–3`) ✓ · kein Hex/px/Map ✓ · Text links, Prozent mit `tnum` (`Confidence.tsx:72`, im Browser `font-variant-numeric: lining-nums tabular-nums`) ✓ · Zeilenhöhe `Row` unverändert (Story `DotOnly`) ✓ · Farbe als Kritikalitätsstufe aus der Registry (`status-registry.ts:854–859`) ✓ · Status nur über Registry (Z2), Spaltenkopf über `StatusHeader` mit dem Wort der Spalte (Z4) ✓ — nach der Korrektur von M1 · fünf Zustände: drei begründet ausgeschlossen ✓ · kein Icon ohne Wort, keine Emoji, keine Versalien in dieser Datei ✓ · kein Hover/Fokus, weil nichts klickt (§2) ✓. Die zwei App-Punkte („ersetzt v1 mit `@deprecated`", „§11 auf v2") sind laut Skill hier übersprungen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle fünf Stories einzeln auf `http://localhost:6107/iframe.html?id=…` geöffnet und betrachtet: `Levels` (vier Punkte mit Wort), `WithValue` (Prozent hinter dem Wort), `DotOnly` (Tabelle, nur Punkte), `NoSignal` (Gedankenstrich), `InUse` (`FieldList` + Kopf der KI-Buchungshinweise). `DotOnly` nach der Korrektur ein zweites Mal, siehe Zeile M1 | ✓ |

### Variabel

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `level` liefert Wort und Farbe aus `resolveStatus("konfidenz")`, keine Map in der Datei | `Confidence.tsx:53`; Story `v3-patterns-prüfen-confidence--levels`: im Browser gemessen `Sicher→rgb(63,122,90)`, `Plausibel→rgb(46,120,168)`, `Unsicher→rgb(140,96,30)`, `Geraten→rgb(168,64,60)` — identisch mit `--color-success #3F7A5A`, `--color-accent-700 #2E78A8`, `--color-warning #8C601E`, `--color-danger #A8403C`. Die vier Wörter stehen nur in `status-registry.ts:855–858` | ✓ |
| `level={null}` rendert „—" mit Titel „keine Angabe" | `Confidence.tsx:45–51`; Story `…--no-signal`: im DOM genau ein `span.v2muted` mit Text `"—"` und `title="keine Angabe"`, daneben der Import-Satz ohne Konfidenz | ✓ |
| `value` erscheint als ganze Prozentzahl mit `tnum` hinter dem Wort | `Confidence.tsx:54` (`Math.round(value * 100)`), `:72` (`lw-numeric`, `tokens.css:328`); Story `…--with-value`: „Sicher · 94 %", „Plausibel · 62 %", „Unsicher · 51 %", „Geraten · 8 %", je `font-variant-numeric: lining-nums tabular-nums` | ✓ |
| `compact` zeigt nur den Punkt; `aria-label` und `title` tragen das Wort | `Confidence.tsx:56–67`; Story `…--dot-only`: alle vier Punkte mit `textContent.length === 0`, `role="img"` und `aria-label = title = "Sicherheit: Sicher · 94 %"` … `"Sicherheit: Geraten · 8 %"` | ✓ |
| `AiBookingNotes` nutzt `Confidence`; `KONFIDENZ_TEXT` ist gelöscht; `ConfidenceLevel` wird aus `Confidence.tsx` exportiert, der Barrel folgt | `grep -rn "KONFIDENZ_TEXT" src/` → kein Treffer im Code (nur Prosa in Story-Kommentar und dieser Spec); `AiBookingNotes.tsx:16` importiert, `:97` rendert `<Confidence level={confidence} compact />`; Typ steht in `Confidence.tsx:16`, Barrel `index.ts:367–371`, aus `AiBookingNotes` entfernt (`git show 71cb9ea -- src/ui/v3/index.ts`). `JournalEntryEditor.tsx:91` zeigt über `React.ComponentProps` auf denselben Typ | ✓ |
| Punkt-Farben in `v3.css` über Tokens, Klassenpräfix gegrept (`v2conf` frei), die vier Hex-Werte von `.confdot--*` nicht kopiert | `v3.css:958–964`: `.v2dot--success/warning/danger/info` führen ausschließlich `var(--color-…)`; die Messung im Browser (Zeile oben) beweist, dass genau diese Tokens ankommen. `grep -rn "v2conf" src/` → kein Treffer: es wurde **keine** Klasse angelegt, weil keine gebraucht wird — das Kriterium verlangt Tokens, nicht einen neuen Präfix. `grep -rn "confdot" src/` → nur noch `app-chrome.css:657–668`, kein Aufrufer im Set; keiner der vier Hex-Werte steht in `Confidence.tsx` | ✓ |
| offen (App): ersetzt die vier Darstellungen in zwölf Dateien; `.confdot`/`.conf`/`.confband` fallen danach | Betrifft `ludwig/app`, hier nicht prüfbar | offen (App) |

### Mängel des ersten Durchgangs

| Mangel | Nachweis der Behebung | Ergebnis |
|---|---|---|
| **M1 — Der Spaltenkopf der Story `DotOnly` hieß „Sicher".** „Sicher" ist der **Wert** von `green` (`status-registry.ts:855`), nicht der Name der Spalte: über vier Punkten stand das Wort, das zugleich der oberste Punkt bedeutet. Z4 will das spezifische Label **der Spalte**; die Hausform sind Substantive (`StatusHeader.stories.tsx:34` `label="Abgleich"`) | `Confidence.stories.tsx:66` lautet jetzt `<StatusHeader axis="konfidenz" label="Konfidenz" />` (`git diff` zeigt genau diese eine Zeile, sonst nichts). Im Browser, Story `…--dot-only`, zweiter Durchgang: der Spaltenkopf trägt `Konfidenz` (`span.v2sth` → `"Konfidenz"`), die vier Punkte unverändert mit `aria-label = title = "Sicherheit: Sicher · 94 %"` … `"Sicherheit: Geraten · 8 %"`. Klick auf das (i) öffnet die Legende mit allen vier Werten aus der Registry — damit trägt der kompakte Punkt V7 zweifach: Wort im Titel, Legende im Kopf. Dasselbe Wort steht in `InUse` als `FieldList`-Zeile (`Confidence.stories.tsx:115`) und im `CardHead` der Story | ✓ behoben |

Beobachtung ohne Mangelcharakter, für die Registry und nicht für diese
Aufgabe: der Spaltenkopf sagt „Konfidenz" (GLOSSARY „Konfidenz-Band"), der
Legenden-Dialog und der Punkt-Titel sagen „Sicherheit"
(`AXIS_LABEL.konfidenz`, `entity-icons.ts:52`). Beides meint dieselbe Achse
und beides ist verständlich; ein Wort für die Achse wäre trotzdem besser.
Betrifft `AXIS_LABEL` set-weit (auch `StatusBadge`, `StatusInfoDialog`), nicht
`Confidence`.

Abgenommen von / am: Claude, Abnahme-Agent, 2026-09-05 · Offene Punkte: nur
„offen (App)" — die zwölf App-Stellen und der Fall von
`.confdot`/`.conf`/`.confband`.

## Offene Fragen

1. Braucht die Buchungszeile die Prozentzahl, oder reicht der Punkt? *Ohne
   Antwort: der Punkt (`compact`); die Zahl steht im Detail.*
   **Entschieden (Bauender, 2026-09-05, Default):** der Punkt. `compact`
   nimmt `value` trotzdem entgegen und hängt die Prozentzahl an `title` und
   `aria-label` — sichtbar wird sie erst ohne `compact`.
2. Vier Farbwerte oder fünf Band-Wörter auf der Achse `konfidenz`? *Ohne
   Antwort: die Achse bleibt bei vier, der Baustein folgt der Achse — L-50
   entscheidet drüben.*
   **Entschieden (Bauender, 2026-09-05, Default):** vier. `ConfidenceLevel`
   führt genau die vier Achsenwerte; kommt das fünfstufige Band, ändert sich
   die Registry, nicht die Schnittstelle (siehe Ausbau).

## Befund beim Bauen

- **`ConfidenceLevel` steht jetzt zweimal im Repo.** Der Spiegel führt ihn
  schon: `src/ludwig/modules/accounting-cases/domain/acceptance-triage.ts`
  (dieselben vier Werte, `null` = keine Aussage). Der Baustein definiert ihn
  trotzdem selbst, weil er die Werte der **Achse** zeichnet und nicht die des
  Domänen-Enums — beide fallen erst auseinander, wenn L-50 die fünf
  Band-Wörter auf die Achse setzt. Steht so im JSDoc. Für die App heißt das:
  `confidenceLevel(value)` aus L-50 hat neben diesem Typ seinen Platz.
- **`.confdot`/`.confdot--*` in `src/styles/app-chrome.css` sind im Set jetzt
  tot** (vier Hex-Werte, `--none` mit Rand). Sie bleiben stehen, bis die App
  ihre zwölf Stellen migriert hat — siehe „offen (App)".
- **Keine Klasse `v2conf`.** Gegrept war sie frei — gebraucht wird sie nicht:
  die Punkt-Farben stehen längst in `v3.css` als `.v2dot--*` über
  `--color-success`/`--color-warning`/`--color-danger`/`--color-accent-700`,
  und der kompakte Punkt ist dasselbe Markup ohne Wort. Für die
  tabellarischen Ziffern reicht `.lw-numeric` aus `tokens.css`. Kein neues
  Stylesheet-Kapitel für diese Aufgabe.
- **Die Story `DotOnly` nutzt `StatusHeader` (0077) über der Punkt-Spalte:**
  `konfidenz` ist eine Achse, also greift Z4 auch hier.
- **`JournalEntryEditor.EditorAiReview.confidence` hing an einer eigenen
  Aufzählung** mit `"none"`. Sie zeigt jetzt über
  `React.ComponentProps<typeof AiBookingNotes>["confidence"]` auf den einen
  Typ — dieselbe Schreibweise, die `sources` daneben schon nutzt.
