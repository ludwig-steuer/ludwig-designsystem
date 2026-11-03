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
| `SourceDocumentVM` (Anzeige-Erweiterung) | — | neu `title?: string \| null`, bis der Spiegel es trägt (Befund **L-378**) |
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
