# 0120 · Beleg-Fakten: DATEV-Ablage, Konfidenz, manuelle Korrektur

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-08, fremde Abnahme steht aus |
| Stufe | `entities/source-document/` — Nachtrag an `SourceDocumentFacts` (0076) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: DATEV-Ablage und Einordnungs-Konfidenz sind Ludwig-Fachbegriffe |
| Quelle | Anfrage `ludwig-manager` 2026-09-08 nach dem Umbau von `documents/[sourceDocId]` (App-Commit `c9fca3aa`); Entitätsprofil `docs/entitaeten/source-document.md` Ränge 13, 14, 16; Seitenprofil `docs/seiten/beleg-detail.md` Rang 5 |
| Ersetzt | die `FieldList`, die die App heute unter die zwei Spalten setzt |
| Setzt voraus | `SourceDocumentFacts` (0076, fertig) — und für zwei der drei Punkte **L-217** |
| Spec von / am | Claude, 2026-09-08 |

## Warum das ins Set gehört und nicht in die Seite

Die Frage von `ludwig-manager` war: kleines Paket an 0076, oder bleibt es
App-Komposition? Drei Gründe für das Set, alle aus dem, was schon
entschieden ist:

1. **Das Entitätsprofil führt alle drei mit Rang und Form** — Konfidenz 13
   (100 % gefüllt, ab M), manuell korrigiert 14 (3 %, ab L), DATEV-Ablage 16
   (65 %, ab L). Ein Datenpunkt mit Rang und Form ist Sache der Form.
2. **`SourceDocFactsCard` zeigt sie heute schon** (Profil §4: „Konfidenz,
   DATEV-Ablage"), und 0076 ist genau deren Ablösung. Eine `FieldList`
   daneben löst sie nicht ab, sie verdoppelt sie.
3. **Das Seitenprofil nennt die DATEV-Ablage in Rang 5** („Kann ich den
   einen falschen Wert hier korrigieren?") — zusammen mit Belegdatum,
   Einordnung und Erledigung, die alle drei schon in `SourceDocumentFacts`
   stehen. Ein Wert dieser Reihe, der woanders wohnt, ist die zweite
   Wahrheit, gegen die die Dreiteilung gebaut ist.

**Kein neuer Baustein**: `spec-schreiben` §3 Regel 2 — ein `@when` deckt den
Fall zu vier Fünfteln, das Fehlende ist eine Designentscheidung, die
wiederkommt (Karte **und** Drawer zeigen dieselben Fakten).

## Was dazukommt

| Punkt | Quelle | Ab Form | Darstellung |
|---|---|---|---|
| Einordnungs-Konfidenz (`classConfidence`) | steht im VM | M | Eine **Zahl** mit Prozentzeichen, kein Badge: die Achse `konfidenz` gehört dem Buchungsvorschlag (L-80, entschieden mit 0070) |
| Manuell korrigiert (`classOverriddenAt`) | **fehlt im VM → L-217** | L | Ein Datum mit Wort: „Einordnung am 30.08.2026 von Hand korrigiert." Der Spaltenkommentar sagt „is not null → Hinweis", also ist die Zeile nur da, wenn der Wert steht |
| DATEV-Ablage (`datevRefSystem` · `datevRefFolder` · `datevRefId`) | **fehlen im VM → L-217** | L | Eine Zeile, drei Teile mit Trenner; die Kennung `mono` (sie wird Zeichen für Zeichen gelesen). Fehlt sie ganz (35 %), fehlt die Zeile |

## Schnittstelle

Eine Prop, nicht drei — die drei Punkte sind **eine** Frage („woher kommt
die Einordnung, wo liegt der Beleg"), und drei Booleans wären der Zuschnitt,
den §5 verbietet:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `provenance` | `boolean` | nein, Vorgabe `false` | Zeigt die drei Punkte unter den generischen Zeilen. `false` in der Karte (M), `true` im Detail und im Drawer (L) | `WithProvenance` |

Die Werte kommen aus `document`, nicht als eigene Props: sie stehen im VM
(bzw. werden es mit L-217), und eine Form, die ihre Werte von außen bekommt,
obwohl sie die Zeile schon hat, ist eine Durchreiche.

**Kann bewusst nicht:**

- **Die Einordnung ändern.** Das ist eine Folgeaufgabe zu 0071, wie schon in
  `beleg-detail.md` Rang 5 vermerkt.
- **Die DATEV-Meta importieren.** Das ist `DatevMetaImportPanel`, ein Menüweg
  der Seite (`beleg-detail.md`, Nebenjobs).
- **Die Konfidenz einfärben.** Sie ist eine Zahl ohne Achse (L-80).

## Stories

Abgeleitet nach §6: 0 neue Zustände (die fünf hat 0076) + 1 Layout-Boolean
(`provenance`) + 1 Rand (alle drei leer — die Zeilen fehlen, es steht kein
Gedankenstrich da) = **2**.

| Story | Beweist |
|---|---|
| `WithProvenance` | Die drei Zeilen unter den generischen, in der Ordnung des Profils |
| `ProvenanceEmpty` | 35 % ohne DATEV-Ablage und 97 % ohne Korrektur: die Zeilen **fehlen**, statt leer dazustehen |

## Abnahmekriterien (variabler Block)

- `provenance` verhält sich wie Zeile 1 der Schnittstelle (`WithProvenance`)
- Die Konfidenz steht als Zahl ohne Badge und ohne Farbe (`WithProvenance`)
- Eine fehlende DATEV-Ablage lässt die Zeile weg, sie zeigt keinen Strich
  (`ProvenanceEmpty`)
- „Manuell korrigiert" erscheint nur bei gesetztem Wert (`ProvenanceEmpty`)
- Die Kennung der Ablage ist `mono` (`WithProvenance`)
- Ersetzt die `FieldList` unter den zwei Spalten in
  `documents/[sourceDocId]` ohne Funktionsverlust

## Offene Fragen

1. Trägt die DATEV-Ablage ein Etikett je Teil (System · Ordner · Kennung)
   oder eine Zeile mit Trennern? *Ohne Antwort: eine Zeile mit `·`, wie die
   Einordnung sie schon setzt.*
2. Wartet der Bau auf L-217 oder wird die Konfidenz vorgezogen? *Ohne
   Antwort: warten — zwei Drittel der Aufgabe hängen daran, und eine Form,
   die einen Punkt zeigt und zwei schuldig bleibt, wird zweimal abgenommen.*

## Ausbau

`provenance` ist der Platz, an dem später die Herkunft **je Feld** stünde
(`field_provenance`, heute im Schema unbeschrieben — L-214). Käme sie, würde
aus dem Boolean ein Enum (`"summary" | "per-field"`); vorher nicht.

## Gebaut 2026-09-08

`provenance?: boolean` an `SourceDocumentFacts`; die drei Punkte stehen als
vierter Block „Herkunft und Ablage" unter den allgemeinen Zeilen. Zwei
Stories, beide im Browser gemessen.

**Jeder Punkt entscheidet für sich, ob er eine Zeile bekommt** — das ist die
eine Entscheidung dieses Nachtrags:

| Punkt | Wann eine Zeile | Warum |
|---|---|---|
| Erkennungssicherheit | immer (100 % gefüllt) | Eine **Zahl** mit Prozentzeichen, kein Badge: die Achse `konfidenz` gehört dem Buchungsvorschlag (L-80) |
| Von Hand korrigiert | nur bei gesetztem Wert (3 %) | Der Spaltenkommentar sagt es so. Eine leere Zeile machte aus „niemand hat es angefasst" ein „wir wissen es nicht" |
| DATEV-Ablage | nur wenn mindestens ein Teil steht (65 %) | Drei Spalten, **eine** Zeile mit `·` — sonst müsste der Leser sie zusammensetzen. Ein Beleg ohne Ablage ist kein Beleg mit unbekannter Ablage |

**Gemessen** (`scripts/cdp.mjs`):

| Story | Gemessen |
|---|---|
| `WithProvenance` | Block da, „Erkennungssicherheit 94 %", „Von Hand korrigiert", „DATEV-Ablage DUO · 2026/08 · DOC-4471-0088" |
| `ProvenanceEmpty` | Block da mit **einer** Zeile: nur die Sicherheit. Kein Gedankenstrich, keine leere Zeile |
| `Filled` | Ohne die Prop kein Block — die Karte (M) bleibt, wie sie war |

**Die Felder stehen vorerst lokal.** `classOverriddenAt` und die drei
`datevRef*` sind mit App-Commit `ae0e1a63` gebaut (L-217, erledigt), aber der
Spiegel ist bis zur Migration eingefroren. Sie liegen deshalb in
`SourceDocumentVM` neben den vier anderen Feldern, die dort aus demselben
Grund stehen, und fallen beim nächsten `pnpm sync:ludwig` — vermerkt in
`docs/ludwig/README.md`.

Offene Frage 1 ist damit beantwortet (eine Zeile mit `·`, wie die Vorgabe);
Frage 2 hat sich erledigt, weil L-217 vor dem Bau kam.

**Was die App wissen muss:** nur `sourceDocumentFromDispatch` füllt die vier
Felder, die Listen-Mapper nicht. Das reicht — `provenance` ist eine Prop der
Detailform, und in der Liste hat keiner der drei Punkte einen Rang unter 13.
