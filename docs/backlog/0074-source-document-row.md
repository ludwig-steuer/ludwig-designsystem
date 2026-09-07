# 0074 · Beleg — Zelle, Einordnung, Zeile

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/source-document/` — Familie `SourceDocument.tsx` (`SourceDocumentCell`, `SourceDocumentClass`, `SourceDocumentRow`) plus das Registry-Modul `source-source-document-detail.ts` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Belegart, Belegkategorie, Belegrichtung und Beleg-Erledigung sind Ludwig-Fachbegriffe mit eigenen Registry-Achsen |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md` (Status `geprüft`), Abschnitte „Die eine Regel", „Datenpunkte" Rang 1–7, „Formen" Zeilen 1–3 · Owner-Anfrage 2026-09-04 |
| Ersetzt | `InvoiceNumberCell`, `PartnerCell`, `ClassificationStack`, `StatusCell`, `CompletedCheck` (alle in `[year]/documents/page.tsx`), die Zeilen von `StuckDocumentsTable`, `BelegeTab`, `DocumentInbox`, `InboxInvoiceSubmissionList`, `ChildDocsCard` |
| Blockiert | 0070 (Spaltensätze), 0071 (View und Karte), und damit alle sechs Beleg-Listen |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

Eine Sachbearbeiterin sieht einen Beleg in einer Liste und muss ihn zwischen
seinen Geschwistern wiedererkennen: *von wem, was für ein Ding, wie viel,
wann, ist er durch.* Heute gibt es dafür sechs verschiedene Zeilen in sechs
Listen — und alle sechs nehmen an, ein Beleg sei eine Rechnung. Für 16 % des
Bestands (Vertrag, Kontoauszug, Kreditkartenabrechnung,
Reisekostenabrechnung, Sonstige) stimmt das nicht: sie haben keine
Rechnungsnummer, keinen Bruttobetrag, und in `StuckDocumentsTable` fehlt
ihnen sogar das Belegdatum.

Diese Aufgabe baut die **eine** Zeile — und mit ihr die Mechanik, die den
Unterschied trägt, ohne sie in `if`-Zweige zu gießen.

## Die tragende Regel

Aus dem Profil, wörtlich:

> Die **Reihenfolge** der Datenpunkte ist über alle Belegarten dieselbe.
> Welches Feld einen Rang füllt, entscheidet die Ausprägung — über eine
> **Registry**, nicht über ein `if (isInvoice)`. Liefert eine Ausprägung für
> einen Rang keinen Füller, greift der **Rückfall** dieses Rangs; gibt es
> auch den nicht, entfällt die Zeile. Es gibt kein „—" für ein Feld, das es
> bei dieser Belegart gar nicht gibt.

Zwei Dinge trennt die Spec dabei sauber, und das löst zugleich Befund B9
(Diskriminator und Subtyp-Zeile widersprechen sich in 10 von 384 Fällen):

| Frage | Wer antwortet | Warum |
|---|---|---|
| Wie **heißt** die Belegart? | `sourceDocType` + Rückfall `classDocumentForm`, über `sourceDocTypeLabel()` | Das ist ein reines Label. `sourceDocTypeLabel(null)` heißt „Beleg", nie „Rechnung" — die Funktion gibt es schon. |
| Welches Feld **füllt** Rang 3 und 5? | das `detail`-Objekt — **aber nur, wenn es zum Diskriminator passt** | Beide Quellen lügen, jede auf ihre Art. Siehe unten. |

**Warum beide zustimmen müssen** (Befund B9 / L-35, mit der App-Seite geklärt
am 2026-09-04). Die 10 Widersprüche sind nicht einer, sondern zwei Fälle mit
entgegengesetzter Wahrheit — nachgerechnet:

| Fall | Bestand | Wer hat recht | Wenn man dem anderen glaubt |
|---|---|---|---|
| `sourceDocType = "invoice"`, **keine** Rechnungs-Zeile | 7, alle vom 2026-07-31 (vor dem F87-Kern), alle erledigt | die **Zeile**: es gibt nichts zu zeigen | ein leerer Rechnungsblock mit vier Gedankenstrichen |
| `sourceDocType = "other"`, **mit** Rechnungs-Zeile | 3, **alle drei mit gesetztem `classOverriddenAt`** — ein Mensch hat die Belegform von `invoice` auf `other` korrigiert, die Rechnungs-Zeile blieb stehen (App-seitig `P26`) | der **Diskriminator**: er ist die Korrektur, die Zeile ist der Rest | Nummer und Brutto einer Einordnung, die ein Mensch ausdrücklich verworfen hat |

Daraus die Regel, konservativ und in einer Zeile:

> Der Ausprägungs-Block erscheint **nur, wenn Diskriminator und Subtyp-Zeile
> übereinstimmen**. Widersprechen sie sich, zeigt die Form allein die
> Supertyp-Punkte — sie behauptet nichts, was eine der beiden Quellen
> bestreitet.

Technisch trägt das die Registry selbst: jeder Eintrag nennt den
`source_doc_type`, zu dem er gehört, und die Zustimmung ist ein Vergleich —
kein Zweig je Belegart.

```ts
const entry  = detail ? SOURCE_DOCUMENT_DETAILS[detail.kind] : null;
const agrees = entry?.type === document.sourceDocType;
```

Damit gibt es in keiner Komponente ein `isInvoice`. Es gibt `agrees` — und
wo es nicht zutrifft, greift derselbe Rückfall wie bei einem Beleg ganz ohne
Ausprägung.

## Einordnung

- **Wiederverwenden:** kein `@when` in `src/ui/v3` deckt den Fall.
  `ClarificationCell`/`ClarificationRow` sind die formgleiche Familie einer
  **anderen** Entität; `AccountCell` nennt ein Konto, nicht einen Beleg.
  `SourceDocumentFacts` (0052) deckt die Größe M, nicht XS/S — und wird in 0076
  umgebaut.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — `ui-repraesentationen.md` §1
  führt für den Beleg die Formen Zelle, Zeile und Liste, und keine
  vorhandene Form deckt sie ab.
- **Zuschnitt:** **eine Datei, drei tragende Exporte** (§4 „Familie"):
  `SourceDocumentCell`, `SourceDocumentClass` und `SourceDocumentRow` teilen
  das Markup-Vokabular der Beleg-Identität, die Zeile setzt beide anderen
  zusammen, und keiner von ihnen trägt eigenen Zustand. *Nachtrag 2026-09-05:
  gebaut sind sieben — dazu kamen `SourceDocumentCompletion`,
  `sourceDocumentIdentifier`, `clipMiddle` und der Typ `SourceDocumentVM`, alle
  vier mit `@when`/`@instead` und von 0075/0076 mitbenutzt. Die drei sind die
  Formen; die vier sind ihr geteiltes Handwerkszeug.* Vorbild `Clarification.tsx` (0059: Cell, Row,
  List in einer Datei). Dazu **ein zweites Modul** `source-source-document-detail.ts` — die
  Registry ist kein Markup und wird von 0076 mitbenutzt; sie in `SourceDocument.tsx`
  zu legen hieße, `SourceDocumentFacts` importiert die Zeile.
- **Setzt auf:** `MonoCell`, `LongText`, `Amount`, `Time`, `StatusBadge`,
  `Badge`, `Row` (`Table.tsx`).

## Schnittstelle

### `source-source-document-detail.ts` — die Registry

```ts
/**
 * Was eine Ausprägung zu den gemeinsamen Rängen beiträgt.
 * Ein neuer Belegtyp bekommt hier einen Eintrag, keinen Sonderpfad.
 */
export type SourceDocumentDetail =
  | { kind: "invoice";  number?: string | null; gross?: number | null;
      currency?: Currency | null; processingStatus?: string | null }
  | { kind: "contract"; subject?: string | null; amount?: number | null;
      currency?: Currency | null; contractType?: string | null };
```

Es gibt genau **zwei** Einträge — Rechnung und Vertrag, die beiden Belegarten
mit eigenen Fachfeldern. Kontoauszug, Kreditkartenabrechnung und
Reisekostenabrechnung bekommen keinen: sie sind Container, ihre Struktur
liegt am Import-Batch und an den Kind-Belegen (App-Seite 2026-09-04, L-38;
seit dem 2026-09-04 auch als Punkt 4 im GLOSSARY-Eintrag „Source document
supertype & specializations"). Ihre Gruppen-Eigenschaft hängt an der
Relation und wird in 0076 gezeigt.

| Registry-Eintrag | `type` (der Diskriminator, zu dem er gehört) | `identifier(d)` → Rang 5 | `measure(d)` → Rang 3 |
|---|---|---|---|
| `invoice` | `"invoice"` | `number`, mono gesetzt | `gross` + `currency` |
| `contract` | `"contract"` | `subject`, mono **nicht** gesetzt (ein Satz, keine Nummer) | `amount` + `currency` |
| *kein `detail`* **oder** `detail` widerspricht dem Diskriminator | — | `null` → Rückfall Dateiname | `null` → **die Stelle bleibt leer** |

Beide Funktionen geben `null` zurück, wenn das Feld fehlt. Die Registry
kennt **keine** UI: sie liefert Werte, nicht JSX — sonst könnte 0076 sie
nicht mit einem dritten Eintrag (`facts`) erweitern, ohne die Zeile
anzufassen.

### `SourceDocumentVM`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `id` | `string` | ja | `client_source_docs.id` | `Gefuellt` |
| `fileName` | `string` | **ja** | Rang 1b. In der Datenbank `NOT NULL` und in **jeder** Ausprägung zu 100 % da — deshalb Pflicht, nicht optional. Er ist der letzte Rückfall der Kennung. | `Ausprägungen` |
| `sourceDocType` | `SourceDocType \| "declaration" \| null` | nein | Diskriminator. Die Union ist um `declaration` geweitet — der DB-CHECK und `SOURCE_DOC_TYPE_LABELS` kennen den Wert, der TS-Typ nicht (Befund B10). | `Ausprägungen` |
| `classDocumentForm` | `string \| null` | nein | Rückfall-Schlüssel des **Labels**: trägt der Beleg nur `other`/NULL, gewinnt die Belegform („Sammel-PDF", „Lohnabrechnung"). | `Ausprägungen` |
| `counterparty` | `string \| null` | nein | Rang 1. Je Ausprägung 50–95 % gefüllt — fehlt er, führt der Dateiname. | `Ausprägungen`, `Rand` |
| `detail` | `SourceDocumentDetail \| null` | nein | Rang 3 und 5. Der Aufrufer setzt es, **wenn die Subtyp-Zeile existiert**; gezeigt wird es nur, wenn es zum Diskriminator passt (siehe „Warum beide zustimmen müssen"). | `Ausprägungen` |
| `documentDate` | `string \| null` | nein | Rang 4, ISO-Tag. NULL bleibt NULL — kein Rückfall auf den Upload-Tag (GLOSSARY). | `Gefuellt` |
| `receivedDate` | `string` | ja | Rang 7, `NOT NULL`. Sortierschlüssel der Belegliste. | `Gefuellt` |
| `completedAt` | `string \| null` | nein | Zustand. `null` = steht noch offen. | `Zustände` |
| `completedVia` | `SourceDocCompletionVia \| null` | nein | Grund der Erledigung. `null` **bei gesetztem `completedAt`** heißt „erledigt, Grund unbekannt" (61 von 384) — nicht „offen". Achse `beleg_erledigung`. | `Zustände` |
| `completedReason` | `string \| null` | nein | Freitext im `title` der Marke, gekürzt bei 280 Zeichen. | `Zustände` |
| `docCategory` | `DocCategory \| null` | nein | Einordnung, Achse `beleg_kategorie`. Nur zu 46 % gefüllt (B3) — NULL zeigt **nichts**, nicht „unklassifiziert". | `Einordnung` |
| `docDirection` | `DocDirection \| null` | nein | Einordnung, Achse `beleg_richtung`. NULL heißt „nicht anwendbar" (GLOSSARY) — kein Badge. | `Einordnung` |
| `classDocumentKind` | `string \| null` | nein | Beleg-Charakter. Wird **nur gezeigt, wenn ≠ `original`** — 83 % tragen `original`, das ist der Normalfall und kein Hinweis wert. Keine Achse (B5) → Label über `formatDocumentKind()`, als `Badge`, nicht als `StatusBadge`. | `Einordnung` |
| `collectionKind` | `string \| null` | nein | Dokumentgruppe, Achse `dokumentgruppe`. Nur am Sammeldokument. | `Einordnung` |
| `caseNumber` / `caseHref` | `string \| null` | nein | Rang 6, als Inline des Sachverhalts. | `ImEinsatz` |
| `href` | `string \| null` | nein | Ohne ihn ist die Zeile kein Link. | `Gefuellt` |

Typen aus `src/ludwig/modules/source-docs/domain/`: `SourceDocType`,
`DocCategory`, `DocDirection`, `sourceDocTypeLabel()`,
`formatDocumentKind()`, `DOCUMENT_FORM_LABEL`. `Currency` aus
`src/ludwig/shared/money`. GLOSSARY: englisch im Code (`document`,
`counterparty`, `doc direction`), deutsch im Label (Beleg, Gegenpart,
Eingangsrechnung).

### Zwei Dinge, die es in `src/ludwig/` noch nicht gibt

Beide werden lokal definiert, strukturell deckungsgleich, mit Kommentar und
Register-Eintrag — nicht erfunden, sondern gemeldet (`spec-schreiben` §5):

| Was | Warum lokal | Register |
|---|---|---|
| `SourceDocCompletionVia = "booking" \| "case_closed" \| "import" \| "superseded" \| "manual" \| "no_booking_required"` | Der DB-CHECK auf `client_source_docs.completed_via` führt genau diese sechs; ein TS-Typ dafür existiert nirgends | L-47 |
| Achse `beleg_erledigung` in der Status-Registry | Es gibt sie noch nicht — die App zeigt die Erledigung als Häkchen mit Tooltip (V7/V11 verletzt). Die Achse trägt die sechs Werte **plus `open`** für `completedAt IS NULL`; `open` ist kein Wert der Spalte, sondern ihr Fehlen | L-41 |

Die Achse gehört in `src/ui/v3/patterns/status-registry.ts` — **eine geteilte
Datei.** Sie wird als eigener Block angehängt, nicht einsortiert, und nur
dieser Block wird gestaget.

**Was die Komponenten bewusst nicht können:**

- **Nichts sortieren, nichts filtern, nichts blättern.** Sechs Zeilen sind
  keine Liste; die Liste ist 0070 (`DataTable`).
- **Keine Aktion.** Erledigen, neu anstoßen, einreichen — alle heutigen
  Zeilen-Aktionen bleiben beim Aufrufer. Er setzt sie neben die Zeile; A12:
  Verhalten kommt später als Callback, nicht heute als Boolean.
- **Kein `—` für ein fehlendes Maß.** Ein Kontoauszug hat keinen Betrag; die
  Stelle bleibt leer. Der Gedankenstrich bleibt den Fällen vorbehalten, in
  denen ein Wert *fehlt*, obwohl es ihn geben müsste (`documentDate`).

## Verhalten

**Server-Component** — keine Interaktion außer Links, kein Zustand.
`SourceDocumentRow` hat bewusst **kein** `Disclosure`: anders als
`ClarificationRow` gibt es beim Beleg nichts zum Aufklappen, was nicht schon
Karte oder Drawer wäre.

Kürzung, aus den p90-Längen des Profils:

| Feld | Grenze | Art | Vollständig zu sehen in |
|---|---|---|---|
| Gegenpart | 36 Zeichen | Ende abschneiden | `title` |
| Dateiname (Zeile) | 48 Zeichen | **in der Mitte**, Endung bleibt lesbar | `title` |
| Erledigungsgrund | 280 Zeichen | Ende | `title` der Marke |

Die Mitten-Kürzung ist eine lokale Funktion in `SourceDocument.tsx` mit
`ponytail:`-Kommentar — `LongText` klappt auf (`<details>`), das ist für
einen Dateinamen in einer Tabellenzeile falsch. Sobald ein zweiter Aufrufer
sie braucht, wird sie eine Primitive.

Die **Rückfallkette der Kennung**, wie sie vier Listen heute schon bauen:
`detail.identifier()` → `fileName` → `id.slice(0, 8)`. Die letzte Stufe ist
theoretisch (`fileName` ist `NOT NULL`), steht aber da, weil `BelegeTab` sie
heute hat.

Zustände: **gefüllt** ist der einzige anwendbare. Eine Zeile lädt nicht (der
Aufrufer zeigt `Skeleton`), ist nie leer (dann gäbe es sie nicht) und hat
keinen Fehlerfall (sie ruft nichts). Begründung gehört in die Spec, nicht in
eine leere Story.

## Stories

Titel `v3/Entitäten/Beleg/SourceDocument`.

| Story | Beweist |
|---|---|
| `Gefuellt` | Eine Rechnungszeile mit allem: Gegenpart, Nummer, Brutto, beide Daten, Sachverhalt, Erledigt |
| `Ausprägungen` | **Die Kernstory.** Alle sieben `sourceDocType`-Werte plus NULL untereinander — mit Subtyp-Zeile, ohne, und die zwei B9-Ausreißer: `invoice` ohne `detail`, und `other` **mit** `detail.kind = "invoice"`. **Beide zeigen dasselbe** — Dateiname als Kennung, leere Maß-Stelle —, und die Story sagt in ihrem Kommentar, warum das aus entgegengesetzten Gründen richtig ist |
| `Einordnung` | `SourceDocumentClass` allein: alle vier Achsen, dazu die drei NULL-Fälle (Kategorie fehlt, Richtung nicht anwendbar, Charakter = `original`) — jeder zeigt **nichts**, nicht „unbekannt" |
| `Zustände` | Die Erledigung über alle sechs `completed_via`-Werte plus „Offen", mit dem Grund im `title` |
| `Zelle` | `SourceDocumentCell` allein, in fremdem Markup (ein Satz, eine Buchungszeile) — mit und ohne `href` |
| `Rand` | Was die Kürzung tut: 139-Zeichen-Dateiname, 56-Zeichen-Gegenpart, Beleg ohne Gegenpart, ohne Belegdatum, ohne alles außer Datei und Eingang |
| `ImEinsatz` | Sechs Zeilen untereinander in einer `Card` — der Beleg-Tab eines Sachverhalts, gemischte Belegarten |

Sieben Stories: 1 Zustand (nur „gefüllt", die anderen vier oben begründet
ausgeschlossen) + 1 je Enum-Achse (`Ausprägungen`, `Einordnung`, `Zustände`)
+ 1 je Zusatz-Export (`Zelle`) + 1 Rand (die Komponente kürzt) + 1
„im Einsatz". Keine Callback-Story — es gibt keinen Callback.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| ~~Kontoauszug, Kreditkartenabrechnung, Reisekostenabrechnung als eigene Ausprägung~~ | — | **Entfällt.** Die App-Seite hat am 2026-09-04 entschieden: keine Subtyp-Tabellen, absichtlich — die drei sind Container, keine Belege mit eigenen Fachfeldern (L-38). Sie bekommen nie einen `SourceDocumentDetail`-Eintrag; ihre Gruppen-Eigenschaft hängt an der Relation und wird in 0076 gezeigt |
| Aktion an der Zeile (erledigen, neu anstoßen, einreichen) | optionaler `actions?: ReactNode`-Slot | wenn 0070 die erste Liste mit Massenaktion baut; bis dahin setzt der Aufrufer sie daneben |
| Die Zustimmungs-Regel wieder fallen lassen | nichts — der Vergleich verschwindet | wenn `P26` drüben entschieden ist (Belegform-Override räumt die Rechnungs-Zeile auf) und `L-35` null Widersprüche zählt. Bis dahin ist die Regel billig und still |
| Auswahl (Checkbox) | `SelectionCell` des Aufrufers, nicht eine Prop hier | mit 0070 und `DataTable`s `SelectionScope` |
| Teilbeleg-Zähler an der Zeile | `childCount?: number` | wenn ein Screen Sammel-PDFs listet — 97 % haben keine Kinder, heute wäre die Zahl fast immer 0 |

## Für den Bau

| | |
|---|---|
| Dateien | `src/ui/v3/entities/source-document/SourceDocument.tsx` (drei Exporte) und `source-document-detail.ts` (die Registry, kein JSX) — dazu `SourceDocument.stories.tsx` |
| Barrel | `src/ui/v3/index.ts`, in den vorhandenen Abschnitt `/* Beleg — … (0052) */`; dessen Kommentar auf `(0052, 0074)` erweitern. Exportiert werden `SourceDocumentCell`, `SourceDocumentClass`, `SourceDocumentRow`, `SourceDocumentDetail`, `SourceDocumentVM` |
| CSS | Präfix **`v2doc`** — er gehört der Entität, nicht der Komponente, und ist mit 0052 schon vergeben (`.v2doc__ident`, `__orig`, `__origskel`, `__h`, `__limit`, `__prose`). Neue Klassen als `.v2doc__row`, `.v2doc__cell`, … in einem **eigenen Abschnitt am Ende** von `src/styles/v3.css`, überschrieben mit `0074`. Nicht einsortieren: an dieser Datei arbeiten mehrere Sitzungen gleichzeitig |
| Reihenfolge | zuerst `source-document-detail.ts` (Union + Registry + Zustimmungsregel), dann `SourceDocumentCell`/`Class`, dann `SourceDocumentRow`. Die Zeile setzt Zelle und Einordnung zusammen — nicht andersherum |
| Blockiert nichts von | 0075 und 0076 hängen an dieser Datei, aber nicht am Storybook-Durchlauf: sie können gebaut werden, sobald `source-document-detail.ts` steht |
| Nicht anfassen | `SourceDocumentDrawer.tsx` und `SourceDocumentFacts.tsx` — die zieht 0076 nach |

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

- [ ] **`grep -n "isInvoice\|=== \"invoice\"" src/ui/v3/entities/source-document/` findet nichts** außer den Registry-Einträgen in `source-source-document-detail.ts`
- [ ] Ein Beleg mit `sourceDocType = "invoice"` **ohne** `detail` zeigt kein leeres Rechnungsfeld, sondern den Dateinamen als Kennung und keine Maß-Stelle (Story `Ausprägungen`)
- [ ] Ein Beleg mit `sourceDocType = "other"` **mit** `detail.kind = "invoice"` zeigt **weder** Nummer **noch** Brutto — die Belegform wurde korrigiert, die Rechnungs-Zeile ist der Rest (Story `Ausprägungen`)
- [ ] Der Vergleich ist **generisch**: er liest `type` aus dem Registry-Eintrag, er zählt keine Belegarten auf
- [ ] `sourceDocType = null` heißt „Beleg", nie „Rechnung" (Story `Ausprägungen`)
- [ ] `docCategory = null`, `docDirection = null` und `classDocumentKind = "original"` erzeugen **kein** Badge (Story `Einordnung`)
- [ ] Die Erledigung steht als **Wort**, nicht als Häkchen (V7, V11) — über die neue Achse `beleg_erledigung`, nicht über eine lokale Label-Map (Story `Zustände`)
- [ ] `completedAt` gesetzt und `completedVia` `null` zeigt „Erledigt", nicht „Offen" (Story `Zustände`)
- [ ] Ein 139-Zeichen-Dateiname wird in der Mitte gekürzt, die Endung bleibt lesbar, das Ganze steht im `title` (Story `Rand`)
- [ ] Kennung fällt in dieser Kette zurück: Ausprägung → Dateiname → Kurz-ID (Story `Ausprägungen`)
- [ ] Ersetzt `InvoiceNumberCell`, `PartnerCell`, `ClassificationStack`, `StatusCell` und `CompletedCheck` aus `[year]/documents/page.tsx` ohne Funktionsverlust
- [ ] Tut bewusst nicht: sortieren, filtern, blättern, handeln — der Aufrufer löst es mit `DataTable` (0070) und eigenen Knöpfen

## Befunde beim Schreiben der Spec

- **B10 — `SourceDocType` fehlt der Wert `declaration`.** Der DB-CHECK auf
  `client_source_docs.source_doc_type` erlaubt sieben Werte,
  `SOURCE_DOC_TYPE_LABELS` führt sieben („Erklärung"), der TS-Typ in
  `document-form-mapping.ts` führt sechs. Die Spec weitet die Union lokal
  und begründet es. *Nachtrag 2026-09-04: von der App-Seite als Absicht
  bestätigt — die Union ist der Typ des Mapping-Ergebnisses, nicht des
  Werteraums; lesend sind sieben Werte richtig. L-44 erledigt.*
- **B14 — `completed_via` hat keinen TS-Typ.** Der DB-CHECK führt sechs
  Werte, `src/ludwig/` keinen davon. 0074 definiert
  `SourceDocCompletionVia` lokal; Register-Eintrag L-47.

## Abnahme

Geprüft gegen Spec, Profil und Code, ohne Chatverlauf. Stand `000f2ad`
(die Dateien der Familie sind seither unverändert: `git diff 000f2ad..HEAD --
src/ui/v3/entities/source-document/` ist leer). Browser: Storybook auf
`:6107`, alle sieben Stories aufgerufen und im DOM gemessen statt am
Quelltext geraten.

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, 2026-09-05. `pnpm build` **nicht ausgeführt** — der Abnahme-Auftrag verbietet ihn, weil mehrere Sitzungen parallel arbeiten; ersatzweise laden alle Stories der Familie im laufenden Storybook, `console-check.mjs` über sechs von ihnen meldet 0 Konsolenmeldungen | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/source-document/SourceDocument.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Beleg/SourceDocument`, dieselbe Form wie Konto und Klärung | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` an allen sieben Exporten (`clipEnd` 121, `clipMiddle` 136, `sourceDocumentIdentifier` 177, `SourceDocumentCompletion` 199, `Cell` 216, `Class` 257, `Row` 298). **Ein Kommentar ist deutsch**, `SourceDocument.tsx:384–385` — siehe Mangel 1 | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\b\|[0-9]+px'` über die Dateien der Familie: ein einziger Treffer, `#30581` in einem Kommentar (TypeScript-Issue). Labels aus `sourceDocTypeLabel()` und `formatDocumentKind()`; Zustand über `StatusBadge axis="beleg_erledigung"` → `BELEG_ERLEDIGUNG` (`src/ludwig/ui/status/status-registry.ts:527`, acht Schlüssel: `open`, `completed` und die sechs `completed_via`-Werte) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | sieben Stories, Namen wie in der Spec (`Gefuellt`, `Ausprägungen`, `Einordnung`, `Zustände`, `Zelle`, `Rand`, `ImEinsatz`); die vier nicht gebauten Zustände sind im Abschnitt „Verhalten" begründet, nicht als leere Story abgelegt | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | gemessen in `--filled`: Zeilenhöhe 72,2 px bei Polsterung `12px 18px` — dieselbe Ordnung wie die abgenommene `ClarificationRow` (71 px, zwei Zeilen); Maß-Spalte `text-align: right` mit `lining-nums tabular-nums`, Text-Spalten `start`, nichts zentriert; Kontrast 13,77 (Gegenpart, Kennung, Maß, Marke), 4,88 (`.v2sub`), 4,81 (Sachverhalts-Link) — alle ≥ 4,5; Fokusring nach echten Tab-Anschlägen `2px solid rgb(59, 143, 196)` auf `.v2rowlink` und `.v2link`, `:focus-visible` trifft; Hover über `.v2tbl__row:has(.v2rowlink):hover`; die Zeile ist ganz klickbar — `elementFromPoint` bei 80 % Breite trifft `A.v2rowlink` (I11); Vorzeichen ohne Farbe (`-120,50 €` in `rgb(45,45,45)`); kein Icon ohne Wort, die Erledigung trägt 0 `<svg>` | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle sieben Story-IDs geöffnet und gemessen; die Spaltenkanten von `--in-use` stehen über sechs Zeilen und fünf Belegarten auf identischen x-Werten (35 · 340 · 464 · 576 · 819 · 923 · 1035 · 1237) | ✓ |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `grep -n "isInvoice\|=== \"invoice\""` findet nichts außer den Registry-Einträgen | genau ein Treffer im ganzen Ordner: `source-document-detail.ts:13`, Fließtext im Modul-Kommentar („never through an `if (isInvoice)`"). Kein Zweig, kein Vergleich auf eine Belegart in einer Komponente | ✓ |
| `invoice` **ohne** `detail`: Dateiname als Kennung, keine Maß-Stelle | `--kinds`, Zeile 9 (`alt-2026-07-31-1188.pdf`): Kennung = Dateiname, Maß-Spalte leerer String, kein Gedankenstrich | ✓ |
| `other` **mit** `detail.kind = "invoice"`: weder Nummer noch Brutto | `--kinds`, Zeile 10 (`Kassenabschluss-2026-08.pdf`): Kennung = Dateiname statt `RE-9902`, Maß-Spalte leer statt `88,40 €` | ✓ |
| Der Vergleich ist generisch | `source-document-detail.ts:246`: `if (entry.type !== sourceDocType) return null;` — der Eintrag nennt seinen eigenen `type`, die Funktion zählt keine Belegarten auf. Auch die Rückfallkette und die Fakten hängen an derselben Zeile | ✓ |
| `sourceDocType = null` heißt „Beleg" | `--kinds`, Zeile 8: Zweitzeile „Beleg", Belegdatum „—", Maß leer. Zeile 6 zeigt zugleich `declaration` → „Erklärung" (die geweitete Union, B10), Zeile 7 `other` + `payroll_slip` → „Lohnabrechnung" (Rückfall auf die Belegform) | ✓ |
| `docCategory = null`, `docDirection = null`, `classDocumentKind = "original"` erzeugen kein Badge | `--classification`: Fall 1 vier Marken; Fall 2 (ohne Kategorie) nur die Richtung; Fall 3 (ohne Richtung) nur die Kategorie; Fall 4 (`original`) nur die Kategorie, kein Charakter-Badge; Fall 5 gar kein `.v2doc__class`-Element | ✓ |
| Die Erledigung steht als Wort, über die Achse `beleg_erledigung` | `--states`: acht Zeilen, acht Wörter („Offen", „Gebucht", „Sachverhalt geschlossen", „Über Import erledigt", „Ersetzt", „Von Hand erledigt", „Keine Buchung nötig", „Erledigt"), 0 `<svg>` in der Zustandsspalte; jeder `title` beginnt mit „Erledigung: …" und trägt die Beschreibung der Achse, der Freitext hängt hinten an | ✓ |
| `completedAt` gesetzt und `completedVia` `null` zeigt „Erledigt" | `--states`, letzte Zeile: „Erledigt · Der Beleg ist durch; woran er erledigt wurde, ist nicht festgehalten." — nicht „Offen" | ✓ |
| Ein langer Dateiname wird in der Mitte gekürzt, die Endung bleibt lesbar, das Ganze steht im `title` | `--edges`, Zeile 1: sichtbar `Rechnung-2026-08-26-ACME…ung-Verwaltung-4471.pdf` (48 Zeichen, Endung steht), `title` trägt alle 121. **Abweichung:** die Spec nennt 139 Zeichen (Höchstwert des Profils), die Story hat 121 — die Kürzung greift, die Zahl stimmt nicht (offener Punkt 2) | ✓ |
| Kennung fällt zurück: Ausprägung → Dateiname → Kurz-ID | `--kinds`: Rechnung → `RE-4471`, Vertrag → Vertragsgegenstand, alle vier Container-Arten → Dateiname. Stufe 3 ist im Bau vorhanden (`SourceDocument.tsx:188`), aber nicht vorführbar: `fileName` ist Pflichtfeld — genau das sagt die Spec über die Stufe („theoretisch") | ✓ |
| Ersetzt `InvoiceNumberCell`, `PartnerCell`, `ClassificationStack`, `StatusCell`, `CompletedCheck` | dieses Repo ist das ausgelagerte Set; die Ablösung ist ein eigener Schritt (`docs/backlog/README.md`) | offen (App) |
| Tut bewusst nicht: sortieren, filtern, blättern, handeln | keine Prop der drei Exporte nimmt Callback, Sortier- oder Seitenzustand; im DOM von `--in-use` kein `<button>`, kein `input`, kein Formularfeld — nur Links | ✓ |

**Story-Deckung** (`spec-schreiben` §6)

| Frage | Nachweis | Ergebnis |
|---|---|---|
| Hat jede Prop ihre Story? | alle 17 Felder des VM kommen in mindestens einer Story vor: `caseNumber`/`caseHref` in `Gefuellt` und `ImEinsatz`, `collectionKind` in `Einordnung` und `Ausprägungen`, `completedReason` in `Zustände`, `href` in `Gefuellt` und `Zelle`, der Rest wie in der Nachweis-Spalte der Schnittstelle | ✓ |
| Stimmt die Zahl mit der Ableitung? | 7 = 1 Zustand + 3 Enum-Achsen + 1 Zusatz-Export + 1 Rand + 1 im Einsatz; keine Callback-Story, weil es keinen Callback gibt | ✓ |
| Ist jeder ausgeschlossene Zustand begründet? | lädt, leer, leer nach Filter, Fehler — begründet im Abschnitt „Verhalten", nicht in einer leeren Story | ✓ |

**Mängel**

1. **Ein deutscher Kommentar im Code** — `src/ui/v3/entities/source-document/SourceDocument.tsx:384–385`:
   „Ein eigener Träger, weil `SourceDocumentClass` `null` zurückgeben darf: eine
   fehlende Grid-Zelle würde alle folgenden Spalten verschieben." `CLAUDE.md`
   und die feste Prüfliste verlangen englische Kommentare; alle übrigen
   Kommentare der Familie sind englisch, dieser eine ist es nicht.
   Nachgewiesen mit `grep -nE '\b(weil|damit|würde|zurückgeben)\b'` über
   `entities/source-document/*.tsx` — genau dieser eine Treffer.
2. **Die Rand-Story bleibt unter dem Höchstfall, den ihr Kommentar behauptet** —
   `SourceDocument.stories.tsx:348–350` trägt einen Dateinamen mit **121**
   Zeichen und einen Gegenpart mit **45**; die Spec nennt 139 und 56, das
   Profil den Höchstwert 139 (Zeile 168). Der Story-Kommentar (`:331`) sagt
   „A 139-character file name" — das stimmt nicht. Die Kürzung ist trotzdem
   nachgewiesen (48 sichtbar, 121 im `title`); zu ändern ist die Zahl, nicht
   die Mechanik.

**Offene Punkte ohne Mangel-Status**

- Der Zuschnitt der Spec sagt „eine Datei, drei Exporte"; gebaut sind sieben
  (dazu `clipEnd`, `clipMiddle`, `sourceDocumentIdentifier`,
  `SourceDocumentCompletion`). Die vier Zusätze sind begründet — 0076 braucht
  dieselbe Kennung und dieselbe Erledigungsmarke —, jeder trägt `@when`/`@instead`,
  und nur zwei davon stehen im Barrel. Kein Mangel, aber der Zuschnitt-Satz
  der Spec beschreibt die Datei nicht mehr.
- `.v2fields__h` und `.v2doc__h` setzen `text-transform: uppercase`; die Blöcke
  von 0076 stehen dadurch als „RECHNUNG", „VERTRAG", „BELEGDATEN" da. Die
  Prüfliste verbietet Versalien (A2, T9). Der Ursprung liegt in 0006 bzw. 0052
  und betrifft das ganze Set, nicht diese Aufgabe — gehört als Befund an die
  Grundlagen (0055), nicht in diese Abnahme.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Ergebnis: **zurück
auf `in Arbeit`**, zwei Mängel, beide klein und ohne Folgen für die
Schnittstelle.

**Status-Nachtrag 2026-09-05.** Gebaut ist die Aufgabe seit `000f2ad`
(„pnpm typecheck und pnpm build grün, alle 21 Stories im Browser
angesehen. Abnahme steht aus und gehört einem anderen Agenten.") — der
Status stand seither fälschlich auf `in Arbeit`. Er sagt jetzt, was der
Fall ist: `Abnahme`.

## Die zwei Mängel der Abnahme vom 2026-09-05 — behoben

**M1 — ein deutscher Kommentar** (`SourceDocument.tsx:384–385`, der Träger um
`SourceDocumentClass`) steht auf Englisch. Alle übrigen der Familie waren es
schon.

**M2 — die Story `Rand` blieb unter ihrem eigenen Höchstfall.** Der Kommentar
nennt 139 Zeichen Dateiname und 56 Zeichen Gegenpart, die Daten trugen 121 und
45 — die Kürzung wurde also an einem leichteren Fall gezeigt, als der Text
behauptet. Jetzt sind es genau 139 und 56 (nachgezählt), und der Dateiname ist
derselbe wie in der `Rand`-Story von 0076: ein Höchstfall, eine Zeichenkette.

## Abnahmekriterien (Nachtrag)

- [ ] Kein deutscher Kommentar mehr in `SourceDocument.tsx` (`grep`)
- [ ] Die Story `Rand` trägt 139 Zeichen Dateiname und 56 Zeichen Gegenpart (nachgezählt)
- [ ] Beide werden gekürzt, der volle Text steht im `title` (Story `Rand`, im DOM)
## Abnahme — zweiter Durchgang (2026-09-05)

Abgenommen gegen Spec und Code, nicht gegen den Chat. Stand `17be1ab`
(„0040, 0074, 0076: die Spalte, der Tag und die erfundenen Wörter"). Alle
sieben Stories auf `localhost:6107` geöffnet und im Blatt gemessen
(`measure.mjs`), die Längen der Rand-Daten am Quelltext **nachgezählt**, nicht
geschätzt. Geprüft wurden auch die Kriterien der Vorrunde — die Behebung hat
davon nichts umgeworfen.

**Story-Deckung.** Unverändert sieben Exporte, sieben IDs in `index.json`
(`--filled`, `--kinds`, `--classification`, `--states`, `--cell`, `--edges`,
`--in-use`); die Ableitung (1 Zustand + 3 Enum-Achsen + 1 Zusatz-Export +
1 Rand + 1 im Einsatz) geht weiter auf, die vier ausgeschlossenen Zustände
stehen begründet unter „Verhalten".

**Nachtrag (die Mängel der ersten Abnahme)**

| Kriterium | Nachweis (Datei · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Kein deutscher Kommentar mehr in `SourceDocument.tsx` | `SourceDocument.tsx:384–385` steht jetzt englisch („A carrier of its own, because `SourceDocumentClass` may return `null`: a missing grid cell would shift every column after it."). Über die ganze Familie gegrept — in `SourceDocument.tsx`, `source-document-detail.ts`, `SourceDocumentFacts.tsx`, `SourceDocumentDrawer.tsx`, `SourceDocumentPreview.tsx` kein deutscher Kommentar mehr | ✓ |
| Die Story `Rand` trägt 139 Zeichen Dateiname und 56 Zeichen Gegenpart | nachgezählt aus `SourceDocument.stories.tsx:349–351`: `"Rechnung-2026-08-26-ACME-…-Kostenstelle-1200-4471.pdf"` = **139**, `"Bürobedarf und Bewirtung Musterstadt Handelsgesellschaft"` = **56** (auch als Codepoints 56, die Umlaute zählen einfach). Der Dateiname ist zeichengleich mit dem der `Rand`-Story von 0076 | ✓ |
| Beide werden gekürzt, der volle Text steht im `title` | `--edges`, DOM: Gegenpart sichtbar `Bürobedarf und Bewirtung Musterstad…` (36 Zeichen), `title` 56; Dateiname sichtbar `Rechnung-2026-08-26-ACME…tenstelle-1200-4471.pdf` (48 Zeichen, in der **Mitte** geschnitten, die Endung steht), `title` 139 | ✓ |

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` **nicht** gelaufen (mehrere Sitzungen parallel, laut Auftrag untersagt); ersatzweise rendert der laufende Storybook alle sieben Stories, `console-check.mjs` über `--edges`, `--kinds`, `--in-use`: **0 Meldungen** | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/source-document/SourceDocument.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Beleg/SourceDocument` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` an allen sieben Exporten (unverändert). **Ein Kommentar ist wieder deutsch**, und zwar neu: `SourceDocument.stories.tsx:348` — siehe Mangel 1 | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\b\|[0-9]+px'` über `SourceDocument.tsx` und `source-document-detail.ts`: ein Treffer, `#30581` im Kommentar zu einem TypeScript-Issue. Wörter aus `sourceDocTypeLabel()`, `formatDocumentKind()` und der Achse `beleg_erledigung` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | `--in-use`, sechs Zeilen über fünf Belegarten: die acht Spaltenkanten stehen in **jeder** Zeile auf 35 · 340 · 464 · 576 · 819 · 923 · 1035 · 1237 — dieselben Werte wie in der ersten Abnahme, die neuen Rand-Daten haben nichts verschoben. Zahlen rechts mit `tabular-nums`, Text links, nichts zentriert; Erledigung als **Wort** (0 `<svg>` in der Zustandsspalte, über alle acht Zeilen von `--states` gezählt); kein `<button>`, kein `input` im DOM von `--in-use`; die zwei App-Punkte übersprungen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle sieben IDs am 2026-09-05 geöffnet und gemessen | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `grep -n "isInvoice\|=== \"invoice\""` findet nichts außer den Registry-Einträgen | genau ein Treffer im Ordner: `source-document-detail.ts:16`, Fließtext im Modul-Kommentar | ✓ |
| `invoice` **ohne** `detail`: Dateiname als Kennung, keine Maß-Stelle | `--kinds`, Zeile 9: `Bürodienst Nord · Rechnung ǀ (leer) ǀ 30.07.2026 ǀ alt-2026-07-31-1188.pdf` — Kennung ist der Dateiname, die Maß-Spalte ist leer, kein Gedankenstrich | ✓ |
| `other` **mit** `detail.kind = "invoice"`: weder Nummer noch Brutto | `--kinds`, Zeile 10: `Filiale Mitte · Kassenabschluss ǀ (leer) ǀ 31.08.2026 ǀ Kassenabschluss-2026-08.pdf` — statt `RE-9902` und `88,40 €` | ✓ |
| Der Vergleich ist generisch | `source-document-detail.ts`: `if (entry.type !== sourceDocType) return null;` — der Eintrag nennt seinen eigenen `type`, die Funktion zählt keine Belegarten auf | ✓ |
| `sourceDocType = null` heißt „Beleg" | `--kinds`, Zeile 8: `scan-20260819-114233.pdf` · **Beleg** · Belegdatum „—". Daneben Zeile 6 `declaration` → „Erklärung", Zeile 7 `other` + `payroll_slip` → „Lohnabrechnung" | ✓ |
| `docCategory = null`, `docDirection = null`, `classDocumentKind = "original"` erzeugen kein Badge | `--classification`, die fünf Fälle im Text: vier Marken · nur Richtung · nur Kategorie · nur Kategorie (bei `original`) · gar nichts („Nichts eingeordnet" ist die Beschriftung der Story, nicht ein Badge) | ✓ |
| Die Erledigung steht als Wort, über die Achse `beleg_erledigung` | `--states`: acht Zeilen, acht Wörter — „Offen", „Gebucht", „Sachverhalt geschlossen", „Über Import erledigt", „Ersetzt", „Von Hand erledigt", „Keine Buchung nötig", „Erledigt"; **0** `<svg>` in der Zustandsspalte; die `title` beginnen mit „Erledigung: …" und tragen den Text der Achse | ✓ |
| `completedAt` gesetzt und `completedVia` `null` zeigt „Erledigt" | `--states`, letzte Zeile: „Erledigt", `title` „… woran er erledigt wurde, ist nicht festgehalten." | ✓ |
| Ein langer Dateiname wird in der Mitte gekürzt, die Endung bleibt lesbar, das Ganze steht im `title` | siehe Nachtrag — jetzt am Höchstfall des Profils (139 statt 121) | ✓ |
| Kennung fällt zurück: Ausprägung → Dateiname → Kurz-ID | `--kinds`: Rechnung → `RE-4471`, Vertrag → „Miete Lagerhalle Nord, monatlich", die vier Container-Arten → Dateiname. Stufe 3 bleibt unvorführbar, weil `fileName` Pflichtfeld ist — so sagt es die Spec selbst | ✓ |
| Ersetzt `InvoiceNumberCell`, `PartnerCell`, `ClassificationStack`, `StatusCell`, `CompletedCheck` | betrifft `ludwig/app`; in diesem Repo nicht erfüllbar | offen (App) |
| Tut bewusst nicht: sortieren, filtern, blättern, handeln | im DOM von `--in-use` und `--kinds` kein `<button>`, kein `input`, kein `select`, kein `textarea` — nur Links | ✓ |

**Mängel**

1. **Ein neuer deutscher Kommentar, eine Datei weiter** —
   `src/ui/v3/entities/source-document/SourceDocument.stories.tsx:348`:
   „`// 139 und 56 Zeichen — der Höchstfall, den der Kommentar oben nennt.`"
   Er ist mit der Behebung von M2 entstanden (`git show 17be1ab -- …
   SourceDocument.stories.tsx`) und steht direkt über den Daten, deren Länge
   die Vorrunde beanstandet hatte. `CLAUDE.md` und die feste Prüfliste
   verlangen englische Kommentare; alle übrigen Kommentare **dieser Datei**
   sind englisch, auch der JSDoc-Block zwei Zeilen darüber („A 139-character
   file name is cut in the middle …"). Nachgewiesen mit
   `grep -rnE '(//|\*).*(\bweil\b|\bdamit\b|\bZeichen\b|\bder\b)'` über
   `entities/source-document/` — genau dieser eine Treffer in der ganzen
   Familie. Der Mangel der Vorrunde ist behoben und derselbe Fehler eine Datei
   weiter neu entstanden; eine Zeile.

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Der Höchstfall ist jetzt derselbe wie in 0076.** Beide `Rand`-Stories
  tragen dieselbe 139-Zeichen-Kette; die Zeile schneidet sie auf 48, Karte und
  Drawer auf 88 (0076). Wer die Kürzung vergleicht, vergleicht dieselbe
  Zeichenkette — das war die Absicht der Behebung und geht auf.
- **Die Kürzung des Gegenparts ist eine Ende-Kürzung mit Auslassungszeichen**,
  36 Zeichen sichtbar bei einer Grenze von 36 („Gegenpart 36 Zeichen, Ende
  abschneiden"): das Zeichen `…` zählt mit. Zwei Zeichen weniger Text als die
  Grenze verspricht — im Bild richtig, in der Tabelle „Kürzung" nicht gesagt.
- Unverändert offen aus der ersten Abnahme: der Zuschnitt-Satz der Spec sagt
  „eine Datei, drei Exporte", gebaut sind sieben; und `.v2fields__h` /
  `.v2doc__h` setzen weiter `text-transform: uppercase` (A2/T9) — beides
  gehört den Grundlagen (0055), nicht dieser Aufgabe.

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-05
· Status zurück auf `in Arbeit`. Ein Mangel, eine Zeile; die drei Kriterien
des Nachtrags sind erfüllt und gemessen.

## Der Mangel der zweiten Abnahme (2026-09-05) — behoben

Der Kommentar, der mit der Behebung von M2 entstand, war deutsch — derselbe
Regelbruch wie der behobene Mangel, eine Datei weiter. Englisch.

## Abnahmekriterien (Nachtrag der zweiten Runde)

- [ ] Kein deutscher Kommentar in `SourceDocument.tsx` **und** `SourceDocument.stories.tsx` (`grep`)

## Abnahme — dritter Durchgang (2026-09-05)

Abgenommen gegen Spec und Code, nicht gegen den Chat. Stand `70a8e74`. Alle
sieben Stories auf `localhost:6107` geöffnet und im Blatt gemessen
(`measure.mjs`), die Längen der Rand-Daten am Quelltext **nachgezählt** statt
geschätzt, die Kommentare beider Dateien Zeile für Zeile gelesen. Die
Kriterien beider Vorrunden sind mitgeprüft — die Behebung hat davon nichts
umgeworfen.

**Story-Deckung.** Unverändert sieben Exporte, sieben IDs in `index.json`
(`--filled`, `--kinds`, `--classification`, `--states`, `--cell`, `--edges`,
`--in-use`); die Ableitung (1 Zustand + 3 Enum-Achsen + 1 Zusatz-Export +
1 Rand + 1 im Einsatz) geht weiter auf, die vier ausgeschlossenen Zustände
stehen begründet unter „Verhalten".

**Nachtrag der zweiten Runde**

| Kriterium | Nachweis (Datei · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Kein deutscher Kommentar in `SourceDocument.tsx` **und** `SourceDocument.stories.tsx` | beide Dateien vollständig durchgesehen: alle Doc-Blöcke und alle sieben `//`-Kommentare der Story-Datei (`:148`, `:149`, `:161`, `:170`, `:171`, `:184`, `:185`, `:348`) sind englisch. Der beanstandete `:348` heißt jetzt „`// 139 and 56 characters — the maximum the comment above claims.`" (`git show 70a8e74 -- … SourceDocument.stories.tsx`: eine Zeile). Gegenprobe über beide Dateien mit `grep -nE '^\s*(//\|\*\|/\*)'` und einem Filter auf deutsche Füllwörter (`weil\|damit\|würde\|nicht\|der\|die\|das\|ein\|und\|Zeichen\|für\|mit\|von\|ist\|sind\|wird\|aus\|beim\|zum`): **kein Treffer** | ✓ |

**Nachtrag der ersten Runde (mitgeprüft)**

| Kriterium | Nachweis (Datei · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Die Story `Rand` trägt 139 Zeichen Dateiname und 56 Zeichen Gegenpart | nachgezählt aus `SourceDocument.stories.tsx:349–351`: der Dateiname `"Rechnung-2026-08-26-ACME-…-Kostenstelle-1200-4471.pdf"` = **139** (auch als Codepoints 139), der Gegenpart `"Bürobedarf und Bewirtung Musterstadt Handelsgesellschaft"` = **56** (Codepoints 56, die Umlaute zählen einfach). Beide Werte sind gegenüber der zweiten Runde unverändert; der Dateiname ist zeichengleich mit dem der `Rand`-Story von 0076 | ✓ |
| Beide werden gekürzt, der volle Text steht im `title` | `--edges`, DOM: Gegenpart sichtbar `Bürobedarf und Bewirtung Musterstad…` (36 Zeichen), `title` 56 · Dateiname sichtbar `Rechnung-2026-08-26-ACME…tenstelle-1200-4471.pdf` (48 Zeichen, in der **Mitte** geschnitten, die Endung steht), `title` 139 | ✓ |

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` **nicht** gelaufen (mehrere Sitzungen parallel, laut Auftrag untersagt); ersatzweise rendert der laufende Storybook alle sieben Stories, `console-check.mjs` über alle sieben: **0 Meldungen** | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/source-document/SourceDocument.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Beleg/SourceDocument` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` an allen sieben Exporten (`clipEnd`, `clipMiddle`, `sourceDocumentIdentifier`, `SourceDocumentCompletion`, `Cell`, `Class`, `Row`), unverändert. Kommentare beider Dateien jetzt durchgehend englisch — siehe Nachtrag | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\b\|[0-9]+px'` über `SourceDocument.tsx` und `source-document-detail.ts`: ein Treffer, `#30581` im Kommentar zu einem TypeScript-Issue. Wörter aus `sourceDocTypeLabel()`, `formatDocumentKind()` und der Achse `beleg_erledigung` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | `--in-use`, sechs Zeilen über fünf Belegarten, und `--edges`, vier Zeilen: die acht Spaltenkanten stehen in **jeder** Zeile beider Stories auf 35 · 340 · 464 · 576 · 819 · 923 · 1035 · 1237 (`distinctColSets` = 1) — dieselben Werte wie in beiden Vorrunden, die neuen Rand-Daten haben nichts verschoben. Zeilenhöhe 72,2 px bei Polsterung `12px 18px`; Maß-Spalte `text-align: right` mit `lining-nums tabular-nums`, nichts zentriert (0 Elemente mit `text-align: center`); die Zeile ist ganz klickbar — `elementFromPoint` bei 80 % Breite trifft `A.v2rowlink` (I11); Erledigung als **Wort** (0 `<svg>` in der Zustandsspalte über alle acht Zeilen von `--states`); kein `<button>`, kein `input`, kein `select`, kein `textarea` im DOM von `--in-use`; die zwei App-Punkte übersprungen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle sieben IDs am 2026-09-05 geöffnet und gemessen | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `grep -n "isInvoice\|=== \"invoice\""` findet nichts außer den Registry-Einträgen | genau ein Treffer im ganzen Ordner: `source-document-detail.ts:16`, Fließtext im Modul-Kommentar („never through an `if (isInvoice)`") | ✓ |
| `invoice` **ohne** `detail`: Dateiname als Kennung, keine Maß-Stelle | `--kinds`, Zeile 9: `Bürodienst Nord · Rechnung ǀ (leer) ǀ 30.07.2026 ǀ alt-2026-07-31-1188.pdf · Über Import erledigt` — Kennung ist der Dateiname, die Maß-Spalte leer, kein Gedankenstrich | ✓ |
| `other` **mit** `detail.kind = "invoice"`: weder Nummer noch Brutto | `--kinds`, Zeile 10: `Filiale Mitte · Kassenabschluss ǀ (leer) ǀ 31.08.2026 ǀ Kassenabschluss-2026-08.pdf` — statt `RE-9902` und `88,40 €` | ✓ |
| Der Vergleich ist generisch | `source-document-detail.ts`: `if (entry.type !== sourceDocType) return null;` — der Eintrag nennt seinen eigenen `type`, die Funktion zählt keine Belegarten auf | ✓ |
| `sourceDocType = null` heißt „Beleg" | `--kinds`, Zeile 8: `scan-20260819-114233.pdf` · **Beleg** · Belegdatum „—". Daneben Zeile 6 `declaration` → „Erklärung" (die geweitete Union, B10), Zeile 7 `other` + `payroll_slip` → „Lohnabrechnung" (Rückfall auf die Belegform) | ✓ |
| `docCategory = null`, `docDirection = null`, `classDocumentKind = "original"` erzeugen kein Badge | `--classification`, die fünf Fälle im Text: „Leistungsbeleg · Eingangsrechnung · Stornogutschrift · Auslagenabrechnung" (vier Marken) · „Kategorie fehlt (Container, B3)" → nur „Ausgangsrechnung" · „Richtung nicht anwendbar" → nur „Nachweisbeleg" · „Charakter = original" → nur „Zahlungsbeleg", kein Charakter-Badge · „Nichts eingeordnet" → gar kein Badge | ✓ |
| Die Erledigung steht als Wort, über die Achse `beleg_erledigung` | `--states`: acht Zeilen, acht Wörter — „Offen", „Gebucht", „Sachverhalt geschlossen", „Über Import erledigt", „Ersetzt", „Von Hand erledigt", „Keine Buchung nötig", „Erledigt"; **0** `<svg>` in der Zustandsspalte; die `title` beginnen mit „Erledigung: …" und tragen den Text der Achse | ✓ |
| `completedAt` gesetzt und `completedVia` `null` zeigt „Erledigt" | `--states`, letzte Zeile: „Erledigt", nicht „Offen" | ✓ |
| Ein 139-Zeichen-Dateiname wird in der Mitte gekürzt, die Endung bleibt lesbar, das Ganze steht im `title` | `--edges`, Zeile 1: sichtbar 48 Zeichen mit `…` in der Mitte und `.pdf` am Ende, `title` 139 — der Höchstfall des Profils, siehe Nachtrag | ✓ |
| Kennung fällt zurück: Ausprägung → Dateiname → Kurz-ID | `--kinds`: Rechnung → `RE-4471`, Vertrag → „Miete Lagerhalle Nord, monatlich", die Container-Arten (Kontoauszug, Kreditkartenabrechnung, Reisekostenabrechnung, Erklärung, Lohnabrechnung, ohne Typ) → Dateiname. Stufe 3 bleibt unvorführbar, weil `fileName` Pflichtfeld ist — so sagt es die Spec selbst | ✓ |
| Ersetzt `InvoiceNumberCell`, `PartnerCell`, `ClassificationStack`, `StatusCell`, `CompletedCheck` | betrifft `ludwig/app`; in diesem Repo nicht erfüllbar | offen (App) |
| Tut bewusst nicht: sortieren, filtern, blättern, handeln | im DOM von `--in-use` und `--edges` kein `<button>`, kein `input`, kein `select`, kein `textarea` — nur Links | ✓ |

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Das Blatt hat sich in diesem Durchgang geändert, die Zeile nicht.** Der
  Commit `70a8e74` fasst `v3.css` an (`.v2drawer__b > *`, `.v2doc__headskel`,
  beides für 0076). Die acht Spaltenkanten von `--in-use` und `--edges` stehen
  danach auf denselben Werten wie in den zwei Vorrunden — die Zeile ist von der
  Änderung nicht berührt.
- **Die Kürzung des Gegenparts ist eine Ende-Kürzung mit Auslassungszeichen**,
  36 Zeichen sichtbar bei einer Grenze von 36: das Zeichen `…` zählt mit. Zwei
  Zeichen weniger Text als die Grenze verspricht — im Bild richtig, in der
  Tabelle „Kürzung" nicht gesagt. Unverändert aus der zweiten Runde.
- Unverändert offen aus beiden Vorrunden: der Zuschnitt-Satz der Spec sagt
  „eine Datei, drei Exporte", gebaut sind sieben; und `.v2fields__h` /
  `.v2doc__h` setzen weiter `text-transform: uppercase` (A2/T9) — beides
  gehört den Grundlagen (0055), nicht dieser Aufgabe.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**L-93 ist erledigt** (App-Commit `62a2d0fa`): `SourceDocumentVM` liegt in
`source-docs/domain/source-document-vm.ts`. Der Anzeige-Typ der Familie setzt
darauf auf und trägt nur noch, was dort nicht hingehört oder noch fehlt:

- **`href` und `caseHref`** sind Routen — die gehören dem Aufrufer, nicht dem
  Datensatz.
- **`caseNumber` und `hasInvoiceRow`** fehlen dem Datensatz (**L-207**); die
  Zeile braucht beide, den Sachverhalt als Rang 6 und das Kennzeichen für die
  Achse `beleg_haenger`.
- **`detail` ist bewusst nicht das des Spiegels.** Drüben sind es die vier
  Kernfakten einer Rechnung, hier ist es die Union über die Belegarten mit
  `net`, `vat`, `processingStatus` und den Feldern des Vertrags — das, was
  0076 zeichnet. Der reichere Typ gewinnt, und dass die App die Union heben
  sollte statt ihrer Rechnungshälfte, steht als **L-208** im Register.
- `sizeBytes` heißt jetzt `byteSize`, wie im Spiegel.

`completedVia` ist drüben `string` und hier die Union der vier Achsenwerte —
dieselbe Verengung wie bei `counterpartySide` in 0097.

**Der Typtausch kam nach der letzten Abnahme.** Er ist typgeprüft
(`typecheck`, `build`, `check:icons`, `check:contrast` grün über den
Exit-Code) und ändert kein Kriterium — aber gebaut hat ihn, wer auch hier
schreibt. Eine kurze Bestätigung steht aus.

## Nachtrag zum Typtausch (2026-09-07, zweite Lieferung)

Drei weitere Befunde der Beleg-Familie sind erledigt (App-Commit `7184a8ac`):

- **L-47** — `SOURCE_DOC_COMPLETION_VIA` steht in der Domäne; die lokale Union
  der sechs Erledigungswege ist ein Re-Export.
- **L-37** — die Achse `beleg_charakter` gibt es. Der Charakter war ein
  `Badge` mit rohem Wort, „weil es keine Achse gibt"; jetzt ist er ein
  `StatusBadge` wie die drei Angaben neben ihm, mit dem Wort der Achse und
  ihrer Erklärung.
- **L-36** — `documentCounterparty()` ist der eine Weg zum Namen des
  Gegenparts. **Am Bau ändert das nichts:** die Familie nimmt den Namen fertig
  vom Aufrufer und leitet selbst nichts ab, wie es sich gehört. Der dritte
  Fall des Befunds betraf uns aber doch — der Drawer beschriftete die Spalte
  „Lieferant"; bei einer Ausgangsrechnung ist der Gegenpart der Kunde. Sie
  heißt jetzt „Gegenpart".

**Eine Anmerkung zum Spiegel:** `documentCounterparty()` ist eine reine
Funktion, liegt aber in einer Datei mit einem Drizzle-SQL-Ausdruck. Der Spiegel
nimmt aus einer Datei mit Infrastruktur-Import nichts, also fehlt sie hier.
Solange die Familie nichts ableitet, ist das folgenlos; sollte sie je gebraucht
werden, braucht sie drüben eine eigene Datei.
