# 0247 · FactRecordView: worauf eine Buchung beruht, in der Leiste der Abnahme

| | |
|---|---|
| Status | spec — Teil A baubar nach 0246 S2; Teil B wartet auf die Owner-Durchsicht des Ablaufs (Plan Booking v3, Punkte 12 und 13) |
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
  - `StatusBadge`: wer entschieden hat (Achse `journal_entry_origin_method`, F681) und wer am Zug ist (`case_disposition`).
  - `OpenPoints`: die offenen Punkte ganz oben. Den Grund liefert die Achse `fact_open_point_reason`. Den Ton gibt `blocksHandover`: `error` nur bei Sperre der Übergabe, sonst `info` (Owner 2026-09-30: offen ist Hinweis).
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
| `view.openPoints` | Liste mit `id`, `detail` | ja | `OpenPoints` ganz oben, Titel „Offen“, Schlüssel `id`. Je Punkt: Bezeichnung des Fakts, `detail` als Satz darunter, Grund (Achse), wer am Zug ist (`case_disposition`). Bei `contradictory` darunter eine `FactTable` mit je einer Zeile je `evidence`-Eintrag und dessen `value` (ohne `value`: „—“) | `OpenPoint` |
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
- **Wer am Zug ist:** `StatusBadge` der Achse `case_disposition` (Ludwig · Kanzlei · Mandant). `server` und `agent` erscheinen als Ludwig.
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
| `Provisional` | Hinweis „Vorläufig gebucht“ unter dem Satz, der offene Punkt darüber |
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
- [ ] Herkunft aus `journal_entry_origin_method`, wer am Zug aus `case_disposition`, Grund aus `fact_open_point_reason`, alles über `StatusBadge` und Registry (`OpenPoint`, `ByHand`)
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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …
