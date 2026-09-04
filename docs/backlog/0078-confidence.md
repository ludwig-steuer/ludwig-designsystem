# 0078 · Confidence — die Konfidenz als ein Punkt mit Wort

| | |
|---|---|
| Status | spec |
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Braucht die Buchungszeile die Prozentzahl, oder reicht der Punkt? *Ohne
   Antwort: der Punkt (`compact`); die Zahl steht im Detail.*
2. Vier Farbwerte oder fünf Band-Wörter auf der Achse `konfidenz`? *Ohne
   Antwort: die Achse bleibt bei vier, der Baustein folgt der Achse — L-50
   entscheidet drüben.*
