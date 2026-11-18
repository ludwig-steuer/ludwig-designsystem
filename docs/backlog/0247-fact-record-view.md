# 0247 · FactRecordView: worauf eine Buchung beruht, in der Leiste der Abnahme

| | |
|---|---|
| Status | fertig (Teil A) — fremd abgenommen 2026-11-18 nach Nacharbeit (Schlussprüfung, s. „Abnahme“), gebaut auf dem DS-Branch `booking-v3`; abgenommen ist der Stand `26ec869` plus die zur Zeit uncommitteten Änderungen im Arbeitsbaum, offen bleiben nur Hinweise · davor: Nachprüfung 2026-11-18 mit M1 im Rest · davor: nicht abgenommen 2026-11-18 (Mängel M1–M3) · Teil B wartet auf die Owner-Durchsicht des Ablaufs (Plan Booking v3, Punkte 12 und 13) |
| Stufe | `entities/fact-record/` (neue Entität „Faktensatz“, eine Form: L, Ansicht in der Leiste) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → nein: Buchungssatz, Steuerbehandlung, Faktengruppen eines Ereignis-Splits |
| Quelle | app-f0 2026-11-18, F678-Brief mit Nachtrag (App `docs/backlog/F678-fact-view-design-brief.md`); Datenform F668, Achsen F681; Konzept App `docs/concepts/booking-process.md` §7 |
| Ersetzt | nichts in der App; im Set nichts. Die Klappzeile der Abnahme (`BookingReview`) bekommt ihren Teil „aus: …“ in einer eigenen Aufgabe (siehe Ausbau) |
| Blockiert | App-Spec der Faktenansicht (Datenlader, Einbau in den Schritt „Buchungsvorschläge“), nach F675 |
| Wartet auf | Teil A: 0246 S2 (FactTable mit Sicherheit), L-382 (VM-Typ im Spiegel). Teil B: Owner-Durchsicht des Userflows |
| Spec von / am | Designer-Sitzung, 2026-11-18 |

## Ziel

Die Buchhalterin nimmt den Monat ab. An einer Buchung will sie sehen, worauf
der Satz beruht, ohne das Datenmodell zu kennen. Sie öffnet die Buchung in der
Leiste und sieht von oben nach unten:

1. den Buchungssatz und wer ihn entschieden hat;
2. was offen ist;
3. das Ergebnis (Steuerbehandlung, Steuerschlüssel, Konto), je mit „aus: …“;
4. die Fakten, die es bestimmt haben, nach Gruppen;
5. eingeklappt alle übrigen Fakten.

Hält sie einen Fakt für falsch, korrigiert sie ihn an der Wurzel und sieht
vorher, was sich am Satz ändert (Teil B). Heute liest sie dafür eine
Prosa-Begründung („Begründung“ in `BookingReview`) und überschreibt im
Zweifel den Satz.

## Einordnung

- **Wiederverwenden** (§3 Regel 1, je Baustein):
  - `Drawer` (R15 Klasse B, Breite `md`) mit `DrawerFooter`: den Rahmen setzt die App-Seite. Die Ansicht ist der Inhalt, wie `SourceDocumentView` im `SourceDocumentDrawer`.
  - `JournalEntryCard`: der Satz oben.
  - `StatusBadge`: wer entschieden hat (Achse `journal_entry_origin_method`, F681) und wer am Zug ist (`disposition`).
  - `OpenPoints`: die offenen Punkte gleich nach dem Satz. Den Grund liefert die Achse `fact_open_point_reason`. Den Ton gibt `blocksHandover`: `error` nur bei Sperre der Übergabe, sonst `info` (Owner 2026-09-30: offen ist Hinweis).
  - `FieldList`: die Ergebniszeilen.
  - `Card` + `CardHead` je Faktengruppe (Wort aus `fact_group`), darin `FactTable` (0246).
  - `Disclosure` „Weitere Angaben“ mit Zähler.
  - `Callout`: „Vorläufig gebucht“ (Hinweis) und „Kein Faktensatz“.
  - `DiffView`: von Hand gebucht (gebucht ↔ abgeleitet), Teil B auch die Vorschau.
  - `Skeleton`: lädt. `EmptyState`-Satz mit „Erneut laden“: Fehler.
- **Erweitert:** `FactTable` um **eine** Prop `marked?: readonly string[]`
  (§3 Regel 2). Markierte Zeilen bekommen den Hintergrund „ausgewählt“
  (`Row active`), ihre Bezeichnung wird Fokusziel. Das ist der Ausbau-Punkt
  aus 0246 und wird mit Teil A gebaut.
- **Neu, weil:** §3 Regel 5. Der Faktensatz ist eine neue Entität (App F668,
  GLOSSARY „Fact record“), und keine vorhandene Form zeigt Satz, Ergebnis und
  Fakten in dieser Reihenfolge mit Rückverweis. Die Ansicht hat eigenen
  Zustand: markierte Fakten, Fokus, in Teil B den Entwurf.
- **Entitätsprofil:** `entitaet-analysieren` setzt echte Daten voraus. Den
  Faktensatz gibt es erst auf `booking-v3`, ohne Daten auf staging. Bis
  dahin tragen Konzept §7, `fact-catalog.md` und F668 das Profil. Das Profil
  `docs/entitaeten/fact-record.md` folgt, sobald staging Faktensätze hat
  (benannte Ausnahme, Designer, 2026-11-18; bei app-f0 gemeldet).
- **Zuschnitt:** eine Datei `entities/fact-record/FactRecordView.tsx` mit
  einem Export und Stories daneben. Die Abschnitte sind interne Funktionen.
  Keiner tritt allein auf, außer dem Ergebnis mit „aus:“, das später auch
  die Klappzeile braucht (siehe Ausbau). Teil B (Bearbeiten) kommt als
  zweiter Export `FactRecordEditor` in dieselbe Datei. Er hat einen
  `"use client"`-Zustand (Entwurf) und andere Gründe sich zu ändern (§4).

## Schnittstelle

Die Daten kommen als ein VM aus der App. Die Form hat app-f0 im Brief
festgelegt, die Namen sind vorläufig. Der Typ gehört nach `src/ludwig/`
(L-382) und wird nicht lokal definiert.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `view` | `FactView` (L-382) | ja | Satz, Herkunft, vorläufig, Ergebnis, offene Punkte, Gruppen mit Fakten | `WithAssumptions` |
| `view.entry.originMethod` | Achse `journal_entry_origin_method` | ja | `StatusBadge` neben „Buchungssatz“ (app-f0: `originMethod` statt `decidedBy`) | `WithAssumptions`, `ByHand` |
| `view.entry.provisional` | `boolean` | ja | `Callout` Hinweis „Vorläufig gebucht: Der Satz ruht auf einem offenen Punkt.“ unter dem Satz | `Provisional` |
| `view.openPoints` | Liste mit `id`, `detail` | ja | `OpenPoints` gleich nach dem Satz, Titel „Offen“, Schlüssel `id`. Je Punkt: Bezeichnung des Fakts, `detail` als Satz darunter, Grund (Achse), wer am Zug ist (`disposition`). Bei `contradictory` darunter eine `FactTable` mit je einer Zeile je `evidence`-Eintrag und dessen `value` (ohne `value`: „—“) | `OpenPoint` |
| `view.result` | Liste mit `key` | ja | `FieldList`: Bezeichnung, Wert, darunter „aus: Land des Lieferanten, Verwendung“ als Wortverweise; `key` ist der Schlüssel der Markierung | `WithAssumptions`, `BackReference` |
| `view.groups` | Liste | ja | Je Gruppe mit mindestens einem Fakt `usedForResult` eine Karte in der Reihenfolge der Achse `fact_group`. Die übrigen Fakten stehen nach Gruppen unter „Weitere Angaben“ | `WithAssumptions`, `AllCertain` |
| `view.state = "no_fact_record"` | — | — | Buchung aus der Zeit vor v3: ein Satz statt leerer Gruppen (app-f0: Feld `state` am Kopf statt `view = null`) | `NoFactRecord` |
| `legacy` | `ReactNode` | nein | Was bei `no_fact_record` darunter steht: die heutige „Begründung“ mit Quellen aus `BookingReview`. Nichts geht verloren (Owner 2026-09-29) | `NoFactRecord` |
| `load` | `"loading" \| "error"` | nein | Ohne Angabe: geladen. lädt: Skeleton in der Form der Ansicht. Fehler: Satz mit „Erneut laden“. Heißt nicht `state`, weil das VM selbst `state` trägt | `Loading`, `Error` |
| `onRetry` | `() => void` | nein | Weg aus dem Fehler; ohne ihn steht kein Knopf | `Error` |
| `renderSourceOpen` | `(source) => (() => void) \| undefined` | nein | Öffnet eine Quelle daneben (Beleg-, Bankumsatz-Drawer); ohne ihn linkt `href` | `InUse` |
| `bookedByHand` | `JournalLine[]` | nein | Von Hand gebucht: `DiffView` „Gebucht (von Hand)“ ↔ „Abgeleitet“ statt der einen Karte | `ByHand` |

Typen: `FactView` (L-382; App F678a, `modules/fact-records/domain/fact-view.ts`
mit Zod-Schema). Alle Werte kommen fertig formatiert als deutsche
Zeichenketten (Wert, Betrag, Datum, `locator`); das Set rechnet und übersetzt
nichts. Die Wörter für Sicherheit, Gruppe, Grund, Quellenart und Herkunft
kommen aus den Achsen. `entry.assumedCount` und der Fakt-Schalter
`decidedByAgent` liegen im VM, zeigt Teil A aber nicht (siehe Ausbau). `Certainty`, `FactSource`, `FactSourceKind` aus
`@/ludwig/modules/fact-records/domain/`. `JournalLine` aus dem Set.
GLOSSARY: Faktensatz (`fact record`), offener Punkt (`open point`), Serie
(`series`).

**Kann bewusst nicht (Teil A):**
- **Kein Bearbeiten**, kein Beantworten, kein Weitergeben an den Mandanten. Das ist Teil B.
- **Keine Regelansicht** und kein Entscheidungsbaum. Die Ergebniszeile mit „aus:“ genügt (Brief, „Was nicht dazugehört“).
- **Keine Stammdaten ändern.** Ein langlebiger Fakt verlinkt über seine Quelle (`business_partner`, `client_profile`) dorthin.
- **Lädt nichts selbst.** Laden, Fehler und Rahmen trägt der Drawer der App (R15 Klasse B). Die Ansicht bekommt `state`.

## Verhalten

- **Reihenfolge, fest:** Satz (mit Herkunft und vorläufig) · Offen · Ergebnis · Beruht auf (Karten je Gruppe) · Weitere Angaben (zu). Was leer ist, steht nicht da, auch nicht sein Kopf.
- **Rückverweis:** „aus: Land des Lieferanten, Verwendung“ steht als Wörter da, nicht nur als Farbe beim Klick (Vier-Wochen-Test). Jedes Wort ist ein Button.
  - Ein Klick markiert die genannten Fakten (`FactTable marked`, Hintergrund „ausgewählt“) und setzt den Fokus auf den ersten.
  - Eine Live-Region sagt „2 Fakten markiert“.
  - Ein zweiter Klick oder `Esc` hebt die Markierung auf. `Esc` schließt die Leiste erst beim zweiten Druck.
  - Die Regel `basedOn` ⊆ `usedForResult` trägt der Kontrakt. Steht ein Fakt trotzdem nur unter „Weitere Angaben“, klappt die Ansicht sie auf.
- **Farbe:** Kritisch (rot) ist nur ein offener Punkt mit `blocksHandover`. Annahmen sind neutral, die Sicherheit ist ein graues Wort (0246). Vorläufig ist ein Hinweis.
- **Widerspruch:** zwei Zeilen untereinander, gleiche Bezeichnung, je eigener Wert und eigene Quelle (F678-Nachtrag).
- **Wer am Zug ist:** `StatusBadge` der Achse `disposition` (Ludwig · Kanzlei · Mandant). `server` und `agent` erscheinen als Ludwig.
- **Breite:** Drawer `md` (640 px). Kein Querscroll bei 1280 px, Kopfebenen h2 (Drawer) → h3 (Karten).
- **Tastatur:** Tab läuft Satz → Offen (Wege) → Ergebnis (Verweise) → Quellen in Lesereihenfolge. Fokusring sichtbar und nicht vom Sticky-Kopf des Drawers verdeckt (2.4.11).
- **Client-Component:** markierte Fakten und Fokus sind Zustand.

## Teil B (nach der Owner-Durchsicht des Ablaufs)

Erst gespect, wenn der Userflow bestätigt ist. Hier steht nur, was er tragen
muss, damit Teil A dafür keinen Umbau braucht:

- **Fakt ändern:** an einer `FactTable`-Zeile mit `editable`. Eingabe über `Select`/`RadioGroup` aus `options`, sonst `Input`.
- **Vorschau:** `DiffView` über Ergebnis und Zeilen **aller** Sätze des Splits (Reichweite laut F678-Nachtrag), Unverändertes eingeklappt. Führt die Änderung in einen anderen Ast, steht dort „Dann fehlt: …“ als offener Punkt.
- **Speichern und Verwerfen:** im `DrawerFooter`. Speichern ist umkehrbar und kommt deshalb ohne Bestätigungsdialog. `Esc` verwirft. Die Live-Region sagt „Gespeichert, Konto 4930 → 3400“.
- **Offener Punkt:** beantworten (dieselbe Eingabe wie „Fakt ändern“) oder als Rückfrage an den Mandanten weitergeben (vorhandene Rückfrage, `ClarificationEditor`). Danach steht dort, wer am Zug ist.
- **Neue Sicherheit nach Korrektur:** `confirmed` mit Quelle `accounting_review` (Person, Zeit). Das kommt aus der App, die Ansicht zeigt es nur.

## Stories

`v3/Entitäten/Faktensatz/FactRecordView`. Entität je Form mindestens 3, hier
10 (Obergrenze) für Teil A. Fiktive Daten nach F678: Software-Abonnement einer
irischen Ltd., Netto 1.188,00 €, § 13b.

| Story | Beweist |
|---|---|
| `WithAssumptions` | Normalfall: Satz mit Herkunft „Aus Fakten abgeleitet“, Ergebnis mit „aus:“, Karten Rechnungsposition und Geschäftspartner, ein Fakt „angenommen“ (neutral), „Weitere Angaben 4“ zu |
| `AllCertain` | Nichts ist hervorgehoben, die Ansicht ist ruhig |
| `OpenPoint` | Drei Punkte: fehlt (Kanzlei am Zug), widersprüchlich mit zwei Quellen und eigenem Wert (Ludwig), blockierend (rot, mit Wort) |
| `Provisional` | Hinweis „Vorläufig gebucht“ im Satz, der offene Punkt darunter |
| `ByHand` | Herkunft „Manuell“, `DiffView` gebucht ↔ abgeleitet, Fakten sichtbar |
| `NoFactRecord` | Buchung vor v3: der Satz, darunter `legacy` (Begründung und Quellen) |
| `Loading` | Skeleton in der Form der Ansicht, das Layout springt nicht |
| `Error` | Satz „Die Fakten zu dieser Buchung ließen sich nicht laden.“ und „Erneut laden“ |
| `BackReference` | Rundlauf: Klick auf „Verwendung“ in „aus:“ markiert, fokussiert, sagt an; Esc hebt auf |
| `InUse` | im `Drawer` `md` neben einer Abnahme-Liste (`JournalEntryReviewList`), Quelle öffnet daneben |

Nicht anwendbar, mit Grund: **leer nach Filter**, denn die Ansicht filtert
nicht. Für **leer** steht `NoFactRecord`: Ein Faktensatz ohne einen Fakt
kommt laut F668 nicht vor.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Teil B: ändern, Vorschau, speichern, offene Punkte beantworten oder weitergeben | Export `FactRecordEditor` mit `onChangeFact`, `onSave`, `onDiscard`, `onAnswer`, `onAskClient`, `preview` | Owner-Durchsicht des Ablaufs (Plan Punkte 12/13), Nachtrag zu F678 |
| Die Klappzeile im Schritt „Buchungen“ zeigt unter „Begründung“ die Ergebniszeilen mit „aus:“ (F678 W) | `BookingReviewEntry.result` und das Ergebnis als eigener Export `FactResult` | App-Spec der Faktenansicht |
| Zeilenmarke in der Abnahme-Liste: Herkunft und Zahl der Annahmen und offenen Punkte | eine Unterzeile in `JournalEntryReviewList`, keine neue Spalte | Owner-Durchsicht Schritt 1 des Ablaufs |
| Entitätsprofil Faktensatz | `docs/entitaeten/fact-record.md` | staging hat Faktensätze |
| Wer einen Fakt gesetzt hat (`decidedByAgent`), für die Nachprüfung je Entscheidung | eine Marke an der `FactTable`-Zeile; das Wort kommt aus einer Achse der App | App-Spec der Nachprüfung je Entscheidung |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (Teil A):

- [ ] Reihenfolge Satz · Offen · Ergebnis · Beruht auf · Weitere Angaben, Leeres ohne Kopf (`WithAssumptions`, `AllCertain`)
- [ ] Gruppen in der Reihenfolge der Achse `fact_group`, Wörter aus der Achse, eine Karte je Gruppe mit `h3` (`WithAssumptions`)
- [ ] Herkunft aus `journal_entry_origin_method`, wer am Zug aus `disposition`, Grund aus `fact_open_point_reason`, alles über `StatusBadge` und Registry (`OpenPoint`, `ByHand`)
- [ ] Rot nur bei `blocksHandover`, mit Wort; Annahme und vorläufig ohne Fehlerfarbe (`OpenPoint`, `Provisional`)
- [ ] Widerspruch als zwei Zeilen mit je eigenem Wert und eigener Quelle (`OpenPoint`)
- [ ] „aus:“ als Wörter, Klick markiert und fokussiert, Live-Region sagt an, Esc hebt erst die Markierung auf (`BackReference`)
- [ ] `FactTable marked` gebaut, mit `@when` in einem Halbsatz und Story in `FactTable.stories` (Erweiterung 0246)
- [ ] `NoFactRecord` (`view.state = "no_fact_record"`) zeigt den Satz und `legacy`, keine leeren Gruppen
- [ ] lädt und Fehler über `load`, ohne Sprung; Fehler mit Weg nur bei `onRetry` (`Loading`, `Error`)
- [ ] Kein Querscroll im Drawer `md` bei 1280 px, Fokus nicht vom Sticky-Kopf verdeckt, Treffer ≥ 24 px, gemessen (`InUse`)
- [ ] Keine lokale Definition von `FactView`: Typ aus `src/ludwig/` (L-382)
- [ ] Ein Zeichen je Quellenart im ganzen Set (Folgeauftrag aus der S2-Abnahme von 0246): Ein gemeinsamer Export zeichnet Icon und Wort (Wort aus `fact_source_kind`) für die Buchung (`AiBookingNotes`) und die Faktenansicht. Dieselbe Art hat an Buchung und Fakt dasselbe Zeichen, auch in den `FactTable`-Stories

## Entschieden (app-f0, 2026-11-18)

1. **Bearbeiten in der Leiste** (R15 Klasse B), nicht im Detail; die Liste
   bleibt sichtbar (Teil B).
2. **Drawer `md`**; `lg` erst, wenn die Vorschau (Teil B) gemessen nicht passt.
3. **Zahl der Annahmen nur an der Zeile der Liste.** Das VM liefert
   `assumedCount` trotzdem, für die Liste.
4. **VM-Form F678a** (Abweichungen vom Brief): `entry.originMethod`,
   `state` am Kopf, Ergebniszeile mit `key`, offener Punkt mit `id` und
   `detail`, `evidence[].value` optional, Fakt mit `decidedByAgent`;
   `editable`/`options` erst mit Teil B. Oben eingearbeitet.

## Nachträge im Bau von Teil A (Spec-Autor, 2026-11-18)

Gebaut auf dem DS-Branch `booking-v3` (Typ F678a nur dort gespiegelt,
`26ec869`). Was anders wurde als oben, mit Grund:

1. **Satz ohne `JournalEntryCard`:** Die Zeilen kommen fertig formatiert
   (`account` „Nummer Name“, `amount` als Text, F678a). `JournalEntryCard`
   braucht Zahl und Kontonummer getrennt, und das Set rechnet nicht zurück.
   Die Ansicht zeigt die Zeilen deshalb als eigene kompakte Tabelle in
   DATEV-Ordnung (Konto · Soll · Haben · BU, Beträge rechts in `tnum`, BU in
   Mono). Gleich auszusehen wie überall ist das Ziel → L-383.
2. **„Von Hand“ ohne Vergleich:** Das VM trägt für eine Buchung von Hand
   keinen abgeleiteten Satz. Die Prop `bookedByHand` und die `DiffView`
   gebucht ↔ abgeleitet entfallen in Teil A. `ByHand` zeigt die Herkunft
   „Manuell“ und die Fakten → Ausbau, wenn das VM den abgeleiteten Satz
   liefert (L-383).
3. **Namen:** `renderSourceOpen` heißt `openSource`. Die Story `Error` heißt
   `LoadError`, weil der Exportname sonst das globale `Error` überdeckt.
4. **`InUse` ohne Liste dahinter:** Die Abnahme-Liste ist die Seite der App
   (F678b). Die Story misst die Leiste in ihrer Breite `md` und den Weg
   „Quelle öffnet daneben“.
5. **Ergebnis als Karte:** `Card` mit `CardHead` „Ergebnis“ und `FieldList`
   `bare`/`prose`, damit es wie die anderen Abschnitte aussieht und die
   Werte (Text) links stehen. Ein `FieldList` mit eigenem Titel stand
   rechtsbündig und mit anderem Kopf (gesehen im Bau).
6. **Ein Zeichen je Quellenart:** `FactSourceKindMark` (in `AiBookingNotes`,
   der freigestellten Aufzählung) zeichnet jede Art für Buchung und Fakt.
   Wo die Art eine Entität ist, ist das Zeichen das der Entität. Sichtbar an
   den KI-Buchungshinweisen: Beleg, Kontoauszug und Rückfrage tragen jetzt
   die Entitätszeichen statt `FileText`, `Banknote`, `HelpCircle`.
7. **`OpenPoints` um `headingLevel`** (eine Prop, §3 Regel 2): im Drawer `h3`
   unter dessen `h2` (A14).
8. **Kein Aufklappen von „Weitere Angaben“ beim Markieren (Abnahme M3):**
   Das Schema von F678a (`superRefine`) lehnt eine Ergebniszeile ab, deren
   `basedOn` einen Fakt ohne `usedForResult` nennt. Ein markierter Fakt steht
   also immer in einer Karte oben, nie unter der Falte. Der Fallback aus dem
   Verhalten-Absatz wird deshalb nicht gebaut; fällt die Schemaregel, kommt
   er zurück.
9. **`OpenPoint.more` (Abnahme M2, ein Feld, §3 Regel 2):** was nur unter
   **diesen** Punkt gehört. Die Widerspruchstabelle steht so direkt unter
   ihrem Punkt statt über `extra` unter allen Punkten.
10. **Ein Zeichen je Quellenart im Pattern (Abnahme M1):** `FactSourceKindMark`
    zieht von `AiBookingNotes` nach `patterns/Provenance.tsx`, die Freistellung
    in `check:icons` mit. So zeichnen Buchung, Faktenansicht und die
    `FactTable`-Stories mit derselben Marke; eine Pattern-Story darf keine
    Entität importieren.
11. **Hinweise der Abnahme umgesetzt:** offene Punkte nach Kritikalität
    (blockierend zuerst, A7); der Fehlersatz nennt keine Ursache, die die
    Ansicht nicht kennt; „Vorläufig gebucht“ im Ton Hinweis (`Callout`
    accent) statt grau.
12. **Spec berichtigt (Mängel der Spec aus der Abnahme):** Die Achse heißt
    `disposition`, nicht `case_disposition`. „Offen“ steht nach dem Satz, wie
    in Ziel und Kriterium; Schnittstelle und Story `Provisional` sagten
    anderes. (Nach der Nachprüfung auch in Einordnung und Schnittstelle
    nachgezogen, dort stand noch „ganz oben“.)
13. **Ein Zeichen je Quellenart auch in den `Provenance`-Stories
    (Nachprüfung, Rest M1):** Sie zeichneten „Bisherige Buchungen“ mit dem
    Zeichen von `journal-entry`; jetzt mit `FactSourceKindMark` wie alle
    anderen.

## Abnahme

Fremde Abnahme (Agent), 2026-11-18, Teil A. Geprüft im Arbeitsbaum
`designsystem-bv3` (Branch `booking-v3`, `26ec869` plus die uncommitteten
Dateien des Baus), Storybook auf Port 6107, Playwright bei 1280 × 900.
Story-IDs ohne Präfix `v3-entitäten-faktensatz-factrecordview--`, wo nicht
anders genannt. Dateiorte relativ zum Arbeitsbaum. Screenshots unter
`.playwright-mcp/abn0247-*.png` im Hauptrepo (nicht eingecheckt).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün | `pnpm -s typecheck` exit 0 · `pnpm -s check:type` exit 0 („0 older findings“) · Build statt `pnpm build` im Arbeitsbaum: `pnpm exec storybook build -o <scratchpad>/sb-abn0247 --quiet` exit 0, „Storybook build completed successfully“, Ordner danach gelöscht | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/entities/fact-record/FactRecordView.tsx` + `FactRecordView.stories.tsx`, Titel `v3/Entitäten/Faktensatz/FactRecordView`; Export in `src/ui/v3/index.ts` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `check:when` exit 0, `check:language` exit 0 (je `--test` exit 0); `@when`/`@instead` an `FactRecordView`, `FactSourceKindMark`, `FactTable` (Halbsatz zu `marked`) gelesen | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Gelesen: kein Hex/px in TSX außer Story-Rahmen (`maxWidth: 600/760`). Herkunft und „wer am Zug“ über `StatusBadge`, Grund, Gruppe, Quellenart, Sicherheit über `resolveStatus`. `TURN` (`FactRecordView.tsx:40`) bildet Werte auf Registry-Schlüssel ab, keine Wörter. Hinweis H6: `cols="… 7rem 7rem 3rem"` (`FactRecordView.tsx:87`) ist ein Maß im TSX, kein px | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | 10 Stories im Index: `with-assumptions`, `all-certain`, `open-point`, `provisional`, `by-hand`, `no-fact-record`, `loading`, `load-error` (Nachtrag 3), `back-reference`, `in-use`; „leer nach Filter“ in der Spec begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe `entities/` (Seitenimport aus `journal-entry` hat Vorbild, `check:domain-paths` exit 0) · Zahlen rechts `v2num lw-numeric`, BU `v2mono` · Rot nur Fehler (s. u.) · Wort zu jeder Farbe · fünf Zustände · Kontrast gemessen: Fokusring rgb(59,143,196) auf markierter Zeile rgb(241,247,251) 3,29:1, Link darauf 5,04:1, Text 12,75:1; `check:contrast` exit 0 · Tastaturweg und Hover gemessen (Verweis unterstreicht bei Hover, Faktenzeile ohne Hover) · Treffer ≥ 24 px · `check:type` exit 0 · h2 (Drawer) → h3 · Karte aus `Card` · kein Querlauf · Sie-Form („Laden Sie die Ansicht erneut.“) · `check:icons` exit 0 (`AiBookingNotes` ist freigestellt) | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle 10 Stories geladen, je nur der bekannte 404 `vite-inject-mocker-entry.js` in der Konsole; Screenshots `abn0247-with-assumptions.png`, `-open-point.png`, `-loading.png`, `-back-reference-marked.png`, `-in-use-open.png` | ✓ |
| Reihenfolge Satz · Offen · Ergebnis · Beruht auf · Weitere Angaben, Leeres ohne Kopf (`WithAssumptions`, `AllCertain`) | `with-assumptions` und `all-certain`: Kinder von `.v3frv` = h3 Buchungssatz · h3 Ergebnis · h3 Rechnungsposition · h3 Geschäftspartner · summary „Weitere Angaben 4“; kein „Offen“-Kopf ohne Punkte. `open-point`: „Offen“ an zweiter Stelle. Hinweis H8: „Beruht auf“ hat keinen sichtbaren Kopf | ✓ |
| Gruppen in der Reihenfolge der Achse `fact_group`, Wörter aus der Achse, eine Karte je Gruppe mit `h3` (`WithAssumptions`) | Daten in der Folge counterparty, line, document, client; gezeigt Rechnungsposition vor Geschäftspartner, unter „Weitere Angaben“ Beleg · Geschäftspartner · Mandant (Achse: document, line, counterparty, client …); Wörter = `FACT_GROUP`-Labels; je Karte ein `h3` | ✓ |
| Herkunft aus `journal_entry_origin_method`, wer am Zug aus `case_disposition`, Grund aus `fact_open_point_reason`, alles über `StatusBadge` und Registry (`OpenPoint`, `ByHand`) | `with-assumptions`: Badge „Aus Fakten abgeleitet“ (`bdg-info`), `by-hand`: „Manuell“ (`bdg-neutral`), `no-fact-record`: „Vorschlag von Ludwig“. `open-point`: „Kanzlei“, „Ludwig“, „Mandant“ als `StatusBadge` der Achse `disposition`; Gründe „fehlt.“, „widersprüchlich.“, „unsicher.“ aus `resolveStatus` | ✓ |
| Mangel der Spec: Achse `case_disposition` | Die Registry kennt keine Achse `case_disposition`; gebaut mit `disposition` (`client_accounting_case.disposition`), das ist gemeint. Spec-Wortlaut in Einordnung, Verhalten und Kriterium nachziehen | Mangel der Spec |
| Rot nur bei `blocksHandover`, mit Wort; Annahme und vorläufig ohne Fehlerfarbe (`OpenPoint`, `Provisional`) | `open-point`: einzige rote Farbe im Baum ist `lucide-circle-x` rgb(168,64,60) am Punkt „USt-IdNr.: unsicher.“ mit dem Satz „Sperrt die Übergabe an DATEV.“; die anderen Punkte `lucide-info` grau. „Vorläufig gebucht“ `v2note--soft` (rgb(244,246,248), Text rgb(92,92,92)); „angenommen“ graues Wort. Hinweis H4 | ✓ |
| Widerspruch als zwei Zeilen mit je eigenem Wert und eigener Quelle (`OpenPoint`) | `open-point`: „Land des Lieferanten · Irland · Beleg Rechnung INV-2026-0412 S. 1, Absender“ und „Land des Lieferanten · Deutschland · Geschäftspartner Nordlicht Software Ltd. Feld Land“. Lage s. M2 | ✓ |
| „aus:“ als Wörter, Klick markiert und fokussiert, Live-Region sagt an, Esc hebt erst die Markierung auf (`BackReference`) | `back-reference`: „aus:“ je Wort ein `button`. Klick „Verwendung“ → 2 Zeilen `is-active` (Was wurde gekauft, Verwendung), Fokus auf `span[data-fact-key=supply_type]`, `role=status aria-live=polite` „2 Fakten markiert“; Esc → 0 Zeilen, „Markierung aufgehoben“; zweiter Klick hebt auf. Tastatur: Enter auf „Land des Lieferanten“ → 3 markiert, Fokusring `:focus-visible` 2 px. `in-use`: erstes Esc erreicht `window` nicht (0 Ereignisse), Drawer bleibt offen; zweites Esc erreicht `window` (1). Hinweis H7 | ✓ |
| `FactTable marked` gebaut, mit `@when` in einem Halbsatz und Story in `FactTable.stories` (Erweiterung 0246) | `v3-patterns-prüfen-facttable--marked`: Zeilen „Leistung“ und „Verwendung“ `is-active` (rgb(241,247,251), Randstrich), jede Bezeichnung `data-fact-key` mit `tabindex=-1`; `@when` „`marked` shows which of them a result rests on“ | ✓ |
| `NoFactRecord` (`view.state = "no_fact_record"`) zeigt den Satz und `legacy`, keine leeren Gruppen | `no-fact-record`: Buchungssatz-Karte, Hinweis „Diese Buchung hat keinen Faktensatz …“, darunter `legacy` (Begründung); keine Gruppen, kein Ergebnis | ✓ |
| lädt und Fehler über `load`, ohne Sprung; Fehler mit Weg nur bei `onRetry` (`Loading`, `Error`) | `loading`: zwei `v2skelgroup` („Wird geladen …“), Breite 600 wie geladen; `load-error`: `v2note--danger` mit fettem Was, Satz und „Erneut laden“ (114 × 34,8 px). Ohne `onRetry` kein Knopf und kein Folgesatz: nur im Code geprüft (`FactRecordView.tsx:184–192`), keine Story ohne `onRetry`. Hinweise H3, H5 | ✓ |
| Kein Querscroll im Drawer `md` bei 1280 px, Fokus nicht vom Sticky-Kopf verdeckt, Treffer ≥ 24 px, gemessen (`InUse`) | `in-use` bei 1280 × 900: Drawer 640 px, `.v2drawer__b` scrollWidth 640 = clientWidth 640, auch mit „Weitere Angaben“ offen; kein Element ragt hinaus. Kopf `.v2drawer__h` steht außerhalb des Scrollbereichs, kein `position: sticky` im Drawer; Tab-Lauf über alle 15 Ziele: jedes `elementFromPoint` = es selbst, Oberkante ≥ Oberkante des Körpers. Treffer: 20 Ziele, kleinstes 23,99 px hoch (Verweise, Subpixel der Formel), (i) 24 × 24, Schließen 28 × 28. Quelle „Rechnung INV-2026-0412“ öffnet daneben („Geöffnet: Rechnung INV-2026-0412, S. 1“). Hinweis H2 | ✓ |
| Keine lokale Definition von `FactView`: Typ aus `src/ludwig/` (L-382) | `FactView`, `FactViewSource`, `FactViewPartyOnTurn` aus `@/ludwig/modules/fact-records/domain/fact-view`; `Fact` nur abgeleitet (`FactView["groups"][number]["facts"][number]`); `FACT_GROUPS` aus `fact-record` | ✓ |
| Ein Zeichen je Quellenart im ganzen Set (Folgeauftrag aus der S2-Abnahme von 0246) … auch in den `FactTable`-Stories | Gemessen über `.v3prov__kind svg`: Faktenansicht und `AiBookingNotes`/`BookingReview` gleich (Beleg `receipt`, Bisherige Buchungen `rotate-ccw-clock`, Geschäftspartner `building-2`, Gesetz `scale`). In den `FactTable`-Stories nicht: „Bisherige Buchungen“ = `book-open` (`--filled`, `--in-use`, `--marked`), „Gesetz“ (`--edge`), „Externe Prüfung“ und „Standardwert“ (`--certainty`) ohne Zeichen. Die Stories zeichnen mit eigenem Helfer statt `FactSourceKindMark` → M1 | ✗ |
| M2 · Schnittstelle `view.openPoints`: „Bei `contradictory` darunter eine `FactTable`“ | `open-point`: Die Widerspruchstabelle steht über `extra` nach **allen** Punkten (`FactRecordView.tsx:285–303`), hier hinter dem roten Punkt „USt-IdNr.“, nicht unter ihrem Punkt. Kein Nachtrag benennt das. Bauen (Platz je Punkt, z. B. eine Prop an `OpenPoints`) oder als Ausnahme benennen | ✗ |
| M3 · Verhalten: „Steht ein Fakt trotzdem nur unter ‚Weitere Angaben‘, klappt die Ansicht sie auf“ | Nicht gebaut: `mark()` verlässt sich auf die Schemaregel (`FactRecordView.tsx:241–249`), die Tabellen unter „Weitere Angaben“ bekommen kein `marked` (`FactRecordView.tsx:371`). Kein Nachtrag benennt das. Bauen oder als Nachtrag mit Grund (Schema `superRefine` schließt den Fall aus) benennen | ✗ |
| Mangel der Spec: Lage von „Offen“ | Schnittstelle `view.openPoints` sagt „`OpenPoints` ganz oben“, Ziel, Verhalten und Kriterium sagen Satz · Offen; Story `Provisional` sagt „der offene Punkt darüber“. Gebaut nach dem Kriterium (Offen unter dem Satz). Spec-Wortlaut angleichen | Mangel der Spec |
| Nachtrag 1 · Satz ohne `JournalEntryCard` | Trägt im Grund: `FactViewEntryLine` hat `account` und `amount` als Text, `JournalLine` braucht `accountNumber` und `amount: number`. Hinweis H1 zur Spaltenfolge | ✓ |
| Nachtrag 2 · „Von Hand“ ohne Vergleich | Trägt: `FactViewSchema` hat keinen abgeleiteten Satz; `bookedByHand` fehlt in den Props; `by-hand` zeigt „Manuell“ und alle Fakten | ✓ |
| Nachtrag 3 · `openSource`, Story `LoadError` | Trägt: Prop `openSource(source) => (() => void) \| undefined`; Story-ID `--load-error` | ✓ |
| Nachtrag 4 · `InUse` ohne Liste | Trägt: Drawer `md` gemessen (s. o.), Quelle öffnet daneben | ✓ |
| Nachtrag 5 · Ergebnis als Karte | Trägt: `Card` + h3 „Ergebnis“ + `FieldList bare/prose`, Werte linksbündig (Screenshot `abn0247-with-assumptions.png`) | ✓ |
| Nachtrag 6 · `FactSourceKindMark` | Trägt für Buchung und Fakt (`AiBookingNotes.tsx:86`, `:261`); Beleg, Kontoauszug, Rückfrage tragen in `aibookingnotes--source-kinds` `receipt`, `arrow-left-right`, `message-circle-question-mark`. Die `FactTable`-Stories sind nicht nachgezogen → M1 | ✓ (mit M1) |
| Nachtrag 7 · `OpenPoints` um `headingLevel` | Trägt: in der Faktenansicht h3; Vorgabe 2 unverändert, gemessen in `muster-detailseite--document`/`--accounting-case`/`--account`, `seiten-sachverhalt-einzelfall--proposal-pending`, `seiten-konto-seite--in-use`, `seiten-sachverhalt-seite--in-use`: h2 | ✓ |
| Regression: `AiBookingNotes`, `BookingReview`, `FactTable`, `OpenPoints` | 7 `aibookingnotes`-, 7 `bookingreview`-, 8 `facttable`-Stories und 6 Stories mit `OpenPoints` geladen: alle `sb-show-main`, keine Fehleranzeige, Konsole nur der bekannte 404. Quellen in `bookingreview--case-editable`/`--in-use`/`--in-foldout` zeigen `receipt` und `rotate-ccw-clock` | ✓ |
| Wächter | `check:when`, `check:language`, `check:icons`, `check:contrast`, `check:domain-paths` exit 0; `check:classes` exit 1 nur mit den vier bekannten Altfunden (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`), kein `v3frv`/`v3fact`; alle `--test` exit 0 | ✓ |

**Mängel**

- **M1** Ein Zeichen je Quellenart gilt in den `FactTable`-Stories nicht:
  `src/ui/v3/patterns/FactTable.stories.tsx:22` (eigener Helfer `kind`
  mit `EntityIcon`), `:46` („Bisherige Buchungen“ mit dem Zeichen des
  Buchungssatzes), `:129`, `:185`, `:188` (Gesetz, Externe Prüfung,
  Standardwert nur als Wort). Die Stories sollen `FactSourceKindMark`
  benutzen.
- **M2** Widerspruchstabelle nicht unter ihrem Punkt
  (`FactRecordView.tsx:285–303`), unbenannte Abweichung.
- **M3** „Weitere Angaben“ klappt bei einem markierten Fakt darin nicht auf,
  dort gibt es keine Markierung (`FactRecordView.tsx:241–249`, `:371`),
  unbenannte Abweichung.

**Hinweise** (kein Mangel)

- **H1** Die Zeilen des Satzes stehen als Konto · Soll · Haben · BU,
  Köpfe „Soll“/„Haben“ (`FactRecordView.tsx:87–110`). `JournalEntryCard`
  hat Konto · Kontoname · BU · Buchungstext · Soll Umsatz · Haben Umsatz.
  Die Reihenfolge ließe sich schon jetzt angleichen (BU vor den Beträgen),
  sonst gehört sie in L-383.
- **H2** Die Rückverweise messen 23,99 px hoch. Das kommt aus dem Subpixel
  der Formel `calc((24px - 1lh) / 2)` und liegt in der Toleranz von axe.
- **H3** „Der Server hat nicht geantwortet.“ (`FactRecordView.tsx:183`)
  nennt eine Ursache, die die Ansicht nicht kennt. Die Einordnung nannte
  einen `EmptyState`-Satz, gebaut ist `Callout danger`.
- **H4** „Vorläufig“ steht als `Callout soft` (Debug-Stufe, grau). Die Spec
  sagt Hinweis, aber `Callout` hat keinen `info`-Ton. Der Text weicht ab:
  „… auf einem offenen Punkt oder auf einer Annahme“ statt „… auf einem
  offenen Punkt“.
- **H5** Das Skeleton ist 180 px hoch, die geladene Ansicht 1.222 px. Die
  Breite bleibt gleich. Die Form zeigt nur eine Karte und vier Zeilen,
  nicht Satz, Ergebnis und Gruppen.
- **H6** Spaltenmaße `7rem 7rem 3rem` stehen im TSX (`FactRecordView.tsx:87`).
- **H7** Steht der Fokus außerhalb der Ansicht (etwa auf „Schließen“),
  schließt Esc die Leiste trotz Markierung. Gemessen: Das Ereignis erreicht
  `window`, die Markierung bleibt.
- **H8** „Beruht auf“ hat keinen sichtbaren Kopf. Die Gruppenkarten folgen
  direkt auf „Ergebnis“ (Vier-Wochen-Test).
- **H9** Die offenen Punkte kommen ungeordnet aus dem VM. `OpenPoints`
  erwartet die Kritikalität absteigend vom Aufrufer, in `open-point` steht
  der rote Punkt zuletzt.
- **H10** `FactTable` macht jetzt jede Bezeichnung zum Fokusziel
  (`tabindex=-1`), nicht nur die markierten. Das ist unschädlich, weil sie
  nicht in der Tab-Folge stehen.

Abgenommen von / am: fremde Abnahme (Agent), 2026-11-18, Teil A —
**nicht abgenommen** · Offene Punkte: M1–M3; Spec-Mängel `case_disposition`
und Lage von „Offen“; Hinweise H1–H10

### Nachprüfung 2026-11-18 (fremd, Agent, Teil A)

Ich habe gegen die Mängel M1–M3, die Spec-Mängel und die Nachträge 8–12
geprüft, nicht gegen die Erklärung des Bauers. Stand: Arbeitsbaum
`designsystem-bv3` mit den uncommitteten Änderungen, jetzt auch in
`patterns/Provenance.tsx`, `patterns/OpenPoints.tsx`, `scripts/check-icons.mjs`.
Gemessen mit Storybook 6107 und Playwright bei 1280 × 900. Das Protokoll
oben bleibt unverändert, auch die vier Stellen mit `case_disposition`
(geprüft).

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| Wächter und Build | `typecheck`, `check:type`, `check:when`, `check:language`, `check:icons`, `check:contrast` und `check:domain-paths` liefen ohne Fehler, ebenso alle `--test`. `check:classes` meldet nur die vier Altfunde. `pnpm exec storybook build -o <scratchpad>/sb-abn0247b --quiet` lief durch, der Ordner ist gelöscht | ✓ |
| M1 · Ein Zeichen je Quellenart im ganzen Set | `FactSourceKindMark` steht jetzt in `patterns/Provenance.tsx` und ist über `@/ui/v3` exportiert. `AiBookingNotes` und `FactTable.stories` zeichnen damit. Gemessen über `.v3prov__kind svg` in 47 Stories (FactRecordView 10, FactTable 8, Provenance 9, AiBookingNotes 7, BookingReview 7, sechs mit `OpenPoints`): Beleg `receipt` (24 Stories), Geschäftspartner `building-2`, Gesetz `scale` (`facttable--edge`, `aibookingnotes--source-kinds`), Externe Prüfung `badge-check`, Standardwert `circle-dashed`, Mandant `briefcase`, Kontoauszug `arrow-left-right`, Regel `ruler`, Rückfrage `message-circle-question-mark`, alle einheitlich. **Ausnahme:** „Bisherige Buchungen“ hat in 14 Stories `rotate-ccw-clock`, in `provenance--note`, `--edges`, `--rows` und `--with-verdict` aber `book-open`. Ursache: `src/ui/v3/patterns/Provenance.stories.tsx:25–31` zeichnet mit eigenem Helfer `kind(entity, word)` aus `EntityIcon` und festem Wort; Zeilen `:35` und `:204` geben „Bisherige Buchungen“ das Zeichen `journal-entry`. Die Wörter „Beleg“ und „Kontoauszug“ stehen dort fest im Code statt aus `fact_source_kind`. Das sind die Stories des Patterns, in dem die Marke jetzt wohnt. In der ersten Abnahme hatte ich die Provenance-Stories nicht gemessen | ✗ |
| M2 · Widerspruch unter seinem Punkt | `open-point`: Der Punkt „Land des Lieferanten: widersprüchlich.“ enthält `.v3open__more` mit den zwei Zeilen „Irland · Beleg …“ und „Deutschland · Geschäftspartner …“. Außerhalb der Punkte steht kein `.v3frv__contra` mehr, kein Querlauf in der Karte (600 px). Neues Feld `OpenPoint.more` (`OpenPoints.tsx`, Nachtrag 9). Screenshot `abn0247-np-open-point.png` | ✓ |
| M3 · Aufklappen von „Weitere Angaben“ | Nicht gebaut, aber mit Grund benannt (Nachtrag 8: `superRefine` von F678a schließt den Fall aus, gegengelesen in `fact-view.ts`) | ✓ |
| Spec-Mangel `case_disposition` | Nachtrag 12. Einordnung, Schnittstelle, Verhalten und Kriterium sagen jetzt `disposition`; die Spec-Autorin hat den Wortlaut des Kriteriums selbst berichtigt | ✓ |
| Spec-Mangel Lage von „Offen“ | Story `Provisional` ist angeglichen („der offene Punkt darunter“). Die Schnittstelle `view.openPoints` (Z. 75) und die Einordnung (Z. 37, „die offenen Punkte ganz oben“) sagen aber weiter „ganz oben“, gegen Nachtrag 12. Gebaut ist richtig (Offen nach dem Satz); es fehlt nur der Wortlaut in der Schnittstelle | Mangel der Spec (Rest) |
| H9 · Kritikalität zuerst | `open-point`: Reihenfolge USt-IdNr. (blockierend, `circle-x` rgb(168,64,60)) · Verwendung · Land des Lieferanten. Rot steht weiter nur am blockierenden Punkt | ✓ |
| H3 · Fehler ohne erfundene Ursache | `FactRecordView.tsx:182–185`: fettes Was, danach nur der nächste Schritt, ohne `onRetry` ein Schritt ohne Knopf (im Code geprüft) | ✓ |
| H4 · Vorläufig als Hinweis | `open-point`/`provisional`: `v2note` (accent) mit Hintergrund rgb(241,247,251) = `--color-info-bg`, Text rgb(45,45,45), keine Fehlerfarbe | ✓ |
| Rückverweis und Drawer erneut | `in-use`: Drawer 640 px, `scrollWidth` = `clientWidth` = 640 auch mit „Weitere Angaben“ offen, kein Sticky, 20 Ziele, kleinstes 23,99 × 24 px. Klick „Verwendung“: 2 markiert, Fokus auf „Was wurde gekauft“ frei sichtbar, Live-Region „2 Fakten markiert“. Erstes Esc: aufgehoben, `window` 0 Ereignisse. Zweites Esc: `window` 1 | ✓ |
| Regression | 47 Stories (Liste oben) mit `sb-show-main`, keine Fehleranzeige, Konsole nur der bekannte 404 `vite-inject-mocker-entry.js`. `aibookingnotes--cell-empty` ist leer wie vorgesehen. `OpenPoints` ohne `headingLevel` bleibt h2 (sechs Seiten-/Muster-Stories), in der Faktenansicht h3 | ✓ |

**Offen**

- **M1 (Rest)** `src/ui/v3/patterns/Provenance.stories.tsx:25–31`, `:35`,
  `:204`: Die Stories sollen `FactSourceKindMark` benutzen, wie die
  `FactTable`-Stories.

**Hinweise**

- Weiter offen, kein Mangel: H1 (Spaltenfolge des Satzes), H2, H5, H6, H7,
  H8, H10.
- **H11** `src/styles/v3.css:4193–4195`: Die neue Regel `.v3open__more`
  steht zwischen dem Kommentar von `.v3open__raw` und dessen Regel. Der
  Kommentar hängt jetzt an der falschen Regel.
- **H12** `FactSourceKindMark` im Pattern `Provenance` benutzt die Klasse
  `ki__art` aus dem Block der KI-Buchungshinweise. Ein Name des Patterns
  wäre klarer.
- **H13** `AiBookingNotes.tsx` hat drei doppelte Leerzeilen (nach Zeile 5,
  68 und 220). Der Kopfkommentar von `Provenance.tsx` hat eine überlange
  Zeile.

Nachgeprüft von / am: fremde Abnahme (Agent), 2026-11-18, Teil A —
**nicht abgenommen** · Offen: M1 (Rest), Wortlaut „ganz oben“ in
Einordnung und Schnittstelle

### Schlussprüfung 2026-11-18 (fremd, Agent, Teil A)

Ich habe gegen die beiden offenen Punkte der Nachprüfung und gegen H11 und
H13 geprüft. Stand: Arbeitsbaum `designsystem-bv3`, jetzt auch mit
`patterns/Provenance.stories.tsx`. Gemessen mit Storybook 6107 und Playwright
bei 1280 × 900. Abnahme und Nachprüfung oben sind unverändert (geprüft).

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| Wächter und Build | `typecheck`, `check:type`, `check:when`, `check:language`, `check:icons`, `check:contrast` und `check:domain-paths` liefen ohne Fehler, ebenso alle sieben `--test`. `check:classes` meldet nur die vier Altfunde. `pnpm exec storybook build -o <scratchpad>/sb-abn0247c --quiet` lief durch, der Ordner ist gelöscht | ✓ |
| M1 (Rest) · Ein Zeichen je Quellenart im ganzen Set | `Provenance.stories.tsx`: Helfer `kind(entity, word)` und `EntityIcon` sind weg. Die Stories zeichnen mit `FactSourceKindMark`, das Wort kommt aus `fact_source_kind`. Gemessen über `.v3prov__kind svg` in 54 Stories, davon 26 mit Quellen: FactRecordView 10, FactTable 8, Provenance 9, AiBookingNotes 7, BookingReview 7, ClarificationCard `facts-*` 4, Beleg-Provenance 3, sechs mit `OpenPoints`. **Null Konflikte**, jedes Wort hat genau ein Zeichen: Beleg `receipt` (24), Bisherige Buchungen `rotate-ccw-clock` (18, darunter `provenance--note`, `--edges`, `--rows`, `--with-verdict`), Geschäftspartner `building-2` (11), Externe Prüfung `badge-check` (8), Standardwert `circle-dashed` (7), Mandant `briefcase` (7), Kontoauszug `arrow-left-right` (5), Regel `ruler` (4), Gesetz `scale` (2), Kanzlei `user-check` (1), Rückfrage `message-circle-question-mark` (1) | ✓ |
| Spec-Rest · Lage von „Offen“ | Einordnung (Z. 37) und Schnittstelle (Z. 75) sagen jetzt „gleich nach dem Satz“. Als Vorgabe steht „ganz oben“ nirgends mehr, nur noch als Rückblick in Nachtrag 12 und im Protokoll. Nachtrag 12 ist ergänzt, Nachtrag 13 beschreibt die Provenance-Stories | ✓ |
| H11 | `v3.css`: `.v3open__more` steht nach der Regel `.v3open__raw`, und der Kommentar sitzt wieder an seiner Regel | ✓ |
| H13 | In `AiBookingNotes.tsx` gibt es keine doppelte Leerzeile mehr | ✓ |
| Unverändert gebaut | `open-point`: Reihenfolge USt-IdNr. · Verwendung · Land des Lieferanten, 2 Zeilen in `.v3open__more` unter dem Widerspruch, „Vorläufig“ mit `--color-info-bg`. `in-use`: Drawer 640 px, `scrollWidth` = `clientWidth` = 640 | ✓ |
| Regression | Alle 54 Stories mit `sb-show-main`, keine Fehleranzeige, Konsole nur der bekannte 404 `vite-inject-mocker-entry.js` | ✓ |

Offen bleiben nur Hinweise, kein Mangel: H1 (Spaltenfolge des Satzes, zu
L-383), H2, H5, H6, H7, H8, H10, H12 (`ki__art` im Pattern). Abgenommen
ist der uncommittete Stand. Der Commit soll genau diese Dateien tragen,
auch `scripts/check-icons.mjs` und `patterns/Provenance.stories.tsx`.

Abgenommen von / am: fremde Abnahme (Agent), 2026-11-18, Teil A —
**abgenommen** nach Nacharbeit (Schlussprüfung) · Offene Punkte: keine
Mängel; Hinweise H1, H2, H5–H8, H10, H12
