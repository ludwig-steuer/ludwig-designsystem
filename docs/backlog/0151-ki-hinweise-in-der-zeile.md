# 0151 · Die KI-Hinweise in einer Zeile

| | |
|---|---|
| Status | gebaut 2026-09-10 — Abnahme offen (nicht durch den Bauenden) |
| Stufe | `entities/journal-entry/` — zwei Exporte mehr in `AiBookingNotes.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Judge, Buchungsvorschlag und Konfidenz sind Ludwigs Prüfkette |
| Quelle | Owner, 2026-09-10: „gibt es die Review-Ansicht auch als Compact View — mit den Buchungshinweisen und Judge-Ergebnissen, gleiches Paket?" |
| Ersetzt | nichts — es gab die Form bisher nicht. Die Achse `judge` wurde im ganzen Set an **einer** Stelle gezeigt |
| Spec von / am | Claude, 2026-09-10 |

## Ziel

Dasselbe Paket — Urteil des Judge, Konfidenz, Begründung, Quellen — in einer
**Liste** von Buchungssätzen. Der Kasten `AiBookingNotes` steht am einzelnen
Satz; ein Stapel hat im Bestand dreistellige Zeilenzahlen, und drei Zeilen
Begründung je Zeile machen daraus eine Wand.

**Die Zeile beantwortet „hat jemand widersprochen?", der Aufklapper „warum?".**

## Zuschnitt: zwei Exporte, keine Variantenprop

Der naheliegende Weg wäre `AiBookingNotes compact` gewesen. Dagegen sprach,
dass „kompakt" hier zwei verschiedene Dinge heißt — die **Zusammenfassung**
für die Zeile und der **Rumpf ohne Kopf** für den Aufklapper —, und eine Prop,
die zwei Dinge auf einmal umschaltet, erklärt sich in einem Monat niemandem
mehr.

Also nach `spec-schreiben` §4 getrennt: ein Teil, der woanders **allein**
gebraucht wird, bekommt seinen eigenen Export.

| Export | Was er ist | Wo er steht |
|---|---|---|
| `AiBookingNotes` | der Kasten, unverändert | am einzelnen Satz, im `JournalEntryEditor` |
| `AiBookingNotesCell` | Urteil · Konfidenz · Zahl der Befunde | Spalte „KI-Prüfung" einer Liste |
| `AiBookingNotesBody` | die vier Blöcke ohne Kasten | im Aufklapper der Zeile — und im Kasten selbst |

Der Kasten benutzt den Rumpf jetzt selbst; die vier Blöcke stehen also
**einmal** im Code, nicht zweimal.

## Schnittstelle

| Prop | Typ | Bedeutung | Nachweis |
|---|---|---|---|
| `verdict` | `JudgeVerdict \| null` | Achse `judge`, als `StatusBadge` | `Cell` |
| `confidence` | `ConfidenceLevel \| null` | **mit Wort**, nicht nur als Punkt | `Cell` |
| `errors` | `string[]` | die **Zahl** in der Zeile, der Text im Aufklapper | `Cell` |

**Kann bewusst nicht:**

- **Den Text zeigen.** Begründung und Judge-Satz gehören in den Aufklapper;
  eine Zelle, die drei Zeilen trägt, ist keine Zelle mehr.
- **Selbst aufklappen.** Das kann `DataTable` mit `expand` bereits — eine
  zweite Aufklapp-Mechanik in der Zelle wäre zwei Chevrons in einer Zeile.
- **Leeres füllen.** Ohne Urteil und ohne Konfidenz steht **nichts** da, kein
  Gedankenstrich: ein Vorschlag, den kein Judge gesehen hat, ist nicht
  dasselbe wie einer, der zu nichts beurteilt wurde.

## Stories

| Story | Beweist |
|---|---|
| `Cell` | Die vier Urteile mit Konfidenz und Befundzahl |
| `CellEmpty` | Ohne Urteil bleibt die Zelle leer; Konfidenz allein ist trotzdem eine Auskunft |
| `Box` | Der Kasten, unverändert — er zeigt jetzt denselben Rumpf |
| `InUse` | Die Buchungsübersicht: Spalte in `DataTable`, Text im Aufklapper |
| `InCard` | Ein Satz allein, wo der Kasten noch trägt |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der Komponente; Status nur über Registry
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen

Variabel (aus dieser Spec):

- [ ] Die Zelle zeigt das Urteil über die Achse `judge`, nie eine lokale Map
- [ ] Die Konfidenz steht **mit Wort** (`Sicher`, `Plausibel`, `Geraten`)
- [ ] Ohne Urteil und ohne Konfidenz rendert die Zelle **nichts** — kein
      Gedankenstrich, kein leerer Chip
- [ ] Der Aufklapper trägt **keinen** zweiten Kopf: Urteil und Konfidenz
      stehen schon in der Zeile (`InUse`, im DOM gezählt)
- [ ] Die vier Blöcke stehen einmal im Code — der Kasten benutzt denselben
      Rumpf wie der Aufklapper
- [ ] Eine Zeile ohne KI-Prüfung sagt im Aufklapper, **warum** nichts da ist

## Messung 2026-09-10 (1240 px)

- Spalten: Belegfeld 1 · Konto · Buchungstext · **KI-Prüfung** · Umsatz
- Zellen: „Bestätigt Sicher" · „Angepasst Plausibel" · „Beanstandet Geraten
  1 Befund"; die vierte Zeile (von Hand gebucht) hat **keine** Zelle
- Aufgeklappt: Befund rot, „Begründung des Vorschlags", „Einschätzung des
  Judge"; `.ki__h` im Aufklapper: **0**

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
