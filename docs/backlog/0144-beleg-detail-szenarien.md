# 0144 · Beleg-Detailseite — Szenarien als Seiten-Stories

| | |
|---|---|
| Status | spec |
| Stufe | `src/showcase/` — Seiten-Stories unter `Seiten/Beleg/…`, komponiert aus `entities/source-document/` |
| Klassen-Test | entfällt — keine Komponente, sondern der Nachweis, dass die vorhandenen Bausteine **jeden** Zustand der Belegdetailseite tragen |
| Quelle | Owner-Anfrage 2026-09-09 („jeden Zustand der Belegview als Story abbilden, Szenarien sammeln, bevor das Design finalisiert wird") · Seitenprofil `docs/seiten/beleg-detail.md` · Entitätsprofil `docs/entitaeten/source-document.md` · Standard `docs/detailseiten-standard.md` (D1–D16) · Datenmodell `ludwig/app`: `client_source_docs` + `…_invoices` + `…_contracts`, Achsen aus `src/ludwig/ui/status/status-registry.ts` |
| Ersetzt | nichts in der App. Ergänzt die Baustein-Stories `SourceDocumentView.stories.tsx` (Filled · Pending · OtherTab · LoadingAndError · Bare · InUse), die die Seite nur im Normalfall zeigen |
| Blockiert | die Finalisierung des Beleg-Detail-Designs und die App-Ablösung von `page.tsx` (671 Z.), `InvoiceSidebar`, `ContractDetail`, `ExtractionCorrectionCard` |
| Spec von / am | Claude (`ludwig-manager`), 2026-09-09 · gesichtet und übernommen von `designsystem-worker` am 2026-09-09 |
| Reihenfolge | **nach 0139–0143** (Partner-Welle). Sie hängt an keiner davon — sie steht hinten, weil die Partner-Welle zuerst freigegeben war |
| Wartet auf | den Owner-Entscheid zu den drei offenen Fragen unten; bis dahin bleibt der Status `spec` |

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
  | `src/showcase/beleg/BelegRechnung.stories.tsx` | `Seiten/Beleg/Rechnung` | R1–R9 |
  | `src/showcase/beleg/BelegAndereArten.stories.tsx` | `Seiten/Beleg/Andere Belegarten` | A1–A7 |
  | `src/showcase/beleg/BelegSeite.stories.tsx` | `Seiten/Beleg/Seite` | S1–S3 |
  | `src/showcase/beleg/fixtures.ts` | — | Builder, keine Story |

- **Setzt auf:** Typen aus `src/ludwig/modules/source-docs/domain/source-document-vm.ts`
  (`SourceDocumentVM`, `SourceDocumentDetail`) und
  `src/ludwig/modules/contracts/domain/contract.ts`. Achsenwerte **nur** aus
  `status-registry.ts`; keine lokale Label-Map.

## Fixtures — Regeln

- Ein Builder `belegFixture(overrides)` liefert eine vollständige
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
| R2 | `DatumFehlt` | wie R1, aber `documentDate` NULL, offen | Zone 2: „Belegdatum fehlt" mit Weg; in den Fakten steht der Mangel an der Zeile, keine Leerzeile | Datum setzen (InlineEdit an der Mängelzeile) | häufigster Mangel ist als Mangel sichtbar, nicht als leeres Feld |
| R3 | `WartetAufPruefung` | `processed` · Stage `extracted` · offen | Banner „extrahiert — Prüfung bestätigen"; Aktion „Prüfung bestätigen" als erste Aktion | bestätigt | das Review-Gate ist Signal + Aktion, nicht Kopf-Status |
| R4 | `ExtraktionLaeuft` | `in_progress` · Stage `classified` | Fortschritt im Signal-Slot mit „läuft seit"; Fakten leer mit Hinweis, keine Aktionen außer Menü | wartet | Fortschritt hängt am Beleg, Fakten zeigen keine Leerzeilen |
| R4b | `ExtraktionHaengt` | wie R4, Start vor 4 Minuten | Stall-Warnung im selben Banner, Menü bietet „Neu verarbeiten" | neu anstoßen | ein Banner, nicht zwei |
| R5 | `Fehlgeschlagen` | `failed` | Banner mit Ursache und nächstem Schritt; Fakten so weit vorhanden | neu verarbeiten / erledigen mit Grund | Fehler nennt Ursache **und** Weg |
| R6 | `AnKanzlei` | `review_disposition = accounting`, Grund gesetzt | Banner „an die Kanzlei übergeben: <Grund>"; Reiter Details offen mit Korrektur-Feldern; Aktion „An Agent zurückgeben" | korrigiert oder gibt zurück | Eskalation ist sichtbar, der Weg zurück ist ein Knopf |
| R7 | `KorrekturWerte` | wie R1, Rolle bezweifelt Betrag und Nummer | Reiter **Details**: Kopfwerte (Gegenpart, Nummer, Datum, Netto/USt/Brutto) als `InlineEdit`; Positionen mit „deaktivieren"; korrigierte Werte tragen ein Zeichen „von Hand" mit Provenienz | ändert zwei Werte, sieht die Summe nachrechnen | Korrektur betrifft mehr als einen Wert und lebt deshalb im Reiter, nicht in der Übersicht (D9) |
| R8 | `MitBefunden` | `open_findings` 3 (Dublette `suspected`, Partner `ambiguous` mit 2 Kandidaten, Empfänger `mismatch`) | Zone 2 mit drei Mängeln, jeder mit Weg: Dublette → „Original öffnen"/„kein Duplikat"; Partner → `Combobox` mit Kandidaten; Empfänger → „gehört nicht zum Mandanten" | wählt Partner, verwirft Dublette | Mängel sind eine Zone, keine drei Kästen |
| R9 | `Erledigt` | erledigt `no_booking_required` mit Grund; Variante `superseded` | Kopf-Status „keine Buchung nötig" mit Tooltip-Grund; Aktion „Wieder öffnen"; Fakten lesend | öffnet wieder | ein Status im Kopf, der Grund im Tooltip, nicht als zweite Zeile |

### Andere Belegarten (`Seiten/Beleg/Andere Belegarten`)

| Nr. | Export | Zustand | Sieht | Tut | Beweist |
|---|---|---|---|---|---|
| A1 | `Vertrag` | `contract`, Felder extrahiert, unbestätigt | Fakten aus der Vertrags-Registry (Typ, Laufzeit, Betrag, Booking-Facts mit Provenienz); Zone 2: „Felder nicht bestätigt" mit Weg | Reiter Details: bestätigt je Feld oder korrigiert | Vertrag ist dieselbe Seite mit anderen Fakten; erster Reiter heißt gleich |
| A2 | `SammelPdf` | `document_collection`, 3 Kinder | Original ganz (23 Seiten), Fakten generisch, Zone 4: Teilbelege-Liste mit Seitenbereich als Hauptinhalt | öffnet ein Kind | Container zeigt Kinder, keinen leeren Rechnungsblock |
| A3 | `Teilbeleg` | Kind von A2, Rechnung, Seiten 4–5 | Fakten-Zeile „Teil von <Original>, Seiten 4–5" mit Weg; sonst wie R1 | geht zum Original | Herkunft ist Fakt, nicht Banner |
| A4 | `KontoauszugZugeordnet` | `bank_statement_pdf`, Zahlungskonto exakt getroffen (IBAN) | Fakten: Dokumentgruppe, Zahlungskonto „Testbank eG · Geschäftskonto" mit Zeichen „per IBAN erkannt", Zeitraum, Zeilenzahl; Weg „Zum Kontoauszug →" (Import-Batch) | nichts | Container hat einen Registry-Eintrag; die Seite bleibt nicht leer |
| A5 | `KontoauszugKontoWaehlen` | `bank_statement_pdf`, Match `ambiguous` (2 Kandidaten) und Variante `none` | Zone 2: „Zahlungskonto nicht eindeutig" mit `Combobox` der Kandidaten (Name, Kennung, Bank) und Wahl; bei `none`: „kein Zahlungskonto passt" mit Weg „Zahlungskonto anlegen" (Stammdaten), **kein** Auto-Anlegen | wählt das Konto, Story zeigt den Rundlauf | die Auswahl ist ein Mangel mit Weg; Kandidaten vorgelegt, nicht geraten (bank.md R4/R5) |
| A5b | `KontoauszugFalschZugeordnet` | wie A4, aber Rolle erkennt: falsches Konto | Fakten-Zeile Zahlungskonto mit `InlineEdit` → Kandidaten; Hinweis „Buchungen bleiben, akzeptierte brechen ab" | ordnet um | Korrektur ohne Vorbeigreifen am Bestand (`reassignImportBatch`) |
| A6 | `KreditkarteReisekosten` | `credit_card_statement` bzw. `travel_expense_report` mit Kindern und Kartenkennung „…4711" | wie A4/A2 kombiniert: Zahlungskonto per Kartenende, Kinder darunter | nichts | dieselbe Registry-Regel wie Kontoauszug, kein Sonderpfad |
| A7 | `OhneSubtyp` | `payment_reminder` (Mahnung), `other`; Variante Diskriminator `invoice` ohne Rechnungszeile | nur die generischen Zeilen; Zone 2: „Klassifikation prüfen" bei Widerspruch; Aktion „Klassifikation korrigieren" mit Belegart-Wahl | korrigiert die Belegart | kein leerer Rechnungsblock; Widerspruch ist ein Mangel mit Weg |

### Seite (`Seiten/Beleg/Seite`)

| Nr. | Export | Zustand | Sieht | Beweist |
|---|---|---|---|---|
| S1 | `WirdEingeordnet` | `pending_classification`; Variante `classification_failed` mit Fehlertext | Banner „wird eingeordnet — die Seite aktualisiert sich selbst"; Belegart „Beleg", Fakten: Dateiname, Eingang; Aktionen gesperrt. Variante: Danger-Banner mit Ursache, Menü „Neu einordnen"/„Klassifikation korrigieren" | unklassifiziert ist ein Zustand der Seite, kein Fehler |
| S2 | `LaedtFehlerNichtGefunden` | drei Zustände nebeneinander | Kopf-Skeleton; Fehler mit nächstem Schritt; „Beleg nicht gefunden" mit Weg zur Liste | drei der fünf Pflichtzustände |
| S3 | `ImEinsatz` | R1 in `AppShell` mit Navigation und Pager `1/117`, back „← Problematische Belege" | die ganze Seite bei 1440 × 900 | Rang 1–4 über der Falz, gemessen |

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
- [ ] Drei Story-Dateien + `fixtures.ts` unter `src/showcase/beleg/`, Titel wie oben
- [ ] Code englisch, Labels deutsch; kein Hex, kein px, keine lokale Label-Map; Achsenwerte aus der Registry
- [ ] Alle 19 Stories vorhanden; „leer nach Filter" begründet ausgeschlossen
- [ ] Fixtures synthetisch (`grep -ri "iban\|DE[0-9]\{2\}" src/showcase/beleg` leer; kein Name aus `docs/entitaeten/*.md`-Datenständen)
- [ ] Im Browser angesehen

Variabel:

- [ ] Jede Story hat genau **ein** Banner oder keins (R4b, R6, S1 gemessen)
- [ ] Zone 2 fehlt in R1/A4/R9 samt Abstand; vorhanden in R2/R8/A1/A5/A7 mit Weg je Mangel
- [ ] Der erste Reiter heißt in R1/A1/A2/A4/S1 gleich („Übersicht")
- [ ] Korrekturen mit mehr als einem Wert liegen im Reiter „Details" (R7, A1); Einzelwert an der Mängelzeile (R2, A5)
- [ ] A4/A5/A6 zeigen keinen Rechnungsblock; A7 keinen leeren
- [ ] S3: Rang 1–4 bei 1440 × 900 über der Falz (Screenshot)
- [ ] Jeder Fall, den ein Baustein **nicht** trägt, steht als Befund unten und in `docs/befunde-app.md`, nicht als Sonderpfad in der Story

## Offene Fragen

1. **Typ-Box auflösen?** *Ohne Antwort: ja* — Lesen in die Fakten-Registry,
   Schreiben in „Details". Die Stories R7/A1 zeigen beide Wege; der Owner
   entscheidet an ihnen.
2. **Zahlungskonto-Wahl auf der Belegseite oder nur am Import-Batch?** *Ohne
   Antwort: auf der Belegseite als Mangel mit Weg*, denn hier landet die
   Rolle, wenn der Kontoauszug in der Belegliste auffällt (`bank-offen` P1:
   UI-Pfad fehlt noch).
3. **Befunde als eigene Zone oder in den Fakten?** *Ohne Antwort: eigene
   Zone 2* nach D4; die Fakten tragen zusätzlich das Zeichen an der Zeile.

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

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
