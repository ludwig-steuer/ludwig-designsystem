# 0076 · Belegdaten je Ausprägung — `DocumentFacts` umbauen

| | |
|---|---|
| Status | spec |
| Stufe | `entities/document/` — Umbau von `DocumentFacts.tsx` (0052), Erweiterung von `document-detail.ts` (0074), Nachzug an `DocumentDrawer.tsx` (0052) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: die Felder sind Belegfelder, und die Registry ist eine Aussage über das Ludwig-Datenmodell (Supertyp + Subtypen) |
| Quelle | Entitätsprofil `docs/entitaeten/document.md`, Abschnitt „Die eine Regel" und „Heutige Darstellung" · Owner-Anfrage 2026-09-04 („Belege und Belegtypen sind Ausprägungen derselben Entität mit verschiedenen Datenfeldern — das sollten wir in der Vorschau berücksichtigen") |
| Ersetzt | `BelegSummary` (`ui/beleg/`), `SourceDocFactsCard` (`SourceDocBelegTab.tsx`), den Fakten-Teil von `GlanceCard` (Rechnung) und von `ContractDetail` (Vertrag) |
| Blockiert | 0071 (View und Karte), 0070 (die Listen zeigen dieselben Werte in Spaltenform) |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

`DocumentFacts` ist mit 0052 als „die Kernfakten eines Belegs" gebaut worden
und zeigt vier Zeilen: **Lieferant · Rechnungsnr. · Rechnungsdatum ·
Brutto**. Das sind Rechnungsfelder. Ein Vertrag hat keine Rechnungsnummer,
ein Kontoauszug keinen Bruttobetrag — sie bekommen heute vier
Gedankenstriche und die falschen Aufschriften.

Dieselbe Lücke hat die App dreifach gefüllt, aufgeteilt nach Belegart:
`SourceDocFactsCard` zeigt die generischen Felder, `GlanceCard` die
Rechnungsfelder, `ContractDetail` die Vertragsfelder — mit Überschneidung in
allem Generischen. Genau das verbietet die GLOSSARY-Regel: *„Neue Belegart =
neuer Subtyp + neuer Diskriminator-Wert + neuer Renderer-Registry-Eintrag,
NICHT Sonderpfade im bestehenden Code."* Die Registry ist in
`source-doc-type.ts` seit Anlage als Keim vermerkt und bis heute leer.

Diese Aufgabe füllt sie: **generische Fakten für jeden Beleg, plus einen
Block, den die Ausprägung beisteuert.**

## Einordnung

- **Wiederverwenden:** `DocumentFacts` (0052) deckt den Fall zu vier
  Fünfteln — Ort, Rahmen und die Idee „ein Satz Feldzeilen, hier einmal
  entschieden" stimmen. Falsch ist, welche Felder.
- **Erweitert, weil:** `spec-schreiben` §3 Regel 2 — das Fehlende ist eine
  Designentscheidung, die wiederkommt (jede künftige Belegart), und sie
  lässt sich in der `@when`-Zeile in einem Halbsatz sagen. Der Umbau ist
  **kein** additives Feld, sondern ein Austausch der Feldliste: die
  Schnittstelle `DocumentFactsVM` ändert sich, deshalb eine eigene Aufgabe
  statt einer Zeile im Ausbau von 0052.
- **Zuschnitt:** kein neuer Export. `DocumentFacts` bleibt eine Komponente;
  die Ausprägung kommt aus `document-detail.ts` (0074), das um einen dritten
  Registry-Eintrag `facts` wächst. Wer eine Belegart hinzufügt, fasst genau
  diese eine Datei an — und keine Komponente.
- **Setzt auf:** `FieldList`, `Amount`, `Time`, `MonoCell`, `LongText`.

## Wie die Registry wächst

`document-detail.ts` (0074) hat zwei Einträge je Ausprägung: `identifier()`
für Rang 5 und `measure()` für Rang 3. Diese Aufgabe fügt den dritten hinzu:

```ts
/** Die Feldzeilen, die es NUR bei dieser Ausprägung gibt. */
facts(d: DocumentDetail): FactRow[];
```

Der Block erscheint unter derselben Bedingung wie in 0074: **nur, wenn
Diskriminator und Subtyp-Zeile übereinstimmen** (`entry.type ===
document.sourceDocType`). Widersprechen sie sich — 10 von 384 Belegen, aus
zwei entgegengesetzten Gründen —, stehen allein die acht generischen Zeilen.
Die Begründung steht in 0074 und wird hier nicht wiederholt; hier zählt nur,
dass es **dieselbe** Regel aus **derselben** Datei ist.

`FactRow` ist `{ label: string; value: ReactNode }` — die Registry liefert
weiterhin **keine** Layout-Entscheidung, nur Paare. `DocumentFacts` reiht
sie unter die generischen Zeilen, in derselben Reihenfolge, in der sie
kommen.

| Ausprägung | generisch (immer) | `facts()` steuert bei |
|---|---|---|
| **jede** | Belegart · Gegenpart · Belegdatum · Eingangsdatum · Kennung · Maß · Erledigung · Zusammenfassung | — |
| Rechnung | dieselben acht | Netto/USt · Fälligkeit · Zahlungsziel · Leistungszeitraum · Zahlstatus · USt-IdNr. des Ausstellers · Original-Währung |
| Vertrag | dieselben acht | Vertragstyp · Laufzeit (Start–Ende, Monate, „unbefristet") · buchungsrelevante Fakten mit Herkunft (KI/manuell) |
| Kontoauszug, Kreditkartenabrechnung, Reisekostenabrechnung, Erklärung, Sonstiger, ohne Typ | dieselben acht | **nichts** — sie haben keine Subtyp-Zeile, und es ist auch keine geplant (App-Seite 2026-09-04, L-38). Kein leerer Block, keine Überschrift ohne Inhalt |

### Der Gruppen-Block — und warum er kein Registry-Eintrag ist

Die App-Seite hat auf Befund B2 geantwortet (2026-09-04): Kontoauszug,
Kreditkartenabrechnung und Reisekostenabrechnung bekommen **absichtlich**
keine Subtyp-Tabelle, weil sie keine Belege mit eigenen Fachfeldern sind,
sondern **Container bzw. Deckblätter**. Ihr Vorschlag: der Registry-Eintrag
dieser drei sei „Container: Gruppe + Batch".

Der Eintrag ist richtig, sein Ort nicht — nachgerechnet auf Staging:

- 89 von 384 Belegen (23 %) stehen in einer Dokumentgruppe: 12 Originale,
  77 Teilbelege.
- Von den 77 Teilbelegen sind **54 Rechnungen**, 13 „Sonstige", und nur 10
  sind Kreditkarten- oder Reisekosten-Deckblätter.
- Kein einziger der 10 Kontoauszüge steht in einer Gruppe.

Die Gruppe schneidet also **quer durch alle Belegarten**. Ein Registry-
Eintrag je Belegart würde sie für 54 Rechnungen verfehlen und für 10
Kontoauszüge behaupten, wo es keine gibt. Deshalb:

> Der Gruppen-Block hängt an der **Relation**, nicht an der Ausprägung. Er
> erscheint für jeden Beleg mit `collectionKind` (er ist ein Original) oder
> `parentSourceDocId` (er ist ein Teilbeleg) — gleich welcher Art, und
> unabhängig davon, ob eine Subtyp-Zeile da ist.

Das trifft die Absicht der App-Seite („EIN Deckblatt-Renderer für alle drei
Container-Typen, kein Renderer je Typ") genauer als ihr eigener Vorschlag.

Was der Block zeigt:

| Der Beleg ist … | Zeile |
|---|---|
| ein Sammel-Original **mit** Klammer-Typ | Dokumentgruppe (Achse `dokumentgruppe`) · Zahl der Teilbelege · wie viele davon erledigt sind |
| ein Sammel-Original **ohne** Klammer-Typ (`not_connected` oder NULL) | „Unabhängige Belege" bzw. gar kein Typ-Badge — nur Zahl und Erledigungsstand der Teilbelege |
| ein Teilbeleg | „Seiten 5–7 aus \<Original\>", mit Weg zum Original |
| beides nicht | **kein Block** |

Die zweite Zeile ist im Bestand **der Normalfall**, nicht die Ausnahme: von
den 12 Sammel-Originalen tragen 8 `not_connected` und 4 gar keinen Wert;
kein einziges eine der vier Klammer-Familien aus belege.md R25–R27. Die
App-Seite hat die Ursache lokalisiert (Klassifikator liefert nie
`credit_card_statement`/`expense_report`, erfasst als `P28`) — für uns heißt
das: der Block muss ohne Klammer-Typ vollständig aussehen, nicht wie ein
halb gefülltes Formular.

Die Batch-Fakten eines Kontoauszugs — Zeitraum, Anfangs-/Endsaldo,
Zeilenzahl — gehören **nicht** hierher: sie liegen an
`client_bank_import_batches`, und zwischen Beleg und Batch gibt es heute
keinen Fremdschlüssel (Befund L-45, Owner-Entscheid steht aus). Sie stehen
im Ausbau, nicht in der Schnittstelle.

Der Vertrags-Eintrag entsteht gegen das **Schema** und
`ContractDetailData`, nicht gegen Daten: `client_source_docs_contracts` hat
im Bestand null Zeilen — und das ist **kein Schreibpfad-Fehler**: die sieben
Audit-Ereignisse hängen an einem Beleg, den es nach einem Mandanten-Wipe
nicht mehr gibt (App-Seite 2026-09-04, L-39). Die Tabelle war auf Staging nie
produktiv befüllt. Owner-Entscheid 2026-09-04: lesend jetzt, der Editor
wartet (0073). Jede Zeile der Vertrags-Stories trägt
deshalb erfundene Werte und der Eintrag einen Kommentar, der das sagt.

## Schnittstelle

`DocumentFactsVM` **ersetzt** die heutige (Bruch, nicht Erweiterung — heute
gibt es genau einen Aufrufer, `DocumentDrawer`):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `document` | `DocumentVM` | ja | Die Beleg-Zeile aus 0074 — dieselbe, die auch `DocumentRow` bekommt. Trägt Belegart, Gegenpart, beide Daten, Erledigung, `detail`. | `Gefuellt` |
| `summary` | `string \| null` | nein | Zusammenfassung. Der Aufrufer wählt zwischen `classCaseSummary` (fachlich, 93 %) und `classSummary` (Belegtext, 100 %) — die Komponente kennt den Unterschied nicht und darf ihn nicht raten. Gekürzt bei 260 Zeichen. | `Gefuellt`, `Rand` |
| `group` | `{ childCount: number; completedChildCount: number } \| { pages: string; parentTitle?: string; parentHref?: string } \| null` | nein | Der Gruppen-Block. Erste Form: der Beleg ist ein Sammel-Original. Zweite: er ist ein Teilbeleg. `null`: keins von beidem, und dann gibt es den Block nicht. | `Gruppe` |
| `tone` | `"surface" \| "soft" \| "bare"` | nein | Wird an `FieldList` durchgereicht: `bare` im Drawer, `surface` in der Karte. | `Toene` |

Dass `document` und `summary` getrennt kommen, ist Absicht: 0074s
`DocumentVM` trägt keine Freitexte (eine Zeile zeigt keine drei Sätze), und
die Wahl zwischen den beiden Zusammenfassungen ist eine
Aufrufer-Entscheidung.

Typen aus `src/ludwig/`: `DocumentVM` und `DocumentDetail` aus 0074,
`Currency` aus `shared/money`, `contractTypeLabel()` und
`ContractBookingFact` aus `modules/contracts/domain/contract`.

**Was sie bewusst nicht kann:**

- **Keine Rechnungspositionen und keine Vorsteuer-Aufstellung.** Beides ist
  eine Liste über eine Enkel-Entität, nicht eine Feldzeile — 0072.
- **Nichts ändern.** Belegdatum, Einordnung und Erledigung sind änderbar,
  aber als `InlineEdit` im View (0071), nicht hier.
- **Keine leere Überschrift.** Hat eine Ausprägung nichts beizusteuern, gibt
  es den Block nicht — nicht einen mit „Keine Angaben."
- **Kein „—" für ein Feld, das es bei dieser Belegart nicht gibt.** Der
  Gedankenstrich bleibt den Fällen vorbehalten, in denen ein Wert *fehlt*,
  obwohl es ihn geben müsste: ein Belegdatum, das die Extraktion nicht
  gelesen hat, steht als „—"; eine Rechnungsnummer an einem Kontoauszug
  steht gar nicht.

## Der Nachzug an `DocumentDrawer` (0052)

Im selben Arbeitsgang, weil der Drawer der einzige Aufrufer ist und sonst
beide Fassungen nebeneinander stünden:

| Was | Heute | Danach |
|---|---|---|
| Vorschau | inline-`<iframe>` in `DrawerBody` | `DocumentPreview` (0075), `height="md"` |
| Fakten | vier Rechnungs-Labels | `DocumentFacts` mit der Registry |
| Kopf-Zustand | `<StatusBadge axis="beleg" …>`, fest verdrahtet | die **Erledigung** (Achse `beleg_erledigung`) — die Achse `beleg` lebt am Rechnungs-Subtyp und hat für 16 % der Belege nie einen Wert (Befund L-42) |
| Kopf-Kennung | `invoiceNumber ?? originalFileName ?? reference` | die Rückfallkette aus 0074 — dieselbe Regel, ein Ort |
| Überschrift „Extrahierte Belegdaten" | fest | „Belegdaten" — bei einem Vertrag ist nichts extrahiert worden, was eine Rechnung extrahiert |

`DocumentQuickView` schrumpft dabei auf `{ document, summary, previewUrl,
previewUnavailableReason, excerpt }`: Titel und Kennung leitet der Drawer aus
`document` ab, statt sie sich geben zu lassen. Die vier Zustände des Drawers
(Fehler → lädt → nicht gefunden → Inhalt) bleiben unangetastet.

## Verhalten

**Server-Component** — `FieldList` und `Time` sind es, die Registry rechnet
nur.

Kürzungen, aus den p90-Längen des Profils: Zusammenfassung 260 Zeichen,
Erledigungsgrund 280, Dateiname in Karte und Drawer 88 (Mitte, wie 0074).
Der volle Text steht im `title`.

Zustände: **gefüllt** und **leer** sind anwendbar — leer heißt hier „ein
Beleg, von dem außer Datei und Eingangsdatum nichts bekannt ist"; das gibt
es im Bestand (der eine Beleg mit `classification_failed`). Lädt und Fehler
trägt der Aufrufer (0042), leer nach Filter gibt es nicht.

## Stories

Titel `v3/Entitäten/Beleg/DocumentFacts`.

| Story | Beweist |
|---|---|
| `Gefuellt` | Eine Rechnung: acht generische Zeilen plus der Rechnungsblock |
| `Ausprägungen` | **Die Kernstory.** Rechnung, Vertrag, Kontoauszug, Sonstiger Beleg und ein Beleg ohne Typ nebeneinander — gleiche Reihenfolge oben, verschiedene Blöcke unten, und bei den letzten dreien **kein leerer Block** |
| `Vertrag` | Der Registry-Eintrag, den kein Bestand belegt: Laufzeit mit und ohne Enddatum, „unbefristet", buchungsrelevante Fakten mit Herkunft KI und manuell |
| `Leer` | Ein Beleg, von dem nur Datei und Eingangsdatum bekannt sind — was steht da, und was steht bewusst nicht da |
| `Gruppe` | Der Block an der Relation, vier Fälle: ein Sammel-Original **ohne** Klammer-Typ („4 von 9 erledigt" — der Normalfall im Bestand), eines **mit**, ein Teilbeleg („Seiten 5–7 aus …") und eine **Rechnung**, die Teilbeleg ist: der Fall, den ein Renderer je Belegart verfehlt hätte |
| `Toene` | `bare` (Drawer) und `surface` (Karte) nebeneinander |
| `Rand` | 400-Zeichen-Zusammenfassung, 139-Zeichen-Dateiname, 868-Zeichen-Erledigungsgrund — alle drei Kürzungen, voller Text im `title` |
| `ImEinsatz` | Im `DocumentDrawer`, neben einer Liste: Kopf, Vorschau, Fakten, Grenze, ein Ausgang — der Nachzug in einem Bild |

Acht Stories: 2 anwendbare Zustände (`Gefuellt`, `Leer`; lädt und Fehler
oben begründet ausgeschlossen) + 1 je Enum-Achse (`Ausprägungen` für die
Registry, `Toene` für `tone`) + 1 für den unbelegten Registry-Eintrag
(`Vertrag`) + 1 für den Relations-Block (`Gruppe`) + 1 Rand (die Komponente kürzt) + 1 „im Einsatz". Kein Callback.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Zeitraum, Anfangs-/Endsaldo und Zeilenzahl eines Kontoauszugs | ein `batch?`-Feld am VM, gefüllt aus `client_bank_import_batches` | sobald der Fremdschlüssel Beleg → Batch steht (L-45). **Nicht** als Registry-Eintrag — die Fakten gehören der Kontoauszugspositions-Familie, hier stünde nur der Sprung dorthin |
| Einzelwerte ändern | je ein optionaler Callback (`onSetDocumentDate`, `onComplete`) über `InlineEdit` | mit 0071 — ohne Callback bleibt der Wert lesend, das ist A12 |
| Positionen und Vorsteuer | eigener Auftrag 0072 | wenn die Rechnungsposition ihr Profil hat |
| Konfidenz der Einordnung als Wert statt als Prozentzahl | eine Konfidenz-Primitive | wenn der Soll-Katalog die **eine** Konfidenz-Darstellung entschieden hat (heute drei Varianten in der App) |

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

- [ ] Die acht generischen Zeilen stehen bei **jeder** Ausprägung in derselben Reihenfolge (Story `Ausprägungen`)
- [ ] Kontoauszug, Sonstiger Beleg und Beleg ohne Typ bekommen **keinen** Ausprägungs-Block — auch keinen leeren mit Überschrift (Story `Ausprägungen`)
- [ ] Keine Zeile heißt „Rechnungsnr." oder „Lieferant" an einem Nicht-Rechnungs-Beleg (Story `Ausprägungen`)
- [ ] `grep -n "isInvoice" src/ui/v3/entities/document/` findet nichts
- [ ] Eine neue Belegart erfordert genau **einen** neuen Eintrag in `document-detail.ts` und keine Änderung an `DocumentFacts.tsx` — nachgewiesen, indem der Vertrags-Eintrag als letzter hinzugefügt wird und die Komponente unverändert bleibt
- [ ] Der Gruppen-Block erscheint bei einer **Rechnung**, die Teilbeleg ist — er hängt an der Relation, nicht an der Belegart (Story `Gruppe`)
- [ ] Ein Sammel-Original mit `collectionKind = "not_connected"` oder ohne Wert sieht **vollständig** aus, nicht wie ein halb gefülltes Formular (Story `Gruppe`)
- [ ] Widersprechen sich Diskriminator und Subtyp-Zeile, steht **kein** Ausprägungs-Block — dieselbe Regel und dieselbe Datei wie 0074 (Story `Ausprägungen`)
- [ ] Ein Beleg ohne `group` bekommt keinen Block, auch keinen leeren (Story `Ausprägungen`)
- [ ] `tone` verhält sich wie Zeile 4 der Schnittstelle (Story `Toene`)
- [ ] Alle drei Kürzungen greifen, der volle Text steht im `title` (Story `Rand`)
- [ ] `DocumentDrawer` zeigt die **Erledigung** im Kopf, nicht `axis="beleg"` (Story `ImEinsatz`)
- [ ] `DocumentDrawer` enthält kein `<iframe>` mehr (`grep -n "iframe" src/ui/v3/entities/document/DocumentDrawer.tsx` findet nichts)
- [ ] Ersetzt `BelegSummary` und `SourceDocFactsCard` ohne Funktionsverlust; die Rechnungs- und Vertragsfelder aus `GlanceCard` und `ContractDetail` stehen als Blöcke
- [ ] Tut bewusst nicht: Positionen, Vorsteuer, Ändern — der Aufrufer löst es mit 0072 und 0071

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: … · Offene Punkte: …
