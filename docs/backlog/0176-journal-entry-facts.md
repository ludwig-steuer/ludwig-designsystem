# 0176 · JournalEntryFacts — der Buchungssatz, ganz gelesen

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Teilbuchungen, BU-Schlüssel, der Weg nach DATEV |
| Quelle | Entitätsprofil `docs/entitaeten/journal-entry.md` (geprüft), Abschnitte „Datenpunkte" (Rang 1–8, 11–17), „Relationen", „Formen", „Zuschnitt" (jetzt, Bau-Reihenfolge 2) |
| Ersetzt | in `ludwig/app` `ui/booking/JournalEntryView.tsx` (374 Z.) und `JournalEntryDetail`; die Herleitung aus `BookingProposalView`/`KIBox` |
| Blockiert | `JournalEntryDrawer` (0177 — Zone 3 des Drawers ist diese Form), den Reiter „Buchung" am Ereignis |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Wer einen Satz aufmacht, will drei Dinge wissen: **was** gebucht wird (Zeilen,
Konten, Steuer), **warum** es so gebucht wird (Herkunft, Regel, Begründung,
Urteil des Judge) und **wo er steht** (freigegeben, exportiert, in DATEV
wiedergefunden). Heute steht das an drei Stellen in der App, jede mit eigener
Wortliste.

## Einordnung

- **Wiederverwenden:** `JournalEntryGrid` (0113) zeigt die Zeilen im
  DATEV-Spaltensatz — es bleibt und wird komponiert. `AiBookingNotesBody`
  (0151) trägt Begründung, Judge-Satz und Quellen; `ProvenanceNote` (0163)
  trägt Herkunft, Regel, Konfidenz und „wer, wann".
- **Neu, weil:** Regel 5 aus `spec-schreiben` §3 — das Profil führt die Form,
  keine vorhandene deckt sie; `JournalEntryCard` (0044) ist die M-Form ohne
  Herleitung und ohne Export.
- **Zuschnitt:** eine Datei `JournalEntryFacts.tsx`. Der Drawer (0177) legt nur
  den Rahmen darum, wie bei `SourceDocumentCard` in 0052.
- **Setzt auf:** `FieldList`, `JournalEntryGrid`, `ProvenanceNote`,
  `AiBookingNotesBody`, `StatusBadge` (`journal_entry_datev_stage`),
  `AmountCell`, `MonoCell`, `Time`, `Link`, `CaseCell`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `entry` | `JournalEntryVM` (`entries/domain/journal-entry-vm.ts`) | ja | der Satz, wie ihn die App liest: Zeilen, Herkunft, Konfidenz, Begründung, Quellen, Export, gesperrt, blockiert | `Filled` |
| `context` | `JournalEntryFactsContext` | nein | was die Detail-Sicht der App **nicht** trägt (L-336), alles einzeln optional: `entryKind`, `documentGroup`, `agentRun`, `stepCode`, `sourceDocumentHref`, `importReference`, `mirrorEntryLabel`, `case`, `event` | `Filled`, `WithoutAi` |
| `judgeReasoning` | `string \| null` | nein | der Satz des Judge aus `proposal_rationale.judge` — die App reicht ihn durch, solange der jsonb keinen Typ hat (L-295) | `Repaired` |
| `batchHref` | `(batchId: string) => string` | nein | Weg zum Stapel; ohne ihn bleibt die Nummer Text | `Exported` |
| `accountHref` | `(accountNumber: string) => string` | nein | Weg zum Konto-Drawer, durchgereicht an das Raster | `InUse` |
| `caseHref` | `(caseId: string) => string` | nein | Weg zum Sachverhalt | `InUse` |
| `tone` | `"surface" \| "bare"` | nein | `bare` für den Drawer, wo die Karte schon außen steht (0052) | `InUse` |

**Aufbau**, in dieser Reihenfolge (D4: Kopf · Mängel · Fakten · Abrisse · Verlauf):

1. **Der Satz** — `FieldList`: Buchungsdatum, Belegfeld 1 (aus der führenden
   Zeile), Betrag, Weg nach DATEV (`StatusBadge`, abgeleitet), Satzart und
   Beleggruppe, wo der Aufrufer sie kennt.
2. **Hinweise** — ein Satz je Fall, nur wenn er zutrifft: gesperrt („nur noch
   stornierbar"), blockiert („eine offene Rückfrage hält ihn"), ersetzt einen
   geflaggten Satz (`repairedFrom`, mit dem Befund des Judge).
3. **Die Buchung** — `JournalEntryGrid` mit den Zeilen des Satzes
   (`mode="simple"`, `status` aus dem Satz).
4. **Herleitung** — `ProvenanceNote`: Herkunft mit Konfidenz, „wer und wann"
   (Agent-Lauf, `createdAt`), Regel (`stepCode`). Hat der Satz ein Urteil des
   Judge oder Quellen, steht darin `AiBookingNotesBody` statt der Zeilen
   „Begründung" und „Quellen" — **nichts zweimal** (D24).
5. **Export und Stapel** — `FieldList`, nur wenn exportiert oder einem Stapel
   zugeordnet: Stapelnummer mit Weg, Export-Datum, Dateiname, LudwigAI-Ref,
   Zustand des Stapels.
6. **Zusammenhang** — `FieldList`, nur was der Aufrufer gibt: Sachverhalt
   (`CaseCell`), Ereignis, Spiegelbuchung, Mandantenstapel, Beleg.

**Kann bewusst nicht:** bearbeiten, annehmen, stornieren (`JournalEntryEditor`
0015 und die Aktionen des Aufrufers), die **Annahmequalität** als Wort zeigen —
`acceptance_quality` hat keine Achse (L-294), und ein roher Schlüssel wäre ein
interner Name außerhalb der Rohdaten (T4); die Erwartungen des Satzes listen
(das tut die Seite mit `ExpectationRow`); den Verlauf zeigen — er hängt am
Sachverhalt (L-297).

## Verhalten

Server-Component, kein Zustand. Das Raster hält seinen eigenen Aufklapper
(`<details>`), die Herleitung ihren (`Disclosure` in `ProvenanceNote`). Jede
Gruppe **entfällt**, wenn sie leer wäre — keine Karte mit Strichen (D23). Die
Stufe kommt aus `deriveEntryDatevStage()`, die Konfidenz-Farbe aus
`confidenceLevel()`; gerechnet wird nichts davon hier.

## Stories

Titel `v3/Entitäten/Buchungssatz/JournalEntryFacts`. Abgeleitet nach §6: ein
Zustand (gefüllt), keine Enum-Prop, ein Layout-Boolean (`tone`), kein Callback,
dazu Einsatz und Rand.

| Story | Beweist |
|---|---|
| `Filled` | ein KI-Vorschlag mit Konfidenz, Begründung, Quellen, Kontext |
| `WithoutAi` | `client_import` und `manual`: keine Konfidenz, keine Begründung — die Herleitung bleibt eine Zeile, die Gruppe verschwindet nicht |
| `Exported` | freigegeben, exportiert, in DATEV wiedergefunden: Stapel, Datum, Ref, Zustand |
| `Repaired` | `repairedFrom` mit dem Befund des Judge und `judgeReasoning` |
| `LockedAndBlocked` | gesperrt und blockiert, je ein Satz mit seiner Folge |
| `Edges` | 36 Teilbuchungen, Begründung über 650 Zeichen, Betrag siebenstellig |
| `InUse` | `tone="bare"` in einer Karte, mit `accountHref`, `caseHref`, `batchHref` — so steht sie im Drawer (0177) |

Nicht anwendbar: leer (ohne Satz gibt es die Form nicht), leer nach Filter,
lädt und Fehler (der Rahmen lädt, nicht die Form).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Annahmequalität als Wort | `entry.acceptanceQuality` plus eine Achse | L-294 gelöst |
| Urteil des Judge als Typ statt Durchreichung | `entry` selbst | L-295 gelöst |
| Spiegelbuchung als Zelle | `context.mirrorEntry` statt `mirrorEntryLabel` | Profil `datev-mirror-entry` gebaut (Roadmap #2) |

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

- [ ] Die sechs Gruppen stehen in der Reihenfolge oben; jede leere fehlt ganz (Story `WithoutAi`, DOM)
- [ ] Die Stufe kommt aus `deriveEntryDatevStage()` (Story `Exported`)
- [ ] Begründung und Quellen stehen **einmal**: mit Judge-Urteil in `AiBookingNotesBody`, sonst in der `ProvenanceNote` (Story `Filled` gegen `Repaired`, Grep auf „Begründung")
- [ ] Gesperrt und blockiert stehen je als Satz mit Folge, nicht als Wort ohne Kontext (Story `LockedAndBlocked`)
- [ ] 36 Zeilen: das Raster scrollt in seinem Rahmen, die Seite nicht (Story `Edges`, gemessen)
- [ ] `tone="bare"` bringt keine zweite Fläche in die Karte (Story `InUse`, gemessen)
- [ ] Ersetzt `JournalEntryView` ohne Funktionsverlust, außer der Annahmequalität — mit Begründung in der Abnahme

## Offene Fragen

1. Gehört die Annahmequalität in die Fakten, sobald sie eine Achse hat? — ohne
   Antwort: **ja**, als Zeile in „Der Satz", direkt unter dem Weg nach DATEV.
2. Zeigt die Form die Erwartungen, die aus dem Satz entstanden sind? — ohne
   Antwort: **nein**, das ist die Liste der Seite; die Form nennt sie nicht
   einmal als Zahl.

## Gebaut (2026-09-15)

`JournalEntryFacts.tsx` mit `JournalEntryFactsContext`; `toJournalRows()` in
`journal-entry.ts` setzt die `BookingLineVM` der App auf die Zeile des Rasters
um (Formwechsel, keine Ableitung). Beides im Barrel.

**Drei Abweichungen von der Spec, jede mit Grund:**

1. **`sources` ist eine eigene Prop**, nicht `entry.sources`.
   `RationaleSourceLike.kind` ist ein freier String, `AiSource.art` eine der
   fünf Arten des Sets — die Zuordnung kennt nur der Aufrufer. Eine Map hier
   wäre eine dritte Wahrheit neben App und Set.
2. ~~**Kein `accountHref`.**~~ **Erledigt am 2026-09-15**: das Raster nimmt
   jetzt `accountHref`, und die Form reicht es durch (Nachtrag 0113, gebaut).
3. ~~**Der Zustand steht zweimal.**~~ **Erledigt am 2026-09-15**: das Raster
   nimmt `showStatus={false}`, die Form setzt es. Der Zustand steht nur noch
   als „Weg nach DATEV" — gemessen in der Story `InUse`.

Gemessen (CDP, Storybook 6107, 1000 px, im Story-Iframe):

| Kriterium | Beobachtung |
|---|---|
| Gruppen in der Reihenfolge | `Filled`: Der Satz · Raster · Herleitung · Zusammenhang; `Exported` zusätzlich „Export und Stapel" |
| Leere Gruppen fehlen | `WithoutAi`: keine Herleitungs-Zeilen außer der Herkunft, kein „Export und Stapel", keine Quellen |
| Stufe aus der Ableitung | `Exported`: „In DATEV bestätigt" aus `exportedAt` und der Spiegelbuchung des Kontexts |
| Nichts zweimal | `Filled`: Begründung, Judge-Satz und Quellen **nur** in `AiBookingNotesBody`; die `ProvenanceNote` trägt Herkunft, Regel, Konfidenz |
| Hinweise mit Folge | `LockedAndBlocked`: zwei Banner, jeder mit dem Satz, was daraus folgt; `Repaired`: der Befund des Judge samt Kriterien |
| Ränder | `Edges`: zwölf Zeilen im Raster, Begründung über 400 Zeichen, siebenstelliger Betrag — kein Überlauf |
| `tone="bare"` | `InUse`: drei `v2fields--bare`, keine zweite Fläche in der Karte |

`pnpm typecheck`, `check:classes`, `check:language`, `check:when`,
`check:icons` und `pnpm build` grün; Screenshots angesehen. Abnahme durch einen
anderen Agenten steht aus.
