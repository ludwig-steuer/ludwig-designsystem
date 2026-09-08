# 0083 · CaseEditor — die vier Werte, die ein Mensch am Sachverhalt ändert

| | |
|---|---|
| Status | fertig (Schnittstelle) — die gemessene Prüfung steht in 0119 aus |
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
| `documentNumbers` | `readonly KnownDocumentNumber[]` (optional) | die heute bekannten Belegnummern aus dem Register — **nicht** bloße Zeichenketten: die Karte braucht Personenkonto und `immutable`. Ohne sie ist die Herabstufung nicht wählbar, weil die Wahl fehlt (gemessen: von `multiple` aus fehlt `single`, sobald keine Nummer dasteht) | `Downgrade`, `Modes` |
| `error` | `ReactNode` (optional) | Der Satz am Feld, wenn das Speichern fehlschlägt. **Der Modus-Editor liest ihn nicht** — er speichert über den Dialog, und der trägt seinen eigenen Fehler | `WithError` |
| `allowNone` | `boolean` (optional) | ob `none` angeboten wird — das weiß nur die Seite, die den Kern gefragt hat | `Modes` |
| `pending`, `disabled` | wie oben | | `Pending` |

**`CaseDispositionEdit`**

| Prop | Typ | Bedeutung | Story |
|---|---|---|---|
| `value` | `CaseDisposition \| null` | wer am Zug ist; `null` heißt „in Pipeline-Bearbeitung oder abgeschlossen" und ist kein Wert zum Wählen | `Dispositions` |
| `onSave` | `(next: CaseDispositionWritable) => Promise<void> \| void` | nur die zwei schreibbaren Werte — der Typ sagt es, nicht ein Kommentar. `CaseDispositionWritable` kommt aus `src/ludwig/`, die Aufzählung war hier ausgeschrieben (berichtigt 2026-09-08, M1) | `Roundtrip` |
| `value` | `CaseDisposition \| null` | `null` heißt „in der Pipeline oder geschlossen" — **lesbar, nicht wählbar**: der Platzhalter „—" ist `disabled`, sonst spräche ein Speichern von dort einen leeren String an die Achse (M4) | `Dispositions` |
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

## Schlanke Abnahme (Schnittstelle) 2026-09-08

Fremde Abnahme, schlanke Tiefe (Owner-Entscheid 2026-09-08): geprüft ist die
**Schnittstelle**, nicht die Darstellung. Spurbreiten, Zeilenhöhen, Überläufe,
Kontraste, Trefferflächen, Hover, Fokus und Tastaturwege sind nach
`docs/backlog/0119-visuelle-pruefung-nachholen.md` vertagt und hier weder
geprüft noch gemessen.

**Gelesen:** diese Spec · `src/ui/v3/entities/accounting-case/CaseEditor.tsx`
(231 Zeilen) · `CaseEditor.stories.tsx` (274) ·
`src/ui/v3/primitives/InlineEdit.tsx`, `ReasonDialog.tsx`, `Dialog.tsx`,
`RadioGroup.tsx`, `Form.tsx` (`Select`) · Spiegel
`src/ludwig/modules/accounting-cases/domain/case.ts` und `document-number.ts`,
`case-detail.ts` · `src/ludwig/ui/status/status-registry.ts` (Achsen
`disposition` Z. 810–814, `belegnummern_modus` Z. 710–715) · Barrel
`src/ui/v3/index.ts:398–402` · Entitätsprofil `docs/entitaeten/accounting-case.md`
(Z. 82, 123, 203) · Register `docs/befunde-app.md` (L-211, L-212) ·
`spec-schreiben` §4–§6, `design-guidelines.md` §9.

**Wächter** (Ergebnis ist der Exit-Code): `pnpm typecheck` 0 · `check:when` 0 ·
`check:icons` 0 · `check:contrast` 0 · `check:mirror` 0 · `check:language` 0.
Mit `--test`: `check-language`, `check-when`, `check-icons`, `check-contrast`,
`mirror-filter` je 0. Gegenprobe `check-language --all` (Bericht, kein Tor):
377 Zeilen in 136 Dateien, **keine davon in `CaseEditor.tsx`** — die Datei ist
älter als der Diff, deshalb war der Bericht nötig.

**Gemessen** im Browser über `scripts/cdp.mjs` (Dev-Server 6107, Story-IDs aus
`index.json`, alle zehn Stories angesehen; Aktion und Messung in getrennten
`Runtime.evaluate`-Aufrufen, Enter als echter Tastendruck): 0 Konsolenfehler.

### Je Kriterium

| Kriterium | Nachweis | Urteil |
|---|---|---|
| `typecheck` grün | Exit 0 | erfüllt |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `CaseEditor.tsx` + `CaseEditor.stories.tsx`, Titel `v3/Entitäten/Sachverhalt/CaseEditor` | erfüllt |
| Code englisch, `@when`/`@instead` an jedem Export | `check:when` 0; die drei JSDoc Z. 42–46, 81–85, 190–194; `check-language --all` nennt die Datei nicht | erfüllt |
| Kein Hex, kein px, keine lokale Label-Map, Status nur über Registry | `grep -nE '#[0-9a-f]{3,8}\|[0-9]+px'` findet nichts; `CASE_KIND_LABEL` importiert (Z. 9), Modus und Zuständigkeit über `resolveStatus` (Z. 138, 141, 144, 215, 224) | erfüllt |
| Alle zehn Stories vorhanden, ausgeschlossene Zustände begründet | zehn IDs in `index.json`; Ausschluss „leer" begründet, aber die Begründung trägt nicht → **M9** | teilweise |
| `CaseKindEdit` zeigt genau die sieben Arten aus `CASE_KIND_LABEL` | Story `Kinds`, Optionen gemessen: `incoming_invoice=Eingangsrechnung, outgoing_invoice=Ausgangsrechnung, recurring_charge=Dauersachverhalt, internal_transfer=Umbuchung, expense_report=Auslagen, adjustment_only=Korrektur, contract=Vertrag` — sieben, keine zweite Map in der Datei | erfüllt |
| Die Art trägt keine Farbe und keinen Zustandsstil | `resolveStatus` wird für `kind` nirgends gerufen; keine Achse `kind` in der Registry (Kommentar `case.ts:57–59`: „Kein Status") | erfüllt (Stilmessung vertagt, 0119) |
| Modus bietet je Ausgangswert genau die Ziele der Übergangstabelle, `none` nur mit `allowNone` | Story `Modes`, alle vier Ausgangswerte: von `multiple` `single`+`per_period`, von `per_period` `multiple`+`single`, mit `allowNone` zusätzlich `none`. **Aber** jede Liste führt zusätzlich den eigenen Wert als wählbare Option → **M3** | verfehlt |
| Jede Umstufung öffnet den `ReasonDialog`; ohne Grund bleibt „Umstufen" gesperrt | Story `Roundtrip`: `single → multiple` öffnet den Dialog, Knopf `[disabled]`, mit Grund `[frei]`, gespeichert „Modus → multiple („Sammelzahlung, mehrere Rechnungen.")" | erfüllt |
| Herabstufung auf `single` verlangt zusätzlich die Nummer; ohne Wahl bleibt gesperrt | Story `Downgrade` (zwei Nummern): mit Grund, ohne Nummer `[disabled]`, Enter aus einem Radio lässt den Dialog offen und speichert nichts; mit Nummer `[frei]`, Enter speichert. **Ohne** `documentNumbers` fällt die Sperre ganz weg → **M2** | verfehlt |
| `onSave` des Modus bekommt Modus, Grund und bei Herabstufung die Nummer | Story `Downgrade`: „single · „Nur eine Nummer bleibt gültig." · Nummer RE-4471" | erfüllt |
| `CaseDispositionEdit` bietet `agent` und `accounting`, nicht `client`; `null` lesbar, nicht wählbar | Story `Dispositions`: Optionen `=—`, `agent=Agent`, `accounting=Kanzlei` — `client` fehlt (erfüllt), aber `—` ist wählbar und wird gespeichert → **M4** | verfehlt |
| Lehnt `onSave` ab, bleibt das Feld offen und zeigt den Satz | Story `Failed`: Feld offen, `.v2field__err` „Der Sachverhalt ist gesperrt, solange der Lauf läuft.", Entwurf `contract` erhalten | erfüllt |
| `pending` sperrt das Feld | Story `Pending`: „Bearbeiten" frei, `select.disabled === false`, Enter im offenen Feld speichert und schließt → **M5** | verfehlt |
| Tastatur: Enter speichert, Escape verwirft, im Dialog schließt Escape ohne Änderung | Story `Roundtrip` mit echten Tastendrücken: nach Escape „Art: Eingangsrechnung", Log „nichts"; nach Enter „Art: Vertrag", Log „Art → contract". Im Dialog: Enter aus einem Radio bestätigt nicht, was der Knopf verweigert | erfüllt |
| Ersetzt `CaseSummaryEditor`, `CaseKindEditor`, `CaseDocumentNumberModeEditor` ohne Funktionsverlust (Story `InUse`) | `InUse` zeigt die drei Exporte im `children`-Slot (gemessene Slotbreite 1328 px), aber weder `title` noch `summary` → der Ersatz von `CaseSummaryEditor` ist von keiner Story belegt → **M8** | teilweise |
| Schnittstelle = Spec | Zeichenvergleich Tabelle ↔ Code: drei Abweichungen und eine fehlende Prop → **M1** | verfehlt |

### Mängel

**M1 · Die Spec ist hinter ihrem Code.**
*Kriterium:* Abschnitt „Schnittstelle" (`spec-schreiben` §5: jede Prop mit Typ
und Story). *Ort:* Spec Z. 105–116 gegen `CaseEditor.tsx:34–40, 96–106, 205`.
*Befund:* vier Abweichungen, Zeichen für Zeichen:
1. `documentNumbers` steht als `readonly string[]` (Z. 106), gebaut ist
   `readonly KnownDocumentNumber[]` (Z. 106 der Komponente).
2. `CaseDispositionEdit.onSave` steht als `(next: "agent" | "accounting")`
   (Z. 115), gebaut ist `(next: CaseDispositionWritable)` (Z. 205).
3. Die Typenliste (Z. 85–89) nennt `CASE_KIND`, `CASE_DISPOSITION_WRITABLE` und
   `KnownDocumentNumber` nicht, obwohl die Datei alle drei importiert.
4. Die Prop **`error`** (`Shared`, Z. 39) steht in **keiner** der drei
   Tabellen und hat keine Story.
Die Punkte 1 und 2 hat die Freigabe (b) angeordnet und der Bau umgesetzt — die
Tabelle wurde nie nachgezogen. Wer nur sie liest, bekommt den falschen Typ.
*Kleinster Weg:* die drei Tabellenzeilen und die Typenliste auf den Code
ziehen, `error` als Zeile ergänzen (mit Story, siehe M6/M8).
*Blockiert:* **ja** — die Tabelle ist der Vertrag der Komponente.

**M2 · Die Herabstufung ohne `documentNumbers` wird angeboten und speichert ohne Nummer.**
*Kriterium:* Spec Z. 211 („verlangt **zusätzlich** die Wahl der künftig
gültigen Nummer; ohne Wahl bleibt Bestätigen gesperrt"), `case.ts:102–107`
(„Herabstufen verlangt zusätzlich die Wahl der künftig gültigen Nummer"),
Spec Z. 106 („ohne sie ist die Herabstufung nicht wählbar"), Register L-211
(„ohne sie ist die Herabstufung nicht wählbar").
*Ort:* `CaseEditor.tsx:117–123` — `allowed` filtert nur `none`; der Kommentar
Z. 121–122 („A downgrade without a choice is not offered at all") beschreibt
einen Filter, den es nicht gibt. `needsNumber` (Z. 123) wird `false`, sobald
`documentNumbers` leer ist, und damit fällt auch `confirmDisabled` (Z. 168).
*Befund (gemessen, Story `Roundtrip`, die den Modus ohne `documentNumbers`
führt):* nach `single → multiple` steht der Editor auf `multiple`; die Auswahl
bietet `single` an; der Dialog öffnet sich **ohne** Nummernwahl (`radios: []`);
mit Grund allein ist „Umstufen" `[frei]`; bestätigt wird gespeichert
„Modus → single („Nur noch eine Nummer.")" — eine Herabstufung ohne die
Nummer, die der Kern verlangt. Dieselbe Lage in Story `Modes` (alle acht
Editoren ohne `documentNumbers`).
*Kleinster Weg:* `single` aus `allowed` nehmen, solange
`documentNumbers.length === 0` — dann stimmen Kommentar, Spec und Register
wieder mit dem Code überein.
*Blockiert:* **ja**.

**M3 · Der eigene Wert ist eine wählbare Option und öffnet den Dialog für einen Übergang, den die Tabelle nicht führt.**
*Kriterium:* Spec Z. 209 („genau die Ziele aus
`CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS`") und Z. 165 / Story `Invalid`
(„Ungültige Umstufung … wird gar nicht erst angeboten").
*Ort:* `CaseEditor.tsx:141` — `<option value={value}>` steht vor den erlaubten
Zielen und ist beim Öffnen vorausgewählt.
*Befund (gemessen):* in Story `Invalid` (`value="single"`) sind die Optionen
`single`, `multiple`, `per_period`; `single` ist vorausgewählt. Feld öffnen und
speichern, ohne etwas zu ändern, öffnet den `ReasonDialog` mit der Kickerzeile
„Eine Belegnummer → Eine Belegnummer". In Story `Roundtrip` habe ich denselben
Weg zu Ende gegangen: mit Grund ist „Umstufen" `[frei]`, gespeichert wird
„Modus → single („Nichts ändert sich.")". `single → single` steht in keiner
Zeile der Übergangstabelle (`case.ts:112–115`). Der Prosatext der Story
`Invalid` (Stories Z. 186–190) behauptet das Gegenteil: „Angeboten sind nur
`multiple` und `per_period` — nicht `single` (der eigene Wert)".
*Kleinster Weg:* die aktuelle Anzeige nicht als Option führen, sondern als
`disabled`-Platzhalter, oder in `onSave` von `InlineEdit` verwerfen, was gleich
dem Ausgangswert ist (`if (next === value) return;`).
*Blockiert:* **ja**.

**M4 · `CaseDispositionEdit`: `null` ist wählbar und wird als leerer String gespeichert.**
*Kriterium:* Spec Z. 114 („`null` … ist kein Wert zum Wählen") und Z. 213
(„`null` ist lesbar, aber nicht wählbar").
*Ort:* `CaseEditor.tsx:221` — `{value === null ? <option value="">—</option> : null}`,
dazu die Zusicherung Z. 211 `onSave(next as CaseDispositionWritable)`, die dem
Typprüfer den leeren String verbirgt (der einzige Fall aus `grep '\bas [A-Z]'`,
der nicht bloß den String von `InlineEdit` zurückholt).
*Befund (gemessen, Story `Dispositions`, zweiter Editor mit `value = null`):*
Optionen `=—`, `agent=Agent`, `accounting=Kanzlei`; vorausgewählt ist der leere
Wert. Speichern ohne Wahl schließt das Feld — also lief `onSave("")` durch.
Beim zweiten Öffnen steht in der Liste nur noch `agent` und `accounting`, und
der Select zeigt „Agent", während die Anzeige weiter „—" sagt: der Zustand ist
weder `null` noch ein Wert der Achse `disposition` (`case.ts:132–142`).
*Kleinster Weg:* die Platzhalter-Option `disabled` setzen und in `onSave`
verwerfen, was leer ist.
*Blockiert:* **ja**.

**M5 · `pending` sperrt das Feld nicht — Enter speichert trotzdem.**
*Kriterium:* Spec Z. 215 („`pending` sperrt das Feld"), Z. 163 (Story
`Pending`: „Feld gesperrt"), Hausregel I2 (`design-guidelines.md` §8), die
`ReasonDialog.tsx:55–56` selbst zitiert: „a lock that Enter walks around is
none".
*Ort:* `InlineEdit.tsx:17–27` (`InlineEditInputProps` führt kein `disabled`)
und `InlineEdit.tsx:103–106` (`save()` prüft `running` nicht), sichtbar an den
drei `renderInput`-Aufrufen `CaseEditor.tsx:68–76, 139–148, 216–228`: das
`Select` bekommt nie `disabled`. Im Standardzweig ohne `renderInput` hat
`InlineEdit` die Sperre (`Z. 148 disabled={running}`) — sie fehlt genau den
Aufrufern, die ein eigenes Feld zeichnen, und das sind hier alle drei.
*Befund (gemessen, Story `Pending`):* „Bearbeiten" ist frei, das Feld öffnet
sich, `select.disabled === false`; „Speichere …" und „Abbrechen" sind
`[disabled]`, aber ein echter Enter im Feld speichert und schließt es. Der
Knopf ist gesperrt, die Tastatur nicht.
*Kleinster Weg:* `disabled` in `InlineEditInputProps` aufnehmen und mit
`running` füllen (`{...rest}` reicht es in allen drei Selects schon durch);
zusätzlich `if (running) return;` am Anfang von `save()`.
*Blockiert:* **ja** — solange `pending` läuft, kann derselbe Wert ein zweites
Mal geschrieben werden.

**M6 · `error` wird von `CaseDocumentNumberModeEdit` nie gelesen.**
*Kriterium:* `spec-schreiben` §8 Nr. 5 („eine Prop, die nichts tut, wird nicht
gebaut") und §5 („eine Prop ohne Story-Nachweis ist entweder überflüssig oder
die Story fehlt").
*Ort:* `CaseEditor.tsx:34–40` (`Shared` trägt `error`) gegen Z. 86–93 — die
Destrukturierung nimmt `pending` und `disabled`, nicht `error`. Die beiden
anderen Exporte reichen es an `InlineEdit` weiter (Z. 64, 214).
*Befund:* derselbe Prop-Name verhält sich in einer Familie an einem Export
anders als an den beiden anderen, und nichts sagt es. Ein Aufrufer, der dem
Modus-Editor einen Fehler von außen gibt, sieht ihn nirgends.
*Kleinster Weg:* `error` an `InlineEdit` durchreichen — oder `Shared` teilen
und den Modus-Editor ohne `error` führen.
*Blockiert:* nein.

**M7 · Die Nummernwahl sperrt genau die Nummer, die der Spiegel als kanonisch führt.**
*Kriterium:* `document-number.ts:9–13` (Regel 1, Owner 2026-08-20: „**DATEV
gewinnt.** Kommt eine Nummer aus der DATEV-Wahrheit, ist sie der kanonische
Wert des Vorgangs und unveränderlich (`immutable`); alles andere sind
Kandidaten") und Z. 101–102.
*Ort:* `CaseEditor.tsx:181` — `disabled: d.immutable`.
*Befund:* die Frage des Dialogs lautet „Welche Nummer bleibt gültig?". Gesperrt
wird damit die einzige, die der Spiegel als gesetzt führt; wählbar bleiben nur
die Kandidaten. Steht in der Liste ausschließlich eine DATEV-Nummer — nach der
Auflösung von L-211 speist der Kern die Liste, und `opos_anchor`/`mirror_ref`
sind DATEV-Quellen —, ist kein Radio wählbar, `confirmDisabled` (Z. 168) bleibt
wahr und der Dialog hat keinen Ausgang außer „Abbrechen". Die Regel steht in
der Spec nirgends; `immutable` kommt in 0083 kein einziges Mal vor.
*Kleinster Weg:* `disabled: d.immutable` streichen (und die DATEV-Nummer
stattdessen vorauswählen) — oder die Regel samt Ausweg in die Spec schreiben.
*Blockiert:* **ja**.

**M8 · Story-Deckung je Prop und je Kriterium.**
*Kriterium:* `spec-schreiben` §5 („jede Prop bekommt in der Tabelle die Story,
die sie beweist") und §7 („je Ersatz: ersetzt `<alt>` ohne Funktionsverlust").
*Ort:* `CaseEditor.stories.tsx` gegen Spec Z. 93–116, 163, 217.
*Befund:* drei Lücken. (a) `error` hat keine Story (siehe M1/M6). (b)
`disabled` nennt die Tabelle für `CaseKindEdit` mit Story `Filled`; gemessen
ist in `Filled` nur der **Modus**-Editor gesperrt („Art → Bearbeiten,
Zuständigkeit → Bearbeiten, Belegnummern-Modus → ⟨kein Knopf⟩"). (c) Kriterium
Z. 217 bindet den Ersatz von `CaseSummaryEditor` an Story `InUse` — dort
stehen aber nur die drei Exporte; `title` und `summary` als
`<InlineEdit … multiline />` an der Aufrufstelle, also genau das, was
`CaseSummaryEditor` ablöst, zeigt keine Story. Dazu Z. 163 „Dialog zeigt seinen
Lauf": in `Pending` wird kein Dialog geöffnet.
*Kleinster Weg:* in `Filled` den Art-Editor sperren statt (oder neben) dem
Modus, in `InUse` die zwei `InlineEdit` für Titel und Zusammenfassung
ergänzen, und für `error` entweder eine Story oder die Prop streichen.
*Blockiert:* nein.

**M9 · Die Streichung von „leer" ist begründet, aber die Begründung trägt nicht.**
*Kriterium:* `spec-schreiben` §6 („Untergrenze … Editor zusätzlich lädt und
ungültig", Zustände „gefüllt · leer · … · lädt · Fehler"; jeder ausgeschlossene
mit Grund).
*Ort:* Spec Z. 150–154.
*Befund:* die Spec streicht „leer" mit dem Satz, ein leerer Wert sei „kein
eigener Zustand dieser drei Exporte, sondern von `InlineEdit`". Für Art und
Modus stimmt das (beide NOT NULL, `case.ts:284–286` und Z. 92–98). Für die
Zuständigkeit nicht: `value` ist `CaseDisposition | null` (Z. 203), der leere
Fall hat eine eigene Anzeige („—", Z. 215) und eine eigene Option (Z. 221) —
gemessen in `Dispositions`, zweiter Editor. Der Zustand ist also vorhanden und
gezeigt, nur unter anderem Namen; die Begründung nennt den falschen Grund.
*Kleinster Weg:* einen Satz in Z. 150–154: „leer" liegt in `Dispositions`
(`value = null`), Art und Modus kennen ihn nicht.
*Blockiert:* nein.

**M10 · Die Fixture zeigt als Auswahl zwei bereits entschiedene Nummern.**
*Kriterium:* `document-number.ts:22–27` (`case_decision` = „die ENTSCHIEDENE
Nummer des Sachverhalts … Ein Mensch oder der Agent hat zwischen zwei
Schreibweisen desselben Belegs gewählt und die Wahl begründet") und Z. 107–110.
*Ort:* `CaseEditor.stories.tsx:23–46`.
*Befund:* beide Kandidaten desselben Sachverhalts `c-4412` tragen
`source: "case_decision"`. Die Wahl bei der Herabstufung ist die Wahl **unter
Kandidaten**; `case_decision` ist deren Ergebnis, nicht ihr Ausgangsmaterial.
Die zweite Nummer trägt zudem weder `periodKey` noch `rationale` — die beiden
Felder, die eine Entscheidung ausmachen. Realistisch wären Kandidaten
verschiedener Herkunft (`invoice_number`, `journal_line`, `link`).
*Kleinster Weg:* der zweiten Nummer eine andere `source` geben.
*Blockiert:* nein.

### Was ausdrücklich in Ordnung ist

- **Keine lokale Verschärfung.** `CaseDispositionEdit` nimmt
  `CASE_DISPOSITION_WRITABLE`/`CaseDispositionWritable` aus dem Spiegel
  (`case.ts:141–142`), baut keine eigene Union nach und engt nichts ein, was
  der Spiegel weiter fasst; `value` ist `CaseDisposition | null` wie
  `case-detail.ts:79`. Der Behelf aus L-212 ist damit gegenstandslos — im hier
  gespiegelten Stand trägt `CaseDetail.disposition` bereits den Achsentyp.
  `KnownDocumentNumber` ist ebenfalls importiert, nicht nachgebaut.
- **Kein zweiter Text für denselben Zustand.** Die Wörter für Modus und
  Zuständigkeit kommen ausschließlich aus `resolveStatus`; `CASE_DISPOSITION_LABEL`
  (`case.ts:143–147`) und die Registry-Achse sagen dasselbe („Agent",
  „Kanzlei", „Mandant"), die Komponente führt keine eigene Map.
- **Die Freigabe-Änderung (a) trägt.** `ReasonDialog.confirmDisabled` sperrt
  Knopf **und** Enter; gemessen mit einem echten Enter aus einem Radio heraus
  (nicht aus der Textarea, wo `Dialog.tsx:33` Enter ohnehin nicht bestätigt).

### Gesamturteil

**zurück.** Blockierend sind M1, M2, M3, M4, M5 und M7. Der Kern der Spec —
„jede Umstufung mit Grund, die Herabstufung zusätzlich mit der Nummer, `client`
nie" — hält an der Stelle, an der die Stories ihn zeigen (`Downgrade`), und
fällt überall dort, wo die Vorbedingung fehlt: ohne `documentNumbers` speichert
die Herabstufung ohne Nummer (M2), der eigene Wert ist ein Ziel, das die
Tabelle nicht kennt (M3), und der leere Platzhalter der Zuständigkeit ist
wählbar (M4). Dazu eine Sperre, die die Tastatur umgeht (M5), eine Regel, die
nur im Code steht und die kanonische Nummer ausschließt (M7), und eine
Schnittstellen-Tabelle, die ihren eigenen Code nicht mehr beschreibt (M1).

### Nacharbeit 2026-09-08 (nach der schlanken Abnahme)

Sechs blockierende Punkte, und anders als in der übrigen Welle sind es
diesmal **echte Verhaltensfehler**, nicht nur Abweichungen der Spec. Drei
davon hätten falsche Werte gespeichert.

| Punkt | Was getan |
|---|---|
| **M2** | **Die Herabstufung speicherte ohne Nummer.** `allowed` filterte nur `none`, und `needsNumber` verlangte die Wahl erst, wenn Nummern übergeben waren — ohne sie ging die Umstufung durch, gegen `case.ts:102–107` und L-211. Der Kommentar behauptete den Filter, den es nicht gab. Jetzt filtert `allowed` die Herabstufungen weg, solange keine Nummer dasteht. **Gemessen im Gegentest:** von `multiple` aus fehlt `single` ohne Nummern und steht mit ihnen da |
| **M3** | **Der eigene Wert war wählbar.** Der Platzhalter des Selects ist der aktuelle Modus; ihn zu „speichern" öffnete den Dialog „Eine Belegnummer → Eine Belegnummer" und schrieb einen Übergang, den die Tabelle nicht führt. `onSave` verwirft ihn jetzt |
| **M4** | **`null` war wählbar.** Bei ungesetzter Zuständigkeit stand „—" zur Wahl, und Speichern rief `onSave("")` — ein leerer String an eine Achse, verdeckt von der Zusicherung dahinter. Der Platzhalter ist jetzt `disabled`, und `onSave` verwirft ihn zusätzlich |
| **M5** | **`pending` sperrte das Feld nicht.** Der Fehler saß in `InlineEdit`: der eingebaute `Input` bekam `disabled`, ein eigener `renderInput` nicht — also blieb das Select bedienbar und ein echtes Enter speicherte am Schloss vorbei. `InlineEditInputProps` trägt jetzt `disabled`, und damit jede Komponente, die `renderInput` benutzt |
| **M7** | **Der Dialog sperrte die richtige Antwort.** `disabled: d.immutable` nahm ausgerechnet die Nummer aus der Wahl, die das Register als kanonisch führt („DATEV gewinnt", Regel 1) — bestand die Liste nur aus DATEV-Nummern, hatte der Dialog **keinen Ausgang**. Jetzt gilt: gibt es eine `immutable` Nummer, ist die Frage schon beantwortet; der Dialog sagt „Es bleibt RE-4471 — die Nummer kommt aus DATEV und ist gesetzt" und fragt nicht. Gemessen: null Radios, der Satz steht |
| **M1** | Die Schnittstelle nennt jetzt `readonly KnownDocumentNumber[]` (nicht `string[]`), `CaseDispositionWritable` (nicht die ausgeschriebene Aufzählung), `error` und `value` — alle vier fehlten oder standen falsch, obwohl die Freigabe (b) zwei davon angeordnet hatte |
| **M6/M8/M10** | `error` hat seinen Nachweis (in `Failed`, neben dem abgelehnten `onSave` — zwei Wege zum selben Bild), dass der Modus-Editor ihn **nicht** liest, steht in der Tabelle; die Kandidatenliste hat zwei **verschiedene** Quellen statt zweimal derselben |

**Die Zahl der Stories bleibt bei 10.** Die zwei neuen Fälle sind in
bestehende Stories gezogen — der DATEV-Fall als zweiter Editor in
`Downgrade`, der Fehler von außen als zweites Feld in `Failed`. Zwölf hätten
die Grenze aus §4 gerissen, und beide Male ist der Vergleich innerhalb einer
Story ohnehin die stärkere Aussage.

`pnpm typecheck` und die fünf Wächter auf Exit 0.
