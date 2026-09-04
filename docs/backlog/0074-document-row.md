# 0074 · Beleg — Zelle, Einordnung, Zeile

| | |
|---|---|
| Status | spec |
| Stufe | `entities/document/` — Familie `Document.tsx` (`DocumentCell`, `DocumentClass`, `DocumentRow`) plus das Registry-Modul `document-detail.ts` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Belegart, Belegkategorie, Belegrichtung und Beleg-Erledigung sind Ludwig-Fachbegriffe mit eigenen Registry-Achsen |
| Quelle | Entitätsprofil `docs/entitaeten/document.md` (Status `geprüft`), Abschnitte „Die eine Regel", „Datenpunkte" Rang 1–7, „Formen" Zeilen 1–3 · Owner-Anfrage 2026-09-04 |
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
const entry  = detail ? DOCUMENT_DETAILS[detail.kind] : null;
const agrees = entry?.type === document.sourceDocType;
```

Damit gibt es in keiner Komponente ein `isInvoice`. Es gibt `agrees` — und
wo es nicht zutrifft, greift derselbe Rückfall wie bei einem Beleg ganz ohne
Ausprägung.

## Einordnung

- **Wiederverwenden:** kein `@when` in `src/ui/v3` deckt den Fall.
  `ClarificationCell`/`ClarificationRow` sind die formgleiche Familie einer
  **anderen** Entität; `AccountCell` nennt ein Konto, nicht einen Beleg.
  `DocumentFacts` (0052) deckt die Größe M, nicht XS/S — und wird in 0076
  umgebaut.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — `ui-repraesentationen.md` §1
  führt für den Beleg die Formen Zelle, Zeile und Liste, und keine
  vorhandene Form deckt sie ab.
- **Zuschnitt:** **eine Datei, drei Exporte** (§4 „Familie"): `DocumentCell`,
  `DocumentClass` und `DocumentRow` teilen das Markup-Vokabular der
  Beleg-Identität, die Zeile setzt beide anderen zusammen, und keiner von
  ihnen trägt eigenen Zustand. Vorbild `Clarification.tsx` (0059: Cell, Row,
  List in einer Datei). Dazu **ein zweites Modul** `document-detail.ts` — die
  Registry ist kein Markup und wird von 0076 mitbenutzt; sie in `Document.tsx`
  zu legen hieße, `DocumentFacts` importiert die Zeile.
- **Setzt auf:** `MonoCell`, `LongText`, `Amount`, `Time`, `StatusBadge`,
  `Badge`, `Row` (`Table.tsx`).

## Schnittstelle

### `document-detail.ts` — die Registry

```ts
/**
 * Was eine Ausprägung zu den gemeinsamen Rängen beiträgt.
 * Ein neuer Belegtyp bekommt hier einen Eintrag, keinen Sonderpfad.
 */
export type DocumentDetail =
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

### `DocumentVM`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `id` | `string` | ja | `client_source_docs.id` | `Gefuellt` |
| `fileName` | `string` | **ja** | Rang 1b. In der Datenbank `NOT NULL` und in **jeder** Ausprägung zu 100 % da — deshalb Pflicht, nicht optional. Er ist der letzte Rückfall der Kennung. | `Ausprägungen` |
| `sourceDocType` | `SourceDocType \| "declaration" \| null` | nein | Diskriminator. Die Union ist um `declaration` geweitet — der DB-CHECK und `SOURCE_DOC_TYPE_LABELS` kennen den Wert, der TS-Typ nicht (Befund B10). | `Ausprägungen` |
| `classDocumentForm` | `string \| null` | nein | Rückfall-Schlüssel des **Labels**: trägt der Beleg nur `other`/NULL, gewinnt die Belegform („Sammel-PDF", „Lohnabrechnung"). | `Ausprägungen` |
| `counterparty` | `string \| null` | nein | Rang 1. Je Ausprägung 50–95 % gefüllt — fehlt er, führt der Dateiname. | `Ausprägungen`, `Rand` |
| `detail` | `DocumentDetail \| null` | nein | Rang 3 und 5. Der Aufrufer setzt es, **wenn die Subtyp-Zeile existiert**; gezeigt wird es nur, wenn es zum Diskriminator passt (siehe „Warum beide zustimmen müssen"). | `Ausprägungen` |
| `documentDate` | `string \| null` | nein | Rang 4, ISO-Tag. NULL bleibt NULL — kein Rückfall auf den Upload-Tag (GLOSSARY). | `Gefuellt` |
| `receivedDate` | `string` | ja | Rang 7, `NOT NULL`. Sortierschlüssel der Belegliste. | `Gefuellt` |
| `completedAt` | `string \| null` | nein | Zustand. `null` = steht noch offen. | `Zustände` |
| `completedVia` | `DocumentCompletion \| null` | nein | Grund der Erledigung, Achse `beleg_erledigung`. | `Zustände` |
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
`DocumentRow` hat bewusst **kein** `Disclosure`: anders als
`ClarificationRow` gibt es beim Beleg nichts zum Aufklappen, was nicht schon
Karte oder Drawer wäre.

Kürzung, aus den p90-Längen des Profils:

| Feld | Grenze | Art | Vollständig zu sehen in |
|---|---|---|---|
| Gegenpart | 36 Zeichen | Ende abschneiden | `title` |
| Dateiname (Zeile) | 48 Zeichen | **in der Mitte**, Endung bleibt lesbar | `title` |
| Erledigungsgrund | 280 Zeichen | Ende | `title` der Marke |

Die Mitten-Kürzung ist eine lokale Funktion in `Document.tsx` mit
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

Titel `v3/Entitäten/Beleg/Document`.

| Story | Beweist |
|---|---|
| `Gefuellt` | Eine Rechnungszeile mit allem: Gegenpart, Nummer, Brutto, beide Daten, Sachverhalt, Erledigt |
| `Ausprägungen` | **Die Kernstory.** Alle sieben `sourceDocType`-Werte plus NULL untereinander — mit Subtyp-Zeile, ohne, und die zwei B9-Ausreißer: `invoice` ohne `detail`, und `other` **mit** `detail.kind = "invoice"`. **Beide zeigen dasselbe** — Dateiname als Kennung, leere Maß-Stelle —, und die Story sagt in ihrem Kommentar, warum das aus entgegengesetzten Gründen richtig ist |
| `Einordnung` | `DocumentClass` allein: alle vier Achsen, dazu die drei NULL-Fälle (Kategorie fehlt, Richtung nicht anwendbar, Charakter = `original`) — jeder zeigt **nichts**, nicht „unbekannt" |
| `Zustände` | Die Erledigung über alle sechs `completed_via`-Werte plus „Offen", mit dem Grund im `title` |
| `Zelle` | `DocumentCell` allein, in fremdem Markup (ein Satz, eine Buchungszeile) — mit und ohne `href` |
| `Rand` | Was die Kürzung tut: 139-Zeichen-Dateiname, 56-Zeichen-Gegenpart, Beleg ohne Gegenpart, ohne Belegdatum, ohne alles außer Datei und Eingang |
| `ImEinsatz` | Sechs Zeilen untereinander in einer `Card` — der Beleg-Tab eines Sachverhalts, gemischte Belegarten |

Sieben Stories: 1 Zustand (nur „gefüllt", die anderen vier oben begründet
ausgeschlossen) + 1 je Enum-Achse (`Ausprägungen`, `Einordnung`, `Zustände`)
+ 1 je Zusatz-Export (`Zelle`) + 1 Rand (die Komponente kürzt) + 1
„im Einsatz". Keine Callback-Story — es gibt keinen Callback.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| ~~Kontoauszug, Kreditkartenabrechnung, Reisekostenabrechnung als eigene Ausprägung~~ | — | **Entfällt.** Die App-Seite hat am 2026-09-04 entschieden: keine Subtyp-Tabellen, absichtlich — die drei sind Container, keine Belege mit eigenen Fachfeldern (L-38). Sie bekommen nie einen `DocumentDetail`-Eintrag; ihre Gruppen-Eigenschaft hängt an der Relation und wird in 0076 gezeigt |
| Aktion an der Zeile (erledigen, neu anstoßen, einreichen) | optionaler `actions?: ReactNode`-Slot | wenn 0070 die erste Liste mit Massenaktion baut; bis dahin setzt der Aufrufer sie daneben |
| Die Zustimmungs-Regel wieder fallen lassen | nichts — der Vergleich verschwindet | wenn `P26` drüben entschieden ist (Belegform-Override räumt die Rechnungs-Zeile auf) und `L-35` null Widersprüche zählt. Bis dahin ist die Regel billig und still |
| Auswahl (Checkbox) | `SelectionCell` des Aufrufers, nicht eine Prop hier | mit 0070 und `DataTable`s `SelectionScope` |
| Teilbeleg-Zähler an der Zeile | `childCount?: number` | wenn ein Screen Sammel-PDFs listet — 97 % haben keine Kinder, heute wäre die Zahl fast immer 0 |

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

- [ ] **`grep -n "isInvoice\|=== \"invoice\"" src/ui/v3/entities/document/` findet nichts** außer den Registry-Einträgen in `document-detail.ts`
- [ ] Ein Beleg mit `sourceDocType = "invoice"` **ohne** `detail` zeigt kein leeres Rechnungsfeld, sondern den Dateinamen als Kennung und keine Maß-Stelle (Story `Ausprägungen`)
- [ ] Ein Beleg mit `sourceDocType = "other"` **mit** `detail.kind = "invoice"` zeigt **weder** Nummer **noch** Brutto — die Belegform wurde korrigiert, die Rechnungs-Zeile ist der Rest (Story `Ausprägungen`)
- [ ] Der Vergleich ist **generisch**: er liest `type` aus dem Registry-Eintrag, er zählt keine Belegarten auf
- [ ] `sourceDocType = null` heißt „Beleg", nie „Rechnung" (Story `Ausprägungen`)
- [ ] `docCategory = null`, `docDirection = null` und `classDocumentKind = "original"` erzeugen **kein** Badge (Story `Einordnung`)
- [ ] Die Erledigung steht als **Wort**, nicht als Häkchen (V7, V11) — Achse `beleg_erledigung` (Story `Zustände`)
- [ ] Ein 139-Zeichen-Dateiname wird in der Mitte gekürzt, die Endung bleibt lesbar, das Ganze steht im `title` (Story `Rand`)
- [ ] Kennung fällt in dieser Kette zurück: Ausprägung → Dateiname → Kurz-ID (Story `Ausprägungen`)
- [ ] Ersetzt `InvoiceNumberCell`, `PartnerCell`, `ClassificationStack`, `StatusCell` und `CompletedCheck` aus `[year]/documents/page.tsx` ohne Funktionsverlust
- [ ] Tut bewusst nicht: sortieren, filtern, blättern, handeln — der Aufrufer löst es mit `DataTable` (0070) und eigenen Knöpfen

## Befunde beim Schreiben der Spec

- **B10 — `SourceDocType` fehlt der Wert `declaration`.** Der DB-CHECK auf
  `client_source_docs.source_doc_type` erlaubt sieben Werte,
  `SOURCE_DOC_TYPE_LABELS` führt sieben („Erklärung"), der TS-Typ in
  `document-form-mapping.ts` führt sechs. Die Spec weitet die Union lokal
  und begründet es; Register-Eintrag L-44 in `docs/befunde-app.md`.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: … · Offene Punkte: …
