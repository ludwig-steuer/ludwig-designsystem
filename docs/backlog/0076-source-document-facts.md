# 0076 · Belegdaten je Ausprägung — `SourceDocumentFacts` umbauen

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/source-document/` — Umbau von `SourceDocumentFacts.tsx` (0052), Erweiterung von `source-source-document-detail.ts` (0074), Nachzug an `SourceDocumentDrawer.tsx` (0052) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: die Felder sind Belegfelder, und die Registry ist eine Aussage über das Ludwig-Datenmodell (Supertyp + Subtypen) |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Abschnitt „Die eine Regel" und „Heutige Darstellung" · Owner-Anfrage 2026-09-04 („Belege und Belegtypen sind Ausprägungen derselben Entität mit verschiedenen Datenfeldern — das sollten wir in der Vorschau berücksichtigen") |
| Ersetzt | `BelegSummary` (`ui/beleg/`), `SourceDocFactsCard` (`SourceDocBelegTab.tsx`), den Fakten-Teil von `GlanceCard` (Rechnung) und von `ContractDetail` (Vertrag) |
| Blockiert | 0071 (View und Karte), 0070 (die Listen zeigen dieselben Werte in Spaltenform) |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

`SourceDocumentFacts` ist mit 0052 als „die Kernfakten eines Belegs" gebaut worden
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

- **Wiederverwenden:** `SourceDocumentFacts` (0052) deckt den Fall zu vier
  Fünfteln — Ort, Rahmen und die Idee „ein Satz Feldzeilen, hier einmal
  entschieden" stimmen. Falsch ist, welche Felder.
- **Erweitert, weil:** `spec-schreiben` §3 Regel 2 — das Fehlende ist eine
  Designentscheidung, die wiederkommt (jede künftige Belegart), und sie
  lässt sich in der `@when`-Zeile in einem Halbsatz sagen. Der Umbau ist
  **kein** additives Feld, sondern ein Austausch der Feldliste: die
  Schnittstelle `SourceDocumentFactsVM` ändert sich, deshalb eine eigene Aufgabe
  statt einer Zeile im Ausbau von 0052.
- **Zuschnitt:** kein neuer Export. `SourceDocumentFacts` bleibt eine Komponente;
  die Ausprägung kommt aus `source-source-document-detail.ts` (0074), das um einen dritten
  Registry-Eintrag `facts` wächst. Wer eine Belegart hinzufügt, fasst genau
  diese eine Datei an — und keine Komponente.
- **Setzt auf:** `FieldList`, `Amount`, `Time`, `MonoCell`, `LongText`.

## Wie die Registry wächst

`source-source-document-detail.ts` (0074) hat zwei Einträge je Ausprägung: `identifier()`
für Rang 5 und `measure()` für Rang 3. Diese Aufgabe fügt den dritten hinzu:

```ts
/** Die Feldzeilen, die es NUR bei dieser Ausprägung gibt. */
facts(d: SourceDocumentDetail): FactRow[];
```

Der Block erscheint unter derselben Bedingung wie in 0074: **nur, wenn
Diskriminator und Subtyp-Zeile übereinstimmen** (`entry.type ===
document.sourceDocType`). Widersprechen sie sich — 10 von 384 Belegen, aus
zwei entgegengesetzten Gründen —, stehen allein die acht generischen Zeilen.
Die Begründung steht in 0074 und wird hier nicht wiederholt; hier zählt nur,
dass es **dieselbe** Regel aus **derselben** Datei ist.

`FactRow` ist `{ label: string; value: ReactNode }` — die Registry liefert
weiterhin **keine** Layout-Entscheidung, nur Paare. `SourceDocumentFacts` reiht
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

`SourceDocumentFactsVM` **ersetzt** die heutige (Bruch, nicht Erweiterung — heute
gibt es genau einen Aufrufer, `SourceDocumentDrawer`):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `document` | `SourceDocumentVM` | ja | Die Beleg-Zeile aus 0074 — dieselbe, die auch `SourceDocumentRow` bekommt. Trägt Belegart, Gegenpart, beide Daten, Erledigung, `detail`. | `Gefuellt` |
| `summary` | `string \| null` | nein | Zusammenfassung. Der Aufrufer wählt zwischen `classCaseSummary` (fachlich, 93 %) und `classSummary` (Belegtext, 100 %) — die Komponente kennt den Unterschied nicht und darf ihn nicht raten. Gekürzt bei 260 Zeichen. | `Gefuellt`, `Rand` |
| `group` | `{ childCount: number; completedChildCount: number } \| { pages: string; parentTitle?: string; parentHref?: string } \| null` | nein | Der Gruppen-Block. Erste Form: der Beleg ist ein Sammel-Original. Zweite: er ist ein Teilbeleg. `null`: keins von beidem, und dann gibt es den Block nicht. | `Gruppe` |
| `tone` | `"surface" \| "soft" \| "bare"` | nein | Wird an `FieldList` durchgereicht: `bare` im Drawer, `surface` in der Karte. | `Toene` |

Dass `document` und `summary` getrennt kommen, ist Absicht: 0074s
`SourceDocumentVM` trägt keine Freitexte (eine Zeile zeigt keine drei Sätze), und
die Wahl zwischen den beiden Zusammenfassungen ist eine
Aufrufer-Entscheidung.

Typen aus `src/ludwig/`: `SourceDocumentVM` und `SourceDocumentDetail` aus 0074,
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

## Der Nachzug an `SourceDocumentDrawer` (0052)

Im selben Arbeitsgang, weil der Drawer der einzige Aufrufer ist und sonst
beide Fassungen nebeneinander stünden:

| Was | Heute | Danach |
|---|---|---|
| Vorschau | inline-`<iframe>` in `DrawerBody` | `SourceDocumentPreview` (0075), `height="md"` |
| Fakten | vier Rechnungs-Labels | `SourceDocumentFacts` mit der Registry |
| Kopf-Zustand | `<StatusBadge axis="beleg" …>`, fest verdrahtet | die **Erledigung** (Achse `beleg_erledigung`) — die Achse `beleg` lebt am Rechnungs-Subtyp und hat für 16 % der Belege nie einen Wert (Befund L-42) |
| Kopf-Kennung | `invoiceNumber ?? originalFileName ?? reference` | die Rückfallkette aus 0074 — dieselbe Regel, ein Ort |
| Überschrift „Extrahierte Belegdaten" | fest | „Belegdaten" — bei einem Vertrag ist nichts extrahiert worden, was eine Rechnung extrahiert |

`SourceDocumentQuickView` schrumpft dabei auf `{ document, summary, previewUrl,
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

Titel `v3/Entitäten/Beleg/SourceDocumentFacts`.

| Story | Beweist |
|---|---|
| `Gefuellt` | Eine Rechnung: acht generische Zeilen plus der Rechnungsblock |
| `Ausprägungen` | **Die Kernstory.** Rechnung, Vertrag, Kontoauszug, Sonstiger Beleg und ein Beleg ohne Typ nebeneinander — gleiche Reihenfolge oben, verschiedene Blöcke unten, und bei den letzten dreien **kein leerer Block** |
| `Vertrag` | Der Registry-Eintrag, den kein Bestand belegt: Laufzeit mit und ohne Enddatum, „unbefristet", buchungsrelevante Fakten mit Herkunft KI und manuell |
| `Leer` | Ein Beleg, von dem nur Datei und Eingangsdatum bekannt sind — was steht da, und was steht bewusst nicht da |
| `Gruppe` | Der Block an der Relation, vier Fälle: ein Sammel-Original **ohne** Klammer-Typ („4 von 9 erledigt" — der Normalfall im Bestand), eines **mit**, ein Teilbeleg („Seiten 5–7 aus …") und eine **Rechnung**, die Teilbeleg ist: der Fall, den ein Renderer je Belegart verfehlt hätte |
| `Toene` | `bare` (Drawer) und `surface` (Karte) nebeneinander |
| `Rand` | 400-Zeichen-Zusammenfassung, 139-Zeichen-Dateiname, 868-Zeichen-Erledigungsgrund — alle drei Kürzungen, voller Text im `title` |
| `ImEinsatz` | Im `SourceDocumentDrawer`, neben einer Liste: Kopf, Vorschau, Fakten, Grenze, ein Ausgang — der Nachzug in einem Bild |

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

## Für den Bau

| | |
|---|---|
| Dateien | `SourceDocumentFacts.tsx` (Umbau), `source-document-detail.ts` (dritter Registry-Eintrag `facts`), `SourceDocumentDrawer.tsx` (Nachzug) — alle drei in `src/ui/v3/entities/source-document/`; Stories mit |
| Barrel | `SourceDocumentFactsVM` weicht dem neuen VM: der Export heißt weiter `SourceDocumentFacts`, der Typ entfällt zugunsten von `SourceDocumentVM` (0074) plus den beiden übrigen Props. `SourceDocumentQuickView` schrumpft, bleibt exportiert |
| CSS | Präfix **`v2doc`**, neuer Abschnitt am Ende von `v3.css`, überschrieben mit `0076` |
| Setzt voraus | **0074** (`source-document-detail.ts`, `SourceDocumentVM`) und **0075** (`SourceDocumentPreview`). Ohne beide lässt sich weder die Registry erweitern noch der Drawer nachziehen |
| Reihenfolge im Paket | erst der dritte Registry-Eintrag, dann `SourceDocumentFacts`, zuletzt der Drawer — er ist der einzige Aufrufer und beweist im Storybook, dass der Umbau trägt |
| Achtung | 0052 ist abgenommen. Der Drawer wird geändert, nicht neu gebaut: seine vier Zustände (Fehler → lädt → nicht gefunden → Inhalt) und das Fünf-Zonen-Schema bleiben, ebenso seine acht Stories. Was sich ändert, steht in der Tabelle „Der Nachzug an `SourceDocumentDrawer` (0052)". Die Abnahme dieser Aufgabe prüft beides: das Neue **und** dass 0052 weiter erfüllt ist |

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
- [ ] `grep -n "isInvoice" src/ui/v3/entities/source-document/` findet nichts
- [ ] Eine neue Belegart erfordert genau **einen** neuen Eintrag in `source-source-document-detail.ts` und keine Änderung an `SourceDocumentFacts.tsx` — nachgewiesen, indem der Vertrags-Eintrag als letzter hinzugefügt wird und die Komponente unverändert bleibt
- [ ] Der Gruppen-Block erscheint bei einer **Rechnung**, die Teilbeleg ist — er hängt an der Relation, nicht an der Belegart (Story `Gruppe`)
- [ ] Ein Sammel-Original mit `collectionKind = "not_connected"` oder ohne Wert sieht **vollständig** aus, nicht wie ein halb gefülltes Formular (Story `Gruppe`)
- [ ] Widersprechen sich Diskriminator und Subtyp-Zeile, steht **kein** Ausprägungs-Block — dieselbe Regel und dieselbe Datei wie 0074 (Story `Ausprägungen`)
- [ ] Ein Beleg ohne `group` bekommt keinen Block, auch keinen leeren (Story `Ausprägungen`)
- [ ] `tone` verhält sich wie Zeile 4 der Schnittstelle (Story `Toene`)
- [ ] Alle drei Kürzungen greifen, der volle Text steht im `title` (Story `Rand`)
- [ ] `SourceDocumentDrawer` zeigt die **Erledigung** im Kopf, nicht `axis="beleg"` (Story `ImEinsatz`)
- [ ] `SourceDocumentDrawer` enthält kein `<iframe>` mehr (`grep -n "iframe" src/ui/v3/entities/source-document/SourceDocumentDrawer.tsx` findet nichts)
- [ ] Ersetzt `BelegSummary` und `SourceDocFactsCard` ohne Funktionsverlust; die Rechnungs- und Vertragsfelder aus `GlanceCard` und `ContractDetail` stehen als Blöcke
- [ ] Tut bewusst nicht: Positionen, Vorsteuer, Ändern — der Aufrufer löst es mit 0072 und 0071

## Abnahme

Geprüft gegen Spec, Profil und Code, ohne Chatverlauf. Stand `000f2ad`
(seither unverändert). Browser: Storybook auf `:6107`, alle acht Fakten-
Stories und alle sechs Drawer-Stories aufgerufen, Feldzeilen und Zonen im DOM
gemessen.

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, 2026-09-05. `pnpm build` **nicht ausgeführt** — der Abnahme-Auftrag verbietet ihn (parallele Sitzungen); ersatzweise laden alle vierzehn Stories, `console-check.mjs` über `--kinds`, `--in-use` und die Drawer-Story meldet 0 Konsolenmeldungen | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `SourceDocumentFacts.tsx` + `.stories.tsx`, Titel `v3/Entitäten/Beleg/SourceDocumentFacts`; der Nachzug liegt in `SourceDocumentDrawer.tsx` mit eigener Story-Datei | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `SourceDocumentFacts.tsx:57–63` und `SourceDocumentDrawer.tsx:64–70`, dazu `resolveSourceDocumentDetail` (`source-document-detail.ts:230–236`); Kommentare durchgehend englisch | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | kein Hex, kein px in den drei Dateien (die Treffer der Stories liegen im Data-URI). Zustand über `axis="beleg_erledigung"` und `axis="dokumentgruppe"`, Belegart über `sourceDocTypeLabel()`, Vertragstyp über `contractTypeLabel()`. **Eine lokale Label-Map bleibt:** die Herkunft einer buchungsrelevanten Vertragsfakt, `source-document-detail.ts:191` — siehe Mangel 1 | ✗ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | acht Stories mit den Namen der Spec (`Gefuellt`, `Ausprägungen`, `Vertrag`, `Leer`, `Gruppe`, `Toene`, `Rand`, `ImEinsatz`); lädt und Fehler sind im Abschnitt „Verhalten" dem Aufrufer zugeschrieben (0042), leer nach Filter gibt es nicht | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Werte rechts mit `tabular-nums`, die Zusammenfassung als `.v2doc__prose` links ohne Ziffernstellung (die Nachbesserung aus 0052 hält); Kontraste wie in 0074 gemessen; kein Icon ohne Wort — die Erledigung steht als Wort mit Beschreibung im `title`; Karte mit Rand ohne Schatten. **Notiz:** `.v2fields__h` setzt `text-transform: uppercase`, die Blockköpfe erscheinen als „RECHNUNG", „VERTRAG", „DOKUMENTGRUPPE", der Zonen-Kopf als „BELEGDATEN" — Versalien (A2). Das kommt aus 0006 bzw. 0052 und betrifft das ganze Set; als Befund an die Grundlagen (0055), nicht als Mangel dieser Aufgabe | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | vierzehn Story-IDs geöffnet; Feldzeilen je Ausprägung, Blockzahl, Zonenpositionen und Kürzungen gemessen | ✓ |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Die acht generischen Zeilen stehen bei jeder Ausprägung in derselben Reihenfolge | `--kinds`, alle sechs Karten: Belegart · Gegenpart · Belegdatum · Eingang · Kennung · [Betrag] · Erledigung · [Zusammenfassung] — die Reihenfolge ist über alle sechs identisch. „Betrag" fehlt genau dort, wo die Ausprägung keins liefert (Kontoauszug, Sonstiger, ohne Typ, Widerspruch) — das verlangt das Kriterium „kein `—` für ein Feld, das es nicht gibt"; „Zusammenfassung" fehlt, wo der Aufrufer keine setzt | ✓ |
| Kontoauszug, Sonstiger Beleg und Beleg ohne Typ bekommen keinen Ausprägungs-Block | `--kinds`, gezählte Blöcke je Karte: Rechnung 2, Vertrag 2, Kontoauszug **1**, Sonstiger **1**, ohne Typ **1**. Kein leerer Block, keine Überschrift ohne Inhalt | ✓ |
| Keine Zeile heißt „Rechnungsnr." oder „Lieferant" an einem Nicht-Rechnungs-Beleg | die Labels der vier Nicht-Rechnungs-Karten sind ausschließlich die generischen sechs; „Netto", „USt.", „Fällig", „Zahlungsziel", „Leistungszeitraum", „USt-IdNr. des Ausstellers" stehen nur unter „RECHNUNG" | ✓ |
| `grep -n "isInvoice" src/ui/v3/entities/source-document/` findet nichts | ein Treffer, `source-document-detail.ts:13` — Fließtext im Modul-Kommentar, kein Zweig. In `SourceDocumentFacts.tsx` und `SourceDocumentDrawer.tsx` kommt keine Belegart als Wert vor, nur in Kommentaren | ✓ |
| Eine neue Belegart erfordert genau **einen** neuen Registry-Eintrag, ohne Änderung an `SourceDocumentFacts.tsx` | strukturell nachgewiesen: `SOURCE_DOCUMENT_DETAILS` ist ein Mapped Type über `SourceDocumentDetail["kind"]` (`source-document-detail.ts:135–137`) — ein dritter Union-Zweig erzwingt genau einen Eintrag und sonst nichts; `SourceDocumentFacts` liest nur `detail.facts` und kennt keinen `kind`-Wert. **Der in der Spec verlangte Nachweis über die Reihenfolge ist nicht führbar:** beide Einträge kamen in einem Commit (`000f2ad`), es gibt keinen Stand „ohne Vertrag" zum Vergleichen | ✓ |
| Der Gruppen-Block erscheint bei einer Rechnung, die Teilbeleg ist | `--group`, vierte Karte: drei Blöcke — generische Zeilen, „RECHNUNG", „DOKUMENTGRUPPE ǀ Ausschnitt = Seiten 12–13 aus Sammel-PDF vom 12.08.2026". Der Block hängt an `group`, nicht an der Belegart | ✓ |
| Ein Sammel-Original ohne Klammer-Typ sieht vollständig aus | `--group`, erste Karte: „DOKUMENTGRUPPE" mit „Teilbelege = 9" und „Erledigt = 4 von 9", **ohne** Klammer-Zeile — kein leeres Feld, kein halb gefülltes Formular. Zweite Karte zeigt denselben Block mit der Zeile „Klammer = Kreditkartenabrechnung" | ✓ |
| Widerspruch zwischen Diskriminator und Subtyp-Zeile: kein Ausprägungs-Block | `--kinds`, Karte „Widerspruch (B9)" (`other` mit `detail.kind = "invoice"`): ein Block, sechs generische Zeilen, Kennung = Dateiname. Dieselbe Regel und dieselbe Zeile wie 0074 (`resolveSourceDocumentDetail`) | ✓ |
| Ein Beleg ohne `group` bekommt keinen Block | `--kinds`: keine der sechs Karten trägt einen „DOKUMENTGRUPPE"-Block; `--empty` ebenso wenig | ✓ |
| `tone` verhält sich wie Zeile 4 der Schnittstelle | `--tones`: `bare` = `background: rgba(0,0,0,0)`, `border-top-width: 0px`, `padding: 0px`; `surface` = `rgb(255,255,255)`, `1px solid`, `padding: 20px` | ✓ |
| Alle drei Kürzungen greifen, der volle Text steht im `title` | `--edges`: Kennung 88 Zeichen sichtbar (Mitte gekürzt, Endung lesbar), `title` 121; Zusammenfassung 259 sichtbar, `title` 356; Erledigungsgrund im `title` der Marke, auf 280 Zeichen gekürzt — so und nicht anders schreibt es die Schnittstelle von 0074 („Freitext im `title` der Marke, gekürzt bei 280 Zeichen"), der Volltext steht also bei diesem einen bewusst nirgends. **Abweichung der Story-Daten:** 356 / 121 / 776 statt der behaupteten 400 / 139 / 868 (offener Punkt 3) | ✓ |
| `SourceDocumentDrawer` zeigt die Erledigung im Kopf, nicht `axis="beleg"` | `--in-use`: Kopf „Rechnung · ACME GmbH ǀ RE-4471 ǀ Gebucht", `title` der Marke „Erledigung: Gebucht · Der Beleg ist gebucht — …" (Achse `beleg_erledigung`). Die Kennung des Kopfes kommt aus derselben Rückfallkette wie die Zeile (`identText` → `sourceDocumentIdentifier`) | ✓ |
| `SourceDocumentDrawer` enthält kein `<iframe>` mehr | `grep -n "iframe" …/SourceDocumentDrawer.tsx` → kein Treffer. Das `<iframe>` im DOM kommt aus `SourceDocumentPreview` (`title="Vorschau von RE-4471-ACME.pdf"`, `height="md"` → 558 px) | ✓ |
| Ersetzt `BelegSummary`, `SourceDocFactsCard`, die Fakten von `GlanceCard` und `ContractDetail` | dieses Repo ist das ausgelagerte Set; die Ablösung ist ein eigener Schritt (`docs/backlog/README.md`). Die Felder selbst sind da: der Rechnungsblock trägt Netto, USt., Fälligkeit, Zahlungsziel, Leistungszeitraum, USt-IdNr.; der Vertragsblock Vertragstyp, Laufzeit und die buchungsrelevanten Fakten | offen (App) |
| Tut bewusst nicht: Positionen, Vorsteuer, Ändern | keine Prop schreibt, kein Formularfeld im DOM der acht Stories; keine Positionsliste, keine Vorsteuer-Aufstellung | ✓ |

**0052 ist weiter erfüllt** (die Spec verlangt diese Prüfung ausdrücklich)

| Kriterium aus 0052 | Nachweis | Ergebnis |
|---|---|---|
| Zonen 1 · 2 · 3 · 4 · 5 in dieser Reihenfolge | `SourceDocumentFacts --in-use`: `v2drawer__h` y = 0 · `v2doc__orig` y = 172 · `v2doc__h` („BELEGDATEN") y = 265 · `v2fields--bare` y = 290 · `v2doc__limit` y = 801 · `v2drawer__foot` y = 840 | ✓ |
| Zone 3 verwendet dieselbe Komponente wie der View | `SourceDocumentDrawer.tsx:19` importiert `SourceDocumentFacts`; im Drawer steht keine zweite Feldliste | ✓ |
| Der Fuß trägt genau eine Aktion | ein `<button>`: „Vollständige Belegansicht öffnen" | ✓ |
| Vier Zustände in der Vorrangfolge `error` → `loading` → `record === null` → Inhalt | `--fehler` zeigt „Beleg RE-4471 konnte nicht geladen werden: …" trotz `record = null`; `--laedt` setzt `record` **und** `loading` und zeigt die Ladefläche; `--nicht-gefunden` den Leertext mit der Kennung; `--geoeffnet` den Inhalt. Fuß leer in Fehler und Leerfall | ✓ |
| Der Fehlertext enthält `reference` wörtlich | „Beleg **RE-4471** konnte nicht geladen werden: Die Ablage antwortet nicht (Zeitüberschreitung nach 30 Sekunden)." | ✓ |
| Sechs Drawer-Stories bleiben | `Geoeffnet`, `OhneVorschau`, `Laedt`, `Fehler`, `NichtGefunden`, `ImKontext` — dieselben sechs wie vor `000f2ad` (`git show 000f2ad^:…` zeigt dieselben Exportnamen). Die Spec spricht von „acht Stories"; es waren sechs, keine ist verloren gegangen | ✓ |
| Ladezustand hat die Form des Inhalts (Nachbesserung 2 der 0052-Abnahme) | gemessen bei 1440 × 900: Skelett `.v2doc__origskel` bei y = 101, 558 px, ohne Rahmen; das Original steht seit dem Nachzug bei y = 172 in einer Karte mit Kopf. Die Deckung, die die 0052-Abnahme hergestellt hatte, ist um 71 px und um den Kartenrahmen verloren — siehe Mangel 2 | ✗ |

**Story-Deckung** (`spec-schreiben` §6)

| Frage | Nachweis | Ergebnis |
|---|---|---|
| Hat jede Prop ihre Story? | `document` (alle), `summary` (`Gefuellt`, `Rand`), `group` (`Gruppe`), `tone` (`Toene`, und `bare` in fast jeder Karte) | ✓ |
| Stimmt die Zahl mit der Ableitung? | 8 = 2 anwendbare Zustände + 2 Enum-Achsen + 1 unbelegter Registry-Eintrag + 1 Relations-Block + 1 Rand + 1 im Einsatz | ✓ |
| Ist jeder ausgeschlossene Zustand begründet? | lädt und Fehler trägt der Aufrufer (0042), leer nach Filter gibt es nicht — beides im Abschnitt „Verhalten" | ✓ |

**Mängel**

1. **Lokale Label-Map für die Herkunft einer Vertragsfakt** —
   `src/ui/v3/entities/source-document/source-document-detail.ts:191`:
   `` `${fact.value} · ${fact.source === "manual" ? "von Hand" : "automatisch gelesen"}` ``.
   `ProvenanceSource` ist ein echter Fachtyp
   (`src/ludwig/modules/contracts/domain/contract.ts:7`), aber er hat weder
   ein Label in `src/ludwig/` noch eine Achse in der Status-Registry — der
   deutsche Text ist hier erfunden. Die feste Prüfliste verbietet genau das
   („keine lokale Label-Map"), und 0074 zeigt den Hausweg am selben Problem:
   Typ lokal definieren **plus** Register-Eintrag (L-47) **plus** Achse
   (`beleg_erledigung`, L-41). Zu tun: Label nach `contract.ts` neben
   `CONTRACT_TYPE_LABELS` oder eine Achse anlegen, und den Befund melden.
   Sichtbar in `--contract`: „Konto = 4210 Miete · automatisch gelesen".
2. **Die Ladefläche des Drawers hat nicht mehr die Form des Inhalts** —
   `SourceDocumentDrawer.tsx:158–163` zeichnet weiter ein nacktes
   `.v2doc__origskel` (y = 101, 558 px), während Zone 2 seit dem Nachzug eine
   `Card` mit Kopf ist (Original bei y = 172, darüber „Rechnung · 3 Seiten").
   Beim Umschlag von `Laedt` auf `Geoeffnet` springt das Original um 71 px und
   bekommt einen Rahmen. Genau diese Deckung war Nachbesserung 2 der
   0052-Abnahme; die Spec verlangt, dass 0052 erfüllt bleibt. Kleiner Eingriff:
   das Skelett in dieselbe Karte setzen bzw. eine Kopfzeile davor.
3. **Die Rand-Story behauptet Zahlen, die nicht stimmen** —
   `SourceDocumentFacts.stories.tsx:396–398` sagt „a 400-character summary, a
   139-character file name … and an 868-character completion reason";
   tatsächlich sind es 356, 121 und 776 Zeichen. Das Profil nennt als
   Höchstwerte 400 (Zusammenfassung), 139 (Dateiname) und 868 (Grund) — die
   Story bleibt unter allen dreien. Die Kürzungen greifen trotzdem (nachgemessen
   oben); zu ändern sind die Daten oder der Kommentar.

**Offene Punkte ohne Mangel-Status**

- `SourceDocumentQuickView` hat sechs Felder, die Spec nennt fünf: `group` ist
  dazugekommen, sonst könnte der Drawer den Gruppen-Block nicht zeigen. Richtig
  so, nur in der Spec nicht nachgetragen. Dabei fällt auf: `excerpt` (für die
  Vorschau) und `group` in seiner Teilbeleg-Form beschreiben **dieselbe**
  Relation; ein Aufrufer muss beide setzen und konsistent halten. Kandidat für
  eine Zusammenlegung in 0071.
- Der Zahlstatus einer Rechnung steht als **Datum** („Bezahlt = …"), nicht als
  Wort — begründet im Kommentar zu `paidAt` (`source-document-detail.ts:57–62`):
  `payment_status` hat weder Achse noch Enum. Das deckt sich mit dem Verbot der
  lokalen Label-Map und ist die richtige Entscheidung; der Befund gehört ins
  Register, damit die Achse irgendwann entsteht.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Ergebnis: **zurück
auf `in Arbeit`**, drei Mängel — einer davon an der festen Prüfliste
(Label-Map), einer an 0052 (Form des Ladezustands), einer an den Story-Daten.
Der fachliche Kern — acht Ränge in fester Reihenfolge, Block nur bei
Zustimmung beider Quellen, Gruppen-Block an der Relation — trägt und ist
gemessen.

**Status-Nachtrag 2026-09-05.** Gebaut ist die Aufgabe seit `000f2ad`
(„pnpm typecheck und pnpm build grün, alle 21 Stories im Browser
angesehen. Abnahme steht aus und gehört einem anderen Agenten.") — der
Status stand seither fälschlich auf `in Arbeit`. Er sagt jetzt, was der
Fall ist: `Abnahme`.

## Die drei Mängel der Abnahme vom 2026-09-05 — behoben

**M1 — die erfundene Label-Map.** `source-document-detail.ts` schrieb „von
Hand" und „automatisch gelesen" für `ProvenanceSource`. Beide Wörter waren
**erfunden**: die App sagt an derselben Stelle „geprüft" (Titel „Vom Menschen
geprüft / gesetzt") und „KI · 87 %" (`ContractDetail.tsx`, `ProvMark`,
Z. 96–120). Zwei Namen für denselben Zustand sind der Anfang einer geteilten
Sprache — derselbe Fehler wie in der Abnahme von 0080 M1.

Jetzt stehen die Wörter der App, wörtlich kopiert, in einer benannten Funktion
`provenance()` mit dem Vermerk, woher sie stammen. Mitgenommen: die
Konfidenz, die die App zeigt und die hier fehlte.

Dass sie überhaupt kopiert werden müssen, ist der eigentliche Befund und steht
als **L-67** im Register: den Typ `ProvenanceSource` gibt es im Spiegel, die
Wörter nicht. Mit einer Achse fällt `provenance()` weg und ein `StatusBadge`
tritt an seine Stelle.

**M2 — die Ladefläche hatte nicht mehr die Form des Inhalts.** Nachbesserung 2
der 0052-Abnahme hatte diese Deckung hergestellt; mit 0075 zog das Original in
eine Karte mit Kopf, das Skelett blieb eine nackte Fläche. Gemessen: Karte bei
y = 101, Skelett bei 101 ohne Rahmen — das geladene Original begann bei 172,
der Sprung war 71 px.

Jetzt steht das Skelett in **derselben Karte mit demselben Kopf**: eine
Kopfzeile in Titelhöhe, darunter die Fläche mit derselben Höhe und demselben
Innenabstand wie das `<iframe>`.

Nachgemessen (`--laedt` gegen `--geoeffnet`): Karte 101 / 101, Kopfhöhe
51 / 51, Original y 173 / 172, Höhe 558 / 558. Ein Pixel Unterschied, statt
71.

**M3 — die Story `Rand` behauptete Zahlen, die nicht stimmten** (400/139/868
gegen tatsächlich 356/121/776). Die Texte sind auf die genannten Längen
gebracht und der Kommentar auf die **gemessenen** Zahlen: 401 Zeichen
Zusammenfassung, 139 Dateiname, 871 Erledigungsgrund.

## Abnahmekriterien (Nachtrag)

- [ ] Keine erfundenen Wörter für `ProvenanceSource` — der Wortlaut ist der der App (`ContractDetail.tsx`, `ProvMark`)
- [ ] Der Befund steht als L-67 in `docs/befunde-app.md`
- [ ] Die Ladefläche steht in derselben Karte mit demselben Kopf wie das geladene Original (`--laedt` gegen `--geoeffnet`, gemessen)
- [ ] Die drei Zahlen im Kommentar der Story `Rand` sind gemessen, nicht behauptet
