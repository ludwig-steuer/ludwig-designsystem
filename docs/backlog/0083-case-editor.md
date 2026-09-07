# 0083 · CaseEditor — die vier Werte, die ein Mensch am Sachverhalt ändert

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-07, ludwig-coordinator im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Formen" (Zeile `CaseEditor`) |
| Auftrag | Kein Formular, sondern `InlineEdit` je Wert im `CaseDetailView`: Anzeigename (`title`), Zusammenfassung (`summary`), Art (`kind`) und Belegnummern-Modus (`document_number_mode`); dazu die Zuständigkeit (`disposition`, schreibbar nur `agent` und `accounting`). Ersetzt `CaseSummaryEditor`, `CaseKindEditor`, `CaseDocumentNumberModeEditor` und `CaseCommentForm`. |
| Besonderheit | Die Umstufung des Belegnummern-Modus ist **begründungspflichtig** (Regel S3, `isDocumentNumberModeDowngrade()`) — dafür `ReasonDialog`, nicht ein stiller Wechsel. |
| Vertagt, weil | der Editor im View lebt und 0050 `CaseDetailView` voraussetzt. Er ist ein Auftrag, keine Ablehnung: §7 Nr. 4 trifft zu (vier Punkte mit änderbar = Nutzer) und Nr. 1 ebenfalls (vier Editoren in der App). |
| Setzt voraus | `CaseDetailView` (0050) · `InlineEdit` · `ReasonDialog` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

## Spec 2026-09-07 (Skill `spec-schreiben`)

## Ziel

Die Werte, die ein Mensch am Sachverhalt ändert, im `CaseDetailView` ändern —
je Wert an Ort und Stelle, nicht in einem Formular, das die Ansicht verlässt.
Ersetzt `CaseSummaryEditor`, `CaseKindEditor`, `CaseDocumentNumberModeEditor`
und `CaseCommentForm` der App.

## Einordnung

**Klasse `entities/accounting-case/`.** Fachwörter in Werten und Regeln: Art,
Belegnummern-Modus, Zuständigkeit. Die allgemeine Form — ein Wert, der weit
öfter gelesen als geändert wird — ist die Primitive `InlineEdit`, der
begründete Wechsel ist `ReasonDialog`; beide bleiben, wo sie sind.

**Regel aus §3, die griff: Nr. 5** — eine neue Entitäts-Form, vom
Entitätsprofil geführt, und §7 Nr. 4 des Analyse-Skills trifft zu (vier
Datenpunkte mit `änderbar = Nutzer`).

**Zuschnitt: drei Exporte, nicht fünf.** Der Auftrag nennt vier Werte plus die
Zuständigkeit. Zwei davon brauchen **keine** Komponente:

- **Anzeigename (`title`)** und **Zusammenfassung (`summary`)** sind
  `<InlineEdit label=… value=… onSave=… />`, bei der Zusammenfassung mit
  `multiline`. Das ist Markup an der Aufrufstelle; §3 Nr. 4 sagt dazu
  ausdrücklich: eine Komposition ohne eigenen Zustand ist keine Komponente.
  Ein Export dafür hätte nichts zu tragen — außer der Grenze von 309 Zeichen
  (p90), und die gehört der Anzeige, nicht dem Editor.

Drei brauchen eine, weil jede eine **Regel** trägt, die sonst an jeder
Aufrufstelle neu entstünde:

| Export | Trägt |
|---|---|
| `CaseKindEdit` | die sieben Arten aus `CASE_KIND_LABEL` — die einzige Quelle, nicht lokal nachgebaut; die Art ist **kein Status** (keine Farbe, keine Übergänge) |
| `CaseDocumentNumberModeEdit` | `CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS` (was von hier aus erlaubt ist), die Begründungspflicht und die Nummernwahl bei der Herabstufung |
| `CaseDispositionEdit` | die Achse `disposition` aus der Registry und die Einschränkung: schreibbar sind **`agent`** und **`accounting`**, `client` nie von hier aus |

Alle drei in **einer Datei** `CaseEditor.tsx` — eine Familie im Sinne von §4:
sie ergeben nur im selben View Sinn und teilen ein Vokabular (Wert, Grund,
Speichern). Getrennte Dateien erzeugten drei Mal denselben Rahmen.

## Was das Datenmodell anders sagt als der Auftrag

Der Auftrag oben nennt die Umstufung „begründungspflichtig (Regel S3,
`isDocumentNumberModeDowngrade()`)". Das Datenmodell ist genauer, und es hat
Vorrang (§5):

> Erlaubte Umstufungen (F100 §5). **Hochstufen ist begründungspflichtig,
> Herabstufen verlangt zusätzlich die Wahl der künftig gültigen Nummer.**
> — `case.ts:102–107`

Also **jede** Umstufung braucht einen Grund, und `isDocumentNumberModeDowngrade`
(`to === "single"` aus `multiple` oder `per_period`) entscheidet nur, ob
**zusätzlich** eine Nummer zu wählen ist. Die Spec baut beides:

- Umstufung → `ReasonDialog` mit `required` (der Grund steht später im
  Protokoll).
- Herabstufung auf `single` → derselbe Dialog, im `children`-Slot die Wahl
  der künftig gültigen Belegnummer aus den heute verknüpften. Ohne Wahl kein
  Bestätigen.
- `none` ist im Set **nicht** wählbar: der Kern lässt es nur bei
  `kind in ('internal_transfer','adjustment_only')` und ohne verknüpften
  Beleg zu, und diese Prüfung liegt im Kern, nicht in der Übergangstabelle.
  Die Komponente bietet an, was sie prüfen kann; `none` kommt als Prop
  (`allowNone`) von der Seite, die den Kern gefragt hat.

## Schnittstelle

Typen aus `src/ludwig/modules/accounting-cases/domain/case.ts`: `CaseKind`,
`CASE_KIND_LABEL`, `CaseDocumentNumberMode`,
`CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS`, `isDocumentNumberModeDowngrade`,
`CaseDisposition`. Die Achse `disposition` und `belegnummern_modus` aus der
Status-Registry.

**`CaseKindEdit`**

| Prop | Typ | Bedeutung | Story |
|---|---|---|---|
| `value` | `CaseKind` | die heutige Art | `Kinds` |
| `onSave` | `(next: CaseKind) => Promise<void> \| void` | wirft oder lehnt ab → das Feld bleibt offen und zeigt den Fehler | `Roundtrip`, `Failed` |
| `pending` | `boolean` (optional) | Speichern läuft von außen | `Pending` |
| `disabled` | `boolean` (optional) | geschlossener Sachverhalt | `Filled` |

**`CaseDocumentNumberModeEdit`**

| Prop | Typ | Bedeutung | Story |
|---|---|---|---|
| `value` | `CaseDocumentNumberMode` | der heutige Modus | `Modes` |
| `onSave` | `(next: CaseDocumentNumberMode, reason: string, keepNumber?: string) => Promise<void> \| void` | Modus, Grund und — nur bei Herabstufung — die künftig gültige Nummer | `Downgrade` |
| `documentNumbers` | `readonly string[]` (optional) | die heute verknüpften Belegnummern; ohne sie ist die Herabstufung nicht wählbar, weil die Wahl fehlt | `Downgrade` |
| `allowNone` | `boolean` (optional) | ob `none` angeboten wird — das weiß nur die Seite, die den Kern gefragt hat | `Modes` |
| `pending`, `disabled` | wie oben | | `Pending` |

**`CaseDispositionEdit`**

| Prop | Typ | Bedeutung | Story |
|---|---|---|---|
| `value` | `CaseDisposition \| null` | wer am Zug ist; `null` heißt „in Pipeline-Bearbeitung oder abgeschlossen" und ist kein Wert zum Wählen | `Dispositions` |
| `onSave` | `(next: "agent" \| "accounting") => Promise<void> \| void` | nur diese zwei — der Typ sagt es, nicht ein Kommentar | `Roundtrip` |
| `pending`, `disabled` | wie oben | | `Pending` |

**Kann bewusst nicht:**

- **Speichern.** Kein Modul, keine Server Action; `onSave` gehört dem
  Aufrufer. Das ist der Unterschied zu den vier App-Editoren, die je ihre
  Action selbst rufen.
- **Den Kommentar.** `CaseCommentForm` der App schreibt ein **Ereignis**, kein
  Feld des Sachverhalts. Es gehört zur Zeitleiste (`CaseTimeline`), nicht
  hierher — sonst trüge diese Datei zwei Datenquellen (§4).
- **`client` als Zuständigkeit setzen.** Den Mandanten ins Spiel zu bringen
  ist eine Handlung mit Außenwirkung (er bekommt eine Frage), keine
  Wertänderung. Sie gehört zur Klärung.
- **Die Art einschränken.** Welche Arten fachlich möglich sind, weiß der Kern;
  die Komponente zeigt alle sieben und lässt `onSave` ablehnen.

## Verhalten

- **Fehl geht offen aus.** Lehnt `onSave` ab, bleibt das Feld offen und zeigt
  den Satz — geerbt von `InlineEdit`, hier nur nachgewiesen.
- **Der Dialog ist die Ausnahme, nicht die Regel.** Nur der
  Belegnummern-Modus öffnet einen; Art und Zuständigkeit speichern direkt.
  Ein Dialog für jede Änderung wäre die Rückkehr zum Formular.
- **Escape verwirft, Enter speichert** (`InlineEdit`), im Dialog schließt
  Escape ohne zu ändern (`ReasonDialog`). Nachweis mit echten Tastendrücken.
- **Der Grund ist Pflicht, die Nummer auch.** Ohne Grund bleibt „Bestätigen"
  gesperrt; bei der Herabstufung zusätzlich ohne gewählte Nummer.

## Stories

Titel `v3/Entitäten/Sachverhalt/CaseEditor`. Ableitung nach §6: **5
Story-Zustände** für einen Editor (gefüllt · leer · Fehler · lädt · ungültig —
„leer nach Filter" entfällt, hier wird nichts gefiltert) + **3** je Enum-Prop
(Art, Modus, Zuständigkeit) + 0 Layout-Booleans + 1 Callback-Rundlauf + 1 „im
Einsatz" + 1 Rand = **11**. Das ist einer zu viel für die Grenze aus §4 —
gespart wird an „leer": ein Sachverhalt ohne Zusammenfassung ist kein eigener
Zustand dieser drei Exporte, sondern von `InlineEdit`, das hier gar keinen
Export bekommt (siehe Zuschnitt). Bleiben **10**, und das ist die Grenze, nicht
ihre Überschreitung.

| Story | Beweist |
|---|---|
| `Filled` | Die drei Editoren nebeneinander, wie sie im View stehen; einer davon `disabled` (geschlossener Sachverhalt) |
| `Kinds` | Alle sieben Arten aus `CASE_KIND_LABEL`, deutsche Labels, keine lokale Map |
| `Modes` | Alle vier Modi, die erlaubten Übergänge je Ausgangswert, `allowNone` einmal an und einmal aus |
| `Dispositions` | `agent` und `accounting` wählbar, `client` nicht angeboten, `null` als Ausgangswert lesbar |
| `Downgrade` | **Der Rand**: `multiple → single` öffnet den Dialog mit Grund **und** Nummernwahl; ohne beides bleibt „Bestätigen" gesperrt |
| `Pending` | Speichern läuft: Feld gesperrt, Dialog zeigt seinen Lauf, nichts springt |
| `Failed` | `onSave` lehnt ab: Feld bleibt offen, Satz steht am Feld |
| `Invalid` | Ungültige Umstufung (ein Übergang, den die Tabelle nicht führt) wird gar nicht erst angeboten |
| `Roundtrip` | `useState` über alle drei: ändern, verwerfen mit Escape, wieder ändern; mit echten Tastendrücken |
| `InUse` | Im `CaseDetailView`, an den Stellen, an denen die Werte stehen — die Breite, in der sie wirklich stehen |

Daten aus den Spiegeltypen, Werte wie echte: „Eingangsrechnung: Musterbau
GmbH", 1.249,90 €, Beleg RE-4471.

## Ausbau (A12)

- **Mehrere Werte in einem Zug ändern.** Erst wenn eine Seite es braucht; sie
  wäre ein Formular und damit eine andere Form (`CaseForm`), nicht diese.
- **Die Umstufung mit Vorschlägen.** `ReasonDialog.chips` trägt sie schon;
  welche Gründe häufig sind, weiß erst der Betrieb. Prop: `reasonChips`.
- **`client` als Zuständigkeit.** Kommt mit der Klärung, nicht hier — und
  dann als Handlung mit eigener Bestätigung, nicht als vierter Wert im Feld.

## Offene Fragen

1. **Trägt die Zuständigkeit einen Grund?** *Ohne Antwort:* nein — der
   Wechsel zwischen Agent und Buchhaltung ist alltäglich und steht ohnehin im
   Protokoll; ein Pflichtfeld dafür wäre Reibung ohne Ertrag.
2. **Wie viele Belegnummern stehen bei der Herabstufung zur Wahl?**
   *Ohne Antwort:* alle heute verknüpften, als Liste; über zehn wird sie
   scrollbar. Ein Picker wäre eine eigene Form.
3. **Bleibt `none` ganz draußen, wenn `allowNone` fehlt?** *Ohne Antwort:* ja
   — nicht ausgegraut, sondern nicht vorhanden. Ein Wert, den man sieht und
   nicht wählen kann, ist eine Frage ohne Antwort.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` grün (Exit 0); **nicht bauen**, solange parallele Prüfer messen (0117)
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an **jedem** der drei Exporte — `pnpm check:when` Exit 0
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle zehn Stories vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook 6107), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `CaseKindEdit` zeigt genau die sieben Arten mit den Labels aus `CASE_KIND_LABEL`; `grep` findet keine zweite Map in der Datei (Story `Kinds`)
- [ ] Die Art trägt **keine** Farbe und keinen Zustandsstil — sie ist kein Status (Story `Kinds`, `getComputedStyle` gemessen)
- [ ] `CaseDocumentNumberModeEdit` bietet je Ausgangswert genau die Ziele aus `CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS` an, `none` nur mit `allowNone` (Story `Modes`, alle vier Ausgangswerte durchgezählt)
- [ ] Jede Umstufung öffnet den `ReasonDialog`; ohne Grund bleibt „Bestätigen" gesperrt (Story `Downgrade`, Knopf-Zustand gemessen)
- [ ] Die Herabstufung auf `single` verlangt **zusätzlich** die Wahl der künftig gültigen Nummer; ohne Wahl bleibt „Bestätigen" gesperrt (Story `Downgrade`)
- [ ] `onSave` des Modus bekommt Modus, Grund und — nur bei Herabstufung — die Nummer (Story `Downgrade`, Rundlauf mit `useState`)
- [ ] `CaseDispositionEdit` bietet `agent` und `accounting` an und **nicht** `client`; `null` ist lesbar, aber nicht wählbar (Story `Dispositions`)
- [ ] Lehnt `onSave` ab, bleibt das Feld offen und zeigt den Satz (Story `Failed`)
- [ ] `pending` sperrt das Feld, ohne die Ansicht springen zu lassen (Story `Pending`, Höhe vorher/nachher gemessen)
- [ ] Tastatur: Enter speichert, Escape verwirft, im Dialog schließt Escape ohne Änderung — **mit echten Tastendrücken gemessen** (Story `Roundtrip`)
- [ ] Ersetzt `CaseSummaryEditor`, `CaseKindEditor` und `CaseDocumentNumberModeEditor` ohne Funktionsverlust; `CaseCommentForm` bleibt bewusst draußen und der Grund steht in „Kann bewusst nicht" (Story `InUse`)

## Abnahme

## Freigabe (2026-09-07, ludwig-coordinator im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Die Regel aus `case.ts:102–107` ist richtig gelesen (jede Umstufung mit Grund, Herabstufung nur `→ single` zusätzlich mit Nummernwahl, `none` über `allowNone`); `InlineEdit`, `ReasonDialog`, `Select` sind im Barrel. Entscheide: 1 kein Grund bei der Zuständigkeit · 2 **`RadioGroup` über `KnownDocumentNumber[]`**, kein Scrollfall (Bestand max. 1) · 3 `none` ohne `allowNone` unsichtbar.

Vor dem Bau in die Spec: (a) `ReasonDialog` sperrt „Bestätigen" nur über `required && reason`, Knopf **und** Enter — die Sperre ohne Nummernwahl braucht einen Weg: `ReasonDialog` um eine Prop `confirmDisabled?: boolean` erweitern (§3 Regel 2, gilt für Knopf und Enter), Kriterium „Enter bestätigt nicht, was der Knopf verweigert"; (b) Typen aus dem Spiegel: `CaseDispositionWritable`/`CASE_DISPOSITION_WRITABLE` (case.ts) statt der lokalen Union, `KnownDocumentNumber` (document-number.ts) statt `readonly string[]`; (c) `InUse`: die drei Editoren im `children`-Slot des `CaseDetailView` (0050: „`CaseEditor` füllt `children`"), Breite des Slots gemessen; (d) Kopfzeile: `CaseCommentForm` aus „ersetzt" streichen — `CaseTimeline` überspringt Kommentare (Owner 2026-09-04), die Ablösung hat im Set keinen Ort, bleibt Ausbau 0040.

Befunde ins Register: **L-211** — `CaseDetail` trägt die verknüpften Belegnummern (`client_case_document_numbers`) nicht; die Herabstufung kann ihre Wahl nicht aus dem Detail speisen. **L-212** — `CaseDetail.disposition` ist `string | null` statt `CaseDisposition | null` (`case-detail.ts:71`), Cast an jeder Aufrufstelle.

## Gebaut (2026-09-07)

`src/ui/v3/entities/accounting-case/CaseEditor.tsx` mit den drei Exporten samt
Stories und Barrel-Eintrag. Alle vier Änderungen der Freigabe sind drin.

**(a) `ReasonDialog` hat `confirmDisabled` bekommen** (§3 Regel 2: eine Prop,
und sie gilt für Knopf **und** Enter). Die Sperre war vorher nur „`required`
und leerer Grund"; die Herabstufung braucht eine zweite. Gemessen im Dialog
von `Downgrade`:

| Zustand | „Umstufen" | Enter |
|---|---|---|
| ohne Grund, ohne Nummer | gesperrt | — |
| **mit Grund, ohne Nummer** | **gesperrt** | Dialog bleibt offen, nichts gespeichert |
| mit Grund und Nummer | frei | speichert `single · „Nur eine Nummer bleibt gültig." · Nummer RE-4471` |

Damit ist das Kriterium „Enter bestätigt nicht, was der Knopf verweigert" mit
echten Tastendrücken belegt, nicht aus dem Code gelesen.

**(b) Typen aus dem Spiegel.** `CaseDispositionWritable` und
`CASE_DISPOSITION_WRITABLE` statt einer lokalen Union — die zwei schreibbaren
Werte stehen im Typ, nicht in einem Kommentar. `KnownDocumentNumber` statt
`readonly string[]`: die Wahl bei der Herabstufung zeigt damit auch das
Personenkonto und sperrt, was DATEV festgeschrieben hat (`immutable`).

**(c) `RadioGroup` statt einer Liste** (Entscheid 2): der Bestand trägt
höchstens eine Nummer je Fall, ein Scrollfall entsteht nicht.

**(d) `InUse` steht im `children`-Slot des `CaseDetailView`** — dem Ort, für
den die drei gebaut sind.

**Gemessen** (Dev-Server 6107, CDP, echte Klicks und Tasten):

- `Kinds`: **sieben** Arten mit den Wörtern aus `CASE_KIND_LABEL`
  (Eingangsrechnung · Ausgangsrechnung · Dauersachverhalt · Umbuchung ·
  Auslagen · Korrektur · Vertrag). Keine zweite Map in der Datei.
- `Modes`: von `multiple` aus werden genau `single` und `per_period`
  angeboten — `none` fehlt ohne `allowNone`, der eigene Wert steht nur als
  aktuelle Anzeige da. Die Wörter kommen aus der Achse
  `belegnummern_modus`.
- `Downgrade`: der Dialog zeigt **zwei** Nummern zur Wahl und die Kicker-Zeile
  „Mehrere Belegnummern → Eine Belegnummer".
- `Dispositions`: `agent` und `accounting` sind wählbar, `client` nicht;
  `null` ist lesbar („—"), aber nicht zu wählen.

**Was hier bewusst keinen Export bekommt:** Anzeigename und Zusammenfassung.
Sie sind `<InlineEdit label=… value=… onSave=… />` an der Aufrufstelle — eine
Komposition ohne eigenen Zustand ist keine Komponente (§3 Nr. 4). Und der
Kommentar: `CaseCommentForm` ist aus „ersetzt" gestrichen (Freigabe d), weil
`CaseTimeline` Kommentare überspringt und die Ablösung im Set keinen Ort hat.

Die zwei Befunde der Freigabe stehen im Register: **L-211** (`CaseDetail` ohne
verknüpfte Belegnummern — deshalb ist `documentNumbers` eine Prop vom
Aufrufer) und **L-212** (`CaseDetail.disposition` ist `string`).

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0.

**Status: Abnahme** — gebaut habe ich, abnehmen muss ein anderer.
