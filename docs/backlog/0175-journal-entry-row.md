# 0175 · JournalEntryRow — der Buchungssatz als Zeile und als Spaltensatz

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Soll und Haben, Belegfeld 1, der Weg nach DATEV |
| Quelle | Entitätsprofil `docs/entitaeten/journal-entry.md` (geprüft), Abschnitte „Datenpunkte" (Rang 1–7), „Listen", „Formen", „Zuschnitt" (jetzt, Bau-Reihenfolge 1) |
| Ersetzt | in `ludwig/app` die Zeile von `BuchungenTabelle` (`datev-export/ui`, 232 Z.) und die Satzzeile in `Schritt3` |
| Blockiert | `JournalEntryList` (drei Jobs), `JournalEntryReviewList` (0164), den Reiter „Buchungen" am Sachverhalt |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Wer einen Stapel prüft, liest Satz um Satz: Was wird gebucht, über welche
Konten, wie viel, und wie weit ist er auf dem Weg nach DATEV. Heute baut jede
Liste diese Zeile selbst — die Stapel-Tabelle zeigt `status` statt der Stufe,
die Abnahme eine andere Auswahl, und der Sachverhalt hat gar keine.

## Einordnung

- **Wiederverwenden:** `JournalEntryCell` (0044) nennt einen Satz **in fremdem
  Markup** („debit, credit, amount, one line") — das ist die Nennung, nicht die
  Zeile einer Liste; `JournalEntryCard` (0044) zeigt alle Zeilen eines Satzes.
  Beide bleiben und werden hier komponiert.
- **Neu, weil:** Regel 5 aus `spec-schreiben` §3 — das Profil führt die Form,
  und keine vorhandene deckt sie.
- **Zuschnitt:** **eine Datei für die Zellen**, zwei Rahmen — wie bei der
  Bankposition (0101): `journal-entry-columns.tsx` liefert `ColumnDef`s für
  `DataTable`, `JournalEntryRow.tsx` die kurze Liste in einer Karte. Ein
  zweiter Zellensatz wäre derselbe Verstoß gegen R17 eine Ebene tiefer.
- **Setzt auf:** `DataTable` (0106/0149), `Row`, `JournalEntryCell` (0044,
  `showNames={false}`), `StatusBadge` + `StatusInfoButton` (Achse
  `journal_entry_datev_stage`), `ProvenanceMark` (0163, Achse
  `journal_entry_origin`), `AmountCell`, `MonoCell`, `Time`, `CaseCell`.

## Schnittstelle

**Daten.** `JournalEntryRowData` in `entities/journal-entry/journal-entry.ts`:

```ts
export type JournalEntryRowData = JournalEntryListItem & {
  /** `proposal_confidence`, 0..1 — fehlt am Listen-Typ der App (L-335). */
  confidence?: number | null;
  /** Zahl der Teilbuchungen; ohne sie nennt die Zelle zwei Konten (L-335). */
  lineCount?: number | null;
  /** Beleggruppe, die Abschnitte der Stapel-Liste (L-335). */
  documentGroup?: string | null;
  /** Titel des Sachverhalts; ohne ihn sagt die Zelle „Sachverhalt" (L-335). */
  caseTitle?: string | null;
};
```

`JournalEntryListItem` kommt aus `src/ludwig/modules/entries/domain/entry.ts`
und wird **nicht** neu definiert; die drei optionalen Felder sind der Befund
L-335, nicht eine eigene Wahrheit: sobald die App sie am Listen-Typ führt,
fällt der Schnitt hier weg.

**Spaltensatz** `journalEntryColumns(options)` → `ColumnDef<JournalEntryRowData>[]`:

| Spalte | Rang | Zelle | Breite · Ausrichtung |
|---|---|---|---|
| `bookingDate` | 4 | `Time format="date" length="short"` | 96 px, sortierbar |
| `belegfeld1` | 6 | `MonoCell` | 112 px |
| `bookingText` | 1 | Text, gekürzt bei **60** Zeichen (EXTF-Grenze), ganzer Text im `title` | `minmax(0, 1.4fr)` |
| `accounts` | 3 | `JournalEntryCell` mit `showNames={false}`; ab `lineCount > 2` „n Zeilen" statt „A an B" | `minmax(0, 1fr)` |
| `taxKey` | 9 | `vatKey` mit `vatRatePercent` im `title`, leer als `—` | 72 px |
| `amount` | 2 | `AmountCell` | 120 px, `end`, sortierbar |
| `datevStage` | 5 | `StatusBadge axis="journal_entry_datev_stage"`, Stufe aus `deriveEntryDatevStage()`; `headerAside` trägt den `StatusInfoButton` (Z4) | 140 px |
| `origin` | 7 | `ProvenanceMark` — Wort aus `journal_entry_origin`, Konfidenz daneben, wenn `confidence` gesetzt | 132 px |
| `case` | — | `CaseCell` mit `caseNumber`; nur außerhalb des Sachverhalts | 112 px |

| Option | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `columns` | `readonly JournalEntryColumn[]` | nein | Auswahl und Reihenfolge; ohne sie der volle Satz ohne `case` | `Columns` |
| `accountHref` | `(accountNumber: string) => string` | nein | Weg zum Konto-Drawer, durchgereicht an `JournalEntryCell` (0155) | `InUse` |
| `caseHref` | `(caseId: string) => string` | nein | Weg zum Sachverhalt; ohne ihn bleibt die Nummer Text | `Columns` |
| `entryHref` | `(entryId: string) => string` | nein | Weg in den Satz (Drawer, 0176); ohne ihn führt die Zeile nirgendwohin | `InUse` |

**Zeile** `JournalEntryRow({ entry, columns?, accountHref?, caseHref?, entryHref? })` —
dieselben Zellen in einem `Row`, für die kurze Liste in einer Karte.

**Kann bewusst nicht:** die Export-Referenz (`export_ref`), den Agent-Lauf und
die Beleggruppe als **Spalte** zeigen — Rang 11, 17 und 14 gehören in die
Facts; die Beleggruppe ist in der Stapel-Liste der **Abschnitt**, nicht eine
Spalte. Keine Auswahl (Massenaktionen trägt `JournalEntryReviewList`, 0164),
kein Bearbeiten (`JournalEntryEditor`, 0015), keine Zeilen-Ampel
(„die Ampel gilt dem Satz", `journal-entry-vm.ts`).

## Verhalten

Server-Component. Die Stufe wird **nicht** in der Zelle gerechnet, sondern mit
`deriveEntryDatevStage()` aus der Domäne — eine Regel, alle Leser. Ohne
`entryHref` ist die Zeile Text; mit ihm ist die **ganze Zeile** ein Link
(`Row href`), die Konten und der Sachverhalt behalten ihre eigenen Wege
(I11: nie zwei Ziele in einem Anker — deshalb hängt der Kontoweg an der Zahl
und nicht am Zeilenlink, und wo beides zusammenfällt, gewinnt die Zahl).
Leer, lädt und Fehler gehören der Liste, nicht der Zeile.

## Stories

Titel `v3/Entitäten/Buchungssatz/JournalEntryRow`. Abgeleitet nach §6: ein
Zustand (gefüllt), zwei Achsen nebeneinander, kein Callback, `columns` als
Layout-Prop, dazu Rand und Einsatz.

| Story | Beweist |
|---|---|
| `Filled` | die volle Zeile mit realistischen Daten, in `Card` + `Table` |
| `Stages` | die fünf Werte von `journal_entry_datev_stage` untereinander, je eine Zeile |
| `Origins` | die vier Herkünfte mit und ohne Konfidenz — `client_import` trägt keine |
| `Columns` | `journalEntryColumns()` in `DataTable`, mit `case`-Spalte und `caseHref` |
| `Edges` | Buchungstext 124 Zeichen (Kürzung bei 60, `title`), Satz mit fünf Zeilen („5 Zeilen"), fehlendes Belegfeld 1, Betrag siebenstellig |
| `InUse` | die kurze Liste am Sachverhalt: `Card` + drei Zeilen + `accountHref` + `entryHref` |

Nicht anwendbar: leer, leer nach Filter, lädt, Fehler — sie gehören dem Rahmen
(`DataTable`, `JournalEntryList`), nicht der Zeile.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Satzart und Beleggruppe als Spalte | `columns` um `entryKind`, `documentGroup` | L-294 und L-335 gelöst, und eine Liste fragt danach |
| KI-Prüfung in der Zeile | `AiBookingNotesCell` als eigene Spalte | 0164 wird gebaut |

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

- [ ] Jede Spalte zeigt ihren Rang wie in der Tabelle oben (Story `Filled`, gemessen: Reihenfolge und Breiten)
- [ ] Die DATEV-Stufe kommt aus `deriveEntryDatevStage()`, nicht aus `status` (Story `Stages`; Grep: kein eigener Vergleich auf `exportedAt` in der Zelle)
- [ ] Das (i) steht im Kopf, nicht in jeder Zeile (Story `Columns`, DOM)
- [ ] `client_import` zeigt die Herkunft ohne Konfidenz, `ai_proposed` mit (Story `Origins`)
- [ ] Buchungstext über 60 Zeichen wird gekürzt, der ganze steht im `title` (Story `Edges`)
- [ ] Mehr als zwei Teilbuchungen: die Konten-Zelle sagt „n Zeilen" (Story `Edges`)
- [ ] Mit `entryHref` ist die Zeile ein Link, die Kontozahl behält ihren eigenen (Story `InUse`, DOM)
- [ ] Zeile und Spaltensatz benutzen **dieselben** Zellen (Grep: `JournalEntryRow` importiert aus `journal-entry-columns`)
- [ ] Ersetzt die Zeile von `BuchungenTabelle` ohne Funktionsverlust außer den drei bewusst gestrichenen Spalten (Export-Referenz, Durchgang, ID) — mit Begründung in der Abnahme

## Offene Fragen

1. Trägt die Zeile die Satzart (`entry_kind`)? Sie ist Rang 8 und heute nur ein
   Badge im Kopf der Abnahme-Karte. — ohne Antwort: **nein**, sie steht in den
   Facts; die Liste gruppiert nach Beleggruppe, nicht nach Art.
2. Ist die ganze Zeile ein Link oder nur eine Zelle? — ohne Antwort: **die
   ganze Zeile**, wie bei `BankTransactionRow` und `SourceDocumentRow`.

## Gebaut (2026-09-15)

`journal-entry-columns.tsx` liefert `journalEntryColumns()`,
`journalEntryTracks()` und `DEFAULT_JOURNAL_ENTRY_COLUMNS`;
`JournalEntryRow.tsx` setzt dieselben Zellen in ein `Row`. Der Zeilen-Typ
`JournalEntryRowData` steht in `journal-entry.ts` und schneidet die vier Felder
an, die der Listen-Typ der App nicht führt (L-335). Alles im Barrel.

Gemessen (CDP, Storybook 6107, 1400 px, im Story-Iframe):

| Kriterium | Beobachtung |
|---|---|
| Spaltensatz und Reihenfolge | Datum · Belegfeld 1 · Buchungstext · Konten · USt · Betrag · Weg nach DATEV · Herkunft; mit `case` als neunter |
| Stufe aus der Ableitung | Story `Stages`: Vorschlag · Freigegeben · Exportiert · In DATEV bestätigt · Storniert — aus `status`, `exportedAt` und `datevMirrorEntryId` |
| Herkunft mit und ohne Konfidenz | Story `Origins`: KI-Vorschlag (mit Punkt) · Regelwerk · Manuell · Mandantenstapel (ohne) |
| Das (i) steht im Kopf | Tabelle mit fünf Zeilen: genau **zwei** Knöpfe, beide in der Kopfzeile |
| Kürzung | Story `Edges`: 60 Zeichen sichtbar, 122 im `title` |
| Mehr als zwei Teilbuchungen | Story `Edges`: „5 Zeilen" statt „A an B" — seit dem Bau von 0178 **ohne** den Betrag: er steht in seiner eigenen Spalte, und zweimal in einer Zeile verstößt gegen D24 (Nachtrag auf 0044, `showAmount`) |
| Zeile als Link | Story `InUse`: ein `a.v2rowlink` je Zeile in der Leitzelle, dazu vier Kontowege — **keine** verschachtelten Anker (`a a` = 0) |
| Kein Überlauf | in allen sechs Stories `scrollWidth` = `clientWidth` |

`pnpm typecheck`, `check:classes`, `check:language`, `check:when`,
`check:icons`, `check:jobs` und `pnpm build` grün; Screenshots angesehen.
Abnahme durch einen anderen Agenten steht aus.

**Offene Frage 1 ist mit dem Bau beantwortet:** die Satzart steht nicht in der
Zeile. Frage 2 ebenso: die ganze Zeile ist der Link.
