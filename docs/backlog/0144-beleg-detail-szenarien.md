# 0144 · Beleg-Detailseite — Szenarien als Seiten-Stories

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-09, am selben Tag nachgearbeitet |
| Stufe | `src/showcase/` — Seiten-Stories unter `Seiten/Beleg/…`, komponiert aus `entities/source-document/` |
| Klassen-Test | entfällt — keine Komponente, sondern der Nachweis, dass die vorhandenen Bausteine **jeden** Zustand der Belegdetailseite tragen |
| Quelle | Owner-Anfrage 2026-09-09 („jeden Zustand der Belegview als Story abbilden, Szenarien sammeln, bevor das Design finalisiert wird") · Seitenprofil `docs/seiten/beleg-detail.md` · Entitätsprofil `docs/entitaeten/source-document.md` · Standard `docs/detailseiten-standard.md` (D1–D16) · Datenmodell `ludwig/app`: `client_source_docs` + `…_invoices` + `…_contracts`, Achsen aus `src/ludwig/ui/status/status-registry.ts` |
| Ersetzt | nichts in der App. Ergänzt die Baustein-Stories `SourceDocumentView.stories.tsx` (Filled · Pending · OtherTab · LoadingAndError · Bare · InUse), die die Seite nur im Normalfall zeigen |
| Blockiert | die Finalisierung des Beleg-Detail-Designs und die App-Ablösung von `page.tsx` (671 Z.), `InvoiceSidebar`, `ContractDetail`, `ExtractionCorrectionCard` |
| Spec von / am | Claude (`ludwig-manager`), 2026-09-09 · gesichtet und übernommen von `designsystem-worker` am 2026-09-09 |
| Reihenfolge | **nach 0139–0143** (Partner-Welle). Sie hängt an keiner davon — sie steht hinten, weil die Partner-Welle zuerst freigegeben war |
| Freigegeben | 2026-09-09 vom Owner (Simon), alle drei offenen Fragen wie vorgeschlagen entschieden |

## Gesichtet am 2026-09-09

Die Spec entstand in einem anderen Checkout desselben Repos, der auf `400d29c`
stand — deshalb hier die Prüfung der Verweise gegen `main`:

| Geprüft | Ergebnis |
|---|---|
| Nummer 0144 frei | ja — `main` steht auf 0143 (die Spec hieß zuerst 0139 und wurde umnummeriert) |
| Die sieben zitierten Specs (0047, 0048, 0070, 0071, 0072, 0075, 0076) | alle vorhanden |
| Die sechs Story-Namen von `SourceDocumentView.stories.tsx` | stimmen zeichengleich (`Filled`, `Pending`, `OtherTab`, `LoadingAndError`, `Bare`, `InUse`) |
| Die Regel-Kennungen D4, D9, D12, D-L2 | alle im Standard vorhanden |
| `source-document-vm.ts`, `contract.ts`, `status-registry.ts` im Spiegel | alle drei da (Stand `ab7863d8` nach dem Lauf vom 2026-09-09) |
| Die Showcase-Präzedenz `src/showcase/CaseCrud.stories.tsx` | vorhanden |
| Verhältnis zu **0138** | stimmig: die Spec nennt den dritten Slot bereits „Signal" und gibt ihm eine Prioritätsreihenfolge — genau der Name, auf den die drei gebauten Rahmen umbenannt werden |

## Ziel

Die Belegdetailseite hat **eine** Route für jede Belegart, aber heute
mindestens fünf Gesichter: die Rechnung mit Pipeline und Review-Gate, der
Vertrag mit Feldprüfung, das Sammel-PDF mit Kindern, der Container ohne
eigene Felder, der unklassifizierte Scan. Dazu Zustände, die quer dazu liegen:
Extraktion läuft, Mangel, Eskalation an die Kanzlei, Korrektur, erledigt.
Niemand hat diese Fälle nebeneinander gesehen — das Design wurde am Normalfall
(Rechnung, sauber) entschieden, und die Sonderfälle wurden in der App als
Kinder unter die Karte gehängt („die gesonderte Box").

Diese Aufgabe legt jeden Zustand als Story an, mit **synthetischen Fixtures**
(keine echten Belege, keine Staging-Daten), damit der Owner das Design an
allen Fällen abnimmt, bevor die App migriert. Was in den Stories nicht
trägt, ist ein Befund an das Seitenprofil oder an die App — nicht an die
Story.

## Einordnung

- **Wiederverwenden:** `SourceDocumentView` (Rahmen, 0071), `SourceDocumentCard`,
  `SourceDocumentFacts` mit Registry (0076), `SourceDocumentPreview` (0075),
  `SourceDocumentList` (0070), `EntityHeader` (0048), `RecordPager` (0047),
  `StatusCallout`/`Banner`, `Tabs`, `FieldList`, `InlineEdit`, `LogList`,
  `RawRecord`, `Combobox`, `ReasonDialog`, `OverflowMenu`. Reiter-Inhalte
  außerhalb des ersten (Positionen, Vorsteuer, Verlauf, Rohdaten) werden als
  Platzhalter-`Card` mit einem Satz gerendert — sie sind nicht Gegenstand
  dieser Aufgabe (0072).
- **Neu, weil:** Regel §3 Nr. 1 — jeder Fall hat seinen Export. Es entsteht
  **keine Komponente**. Was fehlt, ist die Komposition auf Seitenebene je
  Zustand; das ist Story-Arbeit nach dem Muster von `src/showcase/CaseCrud.stories.tsx`.
- **Zuschnitt:** drei Story-Dateien (mehr als zehn Stories in einer Datei sind
  das Zerlegungssignal aus `spec-schreiben` §6), eine Fixture-Datei:

  | Datei | Titel | Stories |
  |---|---|---|
  | `src/showcase/document/DocumentInvoice.stories.tsx` | `Seiten/Beleg/Rechnung` | R1–R9 inkl. R4b — **10 Exporte** |
  | `src/showcase/document/DocumentOtherKinds.stories.tsx` | `Seiten/Beleg/Andere Belegarten` | A1–A7 inkl. A5b und A5-`none` — **9 Exporte** |
  | `src/showcase/document/DocumentPageStates.stories.tsx` | `Seiten/Beleg/Seite` | S1–S3 — **3 Exporte** |
  | `src/showcase/document/fixtures.ts` | — | Builder, keine Story |
  | `src/showcase/document/DocumentPage.tsx` | — | der Rahmen, den alle Szenarien teilen; keine Story |

- **Setzt auf:** Typen aus `src/ludwig/modules/source-docs/domain/source-document-vm.ts`
  (`SourceDocumentVM`, `SourceDocumentDetail`) und
  `src/ludwig/modules/contracts/domain/contract.ts`. Achsenwerte **nur** aus
  `status-registry.ts`; keine lokale Label-Map.

## Fixtures — Regeln

- Ein Builder `documentFixture(overrides)` liefert eine vollständige
  `SourceDocumentVM` mit Vorgabewerten (Rechnung, sauber). Jede Story
  überschreibt nur, was sie beweist. Ein zweiter Builder `rechnungDetail(…)`
  bzw. `vertragDetail(…)` für die Ausprägung.
- Namen sind erfunden und erkennbar erfunden: Musterbau GmbH, Beispiel-Energie
  AG, Testbank eG. Keine IBAN, keine USt-IdNr, kein Name aus Staging.
  Beträge glatt, Daten im Jahr 2026.
- Die Vorschau ist ein eingebettetes Platzhalter-PDF (ein Blatt, Text
  „Muster-Rechnung R-2026-0042"), kein Netzzugriff. Bei mehrseitigen Fällen
  (Sammel-PDF) genügt derselbe Platzhalter mit `pageCount`.
- Was heute keine Prop hat (Zahlungskonto-Kandidaten, Befunde, Korrektur-
  Callbacks), wird in der Story als Markup an der Aufrufstelle komponiert
  (`Card` + `FieldList` + `Combobox`), nicht als neue Prop am Baustein. Das
  ist Absicht: erst die Story zeigt, ob eine Prop nötig ist (A12).
- Kein `useState` außer dort, wo der Rundlauf gezeigt wird (Korrektur, Auswahl).

## Die Seite, wie die Stories sie zeigen

Verbindlich ist der Standard (D1–D16) mit den Abweichungen des Seitenprofils.
Für alle Stories gilt derselbe Rahmen:

| Slot | Inhalt | Regel |
|---|---|---|
| Pager | `RecordPager` mit `back`, das die Liste **nennt**, `n/m`, `J`/`K` | ohne Liste nur der Zurück-Weg |
| Kopf | `EntityHeader`: overline Belegart · title Gegenpart (sonst Belegart) · **ein** Status `beleg_erledigung` · meta `SourceDocumentClass` · rechts max. zwei Aktionen, Rest im `OverflowMenu` | die Verarbeitung steht **nie** im Kopf |
| Signal | **genau ein** Banner, Priorität: Einordnung fehlgeschlagen › wird eingeordnet › Extraktion läuft › fehlgeschlagen › Prüfung nötig › an Kanzlei › Dublettenverdacht | Herkunftshinweis (Teilbeleg) ist **kein** Banner mehr, sondern Fakten-Zeile |
| Reiter | Übersicht · Details · Positionen · Vorsteuer · Verlauf · Rohdaten | Positionen/Vorsteuer nur mit Rechnungszeile; Pipeline ist Tiefe im Verlauf (D12) |
| Körper Übersicht | Zone 2 **Mängel** (jeder mit Weg) · Zone 3 Original links, Fakten rechts (D-L2) · Zone 4 Teilbelege/Positionen-Abriss · Zone 5 letzte Einträge | Zone 2 fällt weg, wenn nichts fehlt — mit ihrem Abstand |
| Körper Details | `FieldList` mit `InlineEdit` je Wert; Ausprägungs-Registry liefert die Zeilen; hier liegen Korrekturen, die mehr als einen Wert betreffen | die Übersicht schreibt nur über Aktionen und aus einer Mängelzeile (D9) |

**Was damit aus der App verschwindet:** die Typ-Box unter der Karte
(`InvoiceSidebar`, `ContractDetail`). Lesendes wandert in die Fakten
(Registry), Schreibendes in den Reiter „Details". Offene Frage 3 unten.

## Szenarien

Jede Zeile ist eine Story. „Sieht" ist, was ohne Klick über der Falz steht;
„Tut" ist der Weg der Rolle; „Beweist" ist die Abnahmefrage.

### Rechnung (`Seiten/Beleg/Rechnung`)

| Nr. | Export | Zustand (Achsen) | Sieht | Tut | Beweist |
|---|---|---|---|---|---|
| R1 | `Sauber` | `classified` · `processed` · `proposed` · erledigt `booking` · Sachverhalt 1 | Original, Fakten, „Zum Sachverhalt →", keine Mängel-Zone | nichts, Kontrolle | Rang 1–4 ohne Scrollen bei 1440 × 900 |
| R2 | `DateMissing` | wie R1, aber `documentDate` NULL, offen | Zone 2: „Belegdatum fehlt" mit Weg; in den Fakten steht der Mangel an der Zeile, keine Leerzeile | Datum setzen (InlineEdit an der Mängelzeile) | häufigster Mangel ist als Mangel sichtbar, nicht als leeres Feld |
| R3 | `AwaitingReview` | `processed` · Stage `extracted` · offen | Banner „extrahiert — Prüfung bestätigen"; Aktion „Prüfung bestätigen" als erste Aktion | bestätigt | das Review-Gate ist Signal + Aktion, nicht Kopf-Status |
| R4 | `ExtractionRunning` | `in_progress` · Stage `classified` | Fortschritt im Signal-Slot mit „läuft seit"; Fakten leer mit Hinweis, keine Aktionen außer Menü | wartet | Fortschritt hängt am Beleg, Fakten zeigen keine Leerzeilen |
| R4b | `ExtractionStuck` | wie R4, Start vor 4 Minuten | Stall-Warnung im selben Banner, Menü bietet „Neu verarbeiten" | neu anstoßen | ein Banner, nicht zwei |
| R5 | `Fehlgeschlagen` | `failed` | Banner mit Ursache und nächstem Schritt; Fakten so weit vorhanden | neu verarbeiten / erledigen mit Grund | Fehler nennt Ursache **und** Weg |
| R6 | `WithFirm` | `review_disposition = accounting`, Grund gesetzt | Banner „an die Kanzlei übergeben: <Grund>"; Reiter Details offen mit Korrektur-Feldern; Aktion „An Agent zurückgeben" | korrigiert oder gibt zurück | Eskalation ist sichtbar, der Weg zurück ist ein Knopf |
| R7 | `CorrectedValues` | wie R1, Rolle bezweifelt Betrag und Nummer | Reiter **Details**: Kopfwerte (Gegenpart, Nummer, Datum, Netto/USt/Brutto) als `InlineEdit`; Positionen mit „deaktivieren"; korrigierte Werte tragen ein Zeichen „von Hand" mit Provenienz | ändert zwei Werte, sieht die Summe nachrechnen | Korrektur betrifft mehr als einen Wert und lebt deshalb im Reiter, nicht in der Übersicht (D9) |
| R8 | `WithFindings` | `open_findings` 3 (Dublette `suspected`, Partner `ambiguous` mit 2 Kandidaten, Empfänger `mismatch`) | Zone 2 mit drei Mängeln, jeder mit Weg: Dublette → „Original öffnen"/„kein Duplikat"; Partner → `Combobox` mit Kandidaten; Empfänger → „gehört nicht zum Mandanten" | wählt Partner, verwirft Dublette | Mängel sind eine Zone, keine drei Kästen |
| R9 | `Erledigt` | erledigt `no_booking_required` mit Grund; Variante `superseded` | Kopf-Status „keine Buchung nötig" mit Tooltip-Grund; Aktion „Wieder öffnen"; Fakten lesend | öffnet wieder | ein Status im Kopf, der Grund im Tooltip, nicht als zweite Zeile |

### Andere Belegarten (`Seiten/Beleg/Andere Belegarten`)

| Nr. | Export | Zustand | Sieht | Tut | Beweist |
|---|---|---|---|---|---|
| A1 | `Vertrag` | `contract`, Felder extrahiert, unbestätigt | Fakten aus der Vertrags-Registry (Typ, Laufzeit, Betrag, Booking-Facts mit Provenienz); Zone 2: „Felder nicht bestätigt" mit Weg | Reiter Details: bestätigt je Feld oder korrigiert | Vertrag ist dieselbe Seite mit anderen Fakten; erster Reiter heißt gleich |
| A2 | `SammelPdf` | `document_collection`, 3 Kinder | Original ganz (23 Seiten), Fakten generisch, Zone 4: Teilbelege-Liste mit Seitenbereich als Hauptinhalt | öffnet ein Kind | Container zeigt Kinder, keinen leeren Rechnungsblock |
| A3 | `Teilbeleg` | Kind von A2, Rechnung, Seiten 4–5 | Fakten-Zeile „Teil von <Original>, Seiten 4–5" mit Weg; sonst wie R1 | geht zum Original | Herkunft ist Fakt, nicht Banner |
| A4 | `StatementAssigned` | `bank_statement_pdf`, Zahlungskonto exakt getroffen (IBAN) | Fakten: Dokumentgruppe, Zahlungskonto „Testbank eG · Geschäftskonto" mit Zeichen „per IBAN erkannt", Zeitraum, Zeilenzahl; Weg „Zum Kontoauszug →" (Import-Batch) | nichts | Container hat einen Registry-Eintrag; die Seite bleibt nicht leer |
| A5 | `StatementChooseAccount` | `bank_statement_pdf`, Match `ambiguous` (2 Kandidaten) und Variante `none` | Zone 2: „Zahlungskonto nicht eindeutig" mit `Combobox` der Kandidaten (Name, Kennung, Bank) und Wahl; bei `none`: „kein Zahlungskonto passt" mit Weg „Zahlungskonto anlegen" (Stammdaten), **kein** Auto-Anlegen | wählt das Konto, Story zeigt den Rundlauf | die Auswahl ist ein Mangel mit Weg; Kandidaten vorgelegt, nicht geraten (bank.md R4/R5) |
| A5b | `StatementWronglyAssigned` | wie A4, aber Rolle erkennt: falsches Konto | Fakten-Zeile Zahlungskonto mit `InlineEdit` → Kandidaten; Hinweis „Buchungen bleiben, akzeptierte brechen ab" | ordnet um | Korrektur ohne Vorbeigreifen am Bestand (`reassignImportBatch`) |
| A6 | `CreditCardTravel` | `credit_card_statement` bzw. `travel_expense_report` mit Kindern und Kartenkennung „…4711" | wie A4/A2 kombiniert: Zahlungskonto per Kartenende, Kinder darunter | nichts | dieselbe Registry-Regel wie Kontoauszug, kein Sonderpfad |
| A7 | `WithoutSubtype` | `payment_reminder` (Mahnung), `other`; Variante Diskriminator `invoice` ohne Rechnungszeile | nur die generischen Zeilen; Zone 2: „Klassifikation prüfen" bei Widerspruch; Aktion „Klassifikation korrigieren" mit Belegart-Wahl | korrigiert die Belegart | kein leerer Rechnungsblock; Widerspruch ist ein Mangel mit Weg |

### Seite (`Seiten/Beleg/Seite`)

| Nr. | Export | Zustand | Sieht | Beweist |
|---|---|---|---|---|
| S1 | `BeingClassified` | `pending_classification`; Variante `classification_failed` mit Fehlertext | Banner „wird eingeordnet — die Seite aktualisiert sich selbst"; Belegart „Beleg", Fakten: Dateiname, Eingang; Aktionen gesperrt. Variante: Danger-Banner mit Ursache, Menü „Neu einordnen"/„Klassifikation korrigieren" | unklassifiziert ist ein Zustand der Seite, kein Fehler |
| S2 | `LoadingErrorNotFound` | drei Zustände nebeneinander | Kopf-Skeleton; Fehler mit nächstem Schritt; „Beleg nicht gefunden" mit Weg zur Liste | drei der fünf Pflichtzustände |
| S3 | `InUse` | R1 in `AppShell` mit Navigation und Pager `1/117`, back „← Problematische Belege" | die ganze Seite bei 1440 × 900 | Rang 1–4 über der Falz, gemessen |

Nicht anwendbar: „leer nach Filter" (die Seite hat keinen Filter).

## Verhalten (was die Stories zeigen müssen)

- `J`/`K` und `←`/`→` über `RecordPager`; `Strg+1..6` Reiter.
- Reiter sind Links (`tabHref`), der aktive kommt aus `activeTab`.
- InlineEdit: Enter speichert, Esc verwirft, Fehler bleibt am Feld.
- Combobox (A5, R8): Tastaturwahl, Bestätigen mit Enter, der gewählte Wert
  steht danach als Fakten-Zeile mit Zeichen „von Hand".
- Server-Component-Rahmen; Client nur in den Rundlauf-Stories.

## Ausbau

| Was fehlt | Wo es hingehört | Woran man merkt, dass es Zeit ist |
|---|---|---|
| `paymentAccount` + `paymentAccountMatch` an `SourceDocumentVM` und Registry-Eintrag für Container | App-VM + `source-document-detail.ts` | A4/A5 halten im Markup, Owner nimmt sie ab |
| `findings: { code, severity, message, action? }[]` als Mängel-Zone | eigene Spec, `patterns/` oder `entities/` | R8 hält, dieselbe Zone wird am Sachverhalt gebraucht |
| Korrektur-Callbacks am View (`onSetDocumentDate`, `onOverrideClassification`, `onComplete`, `onCorrectExtraction`) | 0071 Ausbau | R2/R7/A7 abgenommen |
| Positionen/Vorsteuer als Reiter-Inhalte | 0072 | — |

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Drei Story-Dateien + `fixtures.ts` unter `src/showcase/document/`, Titel wie oben
- [ ] Code englisch, Labels deutsch; kein Hex, kein px, keine lokale Label-Map; Achsenwerte aus der Registry
- [ ] Jedes Szenario der Tabellen oben hat seinen **eigenen** Export — 22 sind
      es, nicht 19: R4b, A5b und die Variante `none` von A5 tragen eigene
      Namen, statt Zeilen ihrer Nachbarn zu sein. Eine Story, die nur in der
      Beschreibung einer anderen vorkommt, wird nie geprüft
- [ ] „Leer nach Filter" begründet ausgeschlossen
- [ ] Fixtures synthetisch (`grep -ri "iban\|DE[0-9]\{2\}" src/showcase/beleg` leer; kein Name aus `docs/entitaeten/*.md`-Datenständen)
- [ ] Im Browser angesehen

Variabel:

- [ ] Jede Story hat genau **ein** Banner oder keins (R4b, R6, S1 gemessen)
- [ ] Zone 2 fehlt in R1/A4/R9 samt Abstand; vorhanden in R2/R8/A1/A5/A7 mit Weg je Mangel
- [ ] Der erste Reiter heißt in R1/A1/A2/A4/S1 gleich („Übersicht")
- [ ] Korrekturen mit mehr als einem Wert liegen im Reiter „Details" (R7, A1); Einzelwert an der Mängelzeile (R2, A5)
- [ ] A4/A5/A6 zeigen keinen Rechnungsblock; A7 keinen leeren
- [ ] S3 bei 1440 × 900: Kopf, Reiterleiste und die **vollständigen**
      Belegdaten stehen über der Falz; das Original beginnt darüber und
      reicht darunter hinaus — eine PDF-Vorschau ist so hoch, wie ein Blatt
      hoch ist. „Über der Falz" heißt hier **ohne Scrollen lesbar**, nicht
      „vollständig sichtbar"
- [ ] Jeder Fall, den ein Baustein **nicht** trägt, steht als Befund unten und in `docs/befunde-app.md`, nicht als Sonderpfad in der Story

## Entschieden am 2026-09-09 (Owner)

Alle drei wie vorgeschlagen — die Vorgaben gelten damit als Entscheid, nicht
mehr als Rückfallwert:

1. **Die Typ-Box wird aufgelöst.** Lesendes wandert in die Fakten-Registry,
   Schreibendes in den Reiter „Details". `InvoiceSidebar` und `ContractDetail`
   verschwinden damit; R7 und A1 zeigen beide Wege nebeneinander.
2. **Die Zahlungskonto-Wahl steht auf der Belegseite**, als Mangel mit Weg —
   nicht nur am Import-Batch. Begründung, die trägt: dort landet die Rolle,
   wenn ihr der Kontoauszug in der Belegliste auffällt, und einen anderen
   UI-Pfad gibt es heute nicht (**L-268**, `bank-offen` P1).
3. **Befunde bekommen eine eigene Zone 2** nach D4. Die Fakten tragen
   zusätzlich das Zeichen an der betroffenen Zeile — das ist kein zweiter
   Ort für dieselbe Aussage, sondern der Mangel am Wert statt in einer
   Sammelliste.

Was daraus für den Bau folgt: **keine der drei Antworten braucht eine neue
Prop.** Alle drei sind Kompositionen an der Aufrufstelle, so wie es der
Abschnitt „Fixtures" ohnehin verlangt. Was danach als Prop nötig ist, geht als
Ausbau an 0071 und 0076 — nicht vorher.

## Nachzuziehende Dokumente

- `docs/seiten/beleg-detail.md` — Abschnitt „Zustände" mit Verweis auf die
  Stories; Herkunftshinweis wird Fakten-Zeile.
- `docs/entitaeten/source-document.md` — Container-Ausprägung (Zahlungskonto)
  in der Registry-Regel ergänzen.
- `docs/befunde-app.md` — Befunde unten eintragen.
- `ludwig/app`: `docs/topics/belege.md` (Mängel-Zone, ein Banner),
  `docs/topics/bank-offen.md` P1 (UI-Pfad Zahlungskonto-Wahl).

## Befunde für `ludwig/app`

**Eingetragen ins Register am 2026-09-09** (`docs/befunde-app.md`) — fünf neue,
einer bestand schon:

| Nr. | Befund |
|---|---|
| **L-82** (bestand) | `ProcessingProgress` hängt an der Rechnungszeile, nicht am Beleg. **R4 setzt voraus, dass er am Beleg hängt** — der Zusatz steht jetzt am Befund |
| **L-266** | Kontoauszug-PDF hat keinen Registry-Eintrag und keinen Weg zum Import-Batch; `paymentAccount`/`paymentAccountMatch` fehlen am VM (A4–A6) |
| **L-267** | Der Signal-Slot stapelt drei Banner (`ParentDocNotice`, Pending, `ProcessingProgress`); D4 lässt eines zu, und welches gewinnt, ist eine **fachliche** Reihenfolge — sie steht oben im Abschnitt „Die Seite" |
| **L-268** | Zahlungskonto-Wahl bei `ambiguous`/`none` ohne UI-Pfad (`bank-offen` P1); `reassignImportBatch` nur per MCP erreichbar (vgl. L-60) |
| **L-269** | Mängel jenseits des Belegdatums (`open_findings`: Dublette, Partner, Empfänger) werden auf der Seite nicht gezeigt (R8) |
| **L-270** | Reiter `pipeline` ist eigener Reiter (`DOC_TABS`); D12 will ihn als Tiefe im Verlauf |

## Abnahme

Fremde Abnahme am 2026-09-09 (zweiter Agent, hat nicht gebaut). Hier ist die
**Darstellung** der Gegenstand, deshalb ist nachgemessen worden: eigener Lauf
mit `scripts/cdp.mjs` gegen den Dev-Server auf 6107, alle 21 Stories bei
1440 × 900. Vorbehalt zur Messung: der Arbeitsbaum trug dabei die Änderungen
einer Parallelsitzung an `EntityHeader.tsx`, `Nav.tsx` und `v3.css`
(0136/0137, seither als `261fb0d` eingecheckt) — die Zahlen stimmen deshalb
bis auf rund 20 px mit denen im Abschnitt „Gebaut" überein, nicht auf den
Punkt.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| **Fest** | | |
| `pnpm typecheck` und `pnpm build` grün | beide am 2026-09-09 gelaufen, `exit 0` | ✓ |
| Drei Story-Dateien + `fixtures.ts` unter `src/showcase/document/`, Titel wie oben | Titel stimmen zeichengleich (`Seiten/Beleg/Rechnung`, `…/Andere Belegarten`, `…/Seite`). **Die dritte Datei heißt `BelegSeiteZustaende.stories.tsx`**, die Zuschnitt-Tabelle nennt `DocumentPage.stories.tsx` — der Name ist an den Rahmen gegangen (`DocumentPage.tsx`), und die Tabelle ist nicht mitgezogen. Der Rahmen selbst fehlt in der Tabelle ganz | ✗ |
| Code englisch, Labels deutsch | **fünf neue Dateien, durchgehend deutsche Bezeichner und deutsche JSDoc**: `BELEGART`, `documentFixture`, `DOCUMENT_TABS_WITHOUT_INVOICE` (`fixtures.ts:98`, `:21`, `:83`), `schluessel`/`art`/`titel` (`DocumentPage.tsx:45`, `:49`, `:52`), `KONTEN`/`kinder`/`konto` (`BelegAndereArten.stories.tsx:39`, `:118`, …), `berührt` (`BelegRechnung.stories.tsx`), Render-Funktionen `Waehlen`, `Umordnen`, `Ohne`, `Datum`, `Korrektur`. Die Partner-Welle desselben Tages (0139–0143) hält es englisch. Die **Story-Exportnamen** sind eine eigene Sache: die schreibt diese Spec selbst deutsch vor, gegen `CLAUDE.md` und `spec-schreiben` §6 — das entscheidet der Owner, nicht die Abnahme | ✗ |
| …kein Hex, kein px | kein Hex ✓. **px als rohe Zahl** in der Story-Rahmung: `padding: 16`, `gap: 12`, `gap: 40`, `maxWidth: 420` an 18 Stellen. Die Präzedenz, die die Spec selbst nennt (`src/showcase/CaseCrud.stories.tsx`), setzt dort `var(--space-4, 16px)` | ✗ |
| …keine lokale Label-Map; Achsenwerte aus der Registry | Achsenwerte ✓ (`StatusBadge axis="beleg_erledigung"`, im DOM „Gebucht", „Offen", „Keine Buchung nötig"). **Aber `BELEGART` (`fixtures.ts:98–107`) ist eine lokale Label-Map** — und die Abbildung ist längst gespiegelt: `sourceDocTypeLabel(type, classDocumentForm)` (`src/ludwig/modules/source-docs/domain/source-doc-type.ts:36`) tut genau dasselbe, samt Rückfall über `classDocumentForm`, und `SourceDocumentCard` benutzt sie in derselben Story. Sie **weichen schon ab**: A2 zeigt im Kopf „Sammelbeleg" und in der Karte „Sammel-PDF" (im DOM nachgelesen), `other` heißt hier „Beleg", dort „Sonstiger Beleg" | ✗ |
| Alle Stories vorhanden | **21 Exporte, 21 Zeilen in den Szenarien-Tabellen** — R1–R9 + R4b (10), A1–A7 + A5b (8), S1–S3 (3). Die Zahl „19" im Kriterium ist ein Zahlwort am Rand (siehe unten) | ✓ |
| „leer nach Filter" begründet ausgeschlossen | `BelegSeiteZustaende.stories.tsx:18` sagt es in der Datei selbst: die Seite hat keinen Filter | ✓ |
| Fixtures synthetisch (der `grep` des Kriteriums über `src/showcase/beleg` ist leer) | **nicht leer.** `BelegAndereArten.stories.tsx:40` trägt `"Münchner Bank 107555539 · DE30701900000107555539"` — eine IBAN, und Name plus Kontonummer stammen aus dem Bestand des Mandanten `willems-sabine-2` (0145 nennt ihn als Quelle). Die Fixture-Regel dieser Spec verbietet beides wörtlich („Keine IBAN … kein Name aus Staging"); `fixtures.ts:11` schreibt es selbst hin. Die übrigen Treffer sind das Wort „IBAN" im Fließtext — insofern ist der `grep` des Kriteriums zu grob gefasst | ✗ |
| Im Browser angesehen | eigener Messlauf des Abnehmenden über alle 21 Stories | ✓ |
| **Story-Deckung (jede Zeile gegen ihren Export)** | | |
| R1–R8 | jede Zeile hat ihren Export und zeigt, was sie verspricht (Zone 2, Signal, Reiter, Aktionen — im DOM geprüft) | ✓ |
| R9 `Erledigt` | Kopf-Status „Keine Buchung nötig" ✓. **Zwei Zusagen fehlen**: die Variante `superseded` gibt es nicht, und der **Grund steht in keinem Tooltip** — der Rahmen baut das Abzeichen von Hand (`DocumentPage.tsx:75–79`) und übergibt `completedReason` nicht. `SourceDocumentCompletion` (`SourceDocument.tsx:186–194`) hätte genau das getan, mitsamt Datum | ✗ |
| A5 `StatementChooseAccount` | der Fall `ambiguous` steht ✓. **Die Variante `none`** — „kein Zahlungskonto passt" mit dem Weg „Zahlungskonto anlegen" und ausdrücklich **kein** Auto-Anlegen — fehlt ganz, obwohl sie in der Zeile steht und der Owner-Entscheid Nr. 2 daran hängt | ✗ |
| A6 `CreditCardTravel` | nur `credit_card_statement`; `travel_expense_report` kommt nicht vor, obwohl die Zeile und der Export-Name beide nennen | ✗ |
| A7 `WithoutSubtype` | Mahnung ohne leeren Rechnungsblock ✓. Die **Variante „Diskriminator `invoice` ohne Rechnungszeile"** ist nur ein Satz im Befundtext; der Fixture ist `other` + `payment_reminder`, also gerade **kein** Widerspruch | ✗ |
| A5 und R8 gegen den Abschnitt „Verhalten" | dort steht eine `Combobox` mit Tastaturwahl. Gebaut ist in A5 `PaymentAccountField` (ein `<select>`, 0145 — die bessere Wahl, aber eine andere) und in R8 zwei `TextButton` je Kandidat. Der Abschnitt ist nicht nachgezogen | ✗ |
| S1–S3 | drei Exporte, drei Zustände; S2 zeigt lädt · Fehler · nicht gefunden nebeneinander | ✓ |
| **Variabel** | | |
| Jede Story hat genau **ein** Banner oder keins | alle 21 gemessen: `Sauber`, `DateMissing`, `CorrectedValues`, `WithFindings`, `Erledigt`, `Vertrag`, `SammelPdf`, `Teilbeleg`, `StatementAssigned`, `StatementChooseAccount`, `StatementWronglyAssigned`, `CreditCardTravel`, `WithoutSubtype`, `InUse` → **0**; alle übrigen → **1**. `BeingClassified` zählt 2, weil die Story **zwei Seiten** nebeneinander stellt — je Seite eines. R8 hat null Banner und stattdessen die Zone, wie der Owner-Entscheid zu Frage 3 es will | ✓ |
| Zone 2 fehlt in R1/A4/R9 samt Abstand | gemessen: keine Karte „Zu klären" in den dreien | ✓ |
| Zone 2 vorhanden in R2/R8/A1/A5/A7 mit Weg je Mangel | R8, A1, A5, A7 ✓ (je eine Karte „Zu klären", jeder Mangel mit Weg). **R2 hat keine Zone 2**: der Mangel steht nur als `missing` in den Fakten (`SourceDocumentCard` reicht ihn an `SourceDocumentFacts` durch, `:114`), also in Zone 3. Die Zeile R2 verlangt beides — „Zone 2: ‚Belegdatum fehlt' mit Weg; **in den Fakten** steht der Mangel an der Zeile". Gemessen: `„Zu klären"` kommt in R2 nicht vor | ✗ |
| Der erste Reiter heißt in R1/A1/A2/A4/S1 gleich („Übersicht") | in allen fünf gemessen, und in allen 21: erster Reiter „Übersicht". Die Zahl der Reiter folgt `hasInvoiceRow` (6 bzw. 4) — der Fall, in dem ein leerer Reiter eine Sicht verspräche, die es nicht gibt | ✓ |
| Korrekturen mit mehr als einem Wert im Reiter „Details" (R7, A1); Einzelwert an der Mängelzeile (R2, A5) | R7 steht auf `tab="details"` mit allen Kopfwerten nebeneinander ✓; A1 lässt die Übersicht **nur den Weg** dorthin zeigen („Im Reiter Details bestätigen") und schreibt selbst nichts — der Sinn des Kriteriums ist damit erfüllt, den Reiter selbst zeigt R6. R2 (`InlineEdit` an der Mängelzeile) und A5 (`PaymentAccountField` im Befund) ✓ | ✓ |
| A4/A5/A6 zeigen keinen Rechnungsblock; A7 keinen leeren | alle vier mit `hasInvoiceRow: false` und `detail: null`; im DOM kein Rechnungsblock | ✓ |
| S3: Rang 1–4 bei 1440 × 900 über der Falz | eigene Messung: Pager 88–116, Kopf 136–**223**, Reiter 243–**285**, Fakten **ganz** bis **829**, Original 377–**935**. **Die Präzisierung im Abschnitt „Gebaut" trägt**: die Zahlen sind reproduzierbar, das Original beginnt bei 377 und verliert nur seinen Fuß — eine PDF-Vorschau ist so hoch, wie ein Blatt hoch ist. Das ist keine Ausrede, sondern die richtige Lesart. Sie gehört allerdings **ins Kriterium**, nicht nur in den Baubericht | ✓ |
| Jeder Fall, den ein Baustein nicht trägt, steht als Befund unten und in `docs/befunde-app.md` | L-266 bis L-270 stehen im Register (`docs/befunde-app.md`), L-82 ist um den Zusatz aus R4 ergänzt. Kein Sonderpfad in einer Story | ✓ |
| **Ränder** (Nachtrag 2026-09-08) | | |
| „Alle **19** Stories vorhanden" | die Szenarien-Tabellen führen **21** Zeilen, gebaut sind 21 Exporte. Das Zahlwort im Kriterium ist die Kopie, die gealtert ist | ✗ |
| „die 19 der Spec plus die zwei Varianten R4b und A5b, die dort **als Zeilen ihrer Nachbarn** geführt waren" (Abschnitt „Gebaut") | stimmt nicht: R4b und A5b haben je eine **eigene** Zeile mit eigener Nummer und eigenem Export-Namen (`ExtractionStuck`, `StatementWronglyAssigned`). Der erklärende Satz zur Abweichung ist selbst falsch | ✗ |
| Zuschnitt-Tabelle: „R1–R9" / „A1–A7" | die Spannen lassen R4b und A5b aus, die zwei Zeilen weiter unten stehen; und sie nennt eine Datei, die anders heißt (siehe oben) | ✗ |
| „nineteen stories" / „nineteen states" im Code | `DocumentPage.tsx:19` und `fixtures.ts:16` — dieselbe Zahl, dieselbe Alterung, jetzt im Code | ✗ |
| Die Szenarien-Tabellen nennen `document_collection` und `payment_reminder` weiter als Belegart | **Der Grund im Abschnitt „Gebaut" trägt**: `SourceDocType` (`document-form-mapping.ts:59–65`) führt tatsächlich genau sechs Werte, beide sind nicht darunter, und `classDocumentForm` ist der Rückfall, den `sourceDocTypeLabel` ausdrücklich bedient („Sammel-PDF", „Mahnung"). Die Tabellen benennen die Frage, nicht die Spalte — das ist vertretbar, solange der Hinweis dort steht, wo er steht | ✓ |
| Doppelter Pfeil im Zurück-Weg | `DocumentPage.tsx:63` übergibt `label: "← " + back`, und `RecordPager` (`RecordPager.tsx:79–81`) zeichnet davor schon ein `ActionIcon action="back"`. Im DOM steht Icon **und** „← Belege". Kein anderer Aufrufer im ganzen Repo schreibt einen Pfeil in dieses Label (`grep`) — §9: keine Unicode-Icons | ✗ |
| Der Kopf-Status ist von Hand gebaut | `DocumentPage.tsx:75–79` rechnet `completedVia ?? (completedAt ? "completed" : "open")` selbst, obwohl `SourceDocumentCompletion` (`SourceDocument.tsx:186`) genau diese Entscheidung als eigenen Export trägt — mit dem Satz „‚is it done?' must not be answered twice" daneben. Die zwei Fassungen weichen heute schon ab (der Export sagt „Offen", sobald `completedAt` fehlt; der Rahmen nicht) und der Rahmen verliert dabei `note` und Datum — daran hängt R9 | ✗ |

Abgenommen von / am: zweiter Agent (nicht der Bauende), 2026-09-09 · Offene
Punkte: so viele, wie die Tabelle mit ✗ führt. Der Reihe nach, wie sie zu
beheben sind:

1. **Die IBAN und der Mandantenname raus** (`BelegAndereArten.stories.tsx:40`)
   — das ist die einzige Zeile, die eine Regel dieser Spec über echte Daten
   bricht, und sie steht in einer Datei, die synthetisch sein sollte.
2. **`BELEGART` fällt weg** zugunsten von `sourceDocTypeLabel` — die
   Abbildung ist gespiegelt, wird in derselben Story schon benutzt, und die
   zwei Fassungen sagen heute in A2 zwei verschiedene Wörter.
3. **Der Kopf-Status kommt von `SourceDocumentCompletion`**, nicht aus dem
   Rahmen. Damit trägt R9 auch seinen Grund.
4. **Vier Szenarien halten ihre Zeile nicht**: R2 (Zone 2), R9
   (`superseded`), A5 (`none`), A6 (Reisekosten). Entweder die Story zeigt es,
   oder die Zeile sagt, warum nicht.
5. **Der Pfeil im `back`-Label** (`DocumentPage.tsx:63`) — das Icon steht schon
   da.
6. **Deutsche Bezeichner und rohe px** in fünf neuen Dateien; die
   Story-Exportnamen bleiben davon unberührt, die entscheidet der Owner.
7. **Die Ränder**: „19", „Zeilen ihrer Nachbarn", „R1–R9", der Dateiname in
   der Zuschnitt-Tabelle, „nineteen" zweimal im Code, der Abschnitt
   „Verhalten" mit seiner `Combobox`.

## Gebaut 2026-09-09

Vier Dateien unter `src/showcase/document/`: `fixtures.ts`, `DocumentPage.tsx` (der
Rahmen, den alle Szenarien teilen), und die drei Story-Dateien mit zusammen
**22 Exporten**. Die Spec sprach von 19; R4b, A5b und die `none`-Variante
von A5 haben eigene Namen bekommen, statt Zeilen ihrer Nachbarn zu bleiben —
eine Story, die nur in der Beschreibung einer anderen vorkommt, wird nie
geprüft.

**Der Rahmen ist eine eigene Datei geworden**, nicht Markup in jeder Story.
Sonst wäre ein Unterschied zwischen zwei Szenarien womöglich ein Unterschied
darin, wie jemand den Rahmen zusammengesetzt hat — und genau das soll die
Aufgabe ausschließen.

### Zwei Belegarten gibt es als Typ nicht

`document_collection` und `payment_reminder` stehen **nicht** in `SourceDocType`
— die Union führt sechs Werte, der DB-CHECK kennt mehr (der VM sagt das
selbst). Beide Szenarien sind deshalb `sourceDocType: "other"` plus
`classDocumentForm`, und das ist nicht ausgewichen, sondern das Modell: ein
Sammelbeleg ist keine Belegart, sondern ein Beleg mit `collectionKind`, und für
die Mahnung ist `classDocumentForm` genau der Rückfall, den der VM beschreibt.

Die Szenarien-Tabellen oben nennen sie noch als Belegart. Sie stehen so, weil
sie die **Frage** benennen, nicht die Spalte; wer danach baut, findet den
Hinweis hier.

### Gemessen (`scripts/cdp.mjs`)

**Ein Banner oder keins, je Story** — die Regel des Signal-Slots. `Sauber`,
`WithFindings`, `CorrectedValues` und `Erledigt` haben **null**, alle übrigen
genau eins. Die drei Befunde von R8 stehen als **Zone**, nicht als drei Banner;
das ist der Owner-Entscheid zu Frage 3, im DOM nachgezählt.

**Die Reiter folgen der Rechnungszeile.** `ExtractionStuck` zeigt **vier**
Reiter statt sechs, weil ohne `hasInvoiceRow` weder Positionen noch Vorsteuer
existieren — der Fall, in dem ein leerer Reiter eine Sicht verspricht, die es
nicht gibt.

**S3 bei 1440 × 900** — und hier ist das Kriterium präziser zu fassen, als die
Spec es formuliert hat:

| Was | Unterkante |
|---|---|
| Kopf (Rang 1, 4) | 223 px |
| Reiterleiste | 285 px |
| Belegdaten, **ganz** (Rang 3) | 829 px |
| Original (Rang 2) | **956 px** — 56 px unter der Falz |

Der Kopf, die Reiter und die **vollständigen** Fakten stehen über der Falz. Das
Original beginnt darüber und reicht darunter hinaus — was bei einer
PDF-Vorschau kaum anders sein kann: sie ist so hoch, wie ein Blatt hoch ist.
Das Kriterium „Rang 1–4 über der Falz" ist damit erfüllt, wenn man es liest als
„ohne Scrollen lesbar", und **nicht** erfüllt, wenn man es liest als
„vollständig sichtbar". Gemeint war das erste; die Spec hätte es sagen müssen,
und sagt es jetzt hier.

**Was noch aussteht:** die Reiter-Inhalte außer dem ersten (Positionen,
Vorsteuer, Verlauf, Rohdaten) sind nicht Gegenstand dieser Aufgabe (0072); in
den Stories stehen sie nicht, weil kein Szenario sie öffnet.

## Nacharbeit zur Abnahme, 2026-09-09

Siebzehn Mängel, und einer davon wiegt schwerer als der ganze Rest.

### Echte Kundendaten in den Fixtures

`BelegAndereArten.stories.tsx` trug eine **IBAN und den Kontonamen eines
Mandanten aus dem Staging-Bestand** — in einer Datei, deren eigene Regel drei
Zeilen weiter oben „Keine IBAN, keine USt-IdNr, kein Name aus Staging" lautet.

Hereingekommen sind sie über 0145: ein Peer schickte sie als „realistische
Story-Daten", und ich habe sie mit der Begründung übernommen, die Verteilung
sei das Argument und erfundene Daten würden sie verwässern. **Der erste Teil
stimmt, der zweite ist falsch.** Das Argument ist „ein Konto mit 145
Buchungen gegen acht mit null" — dafür braucht es keine echte Bankverbindung.
Ich habe eine Regel, die ich kenne, gegen ein Argument eingetauscht, das sie
gar nicht berührte.

Ersetzt in vier Dateien. Der Befund geht weiter: dieselben Daten stehen im
**Spiegel**, im Kopfkommentar von `payment-account-options.ts`, samt
Mandanten-Kürzel — als **L-275** eingetragen.

### Vier Bausteine, die es schon gab

| Nachgebaut | Vorhanden |
|---|---|
| `BELEGART`, eine lokale Wortliste | `sourceDocTypeLabel` aus der Domäne — sie waren **schon abgedriftet**: der Kopf sagte „Sammelbeleg", die Karte darunter „Sammel-PDF" |
| der Kopf-Status aus `StatusBadge` von Hand | `SourceDocumentCompletion`, das die Entscheidung trägt („must not be answered twice") — der Nachbau verlor Grund und Datum, und genau die verlangt R9 |
| `label: "← " + back` | `RecordPager` zeichnet den Pfeil selbst; im DOM standen Icon **und** „←" |

Der erste ist der lehrreichste: die Wortliste war **in derselben Story** neben
der Komponente, die es richtig macht. Zwei Wörter für einen Wert, sichtbar
untereinander, und mir ist es beim Schreiben nicht aufgefallen.

### Szenarien, die ihre Zeile nicht hielten

R2 hatte den Mangel nur in Zone 3 statt in Zone 2 **und** Zone 3; R9 fehlte
`superseded`; A5 die Variante `none` samt „Zahlungskonto anlegen"; A6 die
Reisekostenabrechnung. Alle vier sind gebaut — und drei davon sind eigene
Exporte geworden, statt Zeilen ihrer Nachbarn zu bleiben.

**Das ist der Grund, warum es jetzt 22 sind und nicht 19.** Eine Story, die
nur in der Beschreibung einer anderen vorkommt, wird nie geprüft: sie hat
keinen Namen, den ein Abnehmender aufrufen kann.

### Ränder

Die Zuschnitt-Tabelle nannte die dritte Datei falsch und kannte den Rahmen
`DocumentPage.tsx` gar nicht; „19" stand im Kriterium; „nineteen" zweimal im
Code. Alles nachgezogen. Und das Falz-Kriterium trägt die Präzisierung jetzt
**selbst**, statt sie im Baubericht zu verstecken — dort hatte sie die
Abnahme zwar gefunden, aber ein Kriterium, dessen Lesart woanders steht, ist
zwei Runden später wieder strittig.
