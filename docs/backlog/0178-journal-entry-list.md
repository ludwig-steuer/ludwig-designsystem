# 0178 · JournalEntryList — die Buchungssätze einer Liste, in drei Jobs

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Beleggruppen, Weg nach DATEV, Export-Buckets |
| Quelle | Entitätsprofil `docs/entitaeten/journal-entry.md` (geprüft), Abschnitt „Listen" (drei Jobs) und „Zuschnitt" (jetzt, Bau-Reihenfolge 4) |
| Ersetzt | in `ludwig/app` `BuchungenTabelle` (`datev-export/ui`, 232 Z.) und die Bucket-Listen des DATEV-Export-Panels |
| Blockiert | den Reiter „Buchungen" am Sachverhalt, das Seitenprofil `stapel-detail` (0167) |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Drei Stellen zeigen dieselben Sätze mit derselben Zeile: der Stapel vor der
Übergabe, der Sachverhalt mit seinen Buchungen, der Export mit seinen Buckets.
Heute baut jede ihre eigene Tabelle — mit eigenem Kopf, eigener Leerzeile und
eigener Reihenfolge.

## Einordnung

- **Wiederverwenden:** `DataTable` (0106, Abschnitte 0149) trägt Kopf, Sortierung
  über die URL, Pager, Zeilenaktionen und die fünf Zustände;
  `journalEntryColumns()` (0175) trägt die Zellen.
- **Neu, weil:** Regel 6 aus `entitaet-analysieren` §7 — drei Listen-Jobs. Die
  Komposition ist dünn, aber sie hält vier Entscheidungen fest, die sonst
  dreimal getroffen werden: der Schlüssel der Zeile, der Spaltensatz, die
  Reihenfolge der Beleggruppen und die drei Leerfälle.
- **Zuschnitt:** eine Datei `JournalEntryList.tsx` mit der Liste und dem
  Gruppierer `journalEntriesByDocumentGroup()`.
- **Setzt auf:** `DataTable`, `journalEntryColumns` (0175), `DOCUMENT_GROUP_LABEL`
  aus dem Spiegel.

## Schnittstelle

Die **Form** ist dieselbe Unterscheidung wie in `DataTable`: entweder flach mit
Pager oder in Abschnitten, nie beides (0149: „ein Abschnitt über zwei Seiten
ist kein Abschnitt mehr").

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `entries` \| `groups` | `JournalEntryRowData[]` \| `TableGroup<JournalEntryRowData>[]` | ja (eins von beiden) | die Zeilen dieser Seite, oder die Abschnitte | `AtCase` / `InBatch` |
| `pager` | `TablePager` | nein | nur zur flachen Form | `InBucket` |
| `head` | `{ title, sub?, meta?, actions? }` | ja | Zone 1 — jede Tabelle in einer Karte (V5) | alle |
| `columns` | `readonly JournalEntryColumn[]` | nein | ohne sie der volle Satz ohne Sachverhalt | `AtCase` |
| `sort`, `href` | wie `DataTable` | nein | Sortierung über die URL | `InBucket` |
| `filtered` | `{ summary, resetHref }` | nein | der Leerfall **nach** Filter (T6) | `Filtered` |
| `empty` | `{ title, description?, done? }` | nein | der Leerfall des Jobs; `done` ist der Erfolg (L6) | `Empty` |
| `loading`, `error` | wie `DataTable` | nein | Kopf und Spaltenkopf bleiben stehen (I7) | `LoadingAndError` |
| `rowActions` | `(row) => AnyRowAction[]` | nein | die Zeilenaktion des Buckets („stornieren") | `InBucket` |
| `entryHref` | `(entryId: string) => string` | nein | die ganze Zeile führt in den Satz (Drawer, 0177) | `InBatch` |
| `accountHref`, `caseHref` | `(…) => string` | nein | Wege in Konto und Sachverhalt, an die Zellen durchgereicht | `InBatch` |
| `density` | `TableDensity` | nein | die Seite entscheidet (E9) | — |

`journalEntriesByDocumentGroup(entries)` baut die Abschnitte: die Reihenfolge
ist die von `DOCUMENT_GROUP_LABEL`, der Zähler steht rechts im Abschnittskopf,
und was keine Gruppe trägt, kommt als letzter Abschnitt „Ohne Beleggruppe".
Sortiert wird **nicht** — die Liste rechnet nichts (E2).

**Kann bewusst nicht:** filtern, sortieren, zählen, laden — das tut die Seite;
auswählen (Massenaktionen trägt `JournalEntryReviewList`, 0164); Abschnitte
**und** Pager zugleich.

## Verhalten

Server-Component. Der Zeilenschlüssel ist immer `entryId`. Die drei Jobs
unterscheiden sich nur in dem, was der Aufrufer gibt:

| Job | Form | Spalten | Leerfall |
|---|---|---|---|
| Inhalt des Stapels | Abschnitte je Beleggruppe | voll, mit `case` | „Der Stapel ist leer." |
| Buchungen am Sachverhalt | flach, ohne Pager | ohne `case` | „Noch keine Buchung." (neutral) |
| Export-Bucket | flach mit Pager und Sortierung | voll | je Bucket ein eigener Satz, „Nichts exportierbar." mit `done` |

## Stories

Titel `v3/Entitäten/Buchungssatz/JournalEntryList`.

| Story | Beweist |
|---|---|
| `InBatch` | Job 1: Abschnitte je Beleggruppe mit Zählern, Zeile führt in den Satz |
| `AtCase` | Job 2: flach, zwei Sätze, ohne Sachverhalts-Spalte |
| `InBucket` | Job 3: flach mit Pager, Sortierung und der Zeilenaktion „stornieren" |
| `Empty` | die drei Leerfälle nebeneinander — leer, leer mit `done`, leer am Sachverhalt |
| `Filtered` | leer **nach** Filter, mit Zusammenfassung und Weg zurück |
| `LoadingAndError` | Kopf und Spaltenkopf bleiben stehen; der Fehler hat einen Weg |

Nicht anwendbar: eine eigene „gefüllt"-Story — die drei Jobs sind sie.

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

- [ ] Die Abschnitte stehen in der Reihenfolge von `DOCUMENT_GROUP_LABEL`, jeder mit seinem Zähler (Story `InBatch`)
- [ ] Ohne Beleggruppe steht als letzter Abschnitt, nicht als erster (Story `InBatch`)
- [ ] Am Sachverhalt fehlt die Spalte „Sachverhalt" (Story `AtCase`, DOM)
- [ ] Der Pager erscheint nur in der flachen Form (Story `InBucket` gegen `InBatch`)
- [ ] Die drei Leerfälle sagen drei verschiedene Sätze; der Erfolg trägt `done` (Story `Empty`)
- [ ] Leer nach Filter nennt den Filter und den Weg zurück (Story `Filtered`)
- [ ] Ersetzt `BuchungenTabelle` ohne Funktionsverlust außer den drei bewusst gestrichenen Spalten (0175)

## Offene Fragen

1. Der Stapel hat p90 343 und max 493 Sätze — Abschnitte **und** Pager gehen
   nicht (0149). — ohne Antwort: **Abschnitte ohne Pager**, und was zu viel
   wird, nimmt der Filter (Herkunft, Weg nach DATEV) weg; die Seite kann
   stattdessen flach und geblättert zeigen, wenn sie den Filter „Beleggruppe"
   anbietet.
2. Bekommt die Liste eine Summe im Kopf? — ohne Antwort: **nein**, die Summe
   gehört dem Stapel, nicht seiner Liste; der Aufrufer setzt sie in `head.meta`.

## Gebaut (2026-09-15)

`JournalEntryList.tsx` mit der Liste und `journalEntriesByDocumentGroup()`, im
Barrel. Die Liste hält vier Entscheidungen fest und rechnet sonst nichts: der
Zeilenschlüssel ist `entryId`, die Spalten kommen aus 0175, die Abschnitte
folgen `DOCUMENT_GROUP_LABEL`, und Abschnitte schließen einen Pager aus (die
Form ist dieselbe Unterscheidung wie in `DataTable`).

**Ein Fund aus dem Bau, sofort behoben:** `JournalEntryCell` hängte den Betrag
hinter die Konten, und die Zeile hat eine eigene Betragsspalte — die Zahl stand
zweimal (D24). `JournalEntryCell` hat dafür jetzt `showAmount`; der Spaltensatz
setzt sie auf `false` (Nachtrag auf 0044, erledigt).

Gemessen (CDP, Storybook 6107, 1400 px):

| Story | Beobachtung |
|---|---|
| `InBatch` | vier Abschnitte in der Reihenfolge der Wortliste — Ausgangsrechnungen · Eingangsrechnungen · Bank —, „Ohne Beleggruppe" zuletzt; Zähler „1 Satz" / „2 Sätze"; fünf Zeilen, jede ein Link in den Satz |
| `AtCase` | flach, zwei Zeilen, **keine** Spalte „Sachverhalt", kein Pager |
| `InBucket` | Pager „1–25 von 343" mit Seiten 1 · 2 · … · 14, Sortierpfeil an „Datum", Zeilenaktion „Stornieren" in Warnfarbe |
| `Empty` | drei verschiedene Sätze; „Nichts exportierbar." trägt `done` |
| `Filtered` | „Keine Treffer für …" mit dem Filtertext und „Filter zurücksetzen" |
| `LoadingAndError` | Kopf und Spaltenkopf bleiben stehen; der Fehler nennt seine Meldung |

Kein Überlauf in allen sechs Stories. `pnpm typecheck`, `check:classes`,
`check:language`, `check:when` und `pnpm build` grün; Screenshots angesehen.
Abnahme durch einen anderen Agenten steht aus.

**Offene Frage 1 bleibt offen** (Abschnitte gegen Pager beim Stapel): gebaut
ist beides, die Seite entscheidet. Der Default steht in der Spec.

## Nachtrag 2026-09-15 — Mindestbreite

Beim Bau der Zahlungskonten-Listen (0181/0182) bei 1000 px gemessen: eine
Tabelle, deren Spalten überwiegend `fr`-Spuren sind, quetscht sich zusammen,
bis Namen einen Buchstaben je Zeile tragen — `DataTable` rechnet ihren Boden
aus den Spaltenbreiten, und `minmax(0, 1fr)` steuert dazu nichts bei (0147,
Befund L-273). `JournalEntryList` hat deshalb jetzt `minWidth` mit Vorgabe
1180; darunter scrollt die Tabelle in ihrem Rahmen, die Seite nicht.
