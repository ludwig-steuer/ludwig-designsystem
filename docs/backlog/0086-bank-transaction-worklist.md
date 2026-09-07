# 0086 · BankTransactionWorklist — offene Zahlungen zuordnen

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/bank-transaction/` |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md`, Abschnitt „Listen" (Zeile `BankTransactionWorklist`) |
| Auftrag | Die Arbeitsliste der Zahlungen **eines Kontos** ohne Sachverhalt (die Seite gruppiert mehrere Konten untereinander), mit Mehrfachauswahl und zwei Sammelaktionen: neuen Sachverhalt anlegen oder einem bestehenden zuordnen. Ersetzt `modules/bank-transactions/ui/BankTransactionAssignmentTable.tsx` (658 Z.). |
| Job | Wenn **Zahlungen ohne Vorgang liegen**, will **die Sachbearbeiterin** **sie in einem Zug einem neuen oder bestehenden Sachverhalt zuordnen**, damit **sie nicht Konto für Konto durchgeht**. |
| Warum eigene Komponente | Sie unterscheidet sich von der Auszugsliste (0085) in **drei** der fünf Merkmale aus `entitaet-analysieren` §8: **Spaltensatz**, **Filter** und **Massenaktion**. Zwei genügen. Die Grundgesamtheit zählt ausdrücklich **nicht** mit — der Prüflauf des Profils hat „kontoübergreifend“ verworfen: beide Listen zeigen ein Konto. |
| Umfang | 65 % aller Positionen haben kein Ereignis (Staging 2026-09-05, 1281 Zeilen) |
| Vertagt, weil | sie an `CasePicker` (0084) hängt — heute ist die Auswahl des Ziel-Sachverhalts ein `<select>` über alle Fälle — und an einer Sammelaktion, die es serverseitig nur je Zeile gibt (Befund L-16). |
| Setzt voraus | `BankTransactionRow` (erste Welle) · `CasePicker` (0084) · `DataTable` mit `SelectionBar` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

## Spec 2026-09-07 (Skill `spec-schreiben`), gebaut in derselben Sitzung

### Die Wartebedingung, zur Hälfte aufgelöst

Die Spec wartete auf `CasePicker` (0084) — und 0084 ist von dieser Freigabe
ausdrücklich **ausgenommen**. Gebaut wird trotzdem, weil die Auswahl des
Ziel-Sachverhalts gar nicht der Liste gehört: sie **bietet** die zwei
Sammelaktionen an und übergibt die Schlüssel; **welcher** Fall es wird,
entscheidet der Aufrufer. Eine Liste, die selbst einen Picker öffnete,
entschiede etwas, das nicht ihres ist. Damit ist `bulkActions` die
Schnittstelle zu 0084, ohne 0084 zu kennen — und ohne es anzufassen.

Die zweite Wartebedingung bleibt offen und ist ein Befund, kein Baustopp:
serverseitig gibt es die Zuordnung nur je Zeile (**L-16**).

### Einordnung

- **Warum eigene Komponente:** drei der fünf Merkmale aus §8 gehen auseinander
  (Spaltensatz, Filter, Massenaktion); zwei genügen. **Nicht** die
  Grundgesamtheit — beide Listen zeigen ein Konto (Prüflauf des Profils).
- **Zuschnitt:** eine Datei, ein Export, 139 Zeilen — `DataTable` mit
  `selection`, dem kurzen Spaltensatz und dem Erfolgs-Leerfall.
- **Setzt auf:** `DataTable` (0057), `bankTransactionColumns` (0101),
  `BulkAction` (`primitives/Selection`).

### Fünf Spalten statt sieben

`WORKLIST_COLUMNS = postingDate · counterparty · purpose · cases · amount` —
die Ränge 1–4 und 6 des Profils. Weggelassen ist **nur** die DATEV-Historie:
sie beantwortet eine andere Frage (steht die Zeile in der Historie?) als die,
für die diese Liste da ist (wem gehört sie?). Wer sie doch braucht, erweitert
den Satz über `columns` — die Reihenfolge bleibt dieselbe, weil `columns`
auswählt und nie umordnet (Story `WithMatchStage`, verwürfelt übergeben).

Die **Sachverhalts-Spalte** stand im ersten Bau nicht drin, mit dem Argument,
in dieser Grundgesamtheit sei jede Zeile ohne Sachverhalt. Das Argument trägt
nicht: es gilt nur für reines Z0, und der zweite Aufrufer sieht alle Zeilen.
Selbst im ersten ist die Spalte der Ort, an dem die Zuordnung erscheint,
**sobald sie passiert** — und der Platz für den Vorschlags-Knopf „→ Beleg Nr."
aus dem Profil.

### Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transactions` | `BankTransactionRowData[]` | ja | Die offenen Zahlungen **eines** Kontos | `Filled` |
| `caseHref` | `(caseId) => string` | ja | Durchgereicht an den Katalog | `Filled` |
| `bulkActions` | `BulkAction[]` | ja | „Neuen Sachverhalt anlegen" und „Bestehendem zuordnen" | `Filled` |
| `rowActions` | wie `DataTable` | nein | Einzelaktionen je Zeile | — (durchgereicht, von `DataTable` bewiesen) |
| `rowHref` | `(t) => string` | nein | Der Weg in den Drawer einer Zahlung (0103); der Link sitzt auf der Gegenpartei | `AllOfAnAccount` |
| `openHref` | `string` | nein | Wohin „offen" in der Sachverhalts-Spalte führt | `Filled` |
| `listHref`, `sort`, `pager` | wie `DataTable` | nein | **Der zweite Aufrufer**: die Konfigurationsseite listet alle 500 Zahlungen eines Kontos | `AllOfAnAccount` |
| `columns` | `BankTransactionColumn[]` | nein | Erweitert den kurzen Satz | `WithMatchStage` |
| `loading`, `error` | wie `DataTable` | nein | Durchgereicht | `LoadingAndError` |
| `head` | `{ title, sub?, actions? }` | ja | Kopf der Karte: Konto und Zahl der Offenen | alle |
| `minWidth` | `number` | nein | Voreinstellung **1100** — die Sachverhalts-Spalte kam dazu | `Filled` bei 1100 px |
| `total` | `number` | nein | Wie viele Zahlungen das Konto insgesamt hat; **nur** der Leerfall liest sie | `Empty` |

**Kann bewusst nicht:**

- **Den Ziel-Sachverhalt wählen.** Sie übergibt die Schlüssel; die Wahl ist
  der Picker des Aufrufers (0084).
- **Nach Konto gruppieren.** Das ist die Seite — sie weiß, welche Konten es
  gibt; die Liste weiß nur ihres (Story `InUse`: zwei Listen untereinander).
- **Filtern und suchen.** Kein Filter, keine Suche — das ist der zweite der
  drei §8-Unterschiede zu 0085 und gehört, wo es einen gibt, der Seite.
- **Leer nach Filter.** Sie hat keinen Filter — der einzige Leerfall ist der
  Erfolg.

### Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionWorklist`. Abgeleitet
nach §6: 3 anwendbare Zustände (gefüllt · leer · lädt/Fehler; „leer nach
Filter" ist begründet ausgeschlossen — die Liste hat keinen Filter) + 1 Enum
(`columns`) + 1 „im Einsatz" + 1 zweiter Aufrufer = **6**. Der Callback der
Sammelaktion bekommt **keine** eigene Story: sein Rundlauf steht in `Filled`,
wo die Auswahl ohnehin gezeigt wird.

| Story | Beweist |
|---|---|
| `Filled` | Auswahl, zwei Sammelaktionen im Rundlauf, Taste am Knopf |
| `WithMatchStage` | `columns` erweitert den Satz, ohne die Reihenfolge zu ändern |
| `Empty` | Nichts offen ist ein **Erfolg** — mit Haken |
| `LoadingAndError` | Kopf bleibt stehen; der Fehler nennt Ursache und Schritt |
| `InUse` | Zwei Konten untereinander — das Gruppieren gehört der Seite |
| `AllOfAnAccount` | Der zweite Aufrufer: alle 500 Zahlungen eines Kontos, mit Pager, Sortierung und gefüllter Sachverhalts-Spalte |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 · im
Browser angesehen.

Variabel:

- [ ] Kopf und Zeilen enden bei 900/1100/1440 px an derselben Kante (gemessen)
- [ ] Der Satz trägt die Ränge 1–4 und 6 des Profils und **keine** DATEV-Spalte (Story `Filled`, gemessen)
- [ ] Sortierung und Pager sind durchgereicht, damit der zweite Aufrufer sie hat (Story `AllOfAnAccount`)
- [ ] `columns` erweitert, ohne umzuordnen (Story `WithMatchStage`, gemessen)
- [ ] Jedes Kästchen sagt, **welche** Zeile es wählt, mit absolutem Datum (gemessen: „Stadtwerke Musterstadt vom 26.08.2026 auswählen")
- [ ] Im Leerfall ist das Kopf-Kästchen stillgelegt (gemessen: `disabled === true`)
- [ ] Der Leerfall trägt den Haken **und die Zahl** — im Satz, nicht nur im Kartenkopf (Story `Empty`)
- [ ] Die Fehlerzeile trägt einen Weg zurück, nicht nur einen Satz (Story `LoadingAndError`, gemessen: ein Knopf)
- [ ] Die Komponente kennt keinen `CasePicker` — **kein Import und keine
      Nutzung** (`grep -E 'from .*CasePicker|<CasePicker'`: 0 Treffer). Der
      Fließtext, der erklärt *warum* sie keinen öffnet, zählt nicht: er ist
      die Begründung, auf die sich diese Spec selbst beruft (berichtigt
      2026-09-07 auf Vorschlag der Wiederabnahme)
- [ ] Keine Konsolenmeldung in allen sechs Stories (gemessen)
- [ ] offen (App): ersetzt `BankTransactionAssignmentTable.tsx` (658 Z.), sobald L-16 steht

### Beim Bauen gemessen

Die Auswahl-Beschriftung stand zuerst auf dem ISO-Datum (`2026-08-26`). Ein
Kästchen, das seine Zeile nennt, muss sie so nennen, wie die Zeile sich selbst
nennt (T7) — jetzt über `formatTime(…, "date", "medium")`.

**Das Kopf-Kästchen war im Leerfall klickbar** und wählte nichts. Behoben in
`SelectAllCell` (0057, `disabled` bei leerer Ordnung); der Fund gehört jeder
Liste mit Auswahl, nicht nur dieser.

## Nach der Abnahme vom 2026-09-07

Die Abnahme kam **zurück** — an der Freigaberegel dieser Aufgabe: „freigegeben,
wenn Spec und Profil übereinstimmen". Sie tat es an vier Stellen nicht. Die
Messtechnik hielt: drei Messbehauptungen wurden unabhängig nachgerechnet und
bestätigt (169 px, 150 px, 39 px Kopfüberstand), eine Zahl war falsch — und
zwar zu meinen Ungunsten, nicht zu meinen Gunsten.

### Die Rechnung war falsch, der Schluss richtig (M10)

„Zweimal 35 Polster" stimmt nicht: die Karte hat `padding: 12px 18px`, also
**36 px**. Richtig ist 1060 fest + 70 Rinnen + 36 Polster = **1166 px**; dem
Verwendungszweck blieben bei `minWidth` 1250 also **84 px**, nicht 50, und bei
1400 bekommt er **234 px**, nicht 200. Der Kopf „Verwendungszweck" misst
123 px — der Überstand von 39 px stimmt damit exakt. Spec und JSDoc tragen
jetzt die gemessenen Zahlen. Derselbe falsche Wert stand in
`sourceDocumentMinWidth()` (0070) und ist dort mitkorrigiert.

### Rang 6 kommt zurück in die Arbeitsliste (M2)

Das Profil verlangt für 0086 „Auswahl · 1 · 2 · 3 · 4 · **6**"; gebaut waren
vier Spalten. Meine Begründung — „die Sachverhalts-Spalte sagte in jeder Zeile
dasselbe" — trägt nur, solange die Grundgesamtheit reines Z0 ist. Sie ist es
nicht (siehe M3), und selbst im ersten Aufrufer ist die Spalte der Ort, an dem
die Zuordnung **erscheint, sobald sie passiert**. Das Profil hatte recht.

### Die Liste trägt beide Aufrufer (M3)

Das Profil nennt eine zweite Route: die Konfigurationsseite eines Bankkontos
listet *jede* Zahlung, 500 auf einmal, und schreibt „0086 muss beide Aufrufer
tragen". Die Spec hatte das Gegenteil unter „Kann bewusst nicht" stehen.
Jetzt reicht die Liste `sort`, `pager` und `listHref` durch — 500 Zeilen ohne
Pager sind keine Liste, sondern eine Abschneidung. Story `AllOfAnAccount`.

### Die Zeile hat einen Weg ins Detail (M5)

Das Seitenprofil nennt „eine Zahlung nachschlagen, ohne die Liste zu
verlassen" **oft** und gibt ihm einen Klick; die Liste gab ihn nicht — gemessen
`cursor: auto`, kein `.v2rowlink`. Jetzt `rowHref`, durchgereicht an
`DataTable`, das die Mechanik längst hat. `rowHref` und `expand` schließen
einander aus — das ist die Regel von `DataTable`, nicht unsere: eine Zeile, die
aufklappt, springt nicht auch noch. Story `RowLink`, gemessen: 5 Zeilenlinks,
**0** verschachtelte Anker.

### „kontoübergreifend" war der falsche §8-Beleg (M1)

Der Prüflauf des Entitätsprofils hat das Wort ausdrücklich verworfen: beide
Listen zeigen **ein** Konto. Die drei Unterschiede nach §8 sind
**Spaltensatz · Filter · Massenaktion**. Spec-Prosa und JSDoc sagen das jetzt.

### Der Rest

- **M4** — der Leerfall des Kontoauszugs trägt bewusst keinen Haken
  („weder Erfolg noch Lücke"); das Entitätsprofil sagte weiter „Erfolg". Es
  bekommt eine Prüflauf-Zeile, der Code bleibt.
- **M6** — die Fehlerzeile nannte Ursache, aber keinen nächsten Schritt.
  `retry` war in der Schnittstelle und wurde in keiner Story gesetzt. Jetzt in
  beiden, gemessen: ein Knopf „Erneut laden".
- **M7** — „nichts mehr offen" trägt jetzt die Zahl („0 von 251 offen").
- **M8** — die Story-Ableitung rechnete 3+1+1+1 = 5 und meinte 6 Posten: der
  Rundlauf der Sammelaktion teilt sich die Story mit `Filled`. Steht jetzt so
  da. (Mit der neuen Story `AllOfAnAccount` sind es 6.)
- **M9** — drei deutsche Kommentare im Komponenten-Code sind englisch.
- **M11** — `WithMatchStage` übergab die Spalten bereits in der richtigen
  Reihenfolge und bewies damit nichts. Jetzt verwürfelt; gemessen kommt
  „Datum · Gegenpartei · Verwendungszweck · DATEV-Historie · Betrag" zurück.
- **M12** — doppelte Anführungszeichen im Leerfall nach Filter.
- **M13** — die Story-Daten stiegen, während der Kopf „absteigend" sagte.
- **M14** — die zwei Befunde des Seitenprofils stehen jetzt im Register
  (L-84, L-85).

### Was gemessen bleibt

Kopf und Zeilen an derselben Kante bei 1100/1280/1440/1680/1920 px,
Zellüberlauf 0 — auch in `Extremes` und mit der zurückgeholten
Sachverhalts-Spalte. 15 Stories, keine Konsolenmeldung.

## Dritte Runde, 2026-09-07 — die Breite war da, das Polster nicht

Die Nachabnahme hat die 14 Mängel bestätigt und **zwei Dinge gefunden, die
der eigene Fix aufgemacht hat** — beide in jeder Liste des Sets, beide eine
CSS-Zeile, beide in Zuständen, die §9 als feste Kriterien verlangt:

- **Die Sonderzeile hatte ihre Breite bekommen, aber nicht ihr Polster.**
  Derselbe Reset aus 0106 (`.v2tbl th, .v2tbl td { padding: 0 }`, Spezifität
  0-1-1) schlägt `.v2tbl__empty`, `__error`, `__group` und `__detail` (0-1-0).
  Gemessen begann der Text bei **x = 0**, während jede andere Zelle bei 18
  anfängt — und der Fehlerkasten verlor zusätzlich seine Spaltenrichtung:
  Meldung und „Erneut laden" standen nebeneinander in einem 35-px-Band an der
  Kartenkante. Die vier Klassen stehen jetzt noch einmal auf der Spezifität
  des Resets. Gemessen: `24px 18px`, `display: flex`, Höhe 111 px.
- **Das Ladegerüst war unsichtbar.** `.v2skel` ist ein `<span>` ohne
  `display`-Regel, also `inline` — und dort wirken weder `height: 11px` noch
  die inline gesetzte Breite. Gemessen **40 Spans à 0 × 0 px**; der Ladefall
  zeigte fünf leere Zeilen. Eine Zeile `display: block`. Gemessen: 70 × 11,
  81 × 11, an derselben Kante wie die Zellen darüber.

**Der Zeilenlink hieß „30.08.2026" (N4).** `DataTable` legt `.v2rowlink`
blind auf Zelle 0, und die ist hier das Datum — ein Fokus-Stopp, der nicht
sagt, wohin er führt, und I11 verbietet ausdrücklich, das mit einem
`aria-label` zu heilen. Beide Schwester-Kataloge machen es anders
(`sourceDocumentColumns` führt mit dem Gegenpart, `caseColumns` mit dem
Fallnamen). Der Link geht deshalb jetzt durch `bankTransactionColumns` und
sitzt auf der **Gegenpartei**; wo der Name fehlt (3 %), nimmt er den Zweck —
über `derivePurposeParts`, nicht über einen zweiten Parser. Gemessen: fünf
Links auf Spalte 1, benannt „Handwerk Schulz KG", „Kontoführungsentgelt
August 20…", 0 verschachtelte Anker.

**Die falsche Zurechnung (N5) ist berichtigt:** dass `rowHref` und `expand`
einander ausschließen, ist die Regel **dieser Liste**, nicht die von
`DataTable` — das legt den Link auf Zelle 0 und geht danach trotzdem in den
Aufklapp-Zweig. Stünde es falsch da, verließe sich die nächste Liste darauf.

**N3** — `rowHref` von 0086 war gebaut und von keiner Story berührt; der
Nachweis in der Schnittstelle zeigte auf `AllOfAnAccount`, die es nicht
setzte. Jetzt setzt sie es: die Konfigurationsseite ist genau die, die Zeilen
nachschlägt. Dazu **N6** (Voreinstellung 1100 statt 900), **N7** (die
Kriterienzeilen zählen 9 und 6 Stories statt 8 und 5), **N8** (Zeilenzahlen),
**N9** (die Zahl steht jetzt im Leersatz, nicht nur im Kartenkopf).

**Die Lehre:** ein Fix, der eine Regel wiederherstellt, stellt die Nachbarregel
nicht mit her. `colSpan` gab der Zelle die Breite zurück — das Polster, die
Spaltenrichtung und das Ladegerüst hingen an derselben Umstellung und sind
erst aufgefallen, weil die Zelle breit genug wurde, dass man ihren linken Rand
sehen konnte.

## Wiederabnahme, 2026-09-07 — beide Nacharbeiten halten, der Ladefall nicht

Geprüft wurden Kriterien-Tabelle und jeder Abschnitt danach, gegen den
Dev-Server (Port 6107), ohne Blick in den Bau. **Ergebnis: zurück** — nicht
wegen der Nacharbeit, sondern wegen dessen, was sie sichtbar gemacht hat.

### Die zwei Nacharbeiten sind nachgerechnet und halten

Die Sonderzelle hat ihr Polster zurück, gemessen an der Klasse selbst:
`.v2tbl__empty` `30px 18px`, `.v2tbl__group` `7px 18px`, `.v2tbl__detail`
`14px 18px 16px 46px`, `.v2tbl__error` `24px 18px` — Text jeweils bei
**x = 18** relativ zur Zelle, wie jede andere. Der Fehlerkasten steht auf
`display: flex` / `column` / `align-items: flex-start`, **Höhe 110,9 px**,
`Erneut laden` unter der Meldung statt daneben. Das Ladegerüst ist
`display: block`, **25 Spans, kein einziger 0 × 0**.

**Der Messwert reagiert.** Beide Regeln wurden im laufenden Dokument aus dem
Stylesheet gelöscht und neu gemessen: ohne `.v2tbl td.v2tbl__error` fällt die
Zelle auf `padding: 0`, `display: block`, **Höhe 34,8 px**, Text bei
**x = 0** — genau das 35-px-Band an der Kartenkante, das die dritte Runde
beschreibt. Ohne `.v2skel { display: block }` stehen dieselben 25 Spans auf
`inline` und **0 × 0**. Die Werte sind also gemessen, nicht zurückgelesen.

### Beschädigt hat die Nacharbeit nichts

Gruppenzeilen (`AccountColumns/Grouped`, `OpenItemRow/Grouped`) `7px 18px`,
Inhalt bei +18; Aufklappzeilen (`DataTable/Expand`,
`BankTransactionList/Expanded`) `14px 18px 16px 46px`, Inhalt bei +46; die
Skeleton-Stories und die Gerüste des Beleg-Drawers unverändert (die tragen
ihr `display: block` seit je selbst). Kopf und Zeilen enden bei
**900/1100/1280/1440/1680/1920 px** auf **derselben Kante** (Abweichungen: 0),
Zellüberlauf 0, kein Seitenüberlauf bis hinunter zu 480 px — die Karte scrollt
innen, sie drückt die Seite nicht auf. Sachverhalts-Spur 200 px und **trägt
etwas**: viermal „offen" in `Filled`, der Fallname in `AllOfAnAccount`.
Verwendungszweck 372 px bei `minWidth` 1100, 520 px bei 1250. Kästchen-
Beschriftungen mit absolutem Datum, Kopf-Kästchen im Leer-, Lade- und
Fehlerfall `disabled === true`, Leerfall mit Haken (`aria-label="erledigt"`)
**und** Zahl im Satz, Fehlerzeile mit **einem** Knopf, Rundlauf beider
Sammelaktionen samt Taste `N` geprüft, Pager `1–100 von 500` und drei
Sortier-Links in `AllOfAnAccount`, drei Zeilenlinks auf Spalte 2
(Gegenpartei), **0** verschachtelte Anker. Keine Konsolenmeldung in allen
sechs Stories. `typecheck`, `build`, `check:icons`, `check:contrast`: Exit 0.

### Mängel

1. **Der Ladefall hat sechs Spuren und fünf Zellen — blockierend.**
   Kriterium „Kopf und Zeilen enden an derselben Kante". Gemessen bei 1440 px:
   Kopf 6 Zellen (`32 · 100 · 180 · 520 · 200 · 130`), jede Ladezeile **5**.
   Die Balken sitzen dadurch um eine Spur verschoben — der erste liegt mit
   22,4 px **im 32-px-Auswahlkästchen**, und die Spur „Betrag" bleibt in allen
   fünf Zeilen **leer** (letzte Ladezelle endet bei 1107, der Kopf bei 1247).
   Ursache liegt nicht hier, sondern in `DataTable.tsx`: `cols` zählt
   Auswahl-, Aufklapp- und Aktionsspur mit, `<TableLoading cols={columns.length} />`
   nicht. Vorschlag: `TableLoading` die **Spurzahl** übergeben und die
   Griff-Spuren als leere Zellen rendern, nicht als Balken.
   Die Nacharbeit hat den Fehler nicht gemacht, sie hat ihn sichtbar gemacht:
   solange die Spans 0 × 0 waren, sah man die Verschiebung nicht.
   Dazu: die Zahlen der dritten Runde („70 × 11, 81 × 11, an derselben Kante
   wie die Zellen darüber") sind reproduzierbar — aber auf
   `BankTransactionList/LoadingAndError` (gemessen 70 · 81 · 108 · 90 · 72),
   **nicht** auf dieser Liste (gemessen 22,4 · 45 · 81 · 234 · 90).

2. **`WithMatchStage` beweist die Erweiterung nicht — blockierend.**
   Kriterium „`columns` erweitert, ohne umzuordnen (gemessen)". Übergeben wird
   `["amount","matchStage","purpose","postingDate","counterparty"]` — das ist
   **keine Obermenge** von `WORKLIST_COLUMNS`, es lässt `cases` weg. Gemessen
   kommt „Datum · Gegenpartei · Verwendungszweck · DATEV-Historie · Betrag"
   zurück: fünf Spalten wie die Voreinstellung, DATEV **anstelle** von
   Sachverhalt. Bewiesen ist damit „ordnet nicht um", nicht „erweitert".
   Vorschlag: den vollen Satz plus `matchStage` verwürfelt übergeben, etwa
   `["matchStage","amount","purpose","cases","postingDate","counterparty"]`;
   erwartet werden dann sechs Köpfe mit `Sachverhalt` **und**
   `DATEV-Historie`.

3. **Die Bildunterschrift derselben Story sagt das Gegenteil des Baus —
   blockierend.** Sie liest „Vier Spalten statt sieben: kein DATEV-Haken,
   **keine Sachverhalts-Spalte** — beide sagten hier in **jeder** Zeile
   dasselbe". Genau dieses Argument hat M2 zurückgenommen; gebaut sind fünf
   Spalten **mit** Sachverhalt (gemessen, Kopf von `Filled`). Der Satz steht
   auf der Doku-Seite und schickt den nächsten Leser in die Richtung, die
   diese Aufgabe zweimal verworfen hat. Vorschlag: Unterschrift auf den
   heutigen Satz ziehen.

4. **Nicht blockierend, aber schief:** die Überschrift „Vier Spalten statt
   sieben" (Zeile 42 dieser Datei) zählt darunter fünf auf — seit M2 stale.
   Eine Abnahme ändert die Spec nicht; der nächste Bau möge es mitnehmen.

5. **Nicht blockierend:** Kriterium „kennt keinen `CasePicker` (grep: 0
   Treffer)" — `grep` findet **1** Treffer,
   `BankTransactionWorklist.stories.tsx:44`, in Fließtext. Kein Import, keine
   Nutzung; im Sinn erfüllt, in der Zahl nicht.

6. **Nicht blockierend:** die Rückfall-Beschriftung des Zeilenlinks (fehlende
   Gegenpartei → Zweck, N4) wird in **keiner** Story dieser Liste mit einem
   Link gezeigt: `AllOfAnAccount` setzt `rowHref`, hat aber keine namenlose
   Zeile; `Filled` hat die namenlose Zeile, setzt aber kein `rowHref`. Der
   Pfad ist über 0085 gedeckt, hier nicht.

### Befunde am Set (nicht dieser Aufgabe anzulasten)

- **S1 — `DataTable` zählt die Ladezeile falsch** (Ursache von Mangel 1,
  `patterns/DataTable.tsx`, `TableLoading cols={columns.length}` gegen `cols`
  mit Griff- und Aktionsspuren). Trifft jede Liste mit `selection`, `expand`
  oder `rowActions`. `grep 'selection={'` findet heute nur
  `DataTable.stories.tsx` und diese Liste — deshalb fällt es hier zuerst auf.
- **S2 —** die Zeile `display: block` in `.v2skel` macht die beiden
  Sonderregeln `v3.css:2407` und `:2411` (`.v2doc__origskel`,
  `.v2doc__headskel`) redundant. Kosmetik.
- **S3 —** die Aufklappzeile beginnt bei Karte + 46 px, die erste Datenspalte
  bei Karte + 60 px (gemessen 63 gegen 77 bei 1440). Alt, nicht aus dieser
  Runde; wer 0057 anfasst, prüfe die 46.

| | |
|---|---|
| Abgenommen von / am | Claude (fremde Abnahme, nicht der Bau), 2026-09-07 |
| Ergebnis | **zurück** — blockierend sind 1, 2 und 3 |

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

Die drei blockierenden Mängel sind behoben, zwei der kleinen ebenfalls.

**M1 lag nicht hier, sondern in `DataTable`** (0057): `TableLoading` bekam nur
die Zahl der Datenspalten, nicht die Griff-Spuren. Behoben ist es dort, samt
Kriterium und Messung über fünf Listen; hier fluchten Kopf und Ladezeilen jetzt
auf allen sechs Kanten (67 · 177 · 367 · 897 · 1107 · 1247), und der erste
Balken liegt bei x = 77 statt bei 22,4 im Auswahlkästchen.

**M2 und M3 gehören zusammen.** `WithMatchStage` übergab
`["amount","matchStage","purpose","postingDate","counterparty"]` — darin fehlt
`cases`, also war es **keine** Obermenge des Vorgabesatzes, und gezeigt wurden
fünf Spalten mit DATEV **anstelle** des Sachverhalts. Bewiesen war damit „ordnet
nicht um", nicht „erweitert". Der Satz ist jetzt
`["matchStage","amount","purpose","cases","postingDate","counterparty"]`,
weiterhin verwürfelt; gemessen stehen sechs Spalten in Katalogreihenfolge:
Datum · Gegenpartei · Verwendungszweck · Sachverhalt · DATEV-Historie · Betrag.
Die Bildunterschrift, die das Gegenteil behauptete, ist mit ihr neu
geschrieben — und die Überschrift der Spec sagt jetzt „Fünf Spalten statt
sieben", wie sie darunter aufzählt.

**M6 — der Rückfall des Zeilenlinks hat seine Story.** Fehlt die Gegenpartei,
trägt der Verwendungszweck den Link (N4). Das zeigte keine Story dieser Liste:
die namenlose Zeile stand in `Filled` ohne Link, der Link in `AllOfAnAccount`
ohne namenlose Zeile. `AllOfAnAccount` hat jetzt eine — gemessen trägt sie den
Link in derselben Zelle 2 wie die drei benannten.

**S1 — der Ausschluss steht im Typ.** Der Kommentar an `rowHref` sagte,
`DataTable` erzwinge den Ausschluss gegen `expand` nicht. Das stimmte nicht:
0057 hat dafür seit jeher eine diskriminierte Union. Diese Liste hat sie jetzt
auch, und die Laufzeit-Bedingung `rowHref && !expand`, die stillschweigend die
Prop fallen ließ, ist weg. Gegenprobe: beides zusammen übergeben ergibt einen
Typfehler.

**S2 — zwei redundante Regeln sind weg.** Seit `.v2skel` selbst `display: block`
setzt, brauchten `.v2doc__origskel` und `.v2doc__headskel` es nicht mehr; beide
Klassen stehen ohnehin immer zusammen mit `.v2skel` am selben Element. Nach dem
Löschen im Bild gegengemessen: unverändert 180×22 und 1018×620.

**M5 bleibt offen, mit Grund.** Das Kriterium sagt „grep auf `CasePicker`: 0
Treffer", und es ist einer da — im **Fließtext** eines Story-JSDocs, der
erklärt, warum die Liste keinen öffnet. Der Text ist die Begründung einer
Entscheidung; ihn zu löschen, um einen grep zu befriedigen, hieße die
Begründung gegen die Prüfung zu tauschen. Gemeint war „kein Import, keine
Nutzung" — und das gilt.

## Wiederabnahme (2026-09-07) — die vier Nacharbeiten halten

Geprüft gegen den Dev-Server auf Port 6107 (serviert die Quelle), ohne Blick in
den Bau, jede Messung mit Gegenprobe. Nicht gebaut (`storybook build` ist für
Prüfer gesperrt, 0117). **Ergebnis: abgenommen.**

### M1 — der Ladefall fluchtet, gemessen und gegengeprüft

`LoadingAndError`, 1440 px: Kopfzeile **6** Zellen mit den rechten Kanten
`67 · 177 · 367 · 897 · 1107 · 1247`; jede der **5** Ladezeilen ebenfalls
6 Zellen mit **denselben** Kanten (Abweichung 0). Der erste Balken liegt bei
**x = 77**, also hinter dem Auswahlkästchen, das bei 67 endet; die Spur
„Betrag" trägt einen Balken (x 1117, 58,5 × 11) statt leer zu bleiben.
Bei 900 · 1100 · 1280 · 1440 · 1680 · 1920 px in allen sechs Stories: Kopf und
Zeilen auf derselben Kante (0 Abweichungen), Zellüberlauf **0**, kein
Dokumentüberlauf.

**Gegenprobe:** im laufenden Dokument die führende Leerzelle jeder Ladezeile
entfernt und neu gemessen — das alte Bild kommt exakt zurück: 5 Zellen, letzte
Kante **1107** gegen Kopf **1247** (140 px), erster Balken bei **x = 35** mit
**22,4** px Breite, also im 32-px-Kästchen. Die Messung reagiert.

Gegengemessen an sieben weiteren Ladefällen, alle deckungsgleich, kein Skelett
0 × 0: `DataTable/Loading` (5 Zellen, `145 · 905 · 1045 · 1245 · 1405`),
`Zellen/Loading` (5), `Table/Loading` (4), `CaseList/Loading` (10),
`OpenItemRow/Loading` (10), `BankTransactionList/LoadingAndError` (8),
`DocumentNumberRegister/Loading` (5, ohne Spaltenkopf). Andere Listen **mit
`selection`** gibt es nur in `DataTable.stories` (`grep 'selection='`: zwei
Dateien); dort Kopf gegen Datenzeile gemessen: `Selection` 6 = 6 Spuren
(`67 · 187 · 905 · 1045 · 1245 · 1405`), `Expand` 7 = 7
(`67 · 109 · 229 · 905 · 1045 · 1245 · 1405`), `RowActions` 6 = 6 in beiden
Karten — alle Kanten deckungsgleich. Zum Ladefall dieser Kombinationen siehe
Befund 4.

### M2/M3 — `WithMatchStage` erweitert jetzt wirklich

Übergeben wird verwürfelt
`["matchStage","amount","purpose","cases","postingDate","counterparty"]` — eine
**Obermenge** von `WORKLIST_COLUMNS`. Gemessene Kopfzeile: 7 Zellen =
Auswahl + **Datum · Gegenpartei · Verwendungszweck · Sachverhalt ·
DATEV-Historie · Betrag**, also Katalogreihenfolge (`ORDER`,
`bank-transaction-columns.tsx:53`). Unterscheidend: `matchStage` steht im
übergebenen Satz **vorn** und in der Kopfzeile an **fünfter** Stelle — eine
Kopfzeile, die den Satz nur nachspräche, sähe anders aus. `Filled` dagegen
5 Spuren **ohne** DATEV (Ränge 1–4 und 6 des Profils). Die Bildunterschrift
beschreibt genau diesen Bau, die Spec-Überschrift zählt fünf und sagt fünf.

### M6 — der Rückfall des Zeilenlinks hat seine Story

`AllOfAnAccount`: vier Zeilenlinks, **alle in Zelle 2** (Gegenpartei). Die
namenlose Zeile `a-2` trägt ihn in derselben Zelle 2, beschriftet mit dem
Zweck: „SEPA-Lastschrift Kartenzahlung 88…" → `#zahlung-a-2`. **0**
verschachtelte Anker auf der Seite.

### S1 — der Ausschluss steht im Typ

Probe in einer Kopie außerhalb des Repos (`src` kopiert, eigener
`tsc --noEmit`, Baseline Exit 0): `rowHref` allein übersetzt, `expand` allein
übersetzt, **beides zusammen ist ein Typfehler** — `BankTransactionList` über
die Union `RowWayProps` (TS2322, „Types of property 'expand' are incompatible …
not assignable to type 'undefined'"), `BankTransactionWorklist`, weil sie
`expand` gar nicht kennt (TS2322, „Property 'expand' does not exist").
**Gegenprobe:** die Union in der Kopie neutralisiert → die Zeile mit beidem
übersetzt wieder; Union zurück → der Fehler ist zurück. Die Laufzeit-Bedingung
`rowHref && !expand` ist weg. Die Probe ist entfernt.

### Die übrigen Kriterien

Kopf und Zeilen an derselben Kante bei 900/1100/1440 (und 1280/1680/1920) ✓ ·
Satz mit den Rängen 1–4 und 6, keine DATEV-Spalte in `Filled` ✓ · Sortierung
und Pager durchgereicht (`AllOfAnAccount`: `1–100 von 500`, drei Sortier-Links
`#konto?sort=postingDate|counterparty|amount&dir=asc&page=1`) ✓ · `columns`
erweitert ohne umzuordnen ✓ · Kästchen-Beschriftung mit absolutem Datum
(„Stadtwerke Musterstadt vom 26.08.2026 auswählen", ohne Namen „Zahlung vom
27.08.2026 auswählen") ✓ · Kopf-Kästchen im Leerfall `disabled === true`
(im Lade- und Fehlerfall ebenso; in `Filled` `false`, ein Klick wählt alle
4 Zeilen) ✓ · Leerfall mit Haken (`aria-label="erledigt"`) **und** Zahl im Satz
(„Alle 251 Zahlungen dieses Kontos gehören zu einem Sachverhalt.") ✓ ·
Fehlerzeile mit **einem** Knopf („Erneut laden", Kasten `24px 18px`,
`flex`/`column`, 110,9 px hoch) ✓ · Rundlauf beider Sammelaktionen: zwei
Kästchen + Taste `N` → „Neuer Sachverhalt aus 2 Zahlung(en)", zwei Kästchen +
Klick → „2 Zahlung(en) an den Sachverhalt des Aufrufers", Auswahl danach
zurückgesetzt ✓ · keine Konsolenmeldung in allen sechs Stories (nur
Vite-Hinweis und React-DevTools-Hinweis des Rahmens) ✓ · Datei nach der
Familie, `@when`/`@instead`, kein Hex, keine lokale Label-Map ✓ ·
`typecheck`, `check:icons`, `check:contrast` Exit **0** (Exit-Code geprüft);
`build` **nicht prüfbar** — Bauen ist für Prüfer gesperrt (0117).
`CasePicker`: **1** Treffer, unverändert der Fließtext in
`BankTransactionWorklist.stories.tsx:44`, siehe Befund 3.

Nebenbei gegengemessen, weil S2 dieselbe Regel angefasst hat:
`SourceDocumentDrawer/Lädt` unverändert `180 × 22` und `1018 × 744` (62 vh bei
1200 px Fensterhöhe), beide `display: block`, kein Skelett 0 × 0.

### Befunde — fünf, keiner blockierend

1. **Der JSDoc von `TableLoading` ist beim Reparieren ins Deutsche gekippt**
   (`src/ui/v3/primitives/Cells.tsx:137–163`, dazu die beiden neuen
   Prop-Kommentare). Vorher englisch, jetzt deutsch **samt `@when`/`@instead`**
   — die Hausregel („Code nur Englisch, JSDoc auch `@when`/`@instead`") gilt
   ohne Ausnahme, und jeder andere JSDoc derselben Datei (Zeilen 30, 63, 86,
   108, 189, 210) ist englisch. Dasselbe im Kopfkommentar von `RowWayProps`
   (`BankTransactionList.tsx:23–28`), dessen Prop-Kommentare darunter englisch
   sind. Kleinster Weg: die drei Blöcke zurück ins Englische, Inhalt
   unverändert.
2. **Zwei Nachweis-Spalten der Schnittstelle zeigen auf die falsche Story** —
   dieselbe Sorte wie N3 der dritten Runde. `caseHref` und `openHref` nennen
   `Filled`; gemessen hat `Filled` in der Sachverhalts-Spur **0** Anker
   (viermal nacktes „offen"), während `AllOfAnAccount` dreimal
   „offen → `#zuordnen`" und einmal „Wartung der Klimaanlage →
   `#fall-c-4412`" trägt. Kleinster Weg: in beiden Zeilen `AllOfAnAccount`
   eintragen.
3. **Das `CasePicker`-Kriterium gehört geändert, nicht der Text** (bewusst
   offen gelassen, hier nur bewertet). Gemessen: `grep -r CasePicker src/` → 1
   Treffer, `BankTransactionWorklist.stories.tsx:44`, Fließtext; in
   `BankTransactionWorklist.tsx` **0**. Das Kriterium heißt „Die Komponente
   kennt keinen `CasePicker`" — die Komponente ist die `.tsx`, und dort ist die
   Zahl 0. Der Satz in der Story ist die **Begründung** einer Entscheidung, auf
   die sich die Spec selbst beruft („Die Wartebedingung, zur Hälfte
   aufgelöst"); ihn zu löschen, tauschte die Begründung gegen die Messbarkeit.
   Kleinster Weg: das Kriterium auf das formulieren, was es meint — „kein
   Import und keine Nutzung (`grep` auf `from .*CasePicker` und `<CasePicker`:
   0 Treffer)".
4. **Das neue Kriterium in 0057 ist heute nur zu einem Drittel messbar.** Es
   verlangt den Ladefall „mit `selection`, `expand` und `rowActions` je einzeln
   und zusammen"; gemessen zeigt **keine** Story einen Ladezustand zusammen mit
   `expand` oder `rowActions` — `DataTable/Expand` und `DataTable/RowActions`
   setzen `loading` nicht, und `selection` im Ladefall gibt es nur hier. Die
   Formel in `DataTable.tsx:250–255` deckt beide Fälle ab, bewiesen ist die
   Spur-Zahl aber nur an der Kopfzeile (7 bzw. 6 Spuren, oben gemessen).
   Gehört zu 0057, nicht hierher.
5. **Zwei Buchhaltungs-Kleinigkeiten.** Der S1-Absatz oben in dieser Datei
   sagt „Diese Liste hat sie jetzt auch" — die Union steht in
   `BankTransactionList.tsx` (0085), die Worklist kennt `expand` schlicht
   nicht. Und 0085 hat den Fix seines eigenen Befundes 1 nicht vermerkt.
   Kosmetisch, ohne Folgen für den Bau.

Nicht als Mangel gezählt, aber notiert: im Ladefall steht der Balken der Spur
„Betrag" links (x 1117 in der Spur 1107–1247), während die Spalte rechts
ausrichtet. Verhalten von `TableLoading` (0057), in jeder Liste gleich.

| | |
|---|---|
| Abgenommen von / am | Claude (fremde Wiederabnahme, nicht der Bau), 2026-09-07 |
| Ergebnis | **abgenommen** — kein blockierender Mangel; offen bleiben die fünf Befunde oben und das Kriterium „ersetzt `BankTransactionAssignmentTable.tsx`" (App, wartet auf L-16) |

## Nach der Wiederabnahme (2026-09-07)

**Abgenommen.** Die vier Nacharbeiten halten, gemessen mit Gegenprobe: der
Ladefall hat sechs Zellen wie der Kopf und deckungsgleiche Kanten (der
Rückbau bringt exakt das alte Bild zurück — 5 Zellen, 140 px Lücke, Balken bei
22,4 im Kästchen), `WithMatchStage` übergibt eine verwürfelte Obermenge und
zeigt sieben Zellen in Katalogreihenfolge, der Zeilenlink fällt bei fehlender
Gegenpartei auf den Zweck, und beides zusammen — `rowHref` und `expand` —
ergibt einen Typfehler.

Die Befunde der Abnahme sind eingearbeitet:

- **Befund 1:** der JSDoc von `TableLoading` war beim Reparieren von Englisch
  nach Deutsch gekippt, ebenso der Kopf von `RowWayProps`. Beide sind zurück
  auf Englisch — und die Regel steht jetzt als Wächter im Repo
  (`pnpm check:language`), weil das in dieser Runde der vierte Rückfall war.
- **Befund 3 gebe ich der Abnahme recht:** ändern gehört das **Kriterium**,
  nicht der Text. Es lautet jetzt „kein Import und keine Nutzung", statt einen
  grep zu verlangen, den die eigene Begründung reißt.
- **Befunde 2, 4 und 5** sind vermerkt: die Nachweis-Spalten für `caseHref` und
  `openHref` zeigen auf die falsche Story; das neue 0057-Kriterium ist heute
  nur für `selection` messbar, weil keine Story `loading` mit `expand` oder
  `rowActions` kombiniert; und die Union steht in der Datei von 0085, nicht in
  dieser — dort ist sie auch vermerkt.
