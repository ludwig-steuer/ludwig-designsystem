# 0244 · Ein Anzeigename je Entität (App R27)

| | |
|---|---|
| Status | Abnahme — Teil A, B und C gebaut (B nach F639 T639.3, ludwig/app `be5bfa05d`) |
| Stufe | `entities/` — journal-entry, bank-transaction, source-document, clarification; keine neue Komponente |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, der Name gehört je einer Entität des Ludwig-Datenmodells |
| Quelle | DS-Wunsch llcto 2026-11-03 (Owner 2026-11-03); App-Regel `docs/topics/web-ui.md` R27 (ludwig/app 1864bec7d), Specs F627 (Sachverhalt) und F639 (Beleg) |
| Ersetzt | DS-eigene Namensketten: `counterparty ?? title` (`JournalEntryReviewList.tsx`, Zelle und Auswahl-Label), `title ?? counterpartyName` (`BankTransactionRow.tsx`, Split-Zeile), `issuer ?? number ?? "Beleg"` (`ClarificationCard.tsx`, Kontext Belege), das lokale `documentHead` (`source-document-columns.tsx`), `counterparty ?? fileName` (`SourceDocumentRow`), „<Art> · <Gegenpart>" (`SourceDocumentDrawer`), Gegenpart · Datum · Betrag (`SourceDocumentReview`) |
| Blockiert | F627 und F639 in ludwig/app (Zeiger setzt ll-abnahme) |
| Spec von / am | Claude, 2026-11-03 |

## Ziel

Derselbe Sachverhalt heißt heute auf einer Seite zweimal verschieden: die Liste in Schritt 3 nennt
die Gegenpartei, der Einzelfall darüber den Titel, die Split-Zeile im Kontoauszug wieder den Titel
oder den Partner (Owner 2026-11-03: „das ist verwirrend"). Nach R27 hat jede Entität **einen**
Anzeigenamen aus **einer** Funktion der App. Das Set baut keine eigene Kette mehr: es zeigt, was die
App übergibt, oder ruft die gespiegelte Funktion derselben Entität (`caseTitle` → `caseDisplayTitle`,
`belegAnzeigename`, `documentHead`).

## Einordnung

- **Wiederverwenden** (§3 Regel 1): `caseTitle` (`entities/accounting-case/case-title.ts`, `@when` „A
  case has to be named") deckt den Sachverhalt; für den Beleg kommen `belegAnzeigename` und
  `documentHead` aus dem Spiegel von `source-docs/domain/beleg-name.ts` (F639 nannte sie `belegKopf`;
  die App heißt sie `documentHead`, weil ihr Sprach-Wächter F384 neue deutsche Bezeichner sperrt). Nichts Neues zu bauen — nur Aufrufer umstellen.
- **Zuschnitt:** drei Teile, weil sie verschieden schnell gehen: A Sachverhalt (jetzt), B Beleg (nach
  F639 T639.3), C Doku (jetzt).
- **Kennung bleibt Kennung:** `caseIdentifier`, `sourceDocumentIdentifier` unverändert (R27 „Kennung und
  Name sind zwei Dinge").

## Teil A · Sachverhalt

### A1 `JournalEntryReviewList` / `proposalReviewColumns`

| Feld / Stelle | vorher | nachher |
|---|---|---|
| `ProposalRow.title` | `string` | `string \| null` — der **rohe** Titel des Sachverhalts, nicht `title ?? summary` |
| `ProposalRow.caseKind` | — | neu, optional: `CaseKind \| null` — für den Rückfall „<Art>: <Gegenpart>" (nicht `kindLabel`, das ist die Satzart) |
| `ProposalRow.counterparty` | Anzeige, Titel als Ersatz | nur noch Eingang des Rückfalls — die Gegenpartei des **Sachverhalts**, nicht der Lieferant seines ersten Belegs |
| Spalte | Schlüssel `counterparty`, Kopf „Gegenpartei", Zelle `counterparty ?? title` | Schlüssel `case`, Kopf **„Sachverhalt"**, Zelle `caseTitle({ title, kind: caseKind, counterpartyName: counterparty })` |
| Auswahl-Label | `<Datum> · counterparty ?? title` | `<Datum> · caseTitle(…)` |

Breite, drei Zeilen vor dem Schnitt und `title`-Attribut bleiben (F340). Der neue Titel folgt dem
Muster „Gegenpart: Gegenstand" (F627 T627.1) — die Gegenpartei steht damit vorn im Namen; ohne Titel
nennt der Rückfall sie ebenfalls. Kein Schlüssel `counterparty` mehr in `ProposalColumn`: die App
nutzt ihn nirgends in `without`/`include` (grep 2026-11-03).

### A2 `BankTransactionRow` — Split-Zeile

`c.title ?? c.counterpartyName` → `caseTitle(c)` (`CaseAssignment` ist ein `CaseLink`).

### A3 `ClarificationCard` — Kontext „Sachverhalt"

`EvidenceCase.title` trägt den **Anzeigenamen**, den die App mit `caseDisplayTitle` gebaut hat; das Set
leitet nichts ab und zeigt `<Nummer> · <Name>` wie bisher. Nur der JSDoc sagt das.

## Teil B · Beleg

Der Spiegel `src/ludwig/modules/source-docs/domain/beleg-name.ts` ist byte-gleich mit ludwig/app
`be5bfa05d`: `BelegNameFelder.title`, `belegAnzeigename` mit Titel zuerst, `documentHead` (Titel →
Gegenpart → Form → Datei → „Beleg ohne Kennzeichen").

| Stelle | vorher | nachher |
|---|---|---|
| `SourceDocumentVM` (Anzeige-Erweiterung) | — | neu `title?: string \| null`, bis der Spiegel es trägt (Befund **L-378**) — seit 2026-11-04 im Spiegel (App `c1f030fc5`), die Erweiterung ist gestrichen |
| `documentNameFields(d)` (`SourceDocument.tsx`, nicht im Barrel) | — | die **eine** Abbildung des Datensatzes auf `BelegNameFelder`: `title`, `counterparty` als `businessPartnerName` (die App liefert ihn aufgelöst), Brutto und Währung nur einer Rechnung (`detail.kind === "invoice"`, wie die App), Form, Belegdatum, Datei |
| `documentHeadOf(d)` (`SourceDocument.tsx`, nicht im Barrel) | lokales `documentHead` in `source-document-columns.tsx` | `documentHead(documentNameFields(d))`; eigen ist nur, ob der Kopf auf die Datei fiel (Datei wird in der Mitte gekürzt, mono in der Spalte) |
| Spalte „Beleg" (`sourceDocumentColumns`) | Gegenpart → Form → Datei | `documentHeadOf` |
| Führung von `SourceDocumentRow` | Gegenpart → Datei | `documentHeadOf`; die Art darunter entfällt, wenn der Kopf schon die Art ist (Form ohne Gegenpart) |
| `SourceDocumentDrawer` Titel | „<Art> · <Gegenpart>" | `belegAnzeigename` (offener Schritt aus 0212) |
| `SourceDocumentReview` Themenzeile | Gegenpart · Datum · Betrag, ohne alles keine Zeile | `belegAnzeigename` — nie leer, die Zeile steht immer |
| `EvidenceDocument` (`ClarificationCard`) | `issuer`, Anzeige `issuer ?? number ?? "Beleg"` | `issuer` entfällt, neu **`name: string`** (Pflicht), den die App mit `documentHead` füllt; Tabelle: Spaltenkopf „Beleg" statt „Aussteller"; Liste im Schritt: `name`, darunter Datum · Belegnummer · Betrag |

**Bewusst nicht:** Der Kopf des Originals in `SourceDocumentCard` (`SourceDocumentPreview title`)
bleibt die **Art** („Rechnung"). Im Drawer und auf der Belegseite steht der Name schon im Kopf darüber;
ein zweites Mal wäre die doppelte Titelzeile, die die Card-Doku ausschließt, und die Art ginge
verloren. `SourceDocumentCell` (Kennung, darunter Art · Gegenpart) bleibt: es ist die Erwähnung mit
Kennung, kein Name — offen für F640.

## Teil C · Doku

Jedes Profil in `docs/entitaeten/` (ohne Erhebungen) bekommt im Kopf die Zeile **„Anzeigename"**:
Wert aus der R27-Tabelle, die Funktion (App und Set) und der Stand (F627/F639/F640). Entitäten, die R27
nicht führt, sagen das; die Vorlage `TEMPLATE.md` bekommt die Zeile ebenfalls.

## Stories

- `JournalEntryReviewList`: die 40 Zeilen tragen kurze Titel „Gegenpart: Gegenstand"; jede fünfte
  ohne Titel (Rückfall „<Art>: <Gegenpart>"), Zeile 8 ohne Titel und ohne Gegenpart (nur die Art).
  Alle Daten fiktiv.
- `BankTransactionRow`: in der Story `Expanded` ein Sachverhalt ohne Titel (Rückfall).
- `SourceDocumentRow`: in `Kinds` ein Beleg ohne Rechnungsauslese mit Titel (`b10`) — der Titel führt.
- `ClarificationCard`: die Belege der Fixtures tragen `name` statt `issuer`.
- Keine neuen Stories: die Zustände (gefüllt, leer, leer nach Filter, lädt, Fehler) haben beide schon.

## Abnahme

### Fest

- `pnpm typecheck`, `pnpm check:when|language|type|contrast|icons|classes` grün (classes: nur die vier bekannten Altlasten).
- Storybook-Build ohne Fehler.
- Kein Deutsch im Quellcode außer Nutzer-Strings; keine Echtdaten.

### Variabel

| # | Kriterium | Prüfung |
|---|---|---|
| A1.1 | Spalte heißt „Sachverhalt", Zelle zeigt `caseTitle`: mit Titel den Titel, ohne „<Art>: <Gegenpart>", ohne beides die Art | Story `Flat` (Zeilen 1, 5, 8) |
| A1.2 | Auswahl-Label ist `<Datum> · <Name>` mit demselben Namen wie die Zelle | Story mit Auswahl, Accessible Name der Checkbox |
| A1.3 | Keine eigene Kette mehr | `grep -rnE "counterparty(Name)? \?\? [a-z.]*title\|title \?\? [a-z.]*(counterparty\|summary)" src/ui src/showcase \| grep -v "^.*: *\*"` → leer (JSDoc-Zeilen ausgenommen) |
| A1.4 | Breite und Umbruch unverändert: Spalte `minmax(120px, 1.4fr)`, höchstens drei Zeilen | Browser, 1280 px |
| A2 | Split-Zeile nennt den Sachverhalt wie `CaseCell` daneben | Story `BankTransactionRow` mit Split |
| A3 | `EvidenceCase.title` als Anzeigename dokumentiert, Darstellung unverändert | Code-Blick |
| C | Jedes Profil hat die Zeile „Anzeigename"; Regel, Kette, Funktion und Stand nach R27, Beispiele nur als Muster (keine Echtdaten) | `grep -c "^| Anzeigename" docs/entitaeten/*.md` |
| B1 | Spiegel byte-gleich mit ludwig/app `be5bfa05d` | `git -C ../app show be5bfa05d:apps/web/src/modules/source-docs/domain/beleg-name.ts \| diff - src/ludwig/modules/source-docs/domain/beleg-name.ts` → leer |
| B2 | Kein lokales `documentHead`, kein Feld `issuer` mehr im Set | `grep -rnw "issuer" src/ui/v3/entities/clarification/ClarificationCard.tsx` und `grep -rn "function documentHead(" src/ui` → leer |
| B3 | Spalte und Zeile führen mit dem Titel, wo er gesetzt ist, sonst wie vorher | Story `SourceDocumentRow/Kinds` (`b10`), Spalte in einer `sourceDocumentColumns`-Story |
| B4 | Drawer-Titel und Themenzeile der Prüfung = `belegAnzeigename` | Stories `SourceDocumentDrawer/Opened`, `SourceDocumentReview` |
| B5 | Kontext „Belege": Spalte „Beleg" mit `name`, im Schritt `name` und darunter Datum · Nummer · Betrag | Stories der `ClarificationCard` (Karte und `Step`) |
| B6 | Kopf des Originals bleibt die Art | Story `SourceDocumentCard` |

## Offene Fragen

1. **Spaltenkopf „Sachverhalt" statt „Gegenpartei".** Die Zelle nennt den Sachverhalt, nicht mehr die
   Gegenpartei. Ohne Antwort: „Sachverhalt" (Wort aus dem GLOSSARY, kein neues).
2. **`EvidenceDocument.name` Pflicht oder optional?** Gebaut: Pflicht, `issuer` entfällt. Die App
   füllt es im selben Zeigerhub (F639 T639.4); ein Rückfall im Set wäre wieder eine eigene Kette.
3. **Kopf des Originals in der Card.** Gebaut: bleibt die Art (siehe „Bewusst nicht"). Wenn llcto
   den Namen dort will: eine Zeile in `SourceDocumentCard`.

## Ausbau

Die übrigen Entitäten (Bankumsatz, Buchungssatz, Geschäftspartner, Zahlungskonto, Stapel, Lauf, Korb,
Mandant, Regel) bekommen ihre Funktion mit F640; das Set stellt dann ihre Aufrufer auf die gespiegelte
Funktion um. Schon bekannt: die Zahlung im Kontext der `ClarificationCard` (`counterparty ?? purpose ??
"Zahlung"`) und `SourceDocumentCell`. Auslöser: F640-Commit in ludwig/app.

## Abnahme 2026-11-03 (fremder Agent) und Nacharbeit

Erste Runde **nicht abgenommen**: M1–M3, Hinweise H1–H11. Behoben:

| # | Befund | behoben |
|---|---|---|
| M1 | Kopf der Belegzeile ohne Ellipse mitten im Wort gekappt: `.v2doc__key > *:not(.v2doc__keyname)` hielt den Zeilenlink auf Inhaltsbreite | `.v2doc__lead .v2rowlink { flex-shrink: 1 }`; der Zeichenschnitt bei 36 entfällt für den Kopf, die CSS-Ellipse steht am Zellrand |
| M2 | Beispiel im Profil nicht wörtlich nach R27 | **abweichend gelöst:** die R27-Beispiele stammen aus echten Belegen (F639 #296) — im öffentlichen Repo steht nur das Muster („Aussteller: Gegenstand Zeitraum", „Gegenpart: Gegenstand") |
| M3 | Drawer-Rahmen der Story `SourceDocumentCard/Bare` mit alter Kette | `belegAnzeigename(documentNameFields(INVOICE))` |
| H1 | `ProposalRow.kind` doppelt belegt (Satzart) | `caseKind` |
| H3 | `Clarification.caseTitle` ohne R27-Satz | JSDoc |
| H4 | weitere eigene Ketten | `SourceDocumentView`-Story und Showcase `DocumentPage` → `belegAnzeigename`; `CaseCrud`-Story → `caseTitle`. Bleibt: Altspalte `counterparty` in `sourceDocumentColumns` (nur `DOCUMENT_LIST_COLUMNS`/`STUCK_COLUMNS`, App nutzt sie nicht) |
| H5 | Vertragsbetrag im Namen, die App nimmt nur das Rechnungsbrutto | `documentNameFields` nimmt `gross` nur aus `detail.kind === "invoice"` |
| H6 | `counterparty` muss die des Sachverhalts sein | JSDoc |
| H7 | Kommentar „issuer", Prüfbefehle, Story-Name | nachgezogen |
| H8 | Profil Regel nicht wörtlich; Nachträge in 0164, 0074, 0212 | gestrichen bzw. Nachträge mit Datum |
| H9 | Story-Titel aus echtem Beleg abgeleitet | fiktiver Titel „Musterverband: Mitgliedsbeiträge und Umlagen Q4/2025" |
| H10 | doppelte Leerzeile | entfernt |

Offen, an llcto: **H2** — die Spalte „Sachverhalt" (120 px, drei Zeilen) fasst etwa 40 Zeichen, ein
60-Zeichen-Titel steht gekürzt (Rest im `title`); alte Titel ohne Muster verlieren die Gegenpartei.
Default: so lassen, bis llcto Breite, Unterzeile oder Backfill-Kriterium entscheidet. **H11** (nicht
aus 0244): `BankTransactionRow/Expanded` ist bei 1280 px 1400 px breit.

Dazu: `scripts/sync-ludwig.sh` holt `core/accounting/case-display-title.ts` mit (F627 verlegt
`caseDisplayTitle` dorthin, Hinweis ll-abnahme 2026-11-03).

**Nachprüfung 2026-11-03: abgenommen mit Hinweisen.** Nachgezogen: Reisekosten-Fixture mit Form
(`DocumentOtherKinds`, sonst hieß der Beleg nur „14.08.2026" — Befund L-379), Spalte „Beleg" mit Titel
im Showcase `DocumentRow` (`r6`), Kriterium C und B2 präzisiert, Datenpunkt im Profil Sachverhalt datiert.
Der Spiegel `beleg-name.ts` trägt das R27-Beispiel wörtlich (byte-gleich); es nennt eine Plattform, keinen
Mandanten.

## Nachtrag 2026-11-03 (llcto): Breite der Spalte „Sachverhalt"

**Wunsch:** 60 Zeichen (R27) in höchstens drei Zeilen. Gemessen bei 13,5 px: 160 px → vier Zeilen,
**180 px → drei**; kompakt (12,5 px) reichen 170 px.

**Konflikt:** Eine Untergrenze von 180 px hätte die App-Konfiguration von Schritt 3 (`full`,
`accountNames={false}`, gruppiert `without={["kind"]}`) bei 1084 px Tabellenbreite (1440 px mit
Sidebar) um rund 40 px über die Karte geschoben — genau der Owner-Befund vom 2026-10-27 („Aktionen"
ragte hinaus). Der Owner-Befund geht vor (llcto). Die Untergrenze bleibt 120 px.

**Gebaut: Gewicht 2 statt 1,4, wo Soll/Haben nur die Nummer tragen** — `accountNames ? "minmax(120px,
1.4fr)" : "minmax(120px, 2fr)"`. Zuerst gebaut und
abgenommen war Variante C (`minmax(120px, 180px)`, „wächst bis 180"); die Abnahme fand zwei Preise:
bei 1084 px teilte sie den Platz mit „Prüfgrund" (168 → 159 px, drei Badges mehr gekürzt), und ab etwa
1564 px blieb der Name bei 180 px stehen, während Soll/Haben mit nur der Kontonummer 260–420 px breit
wurden (Zeilen 67 → 88 px). Das Gewicht holt sich den Platz aus den Spuren Soll/Haben statt aus
„Prüfgrund" und hat keine Obergrenze; „Prüfgrund" wächst weiter zuerst bis 200 px, dann teilen sich die
fr-Spuren den Rest 2 : 1 : 1. **Mit Kontonamen** (`accountNames`, Standard bei `full`; App-Reiter „Zum
Schließen", `CloseCasesPanel.tsx`) bleibt es bei 1,4: Dort nahm 2fr den Platz aus den Namensspalten
(1440 px: 129 → 110 px, Zeilen zusammen +20 %, gekürzte Kontonamen 0 → 5), ohne dem Namen zu helfen —
bei 219 wie bei 180 px drei Zeilen (zweite Nachprüfung, M1).

Gemessen in der App-Konfiguration (Story `Grouped`, umgestellt auf `accountNames={false}`,
`without={["kind"]}`):

| Tabellenbreite | vorher 1,4fr | C (bis 180) | **2fr** |
|---|---|---|---|
| 1084 px | Sachverhalt 120 · Prüfgrund 168 · 6/40 Namen, 5/29 Badges gekürzt | 129 · 159 · 5/40, 8/29 | **120 · 168 · 6/40, 5/29** (= vorher) |
| 1246 px | 159 · 200 · 4/40, 0/29 | 180 · 200 · 0/40, 0/29 | **193 · 200 · 0/40, 0/29** |
| 1564 px | 290, Zeilen ≤ 67 px | 180, Zeilen bis 88 px | **352, Zeilen ≤ 67 px** |
| 1886 px | 422, Zeilen ≤ 62 px | 180, Zeilen bis 88 px | **513, Zeilen ≤ 62 px** |

Querscroll in keiner Variante; die Mindestbreite (`--v2-min` 1066 px) ändert sich nicht.

| # | Kriterium | Prüfung |
|---|---|---|
| N1 | Bei 1084 px Tabellenbreite ist alles wie vorher: Spuren, Querscroll, gekürzte Namen und Badges | App-Konfiguration und Stories `Flat`/`Grouped` bei Fenster 1118 |
| N2 | In der App-Konfiguration ab 1246 px Tabellenbreite ≥ 180 px, kein Name gekürzt | App-Konfiguration bei Fenster 1280 |
| N3 | Bei 1280 px in den Stories kein Querscroll und kein Badge in „Prüfgrund" gekürzt („Prüfgrund" 200 px) | `Flat` 138 px Sachverhalt (ohne Kontonamen, 2fr), `Grouped` 120 px (mit Kontonamen, 1,4fr) |
| N4 | Auf breiten Fenstern wächst die Spalte weiter, Zeilen werden nicht höher als vorher | 1920: `Flat` 458 px; App-Konfiguration Zeilen ≤ 62 px |
| N5 | Mit Kontonamen (`Grouped`) sind Spuren und Zeilenhöhen wie vor 0244 | `Grouped` bei 1280, 1440, 1598 px gegen `minmax(120px, 1.4fr)` |

**Abnahme des Nachtrags 2026-11-03 (fremder Agent, drei Runden): abgenommen.** Runde 1 fand an C den Preis
in „Prüfgrund" und auf breiten Fenstern (→ 2fr), Runde 2 an 2fr den Preis bei angezeigten Kontonamen
(→ 1,4fr mit Namen), Runde 3 bestätigt N1–N5.

