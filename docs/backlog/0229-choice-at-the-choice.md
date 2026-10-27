# 0229 · ChoicePrompt: Feld und Knopf an der Wahl, Empfehlung im Hinweis-Ton

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` (`RadioGroup`) und `patterns/` (`ChoicePrompt`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → ja, eine gewählte Antwort mit ihrem Feld und Knopf ist fachfrei |
| Quelle | Anfrage ll-abnahme 2026-10-27, zwei Wünsche des Owners vom selben Tag, direkt im Chat |
| Ersetzt | nichts; die Darstellung von `ChoicePrompt` in `SourceDocumentReview` und `ClarificationCard` ändert sich ohne neue Prop |
| Blockiert | den nächsten Zeigerhub der App (ll-abnahme) |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

**Wunsch 1.** Der Owner schreibt: „Die Input-Felder (bei Zurück an Agent) und
der Submit-Button sollten direkt bei der Auswahl kommen und nicht darunter,
damit man nicht erst scrollen muss, bis man das Eingabefeld sieht.“ Heute
stehen Feld und „Entscheiden und weiter“ unter der ganzen Liste. Auf
`…/close/documents?view=document` liegen sie bei langer Liste außerhalb des
Sichtbereichs, etwa wenn die Gruppe „Ablegen ohne Buchung“ aufgeklappt ist.

**Wunsch 2.** Der Owner schreibt: „Für die Empfehlung in der Auswahl brauchen
wir eine neue farbliche Markierung — sowohl bei Belege-Vorgehen als auch bei
Antworten von Rückfragen.“ Heute steht das Wort „empfohlen“ klein und grau
hinter der Beschriftung. Auf den ersten Blick fällt es nur auf, solange die
empfohlene Zeile vorgewählt ist.

## Einordnung

- **Wiederverwenden:** `ChoicePrompt` (`@when` A question with two to seven
  suggested answers) und `RadioGroup` tragen beide Fälle. Es fehlt ein Ort
  unter der gewählten Option. Den kann nur `RadioGroup` geben: Nur sie weiß,
  welche Zeile wo steht, und das gilt auch in einer aufgeklappten Gruppe.
- **Erweitert, weil:** `spec-schreiben` §3 Regel 2. Eine Prop an `RadioGroup`
  (`underChecked`). `ChoicePrompt` nutzt sie für alle Aufrufer, ohne neue
  Prop. Zwei Verwendungen gibt es heute schon, `SourceDocumentReview` und den
  Schritt von `ClarificationCard`.
- **Empfehlung:** nur eine andere Form am Bestand. `RadioOption.recommended`
  zeichnet das Wort jetzt als `Badge tone="info"`. Das ist kein neues Token und
  keine neue Stufe: Eine Empfehlung von Ludwig ist ein **Hinweis** (Stufe 3,
  „neutral informierend, keine Handlung“, `design-guidelines.md` §3). Wer was
  entschieden hat: Der Owner hat am 2026-10-27 eine farbliche Markierung
  gewünscht. Die Einordnung als Hinweis ist ein Entscheid des Design-Systems,
  zulässig ohne Rückfrage, weil weder Token noch Stufe neu sind (CLAUDE.md §7)
  und 0214 die Form dem Design-System überlassen hat. llcto hat ihn am
  2026-10-27 für den Owner angenommen. Er kehrt den Nachtrag 0214 vom
  2026-10-24 um („Kein eigener Rahmen, keine eigene Farbe“) und steht so in §3.
- **Zuschnitt:** zwei Dateien, `RadioGroup.tsx` und `ChoicePrompt.tsx`, plus
  CSS. Keine neue Komponente.

## Schnittstelle

Neu an `RadioGroup`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `underChecked` | `ReactNode` | nein | steht direkt unter der gewählten Option; bei `rows` im Rahmen der Zeile; bei einer gewählten Gruppe unter ihren Optionen; ohne Wahl nicht da; nur bei `orientation="vertical"` | `RadioGroup/UnderChecked`, `ChoicePrompt/OptionRows`, `ChoicePrompt/OptionGroup` |

Geändert, ohne neue Prop:

| Stelle | Vorher | Jetzt | Nachweis |
|---|---|---|---|
| `RadioOption.recommended` | „empfohlen“ grau, `--fs-ui-sm`, 400 | „empfohlen“ als `Badge tone="info"` (`--color-accent-700` auf `--color-accent-100`), Zeile so hoch wie ohne | `RadioGroup/Rows`, `ChoicePrompt/OptionRows` |
| `ChoicePrompt`, Block aus Feld, Fehler und Knopf | immer unter der Liste | unter der gewählten Antwort (über `underChecked`), mit ihrem Feld: der `note` ihrer Option oder dem offenen Freitext; unten, wenn nichts gewählt ist oder es keine Optionen gibt | `ChoicePrompt/OptionRows`, `OptionGroup`, `WithFreeText`, `ClarificationCard/Step`, `ClarificationCard/WithRecommendedOption`, `SourceDocumentReview/Filled` |

**Der Freitext wandert mit.** `ChoicePrompt` sendet die gewählte Option und den
Text zusammen (`{ optionId, text }`), und die Stories nutzen den Freitext als
Ergänzung zur Option (`WithFreeText`: „die Option ist die Antwort, der Text die
Begründung“; `InCase`: „Anmerkung“). Das Feld gehört also zur gewählten Antwort
und steht in ihrem Rahmen, wie die `note`. So zeigt der Rahmen, was gesendet
wird, und der Owner-Wunsch gilt auch für die Karte einer Rückfrage mit offenem
Freitext. Ist nichts gewählt, ist der Text die ganze Antwort, und Feld und Knopf
stehen unter der Liste.

Was die Komponente **nicht** kann (bewusst): `optionsNote` (das Warum der
Empfehlung) wandert nicht mit; es bleibt unter der Liste. Ob es in
`SourceDocumentReview` über die Liste gehört, wie in `ClarificationCard`, ist
eine eigene Frage (Ausbau).

## Verhalten

- Wählt der Nutzer eine andere Option, wandert der Block mit. Der Text im Feld
  bleibt erhalten, er liegt im Zustand von `ChoicePrompt`.
- Tab vom gewählten Radio geht direkt in den Block, zuerst ins Feld, dann zum
  Knopf. Die anderen Radios derselben Gruppe überspringt Tab wie bisher.
- `Strg+Enter` wirkt im ganzen Block wie bisher.
- Der eigene Lauf (Klick oder `Strg+Enter`, ohne `pending` des Aufrufers):
  Der Knopf sagt „Sende …“ und ist gesperrt; Wahl und Text halten, Änderungen
  werden ignoriert. Das `<fieldset>` bleibt dabei offen, damit der Fokus am
  Radio oder im Feld bleibt. Ein zweiter Auslöser sendet nicht noch einmal.
- `pending` sperrt das `<fieldset>` und damit auch Feld und Knopf im Block. Der
  Knopf sagt „Sende …“ wie bisher.
- Ein Fehler (`error`) steht im Block, also am Ort der Handlung.
- Bei `rows` setzt der Block den Rahmen der gewählten Zeile fort: oben ohne
  Linie, Grund `--color-accent-50`, Rand `--color-accent`. Bei `list` ist er auf
  die Spalte der Beschriftung eingerückt. Unter einer gewählten Gruppenzeile
  steht er ohne Rahmen an der Kante ihrer Optionen.
- Der Fokus geht nur beim Klick auf „Eigene Antwort schreiben“ ins Feld. Beim
  Wandern wird das Feld neu eingehängt; ein `autoFocus` würde dabei den Fokus
  von den Radios ziehen, deshalb setzt ein Effekt ihn einmal nach dem Klick.
- Der Block liegt im `<fieldset>` der Radios; ein Screenreader nennt Feld und
  Knopf als Teil der Gruppe.
- `orientation="horizontal"` zeigt `underChecked` nicht: zwischen Optionen
  nebeneinander bräche der Block die Zeile. `ChoicePrompt` nutzt nur `vertical`.

## Stories

Neu ist eine Story, `RadioGroup/UnderChecked` (eine Prop, ein Schalter).
`ChoicePrompt` bekommt keine neue Story: Die vorhandenen zeigen den Block an
der Wahl (`Filled`, `OptionRows`, `OptionRowsWithLinks`, `OptionGroup`,
`OptionGroupList`, `WithFreeText` nach einer Wahl) und unten (`FreeTextOnly`,
`Error`, `Pending`, `Blocked`, alle ohne Wahl). Leer und leer nach Filter ändern
sich nicht. **Laden und Fehler** stehen bei gewählter Antwort im Block, am Ort
der Handlung: „Sende …“ und der Fehler-Callout in
`ClarificationCard/StepLoadingAndError` und `SourceDocumentReview/States`.

| Story | Beweist |
|---|---|
| `RadioGroup/UnderChecked` | Notiz und Knopf im Rahmen der gewählten Zeile; der Block folgt der Wahl |
| `RadioGroup/Rows` | Badge „empfohlen“, Zeile so hoch wie die anderen |
| `ChoicePrompt/OptionGroup` | Block unter einer Unteroption der aufgeklappten Gruppe |
| `ChoicePrompt/WithFreeText` | Freitext offen, ohne Wahl unten, nach einer Wahl im Block |
| `SourceDocumentReview/Interactive` | `Strg+Enter` aus dem Block sendet und blättert weiter |
| `ClarificationCard/StepLoadingAndError`, `SourceDocumentReview/States` | Laden und Fehler im Block |
| `SourceDocumentReview/Filled` | im Einsatz: Kommentar an Ludwig und „Entscheiden und weiter“ im Rahmen der empfohlenen Zeile |
| `ClarificationCard/Step`, `WithRecommendedOption` | im Einsatz: Schritt mit Knopf an der Wahl; Karte mit offenem Freitext mit Feld und Knopf im Rahmen der vorgewählten Option (Label „Anmerkung“ ab dem Label-Commit nach 0229) |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| das Warum der Empfehlung an der empfohlenen Zeile statt unter der Liste | `ChoiceOption.why` oder das Callout über der Liste in `SourceDocumentReview` | die Abnahme der Belegseite zeigt, dass das Warum unter einer langen Liste nicht gelesen wird |

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

- [ ] `underChecked`: steht direkt unter der gewählten Option, bei einer gewählten Unteroption unter ihr, bei der gewählten Gruppenzeile unter den Optionen der Gruppe; ohne Wahl gibt es keinen Block (`RadioGroup/UnderChecked`, `ChoicePrompt/OptionGroup`)
- [ ] `rows`: Zeile und Block bilden einen Rahmen, ohne Linie und ohne Lücke dazwischen (`getBoundingClientRect`: Unterkante der Zeile = Oberkante des Blocks) (`RadioGroup/UnderChecked`, `SourceDocumentReview/Filled`)
- [ ] `ChoicePrompt`: Bei gewählter Antwort stehen Feld (`note` oder offener Freitext), Fehler und Knopf im Block. Ohne Wahl und ohne Optionen stehen sie unter der Liste (`OptionRows`, `OptionGroup`, `WithFreeText`, `FreeTextOnly`, `Blocked`)
- [ ] Tab vom gewählten Radio führt zuerst ins Feld des Blocks, dann zum Knopf (`SourceDocumentReview/Filled`); `Strg+Enter` sendet aus dem Block (`SourceDocumentReview/Interactive`)
- [ ] Eigener Lauf: Während er läuft, ändert weder Klick noch Pfeiltaste die Wahl, der Knopf bleibt „Sende …“ und gesperrt, ein zweiter Klick oder `Strg+Enter` ruft `onSubmit` nicht noch einmal; der Fokus bleibt, wo er war; danach ist alles wieder frei (`ChoicePrompt/OptionRows`)
- [ ] Der Fokus bleibt beim Wandern des Blocks am Radio, auch wenn der Freitext per Knopf geöffnet wurde; er geht nur beim Klick auf den Freitext-Knopf ins Feld (`ClarificationCard/Step`: „Eigene Antwort schreiben“, dann Pfeil ab)
- [ ] Wechsel der Option: Der Block wandert, ein getippter Text bleibt im Feld (`ChoicePrompt/OptionNote` mit zwei Optionen, die eine `note` tragen, oder zur Laufzeit gemessen)
- [ ] „empfohlen“ ist ein `info`-Badge; Text ≥ 4,5:1 auf seinem Grund; die Zeile ist so hoch wie eine ohne Badge (`RadioGroup/Rows`, `ChoicePrompt/OptionRows`)
- [ ] Der Entscheid zur Empfehlung steht mit Datum in `design-guidelines.md` §3, und der JSDoc von `RadioOption.recommended` sagt dasselbe
- [ ] Ohne Wahl ist die Darstellung von `ChoicePrompt` unverändert gegenüber HEAD, bis auf das Badge (`Blocked`, `FreeTextOnly`, `Error`, `Pending`, `WithFreeText` vor der Wahl)

## Abnahme

Gemessen mit `scripts/cdp.mjs` in einem Messbrowser, Storybook :6107 bei 1280
und 1440 px. Für den Vergleich mit HEAD wurden ein HEAD-Export und der
Arbeitsbaum je als statisches Storybook gebaut (`storybook build -o …`, außerhalb
des Repos) und die Lage aller Optionszeilen, Felder, Knöpfe und Linkzeilen per
`getBoundingClientRect` verglichen.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. Statt `pnpm build` (leert `storybook-static/`) derselbe Befehl `storybook build` mit eigenem Ausgabeordner auf dem Arbeitsbaum: Exit 0 | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | keine neue Datei; `UnderChecked` in `RadioGroup.stories.tsx`, Titel `v3/Primitives/Formular/RadioGroup` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0 (0 Zeilen), `pnpm check:when` Exit 0; kein neuer Export; Story-Werte (`next`, `duplicate`, `client`, `decision-under`) englisch | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Diff gelesen: kein Hex und kein px in den Bausteinen, px nur in `v3.css`; die Story setzt `maxWidth: 560` wie ihre Nachbarn; keine Label-Map; „empfohlen“ ist kein Status. `pnpm check:type` Exit 0, `pnpm check:contrast` Exit 0, `pnpm check:classes` Exit 1 mit denselben vier Funden wie im HEAD-Export (H5, nicht aus diesem Diff); `--test` der fünf Skripte Exit 0 | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | alle Stories der Tabelle „Stories“ vorhanden. Die Begründung „Laden und Fehler ändern sich nicht“ trifft nicht zu, gemessen in `ClarificationCard/StepLoadingAndError` (M2) | ✗ M2 |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Zeilenhöhe unverändert (Zeile „empfohlen“), Farbe als Stufe mit Wort, Kontrast 4,69:1, Fokusring der Zeile `2px solid` nach innen und vom Block nicht verdeckt, Block ohne Hover (er klickt nicht), Knopf 30,2 bzw. 34 px hoch, Badge `11.5px` = `--fs-ui-xs`, Text links. Vier Linsen: Sprache unverändert; Bedienung gemessen (Tab, Pfeile, `Strg+Enter`), mit einer Regression (M3); Logik: Regel „unten“ falsch beschrieben (M1); Darstellung: ein Rahmen, Hinweis-Ton, falsche Zuschreibung (M4). Fünf Zustände: M2 | ✗ M1–M4 |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle 49 Stories von `RadioGroup`, `ChoicePrompt`, `SourceDocumentReview` und `ClarificationCard` geladen, jede zeigt Inhalt. Konsole leer bis auf Reacts eigene Dev-Zeile „Download the React DevTools“ in jeder Story (H6); auch während der Abläufe in `OptionNote`, `SourceDocumentReview/Interactive` und `ClarificationCard/Step` kein Eintrag | ✓ |
| `underChecked`: direkt unter der gewählten Option, unter einer gewählten Unteroption, bei der gewählten Gruppenzeile unter den Optionen der Gruppe; ohne Wahl kein Block | `RadioGroup/UnderChecked`: Oberkante Block = Unterkante Zeile (247,3 = 247,3), nach Klick auf „In den nächsten Zeitraum“ 108,7 = 108,7. `ChoicePrompt/OptionGroup`: Unteroption „Lohn“ 385,9 = 385,9, „Dauerakte“ 455,2 = 455,2; Gruppenzeile gewählt: Block im Gruppen-`div` nach dem Unter-`fieldset` (532,5 unter 524,5). `OptionNote` am Start und `Blocked`: kein `.v2radiogrp__under`. 1280 und 1440 gleich | ✓ |
| `rows`: Zeile und Block ein Rahmen, ohne Linie und ohne Lücke | `RadioGroup/UnderChecked` 247,3 = 247,3; `SourceDocumentReview/Filled` 356,9 = 356,9, bei 1280 und 1440. Zeile `border-bottom-color` transparent, Block `border-top` 0, beide links `1px` Akzent, Grund `accent-50`; Spalte der Beschriftung 51 = 51 bzw. 676 = 676 | ✓ |
| `ChoicePrompt`: Feld, Fehler und Knopf im Block bei Wahl ohne offenen Freitext; unter der Liste bei offenem Freitext, ohne Wahl, ohne Optionen | im Block: `Filled` (Knopf bei 161,7 statt 278,3, eingerückt 46 = 46), `OptionGroup`, `OptionRowsWithLinks`, `OptionNote`, `OptionGroupList` (68 = 68), `SourceDocumentReview/Filled`; Fehler-Callout im Block in `ClarificationCard/StepLoadingAndError`. Unter der Liste: `WithFreeText` (auch nach Wahl), `OptionRows`, `FreeTextOnly`, `Blocked`, `Error`, `Pending`. Erfüllt, wie das Kriterium es sagt; den Fall „offener Freitext und Option mit `note`“ beschreibt die Spec falsch (M1) | ✓ |
| Tab vom gewählten Radio führt ins Feld, dann zum Knopf; `Strg+Enter` sendet aus dem Block | `SourceDocumentReview/Filled`, 1280 und 1440: Radio → Textarea im Block → nach Eingabe Knopf im Block → Ende der Story; Shift+Tab zurück bis zum Radio. `Strg+Enter` aus der Textarea gemessen in `SourceDocumentReview/Interactive`, weil `Filled` beim Senden nichts zeigt (M2): `fieldset` gesperrt, Textarea gesperrt, Knopf „Sende …“, danach „Beleg 2 von 5“ und Fokus auf der `h2` | ✓ |
| Wechsel der Option: Block wandert, getippter Text bleibt | `ChoicePrompt/OptionNote`: Text unter „Mit Kommentar noch verarbeiten“ getippt → „Beim Mandanten klären“: Block dort, derselbe Text; „Archivieren“: Block ohne Feld; zurück: Text da. Pfeiltasten: Block folgt, Fokus bleibt am Radio; `Strg+Enter` vom Radio sendet | ✓ |
| „empfohlen“ ist ein `info`-Badge, Text ≥ 4,5:1, Zeile so hoch wie ohne | `RadioGroup/Rows`: Klasse `bdg bdg-info`, `rgb(43,111,156)` auf `rgb(227,240,248)` = 4,69:1, gewählt und ungewählt; alle drei Zeilen 40,9 px. `ChoicePrompt/OptionRows` 40,9 / 40,9. Gegen HEAD hat sich in keiner Story mit Badge eine Zeile um mehr als 0,5 px verändert | ✓ |
| Entscheid in §3 mit Datum, JSDoc von `RadioOption.recommended` sagt dasselbe | §3, JSDoc und CSS-Kommentar sagen inhaltlich dasselbe (Hinweis, `info`, keine neue Farbe). Die Einordnung ohne Rückfrage ist zulässig, aber §3 schreibt sie dem Owner zu (M4) | ✓ Inhalt, M4 |
| Ohne Wahl und mit offenem Freitext unverändert gegenüber HEAD, bis auf das Badge | Vergleich HEAD/Arbeitsbaum bei 1280 und 1440: `WithFreeText`, `OptionRows`, `Blocked`, `FreeTextOnly`, `Error`, `Pending`, `InCase`, `OptionNote` und die 16 `ClarificationCard`-Stories außerhalb des Schritts, darunter `WithRecommendedOption`: alle Lagen gleich (Δ ≤ 0,5 px) | ✓ |
| Zusatz: Aufrufer `SourceDocumentReview` und `ClarificationCard` | Verschoben hat sich nur, was die Spec will: Knopf und Feld an der Wahl (`Filled`, `Interactive`, `States`, `PreviewLoading`; Schritt-Stories), die Linkzeile des Schritts 47 px tiefer unter dem Block, die Antwortzone 3 px kürzer, mit Fehler 14 px länger. `WithoutRecommendation`, `Overview` und alle Karten außerhalb des Schritts unverändert | ✓ |
| M1 Mangel der Spec: Regel „unten“ | Probe-Story im Export, nicht im Repo; Code `ChoicePrompt.tsx` | ✗ |
| M2 Mangel der Spec: Nachweise und Zustände | `OptionRows`, `StepLoadingAndError`, `SourceDocumentReview/Filled` | ✗ |
| M3 Regression: Fokus verlässt die Radios | Probe-Story im HEAD- und im Arbeitsbaum-Export | ✗ |
| M4 Zuschreibung der Einordnung | `design-guidelines.md` §3 | ✗ |

Abgenommen von / am: fremde Abnahme (schlanke Abnahme plus Messung der Kriterien), 2026-10-27 · Offene Punkte: M1–M4; H1–H6 nicht blockierend · Nachprüfung 1 (fremd, gemessen), 2026-10-27: M1–M4 behoben, H1–H3 stimmen, die zwei geänderten und das neue Kriterium erfüllt; offen: N1, N2 (neu); H7, H8 nicht blockierend · Nachprüfung 2 (fremd, gemessen), 2026-10-27: N2 im Code behoben, N1 bis auf N3 festgehalten, H7 behoben; offen: N2 in der Spec (Verhaltenssatz und Kriterium fehlen), N3 (neu); H9–H11 nicht blockierend · Nachprüfung 3 (fremd, gemessen), 2026-10-27: N2 in der Spec, N3 und H9 erfüllt, das neue Kriterium „Eigener Lauf“ erfüllt; H12–H14 nicht blockierend

### Mängel

- **M1 · Die Regel „Block bleibt unten“ ist falsch begründet und falsch beschrieben.**
  (a) Die Spec und der Nachtrag in 0028 sagen, der Freitext sei „keine Ergänzung
  zur gewählten Option, sondern eine Antwort neben den Optionen“. Der Code sendet
  aber Option und Text zusammen (`onSubmit({ optionId: answer, text: typed })`),
  und die eigenen Stories nutzen den Freitext genau als Ergänzung: `WithFreeText`
  („die Option ist die Antwort, der Text die Begründung“), `InCase` („Anmerkung:
  Wer war dabei, welcher Anlass?“). (b) Der Satz „unten, … wenn der Freitext
  offen ist“ stimmt nicht mit dem Code: `atChoice` prüft `field !== freeText`.
  Bei offenem Freitext und einer gewählten Option mit `note` steht der Block an
  der Wahl, und das Freitextfeld verschwindet, gemessen an einer Probe-Story.
  (c) Der JSDoc von `ChoiceOption.note` sagt weiter „stands under the options“.
  Nächster Schritt: die Regel so fassen, wie der Code entscheidet („unten,
  solange das Feld der Freitext ist“), mit einer Begründung, die zum Code passt.
  Bleibt der Knopf bei offenem Freitext unter der Liste, ist das ein Teil des
  Owner-Wunsches 1, der unerfüllt bleibt (Karte einer Rückfrage mit bis zu sieben
  Zeilen). Das gehört benannt, oder es geht als Frage an den Owner.
- **M2 · Nachweise und ausgeschlossene Zustände stimmen nicht.** (a) Die Spec führt
  `ChoicePrompt/OptionRows` als Nachweis für `underChecked` und als Story mit
  dem Block an der Wahl. `OptionRows` hat aber einen offenen Freitext, der Block
  steht unten (kein `.v2radiogrp__under`, Knopf bei 267,3 wie in HEAD).
  (b) „Leer, leer nach Filter, Laden und Fehler ändern sich nicht“ trifft für
  Laden und Fehler nicht zu. Ist eine Antwort gewählt, stehen „Sende …“ und der
  Fehler-Callout im Block, gemessen in `ClarificationCard/StepLoadingAndError`
  und `SourceDocumentReview/States`. `ChoicePrompt/Error` und `Pending` zeigen nur
  den Fall ohne Wahl. (c) `Strg+Enter` ist an `SourceDocumentReview/Filled`
  nicht prüfbar, denn `onDecide` tut dort nichts Sichtbares; prüfbar ist es in
  `Interactive`. Nächster Schritt: Nachweise berichtigen und Laden und Fehler im
  Block mit den Stories benennen, die sie zeigen.
- **M3 · Der Fokus springt aus der Radiogruppe ins Freitextfeld.** Ursache:
  Durch den Umzug wird die Textarea neu eingehängt, und `autoFocus` greift erneut.
  Gemessen an einer Probe-Story mit `freeText.toggle` und Optionen mit `note`:
  „Eigene Antwort schreiben“ öffnen, eine Option mit `note` wählen, dann
  Pfeil ab auf eine Option ohne `note`. Danach liegt der Fokus in der Textarea
  „Eigene Antwort“, in HEAD bleibt er am Radio. Der Code-Kommentar verbietet
  genau das („must not take the focus off the radios“). Heute kombiniert kein
  Aufrufer beides, die Schnittstelle erlaubt es. Nächster Schritt: den Fokus nur
  beim Klick auf den Freitext-Knopf setzen, nicht bei jedem Einhängen.
- **M4 · §3 schreibt die Einordnung dem Owner zu.** Dort steht „Owner 2026-10-27
  (0229): Ludwigs Empfehlung in einer Auswahl ist ein Hinweis“. Der Owner hat eine
  farbliche Markierung gewünscht, die Einordnung als Stufe Hinweis hat das
  Design-System getroffen. Die Spec sagt selbst „ohne Rückfrage beim Owner“, und
  0214 hat am 2026-10-24 die Form dem Design-System überlassen. Die Einordnung ist
  zulässig: kein neues Token, keine neue Stufe (CLAUDE.md §7), und eine Empfehlung
  ist „neutral informierend, keine Handlung“ (§3). Den Verweis auf ll-abnahme
  braucht sie nicht, denn ll-abnahme gibt nicht im Namen des Owners frei.
  Nächster Schritt: in §3, im JSDoc und im CSS-Kommentar nennen, wer was entschieden
  hat, wie bei „llcto für den Owner“ in T4. Etwa so: „Owner 2026-10-27: Farbe
  gewünscht; Einordnung als Hinweis: Design-System (0229)“.

### Hinweise

- **H1** `underChecked` mit `orientation="horizontal"`: Der Block wird ein
  Flex-Kind zwischen den Optionen. In einer Probe-Story steht er zwischen „Netto“
  und „Brutto“, und die Zeilen wachsen von 32,9 auf 44,8 px. Kein Aufrufer nutzt
  das. Der JSDoc sollte `vertical` verlangen.
- **H2** In `rows` mit gewählter Gruppenzeile steht der Block ohne Rahmen. Sein
  Inhalt beginnt bei x = 46, die Beschriftung der Gruppenzeile bei 51, die
  Unterzeilen bei 38 und ihre Beschriftung bei 73 (`ChoicePrompt/OptionGroup`).
  Er fluchtet also mit nichts. Die Spec regelt nur den Rahmen in `rows` und die
  Einrückung in `list`.
- **H3** Feld und Knopf liegen jetzt im `<fieldset>` der Radios, bei einer
  Unteroption in dem der Gruppe. Ein Screenreader nennt sie als Teil der Gruppe
  „Entscheidung“ bzw. „Antwortoptionen“. Das ist zulässig, ein Satz im JSDoc
  von `underChecked` wäre hilfreich.
- **H4** „empfohlen“ ist als `Badge` eine Pille (`border-radius: 999px`).
  CLAUDE.md §2 sagt „Pill nur Status-Badge“, und „empfohlen“ ist kein Status. Das
  gilt für jeden `Badge` und ist eine Frage an den Baustein, nicht an diesen Diff.
- **H5** `pnpm check:classes` endet mit Exit 1 wegen `v3clt__step`, `v3clt`,
  `v2tbl__foot` und `cy-page`. Ein HEAD-Export liefert dieselben vier Funde, sie
  kommen also nicht aus diesem Diff.
- **H6** Die einzige Konsolenzeile ist Reacts Dev-Hinweis auf die DevTools. Er
  erscheint in jeder Story des Dev-Servers und kommt nicht aus den Stories.

### Messung des Bauenden (keine Abnahme)

`scripts/cdp.mjs`, Storybook :6107, 1280 px:

- `SourceDocumentReview/Filled`: „Mit Kommentar noch verarbeiten“ ist vorgewählt. Der Block steht im Rahmen dieser Zeile, mit „Kommentar an Ludwig *“ und dem Knopf. Der Knopf steht bei y = 467 statt unter fünf Zeilen.
- Tab vom gewählten Radio: zuerst die Textarea im Block. Der Knopf ist gesperrt, solange der Pflichtkommentar fehlt, und wird übersprungen wie bisher.
- Pfeil ab: Die Wahl geht auf „In den nächsten Zeitraum“, der Block wandert mit, und Tab führt zum Knopf im Block.
- Zeilenhöhe in `ChoicePrompt/OptionRows`: „Bewirtung (4650)“ 41 px, „Reisekosten (4670) empfohlen“ 41 px.
- Kontrast des Badge: `--color-accent-700` auf `--color-accent-100` 4,69:1.
- `ClarificationCard/WithRecommendedOption` (Freitext offen): Der Block steht unten wie bisher.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | Die Regel ist neu gefasst, nicht nur ihre Beschreibung: Der Freitext wandert mit in den Block, wie die `note`, denn er geht mit der gewählten Option auf den Weg. Code `ChoicePrompt.tsx` (`atChoice` ohne Ausnahme), Spec (Schnittstelle, „Der Freitext wandert mit“), Nachtrag 0028. Damit ist der Owner-Wunsch auch für die Karte mit offenem Freitext erfüllt. JSDoc von `ChoiceOption.note`: „stands under it (0229)“ |
| M2 | Nachweise berichtigt: `Strg+Enter` in `SourceDocumentReview/Interactive`; `OptionRows` zeigt den Block jetzt an der Wahl (Folge von M1). Laden und Fehler im Block sind mit `ClarificationCard/StepLoadingAndError` und `SourceDocumentReview/States` benannt |
| M3 | `autoFocus` entfernt; der Fokus geht über einen Effekt einmal nach dem Klick auf den Freitext-Knopf ins Feld. Gemessen in `ClarificationCard/Step`: Knopf → Fokus in der Textarea; Radio, Pfeil ab, Pfeil ab → Fokus bleibt am Radio, der Block wandert mit dem Feld |
| M4 | §3, JSDoc von `RadioOption.recommended` und CSS-Kommentar nennen: Owner wünscht Farbe, Einordnung als Hinweis durch das Design-System, angenommen von llcto für den Owner. Der Verweis auf ll-abnahme ist gestrichen |
| H1 | `underChecked` wirkt nur bei `orientation="vertical"`, im Code und im JSDoc |
| H2 | Unter einer gewählten Gruppenzeile steht der Block an der Kante der Unteroptionen (gemessen: Block 38, Unterzeilen 38) |
| H3 | Ein Satz im JSDoc von `underChecked`: Der Block liegt im `<fieldset>` |
| H4 | bleibt: Die Pille gilt für jeden `Badge`; eine Frage an den Baustein, nicht an 0229 |
| H5, H6 | bleiben, nicht aus diesem Diff |

Zwei Kriterien hat der Spec-Autor mit M1 angepasst, weil sich die Regel
geändert hat, nicht weil sie unprüfbar waren: „Block an der Wahl“ (jetzt mit
offenem Freitext) und „unverändert gegenüber HEAD“ (jetzt nur ohne Wahl). Ein
Kriterium zum Fokus ist dazugekommen (M3).

## Nachprüfung 1 (2026-10-27)

Fremde Nachprüfung, gemessen mit `scripts/cdp.mjs` in einem Messbrowser bei 1280
und 1440 px: Storybook :6107 für den Arbeitsbaum, für HEAD der statische Export
der ersten Abnahme (ohne `v2radiogrp__under`), außerhalb des Repos. Laufzeit-Proben
wurden in die Story-Seite des Dev-Servers über den Modul-Import von Vite
eingehängt. Dafür liegt keine Datei im Repo. Kein Build (Auftrag).

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 Regel „unten“ | Code: `atChoice` prüft nur noch, ob die Wahl eine gezeigte Option ist. Spec („Der Freitext wandert mit“), Nachtrag 0028 und JSDoc von `ChoiceOption.note` („stands under it (0229)“) sagen dasselbe wie der Code, der `{ optionId, text }` sendet. `ChoicePrompt/OptionRows`: „Oder selbst formulieren“ und Knopf im Block, Block 137,2 = Zeile 137,2. `WithFreeText`: ohne Wahl unten (Knopf 427,4); nach „Reisekosten“ mit „Anmerkung“ im Block, der Text bleibt beim Wechsel auf „Bürobedarf“, gesendet „buero · Geschäftsessen mit Kunde Nord“. Probe mit geöffnetem Freitext und einer Option mit `note`: Die `note` gewinnt, wie im Code von HEAD | ✓ (a)–(c) behoben; die neue Regel widerspricht aber den Wörtern der Aufrufer (N1) |
| M2 Nachweise und Zustände | (a) `OptionRows` zeigt den Block jetzt (Folge von M1). (b) Abschnitt „Stories“ nennt Laden und Fehler im Block. `ClarificationCard/StepLoadingAndError`: erste Karte „Sende …“ gesperrt im Block, `<fieldset>` gesperrt; zweite Karte `v2note--danger` im Block. `SourceDocumentReview/States` ebenso, die Textarea im Block ist gesperrt bzw. frei. `ClarificationCard/ErrorState`: Callout im Block. (c) Das Kriterium nennt `Interactive` für `Strg+Enter` | ✓ |
| M3 Fokus | Code: kein `autoFocus`; der Effekt hängt an `focusText`, das nur der `onClick` des Freitext-Knopfs setzt. `ClarificationCard/Step`: Klick auf „Eigene Antwort schreiben“ → Fokus in der Textarea „Eigene Antwort“ im Block, im Sichtbereich. Dann Radio, Pfeil ab, Pfeil ab, Pfeil auf → der Fokus bleibt jedes Mal am Radio, der Block wandert mit dem Feld. Tab vom Radio → Textarea → Knopf. Probe mit dem Fall der ersten Abnahme (`toggle` und Optionen mit `note`): Knopf → Textarea; Option mit `note` → Radio; Pfeil ab auf eine Option ohne `note` → Radio, Block mit „Eigene Antwort“; Pfeil ab auf eine `note` → Radio | ✓ |
| M4 Zuschreibung | §3 und JSDoc von `RadioOption.recommended`: Der Owner wünscht Farbe, das Design-System ordnet als Hinweis ein, die Einordnung ist für den Owner angenommen. Kein Verweis auf ll-abnahme mehr. Der CSS-Kommentar an `.v2radioline__rec` nennt Owner und Design-System, die Annahme nicht (H7) | ✓ |
| H1 | Code: `under` nur bei `orientation === "vertical"`, der JSDoc sagt es. Probe `orientation="horizontal"` mit `underChecked`: kein Block, kein Knopf, Zeilen 32,9 px wie ohne die Prop | ✓ |
| H2 | `ChoicePrompt/OptionGroup`, Gruppenzeile gewählt: Block ohne Rahmen nach dem Unter-`fieldset` (532,5 unter 524,5), Inhalt bei 38 = Kante der Unterzeilen 38. In `list` (`OptionGroupList`): Inhalt 46 = Beschriftung der Gruppenzeile 46 = Radio der Unterzeilen | ✓ |
| H3 | JSDoc von `underChecked`: „sits inside the group's `<fieldset>`, so a screen reader names it as part of the group“ | ✓ |
| Kriterium (geändert): Feld, Fehler und Knopf im Block, mit offenem Freitext | Code: `tail` aus Feld, Fehler und Knopf, `underChecked={atChoice ? tail : undefined}`, sonst nach den Links. Im Block: `OptionRows`, `OptionGroup` (Lohn 385,9 = 385,9), `WithFreeText` nach der Wahl, Fehler wie unter M2. Unten: `FreeTextOnly`, `Blocked`, `WithFreeText` vor der Wahl | ✓ |
| Kriterium (geändert): ohne Wahl unverändert gegenüber HEAD | Code: ohne Wahl steht `tail` an derselben Stelle wie in HEAD. HEAD-Export gegen Dev-Server, Lage aller Optionszeilen, Felder, Knöpfe, Links und Callouts: `Blocked`, `FreeTextOnly`, `Error`, `Pending`, `WithFreeText`, dazu `InCase`, `OptionNote`, `SourceDocumentReview/WithoutRecommendation` und die sieben `RadioGroup`-Stories außer `UnderChecked` ohne Abweichung über 0,5 px | ✓ |
| Kriterium (neu): Fokus bleibt beim Wandern am Radio | wie M3 | ✓ |
| übrige Kriterien | `RadioGroup/UnderChecked`: 247,3 = 247,3, nach dem Wechsel 108,7 = 108,7, Kanten 16/576 gleich, oben kein Rand, unten an der Zeile transparent. `SourceDocumentReview/Filled`: 356,9 = 356,9, Tab Radio → Textarea → Knopf, Shift+Tab zurück. `Interactive`: `Strg+Enter` aus der Textarea im Block sperrt `<fieldset>` und Textarea, „Sende …“, danach „Beleg 2 von 5“, Fokus auf der `h2`. `OptionNote`: Text bleibt über drei Wechsel. Badge `bdg-info` 4,69:1, alle Zeilen 40,9 px | ✓ |
| Wächter | `pnpm typecheck`, `check:when`, `check:language`, `check:type`, `check:contrast` Exit 0. Die vier ungeprüften Kontrastangaben liegen außerhalb des Diffs. `pnpm build` nicht gelaufen (Auftrag) | ✓ |
| Browser | alle 49 Stories der vier Familien auf :6107 geladen, jede zeigt Inhalt; Konsole leer bis auf Reacts DevTools-Zeile (H6) | ✓ |
| Aufrufer | HEAD gegen Arbeitsbaum. `SourceDocumentReview` (`Filled`, `Interactive`, `States`, `PreviewLoading`): Feld und Knopf von 844 auf 467 (`Filled`), die Zeilen darunter 157 px tiefer. `ClarificationCard`: in jeder Karte mit Optionen steht der Block an der vorgewählten Option, die Linkzeile des Schritts 47 px tiefer. Unverändert: `WithoutRecommendation`, `Overview`, `AtCaseFreeText`, `StepFreeText` und die Lesekarten. Die Lage stimmt mit der Spec, die Wörter nicht | ✗ N1 |
| N1 neu: Wort und Rahmen widersprechen sich | unten | ✗ |
| N2 neu: der Knopf verliert seinen Lauf | unten | ✗ |

### Neue Mängel

- **N1 · Die Aufrufer beschriften den Freitext als Antwort statt der Option, der Rahmen zeigt ihn als Teil der Option.**
  Die neue Regel passt zum Code, der `{ optionId, text }` sendet, und zu den
  Stories mit „Anmerkung“ (`WithFreeText`, `InCase`). `ClarificationCard`
  beschriftet den Freitext aber als eigene Antwort: in der Karte „Oder selbst
  formulieren“, im Schritt „Eigene Antwort schreiben“ und dann „Eigene Antwort“.
  `ChoicePrompt/OptionRows` und `OptionRowsWithLinks` tun dasselbe. Gemessen:
  In `ClarificationCard/WithRecommendedOption` steht „Oder selbst formulieren“ im
  Rahmen von „Reisekosten (4670) empfohlen“. In `ClarificationCard/Step` öffnet
  „Eigene Antwort schreiben“ das Feld „Eigene Antwort“ im Rahmen der
  vorgewählten Option. Wer eine eigene Antwort geben will, schreibt sie also in
  den Rahmen einer Option, die Ludwig vorgewählt hat, und sie geht mit dieser
  Option hinaus. Gesendet wurde schon in HEAD so. Neu ist, dass Wort und Rahmen
  sich jetzt sichtbar widersprechen. S13 (`docs/ludwig/web-ui.md`: „vorgelegte
  Antworten sind ein Angebot, kein Menü“) und I6 („Freitext immer zusätzlich“)
  lassen beide Lesarten zu. Die Kommentare in `ClarificationCard.tsx` („the free
  text always beside them“) und an `OptionRows` („the free text beside the
  options“) folgen der alten Lesart. Nächster Schritt: Ob der Freitext einer
  Klärung eine Ergänzung zur Option oder eine eigene Antwort ist, ändert eine
  Regel und geht an den Owner (CLAUDE.md §7). Ist er eine Ergänzung, brauchen
  Karte und Schritt neue Beschriftungen, und auch die gehen an den Owner. Ist er
  eine eigene Antwort, bleibt der Block bei offenem Freitext unten, oder der Text
  geht ohne Option hinaus (Code). Bis zur Antwort steht die Annahme in der Spec.
- **N2 · Der Knopf verliert „Sende …“ und seine Sperre, wenn die Wahl während seines Laufs wechselt.**
  Ursache: Der Block wird bei jedem Wechsel neu eingehängt, `ActionButton` mit
  ihm. Damit geht sein eigener Lauf verloren („two clicks, one action“). Ohne
  `pending` vom Aufrufer bleiben die Radios während des Laufs frei. Gemessen in
  `ChoicePrompt/OptionRows` (Lauf 600 ms): Klick auf „Antwort speichern“, nach
  60 ms Wechsel auf „Bewirtung (4650)“. In HEAD bleibt „Sende …“ gesperrt stehen,
  im Arbeitsbaum steht „Antwort speichern“ wieder frei. In einer Probe mit 3 s
  Lauf führt ein zweiter Klick zu zwei `onSubmit`-Aufrufen (`b`, dann `a`),
  während der erste noch läuft. Laut Code verschwindet ebenso ein Fehlertext
  von `ActionButton` (`v2act__err`). Betroffen sind Aufrufer ohne
  `pending`, darunter die Stories `Filled`, `OptionRows` und `WithFreeText`.
  `SourceDocumentReview` und `ClarificationCard` reichen `pending` durch, und wenn
  es gesetzt ist, sperrt es das `<fieldset>`. Nächster Schritt: den Lauf in
  `ChoicePrompt` halten und die Radios währenddessen sperren, oder den Knopf beim
  Wandern nicht neu einhängen. Dazu ein Kriterium in der Spec.

### Hinweise

- **H7** Der CSS-Kommentar an `.v2radioline__rec` nennt Owner und
  Design-System. Dass die Einordnung für den Owner angenommen ist, steht dort
  nicht, anders als die Nachbesserung zu M4 sagt. Nicht blockierend.
- **H8** Der Rand der Textarea (`--color-border-strong`) erreicht auf dem Grund
  des Blocks 1,50:1, auf Weiß 1,62:1. Die weiße Fläche hebt sich mit 1,08:1 vom
  `accent-50` ab. Der Wert kommt aus dem Token, nicht aus diesem Diff, und sinkt
  im Block nur leicht. Das ist eine Frage an das Token.
- H4–H6 bleiben wie in der ersten Abnahme.

## Nachbesserung 2 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| N1 | Die Regel „der Freitext ist eine Ergänzung zur gewählten Option und steht in ihrem Rahmen“ hat llcto am 2026-10-27 für den Owner angenommen (nach Nachbesserung 1). Die Wörter folgen ihr: Das Label der Karte außerhalb des Schritts, „Oder selbst formulieren“ in `ClarificationCard.tsx`, wird „Anmerkung“. Das hat llcto für den Owner entschieden, ohne „(optional)“, weil das Set nur Pflichtfelder markiert (I8). Es kommt als eigener Commit direkt nach 0229, zusammen mit den Stories `OptionRows` und `OptionRowsWithLinks`. Offen und an llcto gestellt: die Wörter im Schritt, „Eigene Antwort schreiben“ und „Eigene Antwort“. Bis zur Antwort bleiben sie |
| N2 | `ChoicePrompt` führt seinen eigenen Lauf neben `pending` (`sending`, zusammen `busy`). Solange er läuft, sind die Radios gesperrt. Die Wahl kann also nicht wechseln, der Knopf wird nicht neu eingehängt und behält „Sende …“ und seine Sperre. `Strg+Enter` läuft über denselben Weg. Gemessen in `ChoicePrompt/OptionRows`: Knopf geklickt, Klick auf „Bewirtung“ während des Laufs → Wahl bleibt „Reisekosten“, Knopf „Sende …“ gesperrt, `fieldset` gesperrt; nach dem Lauf alles wieder frei |
| H7 | Der CSS-Kommentar an `.v2radioline__rec` nennt jetzt auch die Annahme durch llcto für den Owner |
| H8 | bleibt: Der Rand der Textarea ist eine Frage an das Token `--color-border-strong`, nicht an 0229 |

## Nachprüfung 2 (2026-10-27)

Fremde Nachprüfung, nur N1, N2 und H7. Gemessen mit `scripts/cdp.mjs` in einem
Messbrowser, Storybook :6107, 1280 px. Der Dev-Server liefert den Arbeitsbaum
(`setSending` im ausgelieferten `ChoicePrompt.tsx`). Die Aufrufe von `onSubmit`
sind über die Timer der Story gezählt: `wait(600)` bzw. `wait(4000)`,
`setTimeout` dafür in der Seite umwickelt. Für „`onSubmit` wirft“ gibt es keine
Story. Zwei Proben wurden deshalb über den Modul-Import von Vite in die Seite
von `OptionRows` eingehängt. Die erste lehnt nach 400 ms ab, die zweite wirft
sofort. Dafür liegt keine Datei im Repo. Kein Build (Auftrag).

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| N1 Annahme der Regel | Nachbesserung 2: „der Freitext ist eine Ergänzung zur gewählten Option und steht in ihrem Rahmen“, von llcto am 2026-10-27 für den Owner angenommen. Schnittstelle („Der Freitext wandert mit“) und Nachtrag 0028 sagen dasselbe wie der Code (`{ optionId, text }`, `atChoice` ohne Ausnahme) | ✓ |
| N1 Label „Anmerkung“ als eigener Commit | Festgehalten sind Wort, Ort und Entscheider: die Karte außerhalb des Schritts in `ClarificationCard.tsx`, heute „Oder selbst formulieren“ (Zeile 1122), llcto für den Owner. Auch der Grund, warum „(optional)“ fehlt, steht da (I8). Der Commit ist nicht Teil des Diffs: `ClarificationCard.tsx` ist laut `git status` unverändert, wie angekündigt. Sein Umfang nennt aber `OptionRowsWithLinks`, und diese Story trägt die Wörter des Schritts („Eigene Antwort“, „Eigene Antwort schreiben“, wie `ClarificationCard.tsx` Zeile 1121). Diese Wörter sollen bis zur Antwort bleiben | ✗ N3 |
| N1 offene Frage | die Wörter im Schritt, an llcto gestellt, mit dem Stand „bleiben bis zur Antwort“ (CLAUDE.md §7) | ✓ |
| N2 Code | `sending` neben `pending`, zusammen `busy`. `busy` sperrt `RadioGroup`, Textarea, Freitext-Knopf und `ActionButton` und unterdrückt `why`. Klick (`action={run}`) und `Strg+Enter` (`send()` → `run()`) laufen über dasselbe `run`, `send` bricht bei `busy` ab. `finally` gibt `sending` auch beim Wurf frei. Ein Wurf läuft über `run` weiter an `ActionButton`, und der zeigt ihn (`v2act__err`). Der Hotkey von `ActionButton` („Strg+Enter“) trifft über `matchesKey` nie, es gibt also nur den einen Weg | ✓ |
| N2 Klick während des Laufs | `ChoicePrompt/OptionRows`: Knopf geklickt, nach 54 ms „Sende …“, Knopf gesperrt, `aria-busy`, `<fieldset>`, Radios und Textarea gesperrt. Klick auf „Bewirtung (4650)“ bei 103 ms: Die Wahl bleibt „Reisekosten (4670)“, der Block steht weiter dort | ✓ |
| N2 Pfeiltaste während des Laufs | `OptionRows`: (a) Klick auf den Knopf, dann Pfeil ab und Pfeil auf. (b) Fokus am gewählten Radio, Knopf per `click()`, Fokus also nicht verschoben, dann Pfeil auf und Pfeil ab. Beide Male bleibt die Wahl „Reisekosten“ | ✓ |
| N2 `Strg+Enter` | `OptionRows`, aus dem Radio und aus der Textarea: gesperrt wie beim Klick, Knopf „Sende …“. Pfeil auf, Klick auf „Bewirtung“, zweites `Strg+Enter` und Klick auf den Knopf ändern nichts. Der getippte Text bleibt | ✓ |
| N2 kein zweites `onSubmit` | Klick, Klick auf eine Option, zweiter Klick (Maus bei 154 ms, ebenso per `click()`) und `Strg+Enter` mit Nachklick: je genau ein `setTimeout(…, 600)`. Probe 1 zählt nach Klick, Optionsklick und zweitem Klick einen Aufruf (`b`) | ✓ |
| N2 nach dem Lauf frei | `OptionRows` bei 902 ms nach jedem Weg: Radios, `<fieldset>` und Textarea frei, Knopf „Antwort speichern“ frei. Klick auf „Bewirtung“ bzw. Pfeil auf wechselt, und der Block wandert | ✓ |
| N2 `pending` von außen | `ChoicePrompt/Pending`: `<fieldset>` und alle drei Radios gesperrt, Knopf „Sende …“ gesperrt. Ein Klick auf die erste Option wählt nichts. `Strg+Enter` und ein Klick auf den Knopf: kein `setTimeout(…, 4000)`, also kein `onSubmit` | ✓ |
| N2 `onSubmit` wirft | Probe 1 (Ablehnung nach 400 ms): während des Laufs gesperrt, danach alles frei, „Probe: Speichern fehlgeschlagen.“ am Knopf. Dasselbe über `Strg+Enter`: danach frei, aber ohne Fehlertext (H10). Probe 2 (Wurf sofort): nach dem Klick frei, Fehlertext am Knopf; nach `Strg+Enter` frei. Gesperrt bleibt in keinem Fall etwas | ✓ |
| N2 in der Spec | Der nächste Schritt von N2 verlangt ein Kriterium. Es fehlt in „Abnahmekriterien“. „Verhalten“ nennt nur „`pending` sperrt das `<fieldset>`“, nicht den eigenen Lauf, der jetzt auch bei Aufrufern ohne `pending` die Radios sperrt. Nur Nachbesserung 2 beschreibt ihn | ✗ |
| H7 | CSS-Kommentar an `.v2radioline__rec`: „accepted by llcto for the owner“ | ✓ |
| Wächter | `pnpm typecheck` Exit 0. Konsole der Stories in A bis D ohne Fehler und Warnungen; die zwei Ausnahmen kommen aus den Proben (H10) | ✓ |

### Neue Mängel und offene Reste

- **N2, Rest · Verhalten und Kriterium fehlen.** Der Code ist behoben, aber die
  Spec sagt nicht, dass der eigene Lauf die Radios sperrt. Nächster Schritt: ein
  Satz unter „Verhalten“ und ein Kriterium, etwa „Während des Laufs, auch ohne
  `pending`, ist die Wahl gesperrt, der Knopf bleibt ‚Sende …‘, ein zweiter Klick
  oder `Strg+Enter` sendet nicht, nach dem Lauf und nach einem Wurf ist alles
  frei (`ChoicePrompt/OptionRows`)“.
- **N3 · Der angekündigte Label-Commit nennt eine Story mit den offenen Wörtern des Schritts.**
  `OptionRowsWithLinks` spiegelt den Schritt, nicht die Karte, und dessen Wörter
  bleiben bis zur Antwort. Nächster Schritt: die Story aus dem Label-Commit
  nehmen und der offenen Frage zuordnen, oder sagen, was sich an ihr ändert.
  Derselbe Commit muss auch die Zeile `WithRecommendedOption` unter „Stories“
  nachziehen, die „Oder selbst formulieren“ nennt.

### Hinweise

- **H9** Nach `Strg+Enter` aus Radio oder Textarea fällt der Fokus auf `body`,
  sobald der eigene Lauf sperrt, und bleibt dort, gemessen in `OptionRows`. In
  HEAD blieben Radios und Feld bei Aufrufern ohne `pending` laut Code frei, und
  der Fokus blieb am Ort. Mit `pending` war es schon so; die Aufrufer der App
  reichen `pending` durch, `SourceDocumentReview` setzt den Fokus danach selbst.
  Nicht blockierend. Abhilfe wäre, den Fokus nach dem Lauf zurückzugeben (V10),
  wie `ActionButton.close()` es tut.
- **H10** Wirft `onSubmit` nach `Strg+Enter`, steht am Knopf kein Fehlertext, und
  die Konsole meldet eine unbehandelte Ablehnung. Nach einem Klick zeigt
  `ActionButton` den Text. In HEAD war es genauso (`void onSubmit(…)`), es kommt
  also nicht aus diesem Diff. Gesperrt bleibt nichts.
- **H11** Der Fehlertext von `ActionButton` verschwindet, wenn nach dem Lauf eine
  andere Option gewählt wird, weil der Block neu eingehängt wird. Als neue Eingabe
  ist das vertretbar, so hält es `ActionButton` auch bei `ask`. Ein `error` des
  Aufrufers bleibt stehen.

## Nachbesserung 3 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| N2 in der Spec | „Verhalten“ beschreibt den eigenen Lauf; ein Kriterium dazu steht in „Abnahmekriterien“ (vom Spec-Autor ergänzt, wie N2 verlangt) |
| N3 | Die Frage zu den Wörtern im Schritt ist entschieden: llcto für den Owner, 2026-10-27, „Anmerkung schreiben“ und das Feld „Anmerkung“, denn gesendet wird eine Ergänzung zur gewählten Option. Der Label-Commit nach 0229 zieht deshalb beide Stellen in `ClarificationCard.tsx` nach (Karte und Schritt) und mit ihnen die Stories `OptionRows` und `OptionRowsWithLinks` und die Zeile „Stories“ dieser Spec. `OptionRowsWithLinks` passt damit zu seinem Umfang |
| H9 | Der eigene Lauf sperrt das `<fieldset>` nicht mehr, sondern ignoriert Änderungen: `onChange` der Radios setzt die Wahl nicht, solange er läuft, und die Textarea ist `readOnly`. Gesperrt bleibt nur der Knopf. Gemessen in `ChoicePrompt/OptionRows`: `Strg+Enter` vom Radio → „Sende …“, Fokus am Radio, Pfeil auf ändert nichts; `Strg+Enter` aus der Textarea → Fokus in der Textarea; Klick auf „Bewirtung“ während des Laufs → Wahl bleibt „Reisekosten“; danach alles frei. `pending` von außen sperrt das `<fieldset>` wie bisher |
| H10 | bleibt: Wirft `onSubmit` nach `Strg+Enter`, steht kein Fehlertext am Knopf. Das war vor 0229 schon so; der Aufrufer zeigt Fehler über `error` |
| H11 | bleibt: Der Fehlertext von `ActionButton` verschwindet bei einer neuen Wahl; eine neue Eingabe darf ihn räumen |

## Nachprüfung 3 (2026-10-27)

Fremde Nachprüfung, nur N2 in der Spec, N3 und die Code-Änderung zu H9. Gemessen
mit `scripts/cdp.mjs` in einem Messbrowser, Storybook :6107, 1280 px. Der
Dev-Server liefert den Arbeitsbaum (`readOnly: sending` und `if (!sending)
setChoice` im ausgelieferten `ChoicePrompt.tsx`). Die Aufrufe von `onSubmit`
sind über die Timer der Story gezählt (`setTimeout` in der Seite umwickelt,
gezählt `wait(600)` bzw. `wait(4000)`). Ein `requestAnimationFrame`-Takt hat in
jedem Bild Wahl, gezeichnete Wahl (die Zeile mit `:has(input:checked)`, fett),
Ort des Blocks, Knopf, Textarea und Fokus mitgeschrieben. Tasten über
`Input.dispatchKeyEvent`, `Strg+Enter` mit `modifiers: 2`. Kein Build (Auftrag).

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| N2 in der Spec: „Verhalten“ | Der Satz zum eigenen Lauf sagt, was der Code tut: Knopf „Sende …“ und gesperrt (`disabled={blocked \|\| busy}`, Label `busy ? "Sende …"`), Wahl und Text halten (`onChange` setzt nichts, solange `sending`; Textarea `readOnly={sending}`), `<fieldset>` offen (`disabled={pending}`), kein zweiter Auslöser (`send()` bricht bei `busy` ab, `ActionButton` ist gesperrt). Der Satz zu `pending` steht daneben und stimmt weiter | ✓ |
| N2 in der Spec: Kriterium „Eigener Lauf“ | steht unter „Abnahmekriterien“, vom Spec-Autor ergänzt, mit Story `ChoicePrompt/OptionRows`. Den Fall „nach einem Wurf frei“ aus dem Vorschlag von Nachprüfung 2 nennt es nicht; der Code gibt `sending` im `finally` frei, gemessen in Nachprüfung 2 | ✓ |
| Kriterium „Eigener Lauf“: `Strg+Enter` vom Radio | `OptionRows`, Fokus am gewählten Radio „Reisekosten (4670)“. Nach `Strg+Enter`: „Sende …“ gesperrt nach 16 ms, Textarea `readOnly`, `<fieldset>` und Radios frei, Fokus am Radio. Ohne weitere Eingabe bleibt der Fokus nach dem Lauf am Radio | ✓ |
| Kriterium „Eigener Lauf“: `Strg+Enter` aus der Textarea | `OptionRows`, „Geschäftsessen“ getippt, `Strg+Enter`: Fokus in der Textarea während und nach dem Lauf, kein Zeilenumbruch im Text. Während des Laufs getippt („ XYZ“, „a“): nichts kommt an, der Text bleibt „Geschäftsessen“, so wie er gesendet wurde. Nach dem Lauf nimmt die Textarea wieder Text an („Geschäftsessen frei“) | ✓ |
| Kriterium „Eigener Lauf“: Pfeiltaste und Klick während des Laufs | Pfeil auf, Pfeil ab, Klick auf „Bewirtung (4650)“: Die Wahl bleibt „Reisekosten“, der Block bleibt dort, der Knopf bleibt „Sende …“. In keinem Bild war eine andere Zeile als gewählt gezeichnet als die gehaltene Wahl. Pfeil auf verschiebt aber den Fokus auf „Bewirtung“, ohne sie zu wählen (H12) | ✓ |
| Kriterium „Eigener Lauf“: kein zweites `onSubmit` | je Weg genau ein `setTimeout(…, 600)`: vom Radio mit zweitem `Strg+Enter`, Klick auf den Knopf und drittem `Strg+Enter`; aus der Textarea mit zweitem `Strg+Enter`; nach Klick auf den Knopf mit zweitem Klick und `Strg+Enter` | ✓ |
| Kriterium „Eigener Lauf“: danach frei | nach jedem Weg nach rund 620 ms: Knopf „Antwort speichern“ frei, Textarea beschreibbar, Radios frei. Pfeil auf wechselt auf „Bewirtung“, der Block steht dort; Pfeil ab zurück, der Block wandert mit. Klick auf „Bewirtung“ ebenso, der getippte Text bleibt | ✓ |
| Kriterium „Eigener Lauf“: Fokus beim Klick auf den Knopf | Nach dem Klick liegt der Fokus während und nach dem Lauf auf `body`. Ursache ist `Button` (`disabled={disabled \|\| loading}`), laut Code in HEAD genauso, nicht aus diesem Diff (H13) | ✓ |
| `pending` von außen | `ChoicePrompt/Pending`: `<fieldset>` und alle drei Radios gesperrt, Knopf „Sende …“ gesperrt. Ein Klick auf die erste Zeile wählt nichts, Klick auf den Knopf und `Strg+Enter`: kein `setTimeout(…, 4000)` | ✓ |
| H9 Code | `sending` neben `pending`, zusammen `busy`. Das `<fieldset>` sperrt nur `pending`; der eigene Lauf ignoriert Änderungen (`onChange` der `RadioGroup`, `readOnly` der Textarea), statt zu sperren. Freitext-Knopf und `ActionButton` bleiben über `busy` gesperrt. Der Kommentar ist englisch und nennt den Grund (H9) | ✓ |
| N3 Umfang des Label-Commits | Nachbesserung 3 hält fest: Wörter des Schritts entschieden (llcto für den Owner, 2026-10-27, „Anmerkung schreiben“ und „Anmerkung“), Grund, Umfang: beide Stellen in `ClarificationCard.tsx` (heute Zeile 1121 und 1122), die Stories `OptionRows` (Zeile 178) und `OptionRowsWithLinks` (Zeile 204) und die Zeile „Stories“. `OptionRowsWithLinks` trägt die Wörter des Schritts, die jetzt entschieden sind; der Widerspruch aus N3 ist weg. Die Zeile `WithRecommendedOption` unter „Stories“ nennt „Oder selbst formulieren“ nicht mehr, sondern „Anmerkung ab dem Label-Commit nach 0229“. Der Stand „bleiben bis zur Antwort“ aus Nachbesserung 2 ist durch die Antwort erledigt. `ClarificationCard.tsx` ist laut `git status` unverändert, wie angekündigt. Nicht im Umfang stehen zwei Sätze dieser Spec und drei Kommentare mit „Eigene Antwort schreiben“ (H14) | ✓ |
| Wächter | `pnpm typecheck` Exit 0, `pnpm check:language` Exit 0 (0 Zeilen in 0 Dateien) | ✓ |

### Hinweise

- **H12** Pfeil auf während des Laufs verschiebt den Fokus auf „Bewirtung“, die
  Wahl bleibt „Reisekosten“. Nach dem Lauf steht der Fokusring auf einer Zeile,
  die nicht gewählt ist, und Tab führt zuerst zum gewählten Radio, dann ins
  Feld. Ein natives Radio kennt diesen Zustand sonst nicht. Ehrlich ist er: Ein
  Screenreader sagt „nicht ausgewählt“, und die Leertaste wählt. Die Aussage in
  Nachbesserung 3 „Pfeil auf ändert nichts“ stimmt nur für die Wahl. Abhilfe
  wäre, die Pfeiltasten an den Radios während des Laufs abzufangen. Nicht
  blockierend.
- **H13** Nach einem Klick auf den Knopf liegt der Fokus während und nach dem
  Lauf auf `body`, weil `Button` beim Laden gesperrt ist. Das gilt für jeden
  `ActionButton` und war in HEAD genauso. Das Kriterium sagt „der Fokus bleibt,
  wo er war“, „Verhalten“ sagt genauer „am Radio oder im Feld“. Das ist eine
  Frage an `Button`, nicht an 0229. Nicht blockierend.
- **H14** Der Label-Commit ändert „Eigene Antwort schreiben“ in „Anmerkung
  schreiben“. Sein Umfang nennt aber nicht alle Stellen mit dem alten Wort:
  den Satz unter „Verhalten“ („Der Fokus geht nur beim Klick auf ‚Eigene
  Antwort schreiben‘ ins Feld“), das Kriterium zum Fokus („`ClarificationCard/Step`:
  ‚Eigene Antwort schreiben‘, dann Pfeil ab“), den Kommentar in
  `ClarificationCard.tsx` Zeile 1109, das Beispiel im JSDoc von `freeText.toggle`
  (`ChoicePrompt.tsx` Zeile 77) und die Beschreibung der Story in
  `ClarificationCard.stories.tsx` Zeile 642. Nach dem Commit nennen sie einen
  Knopf, den es nicht mehr gibt. Das Kriterium ändert nur der Spec-Autor.
  Nächster Schritt: Der Label-Commit nimmt die Stellen mit oder nennt sie.
  Nicht blockierend für 0229.
- H10, H11 bleiben wie in Nachbesserung 3 begründet.
