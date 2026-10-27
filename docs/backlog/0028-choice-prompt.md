# 0028 · ChoicePrompt — die Frage mit Antwortoptionen

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, „Frage mit vorgeschlagenen Antworten" ist fachfrei |
| Quelle | Soll-Katalog §11.7 Stufe 2 „Frage mit Antwortoptionen (Handlungen + Freitext, I6, S13)" |
| Ersetzt | den Handbau in `RaiseClarificationForm` |
| Blockiert | Klärung im Sachverhalt, Rückfragen in der Stapelabnahme, die Portal-Antwort |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Ludwig fragt: „Ist das eine Bewirtung oder eine Reisekosten-Position?" Die
Sachbearbeiterin soll mit einem Klick antworten können — und nur dann tippen,
wenn keine der Antworten passt. Heute steht dort ein Formular mit Freitext,
in dem jede Antwort neu formuliert wird; die Vorschläge, die der Agent
mitliefert, landen im besten Fall als Satz im Fragetext.

## Einordnung

- **Wiederverwenden:** `ReasonDialog` fragt **nach einem Grund** zu einer
  bereits gewählten Handlung und blockiert dafür den Bildschirm — hier ist die
  Frage der Inhalt, nicht die Rückfrage. `RadioGroup` (0017) ist der
  Auswahlteil und wird benutzt, nicht ersetzt.
- **Neues Pattern, weil:** Regel 4 — eigener Zustand (Auswahl plus Freitext
  plus Absenden) und mindestens zwei Screens (Sachverhalt, Stapelabnahme,
  Portal).
- **Zuschnitt:** eine Datei, ein Export. Auswahl und Freitext trennen hieße,
  den halben Zustand durchzureichen.
- **Setzt auf:** `RadioGroup` (0017), `Textarea`, `ActionButton` (0004),
  `Callout` für den Fehler.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `question` | `string` | ja | Die Frage, ein Satz (T2) | `Filled` |
| `context` | `ReactNode` | nein | Worum es geht — Beleg, Betrag, Zeile | `InCase` |
| `options` | `ChoiceOption[]` | ja | `{ id, label, hint?, recommended? }` — die vorgeschlagenen Antworten; `recommended` markiert „empfohlen" und wählt vor, wenn `defaultOptionId` fehlt (Nachtrag 0214, 2026-10-24) | `Filled`, `OptionRows` |
| `freeText` | `{ label: string; placeholder?: string; required?: boolean }` | nein | Zusatzfeld; ohne diese Prop gibt es keinen Freitext | `WithFreeText` |
| `submitLabel` | `string` | nein | Imperativ mit Objekt (T3), Default „Antwort senden" | `Filled` |
| `onSubmit` | `(answer: { optionId: string \| null; text?: string }) => Promise<void> \| void` | ja | Absenden | `Interactive` |
| `pending` | `boolean` | nein | Läuft gerade | `Pending` |
| `error` | `string` | nein | Absenden fehlgeschlagen | `Error` |

Was das Pattern **nicht** kann: die Frage stellen (es zeigt sie), mehrere
Fragen hintereinander (das ist ein Assistent), Dateien annehmen (das ist
`FileDrop`, 0021), und es kennt weder Sachverhalt noch Klärung — beide kommen
als Text und Callback vom Aufrufer.

## Verhalten

Client-Component. Ohne Auswahl und ohne Freitext ist der Absenden-Knopf
gesperrt, und **daneben steht warum** (V7/T6), nicht nur ausgegraut. Die
Auswahl einer Option mit `hint` zeigt den Hinweis unter der Option, nicht als
Tooltip. Tastatur: Pfeiltasten wählen (von `RadioGroup`), Strg+Enter sendet;
die Taste steht am Knopf (V14). Nach Fehler bleibt alles Eingegebene stehen.

## Stories

Titel `v3/Patterns/Prüfen/ChoicePrompt`. Abgeleitet nach §6: 4 Zustände
(gefüllt, gesperrt-ohne-Auswahl, lädt, Fehler) + 1 Callback + 1 „im Einsatz" = 6.

| Story | Beweist |
|---|---|
| `Filled` | Frage mit drei Antworten, eine gewählt |
| `Blocked` | nichts gewählt: Knopf gesperrt, Grund steht daneben |
| `WithFreeText` | Antwort „Etwas anderes" plus Freitextfeld |
| `Pending` | Absenden läuft, Formular gesperrt |
| `Error` | fehlgeschlagen, Eingaben stehen noch |
| `InCase` | in einer `Card` mit Kontext (Beleg, Betrag), wie im Sachverhalt |

Nicht anwendbar: `Leer` (eine Frage ohne Antwortoptionen ist ein Freitextfeld,
kein Fall für dieses Pattern), `LeerNachFilter`.

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

- [ ] Gesperrter Knopf nennt den Grund im Text daneben (Story `Blocked`, Regel T6)
- [ ] Strg+Enter sendet, die Taste steht am Knopf (Story `Interactive`, Regel V14)
- [ ] Nach einem Fehler steht die Eingabe noch da (Story `Error`)
- [ ] Ohne `freeText`-Prop gibt es kein Textfeld (Story `Filled`, Blick ins DOM)
- [ ] Ersetzt `RaiseClarificationForm.tsx` ohne Funktionsverlust


## Offene Fragen

1. Darf man Option **und** Freitext gleichzeitig senden? *Ohne Antwort: ja —
   die Option ist die Antwort, der Text die Begründung.*
2. Kommen die Optionen vom Agenten? *Ohne Antwort: der Aufrufer bringt sie
   mit; das Pattern fragt nichts ab.*

## Abnahme

**Zweite Abnahme, 2026-09-05** (fremder Prüfer, nicht der Erbauer). Die beiden
ersten Punkte sind behoben: Strg+Enter hängt jetzt am Pattern statt am
Freitextfeld, und `Filled` zeigt über `defaultOptionId` wirklich eine gewählte
Antwort. Die Punkte (3) und (4) der ersten Runde stehen unverändert. Jedes
Kriterium einzeln, fest und variabel:

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; zweimal gelaufen (Beginn und Ende der Abnahme, 2026-09-05) | ✓ |
| **Fest** — `pnpm build` grün | Nicht erneut gelaufen (schreibt nach `storybook-static`, parallele Abnahmen). Der Lauf für diesen Stand war grün („Storybook build completed successfully") | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/ChoicePrompt.tsx` mit `ChoicePrompt.stories.tsx` daneben; Titel `v3/Patterns/Prüfen/ChoicePrompt` (`ChoicePrompt.stories.tsx:9`) — „Prüfen" ist die Gruppe aus dem Barrel; Export `src/ui/v3/index.ts:256–259` | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Drei Exporte: `ChoiceOption` (`:18`), `ChoiceAnswer` (`:25`) und `ChoicePrompt` (`:36`) mit `@when`/`@instead` in `:30–35`. Props, Typen, Kommentare englisch; deutsch nur in den sichtbaren Strings | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\|[0-9]+px\|fontSize:" ChoicePrompt.tsx` → keine Treffer; Maße in `v3.css:1929–1933` (`.v2ask*`). Kein Status im Spiel — die Antwortoptionen sind Daten des Aufrufers, keine Zustandsachse | ✓ |
| **Fest** — alle Stories der Spec vorhanden, ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--blocked`, `--with-free-text`, `--pending`, `--error`, `--in-case` — sechs, wie in der Ableitung (4 Zustände + 1 Callback + 1 „im Einsatz"). `Leer` und `LeerNachFilter` sind in der Spec mit Grund ausgeschlossen. Anmerkung: Die Abnahme der ersten Runde vermisste eine Story `Interactive`; die Spec führt sie nicht, und `--with-free-text` deckt den Rundlauf ab | ✓ |
| **Fest** — Story-Deckung der Schnittstelle | Alle acht Props der Spec sind belegt: `question` → `--filled`, `context` → `--filled` und `--in-case` („RE-4483 · 128,40 € · 26.08.2026"), `options` → alle, `freeText` → `--with-free-text` (genau ein `textarea`), `submitLabel` → `--in-case` („Antwort an Ludwig senden"), `onSubmit` → `--with-free-text` (Zeile „Gesendet: …"), `pending` → `--pending`, `error` → `--error`. Nicht belegt ist der Teilfall `freeText.required` — dafür gibt es einen zweiten Grundtext im Code (`:69` „Bitte ergänzen Sie den Text.") ohne Story. Die neunte, in der Spec nicht geführte Prop `defaultOptionId` ist in `--filled` vorgeführt | ✓ (mit Befund) |
| **Fest** — Prüfliste `design-guidelines.md` §9 (ohne die zwei App-Punkte) | Stufe `patterns/`, Importe nur abwärts (`ActionButton`, `Callout`, `Form`, `RadioGroup`), kein Fachmodul ✓ · kein Hex/px/Label-Map ✓ · Text links, nichts zentriert ✓ · Farbe: nur der `Callout` im Fehlerfall, sonst keine ✓ · jeder farbige Zustand mit Wort ✓ · fünf Zustände: vier gebaut, zwei begründet ausgeschlossen ✓ · Kontrast gemessen: Grundzeile `.v2ask__why` 6,17:1, Frage 12,71:1, Options-Hinweis 4,88:1 ✓ · keine Bewegung ✓ · Hover: `.v2radioline:hover` färbt eine Tonstufe (`v3.css:1706`) ✓ · Fokus/Pfeiltasten aus dem nativen `<fieldset>` — Pfeil-ab wechselt die Auswahl (in `--with-free-text` geprüft) ✓ · kein Icon, kein Emoji ✓ · Karte in `--in-case` mit Rand, ohne Schatten ✓ · Texte Sie, Imperativ mit Objekt („Antwort senden", „Antwort an Ludwig senden") ✓. **Zwei Punkte reißen:** siehe **M1** (der Ladezustand sagt nicht, dass er lädt) und **M2** (zwei Prompts teilen eine Radiogruppe). Set-weiter Befund: `.v2field__label` in Versalien (`v3.css:842–845`, A2/T3), betrifft `<legend>` und Freitext-Label — wie in 0017 als Befund gewertet | ✗ (wegen M1/M2) |
| **Fest** — im Browser angesehen | Alle sechs Stories in Chromium auf `localhost:6107` geöffnet, Antworten geklickt, Text getippt, Strg+Enter aus drei verschiedenen Fokuslagen gedrückt; Bilder von `--pending` und `--filled` geprüft | ✓ |
| **Variabel** — gesperrter Knopf nennt den Grund im Text daneben (T6) | `--blocked`: `<button disabled>` und daneben `.v2ask__why` „Wählen Sie eine Antwort oder schreiben Sie eine."; nach dem Wählen einer Antwort ist der Knopf frei und der Satz verschwunden (`.v2ask__why`-Anzahl 0). Im Bild von `--pending` gut zu sehen | ✓ |
| **Variabel** — Strg+Enter sendet, die Taste steht am Knopf (V14) | Behoben gegenüber der ersten Runde: `onKeyDown` sitzt jetzt am Block (`ChoicePrompt.tsx:82–87`), nicht mehr am `Textarea`. Nachgestellt in `--with-free-text`: (a) Fokus im `textarea` → „Gesendet: bewirtung · Kunde war dabei"; (b) Fokus auf einem Radio, ohne das Textfeld anzufassen → „Gesendet: reise · ohne Text". Die Taste steht als `<kbd class="v2kbd">Strg+Enter</kbd>` am Knopf. Anmerkung: liegt der Fokus außerhalb des Blocks (Seite frisch geladen, nichts angeklickt), greift sie nicht — das ist die richtige Abgrenzung, sonst würden zwei Prompts auf einer Seite beide senden | ✓ |
| **Variabel** — nach einem Fehler steht die Eingabe noch da | `--error`: Der `Callout` „Die Rückfrage konnte nicht gesendet werden — der Sachverhalt ist gesperrt." steht; danach „Das war eine Betriebsveranstaltung." ins Freitextfeld getippt und eine Antwort gewählt — beides bleibt stehen, der `Callout` ebenso. Im Code setzt nichts `text`/`choice` zurück | ✓ |
| **Variabel** — ohne `freeText`-Prop gibt es kein Textfeld | `--filled`: `textarea`-Anzahl im DOM 0; mit der Prop (`--with-free-text`) genau eins (`:101–111`) | ✓ |
| **Variabel** — `Filled` zeigt „eine gewählt" | Behoben: `--filled` startet mit `defaultOptionId="bewirtung"`, ausgelesen ist genau ein Radio gewählt (`value=bewirtung`), der Knopf ist frei und `.v2ask__why` fehlt. Damit unterscheidet sich `Filled` sichtbar von `Blocked` | ✓ |
| **M1 · Variabel** — im Zustand `pending` sagt der Knopf, dass er lädt | **Reißt (Punkt (3) der ersten Runde, unverändert).** `--pending`, Knopf ausgelesen: `<button type="button" disabled class="v2btn v2btn--primary v2btn--sm"><span>Antwort senden</span><kbd class="v2kbd">Strg+Enter</kbd></button>` — kein „Sende …", kein `aria-busy`. Grund: `pendingLabel` wird an `ActionButton` durchgereicht, das daraus `loadingLabel` macht, aber `loading` allein aus seinem **eigenen** Lauf zieht (`ActionButton.tsx:61,94–95`); ein `pending` von außen erreicht nur `disabled`. Die Story behauptet in ihrem Kommentar „der Knopf trägt ein Wort" — das stimmt nicht. Dazu steht unter dem gesperrten Knopf weiterhin „Wählen Sie eine Antwort oder schreiben Sie eine.", obwohl gerade gesendet wird: der Satz widerspricht dem Zustand. So hat der Zustand „lädt" (V9) weder Wort noch stimmigen Text | ✗ |
| **M2 · Fest** — zwei Prompts auf einer Seite stören sich nicht | **Reißt (Punkt (4) der ersten Runde, unverändert).** `RadioGroup name="choice"` ist ein festes Literal (`ChoicePrompt.tsx:94`); im DOM tragen alle Optionen `name="choice"`. Nachgestellt in `--filled`: Auswahl steht auf `bewirtung`; danach ein zweiter Radio mit `name="choice"` in dieselbe Seite gesetzt und gewählt → die erste Gruppe ist **abgewählt** (`.v2radiogrp input:checked` = 0). Zwei `ChoicePrompt` nebeneinander — Sachverhalt mit zwei Klärungen, Stapelabnahme mit zwei Rückfragen — löschen sich damit gegenseitig die Antwort | ✗ |
| **Variabel** — ersetzt `RaiseClarificationForm.tsx` ohne Funktionsverlust | Betrifft das Repo `ludwig/app` und ist hier nicht erfüllbar. Der fachliche Befund der ersten Runde bleibt: nicht gedeckt sind das eingeklappte Formular mit Auslöser-Knopf, der Empfänger-Select mit wechselnder Hinweiszeile, der Schalter „Blockiert die Buchung" und ein Abbrechen-Weg, der den Entwurf behält | offen (App) |

**Zurück auf `in Arbeit`.** Zu tun:

1. **M1 — der Ladezustand braucht ein Wort.** Entweder `ChoicePrompt` reicht
   `pending` so an den Knopf, dass dort `pendingLabel` erscheint (z. B. `Button`
   mit `loading` statt `ActionButton` mit `disabled`), oder `ActionButton`
   bekommt ein von außen gesetztes `loading`. Im selben Zug: die Grundzeile
   `.v2ask__why` verschwindet, solange `pending` läuft — sie widerspricht sonst
   dem Zustand. Danach stimmt auch der Kommentar der Story wieder.
2. **M2 — `name` der Radiogruppe eindeutig machen** (`useId()`, oder eine Prop
   `name`), damit zwei Prompts auf einer Seite nebeneinander stehen können.

**Befunde** (keine Mängel dieser Aufgabe):

3. **`defaultOptionId` fehlt in der Schnittstelle der Spec.** Die Prop ist
   gebaut (`ChoicePrompt.tsx:40,52`), im JSDoc erklärt und für `Filled` nötig —
   die Tabelle oben führt sie nicht. Beim nächsten Anfassen nachtragen.
4. **`freeText.required` hat keine Story.** Der zweite Grundtext „Bitte ergänzen
   Sie den Text." (`:69`) ist damit nirgends zu sehen.
5. **`--error` startet mit leerem Feld.** Die Aussage „nach einem Fehler steht
   die Eingabe noch da" führt die Story nicht von selbst vor; sie ist nur beim
   Mittippen zu sehen (so geprüft). Ein vorbelegter Text würde sie beweisen.
6. **Versalien am Feldlabel, set-weit** — `.v2field__label`, `v3.css:842–845`;
   trifft hier `<legend>ANTWORT</legend>` und „ANMERKUNG". Eigene Aufgabe,
   dieselbe Feststellung wie in 0017.

Erste Runde (2026-09-03, Historie): ✗ an Strg+Enter (behoben) und am
App-Kriterium; offene Punkte (1) und (2) behoben, (3) und (4) offen.


## Mängel der Abnahme vom 2026-09-05 — behoben

**M1 — im Pending trug der Knopf kein Wort.** `pendingLabel` erreicht
`ActionButton` nur bei dessen **eigenem** Lauf; hält der Aufrufer das Pending
(Server Action in seiner Hand), blieb der Knopf grau mit unverändertem Wort —
und darunter stand weiter „Wählen Sie eine Antwort oder schreiben Sie eine.",
was dem Zustand widerspricht.

Zwei Änderungen: die Beschriftung trägt „Sende …", wenn `pending` von außen
kommt, und der Hinweis daneben schweigt währenddessen. Der Satz darf nicht
nach einer Antwort fragen, die schon unterwegs ist.

**M2 — `RadioGroup name="choice"` war fest verdrahtet.** Zwei Fragen auf
einer Seite bildeten damit **eine** Radiogruppe: die zweite wählte die erste
ab. Jetzt `useId()`.

**Nebenbei, aus der Abnahme von 0060:** die `RadioGroup` wird nicht mehr
gerendert, wenn `options` leer ist — bei reiner Freitext-Frage (60 % des
Bestands) stand sonst „Antwort" zweimal, einmal als Legende über einem leeren
`fieldset`. Der Zweig hat hier noch keine eigene Story; belegt ist er über
die Klärungs-Karten. Beim nächsten Anfassen gehört er hierher.

## Abnahmekriterien (Nachtrag)

- [ ] Von außen gehaltenes `pending` zeigt ein Wort am Knopf (V7)
- [ ] Der Hinweis neben dem Knopf schweigt, während gesendet wird
- [ ] Zwei `ChoicePrompt` auf einer Seite wählen sich nicht gegenseitig ab (im Browser gemessen)
- [ ] Ohne Optionen erscheint keine `RadioGroup` und keine zweite Beschriftung „Antwort"

## Abnahme der Nachbesserung, 2026-09-05

Dritte Runde, fremder Prüfer (weder Erbauer noch Vorprüfer). Geprüft gegen
die festen und variablen Kriterien und gegen den Nachtrag. Gemessen in einem
eigenen headless Chromium (1440 × 900) auf `localhost:6107`; wo zwei
Instanzen nötig waren, sind sie zur Laufzeit in **einen** React-Baum
gerendert und im DOM ausgelesen.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0 | ✓ |
| **Fest** — `pnpm build` grün | Nicht gestartet: er schreibt nach `storybook-static`, und parallel arbeiten weitere Sitzungen | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/ChoicePrompt.tsx` mit `ChoicePrompt.stories.tsx` daneben; Titel `v3/Patterns/Prüfen/ChoicePrompt`; Export `src/ui/v3/index.ts:256–259` | ✓ |
| **M3 · Fest** — Code englisch; `@when`/`@instead` an jedem Export | Die `@when`/`@instead`-Zeilen stehen unverändert unmittelbar über `export function ChoicePrompt` (`:36`) — der Block steht in `:30–35` — das hält. **Die Sprache reißt neu:** die Nachbesserung hat drei deutsche Kommentarblöcke in die Komponente gesetzt — `:62–63` („Zwei Fragen auf einer Seite dürfen sich nicht gegenseitig abwählen …"), `:101–104` (JSX-Kommentar „Keine Gruppe ohne Gegenstand …") und `:134–138` („`ActionButton` kennt nur seinen **eigenen** Lauf …"). Vor `9a831fa` war die Datei durchgängig englisch, die Vorrunde hat das ausdrücklich so protokolliert. `CLAUDE.md` lässt Deutsch nur in Strings zu, die Nutzer sehen | ✗ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}\b|[0-9]+px|fontSize' src/ui/v3/patterns/ChoicePrompt.tsx` → 0; die Maße stehen in `v3.css` (`.v2ask*`). Kein Status im Spiel | ✓ |
| **Fest** — alle Stories vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--blocked`, `--with-free-text`, `--pending`, `--error`, `--in-case` — sechs, genau die Ableitung. `Leer` und `LeerNachFilter` sind begründet ausgeschlossen | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Die zwei Punkte, die in der Vorrunde rissen, halten jetzt: der Ladezustand trägt ein Wort (V9/V7) und zwei Prompts stören sich nicht. Gerissen ist die Sprache der Kommentare (M3). Der Rest unverändert: Text links, Farbe nur am `Callout`, Fokus und Pfeiltasten aus dem nativen `<fieldset>`, kein Icon, kein Emoji, Karte in `--in-case` mit Rand ohne Schatten, Texte Sie und Imperativ | ✗ (wegen M3) |
| **Fest** — im Browser angesehen | Alle sechs Stories geöffnet und ausgelesen: `--filled` (ein Radio gewählt, `value=bewirtung`, Knopf frei, kein `.v2ask__why`), `--blocked` (Knopf gesperrt, Satz daneben), `--with-free-text` (genau ein `textarea`), `--pending` (siehe Nachtrag), `--error` (`div.v2note.v2note--danger` mit dem Fehlersatz), `--in-case` (Knopf „Antwort an Ludwig senden") | ✓ |
| **Variabel** — gesperrter Knopf nennt den Grund im Text daneben (T6) | `--blocked`: `<button disabled>` und `.v2ask__why` „Wählen Sie eine Antwort oder schreiben Sie eine." | ✓ |
| **Variabel** — Strg+Enter sendet, die Taste steht am Knopf (V14) | `onKeyDown` sitzt am Block (`ChoicePrompt.tsx:90–95`), die Taste steht als `<kbd class="v2kbd">Strg+Enter</kbd>` am Knopf — in jeder der sechs Stories im DOM nachgesehen | ✓ |
| **Variabel** — nach einem Fehler steht die Eingabe noch da | `--error`: nichts im Code setzt `text`/`choice` zurück; der `Callout` bleibt stehen | ✓ |
| **Variabel** — ohne `freeText`-Prop gibt es kein Textfeld | `--filled`: `textarea`-Anzahl 0; `--with-free-text`: genau 1 | ✓ |
| **Variabel** — ersetzt `RaiseClarificationForm.tsx` | Betrifft `ludwig/app`, hier nicht erfüllbar | offen (App) |

**Nachtrag**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Von außen gehaltenes `pending` zeigt ein Wort am Knopf (V7) | `--pending`, Knopf ausgelesen: `<button type="button" disabled class="v2btn v2btn--primary v2btn--sm"><span>Sende …</span><kbd class="v2kbd">Strg+Enter</kbd></button>`. Statt „Antwort senden" steht dort jetzt „Sende …" — der Zustand trägt ein Wort, nicht nur Grau. Die drei Radios sind dabei `disabled` | ✓ |
| Der Hinweis neben dem Knopf schweigt, während gesendet wird | `--pending`: `.v2ask__why`-Anzahl **0**. In `--blocked`, `--with-free-text`, `--error` und `--in-case`, wo nichts läuft, steht der Satz weiterhin. Im Code hängt das an `const why = pending ? null : …` (`ChoicePrompt.tsx:72–78`) | ✓ |
| Zwei `ChoicePrompt` auf einer Seite wählen sich nicht gegenseitig ab (im Browser gemessen) | Zwei Instanzen mit denselben Optionen zur Laufzeit in einen React-Baum gerendert: die Radios der ersten tragen `name="_r_1_"`, die der zweiten `name="_r_2_"` — zwei verschiedene Gruppen. Erst die erste Option der ersten Frage angeklickt (`checked` `[true, false, false, false]`), dann die erste der zweiten (`[true, false, true, false]`): **beide** Antworten stehen weiter. Der Fall der Vorrunde — die zweite wählte die erste ab — tritt nicht mehr auf. `useId()` (`ChoicePrompt.tsx:64`, `name={groupName}` `:107`) | ✓ |
| Ohne Optionen erscheint keine `RadioGroup` und keine zweite Beschriftung „Antwort" | Dritte Instanz im selben Baum mit `options={[]}` und `freeText`: `.v2radiogrp`- und `fieldset`-Anzahl **0**, `<legend>`-Anzahl **0**, im Block genau eine Beschriftung — „Anmerkung" am Freitextfeld — und genau ein `textarea`. Der Zweig ist `options.length === 0 ? null : …` (`ChoicePrompt.tsx:105`) | ✓ |

**Zurück auf `in Arbeit`.** Ein Mangel:

1. **M3 — deutsche Kommentare in `ChoicePrompt.tsx`.** Drei Blöcke, alle neu:
   `:62–63`, `:101–104`, `:134–138`. Die Datei war vorher englisch, und das
   feste Kriterium verlangt es. Übersetzen — die Inhalte sind richtig, nur die
   Sprache stimmt nicht.

**Befunde** (keine Mängel):

2. **`pending` setzt kein `aria-busy` und zeigt keinen Spinner.** Der Knopf
   ist `disabled` und trägt das Wort — das verlangt das Kriterium, und mehr
   nicht. Wer beides will, hat in `Button` bereits `loading` (0010); der
   Unterschied zwischen einem gesperrten und einem laufenden Knopf ist für die
   Vorlesehilfe heute nicht hörbar.
3. **Der Zweig „ohne Optionen" hat weiterhin keine eigene Story.** Er ist
   jetzt belegt (oben, zur Laufzeit), aber im Storybook nicht zu sehen. Der
   Text der Nachbesserung sagt das selbst.
4. **`defaultOptionId` fehlt in der Schnittstelle der Spec**, und
   `freeText.required` hat keine Story — beides unverändert aus der Vorrunde.
5. **`.v2field__label` in Versalien** — set-weit, eigene Aufgabe (wie 0017).

Geprüft von / am: Claude (Abnahme-Agent), 2026-09-05

## Der Mangel der Abnahme vom 2026-09-05 (zweite Runde) — behoben

Drei Kommentarblöcke, die mit der Nachbesserung neu hineinkamen, standen auf
Deutsch — in einer Datei, die sonst englisch ist. Englisch.

**Aufgenommen, aber nicht hier behoben** (Befund der Abnahme): `pending` setzt
kein `aria-busy` und zeigt keinen Spinner; für eine Vorlesehilfe sind
„gesperrt" und „läuft" damit ununterscheidbar, obwohl `Button` mit `loading`
beides mitbrächte. Das Kriterium verlangt nur das Wort, und der Weg dahin
führt über den `ActionButton`, der das Pending heute selbst hält — das ist
eine Änderung an seiner Schnittstelle, nicht an dieser Datei. Gehört in die
nächste Runde an 0004.


## Abnahme der zweiten Nachbesserung, 2026-09-05

Vierte Runde, fremder Prüfer — weder Erbauer noch einer der Vorprüfer.
Geprüft gegen die festen Kriterien, die variablen aus der Spec und den
Nachtrag; die Punkte der Vorrunden sind nachgemessen, nicht übernommen.
Gemessen in einem eigenen headless Chromium (1440 × 900) auf
`localhost:6107`; Strg+Enter als echter Tastenanschlag über CDP, und wo
mehrere Instanzen nötig waren, sind sie zur Laufzeit in **einen** React-Baum
gerendert und im DOM ausgelesen.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` nicht gestartet: er schreibt nach `storybook-static`, und parallel arbeiten weitere Sitzungen | ✓ (Build zitiert) |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/ChoicePrompt.tsx` mit `ChoicePrompt.stories.tsx` daneben; Titel `v3/Patterns/Prüfen/ChoicePrompt`, Gruppe „Prüfen" wie im Barrel (`src/ui/v3/index.ts:242`); Export `:256–259` | ✓ |
| **M3 · Code englisch; `@when`/`@instead` an jedem Export** | **Reißt weiter — zwei von drei Blöcken sind übersetzt, einer nicht.** Englisch stehen jetzt `:62–63` („Two questions on one page must not deselect each other …") und `:134–138` („`ActionButton` only knows its **own** run …"). **Deutsch geblieben ist der JSX-Kommentar `ChoicePrompt.tsx:101–104`:** „Keine Gruppe ohne Gegenstand: bei reiner Freitext-Frage (60 % des Bestands) stünde sonst eine leere `<fieldset>` mit der Legende „Antwort" über dem Feld, das dieselbe Beschriftung trägt — zweimal dasselbe Wort, und für einen Screenreader eine Gruppe ohne Inhalt." Maschinell nachgeprüft: alle Kommentarblöcke der Datei ausgeschnitten und gegen eine Liste deutscher Funktionswörter gehalten — genau ein Treffer, dieser. Die `@when`/`@instead`-Zeilen stehen unverändert unmittelbar über `export function ChoicePrompt` (`:30–36`) | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}\b\|[0-9]+px\|fontSize' src/ui/v3/patterns/ChoicePrompt.tsx` → 0; die Maße stehen in `v3.css` (`.v2ask*`). Kein Status im Spiel | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--blocked`, `--with-free-text`, `--pending`, `--error`, `--in-case` — sechs, genau die Ableitung. `Leer` und `LeerNachFilter` sind begründet ausgeschlossen | ✓ |
| Story-Deckung der Schnittstelle | `question` → alle, `context` → `--filled`/`--with-free-text`/`--in-case`, `options` → alle, `freeText` → `--with-free-text`, `--error`, `--in-case` (je genau ein `textarea`; `--filled` und `--blocked` haben keins), `submitLabel` → `--in-case` („Antwort an Ludwig senden"), `onSubmit` → `--with-free-text` („Gesendet: …"), `pending` → `--pending`, `error` → `--error` (`div.v2note.v2note--danger`), `defaultOptionId` → `--filled` | ✓ |
| Prüfliste `design-guidelines.md` §9 | Die zwei App-Punkte übersprungen. Die zwei Punkte, die in der Vorrunde rissen, halten: der Ladezustand trägt ein Wort (V9/V7) und zwei Prompts stören sich nicht. Der Rest unverändert: Text links, Farbe nur am `Callout`, Fokus und Pfeiltasten aus dem nativen `<fieldset>`, kein Icon, kein Emoji, Karte in `--in-case` mit Rand ohne Schatten, Texte Sie und Imperativ. Gerissen ist die Sprache der Kommentare (M3) | ✗ (wegen M3) |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sechs Stories geöffnet und ausgelesen; dazu drei weitere Instanzen zur Laufzeit gerendert (siehe Nachtrag) | ✓ |

**Variabel (aus der Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Gesperrter Knopf nennt den Grund im Text daneben (T6) | `--blocked`: `<button disabled>` und daneben `.v2ask__why` „Wählen Sie eine Antwort oder schreiben Sie eine."; in `--filled` (eine Antwort vorgewählt) ist der Knopf frei und `.v2ask__why` fehlt (Anzahl 0) | ✓ |
| Strg+Enter sendet, die Taste steht am Knopf (V14) | `--with-free-text`, **echter Tastenanschlag über CDP**: zweite Antwort geklickt, Fokus ins `textarea` gesetzt, Strg+Enter gedrückt → die Zeile unter dem Block wechselt von „Gesendet: nichts" auf „Gesendet: reise · ohne Text". Die Taste steht als `<kbd class="v2kbd">Strg+Enter</kbd>` am Knopf, in allen sechs Stories im DOM nachgesehen. `onKeyDown` sitzt am Block (`ChoicePrompt.tsx:90–95`), nicht am Feld | ✓ |
| Nach einem Fehler steht die Eingabe noch da | `--error`: der `Callout` „Die Rückfrage konnte nicht gesendet werden — der Sachverhalt ist gesperrt." steht; im Code setzt nichts `text` oder `choice` zurück, `error` ist eine reine Anzeige-Prop | ✓ |
| Ohne `freeText`-Prop gibt es kein Textfeld | `--filled` und `--blocked`: `textarea`-Anzahl **0**; `--with-free-text`, `--error`, `--in-case`: je **1** | ✓ |
| Ersetzt `RaiseClarificationForm.tsx` ohne Funktionsverlust | Betrifft `ludwig/app`, hier nicht erfüllbar. Der fachliche Befund der Vorrunden bleibt: nicht gedeckt sind das eingeklappte Formular mit Auslöser-Knopf, der Empfänger-Select, der Schalter „Blockiert die Buchung" und ein Abbrechen-Weg, der den Entwurf behält | offen (App) |

**Nachtrag**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Von außen gehaltenes `pending` zeigt ein Wort am Knopf (V7) | `--pending`, Knopf ausgelesen: `<button type="button" disabled class="v2btn v2btn--primary v2btn--sm"><span>Sende …</span><kbd class="v2kbd">Strg+Enter</kbd></button>`. Statt „Antwort senden" steht dort „Sende …"; die drei Radios sind dabei `disabled` | ✓ |
| Der Hinweis neben dem Knopf schweigt, während gesendet wird | `--pending`: `.v2ask__why`-Anzahl **0**. In `--blocked`, `--with-free-text`, `--error` und `--in-case`, wo nichts läuft, steht der Satz. Im Code `const why = pending ? null : …` (`ChoicePrompt.tsx:72–78`) | ✓ |
| Zwei `ChoicePrompt` auf einer Seite wählen sich nicht gegenseitig ab (im Browser gemessen) | Zwei Instanzen mit denselben Optionen zur Laufzeit in einen React-Baum gerendert: die Radios der ersten tragen `name="_r_1_"`, die der zweiten `name="_r_2_"` — zwei Gruppen. Erst die erste Option der ersten Frage geklickt (`checked` `[true,false]` / `[false,false]`), dann die erste der zweiten (`[true,false]` / `[true,false]`): **beide** Antworten stehen weiter. `useId()` (`ChoicePrompt.tsx:64`), `name={groupName}` (`:107`) | ✓ |
| Ohne Optionen erscheint keine `RadioGroup` und keine zweite Beschriftung „Antwort" | Dritte Instanz im selben Baum mit `options={[]}` und `freeText={{ label: "Anmerkung" }}`: `.v2radiogrp`-Anzahl **0**, `fieldset` **0**, `legend` **0**, genau eine Beschriftung („Anmerkung") und genau ein `textarea`. Der Zweig ist `options.length === 0 ? null : …` (`ChoicePrompt.tsx:105`) | ✓ |

**Zurück auf `in Arbeit`.** Ein Mangel:

1. **M3 — der deutsche JSX-Kommentar in `ChoicePrompt.tsx:101–104` steht
   noch.** Die Nachbesserung hat zwei der drei Blöcke übersetzt (`:62–63` und
   `:134–138`), diesen nicht: „Keine Gruppe ohne Gegenstand: bei reiner
   Freitext-Frage (60 % des Bestands) stünde sonst eine leere `<fieldset>` …".
   `CLAUDE.md` lässt Deutsch nur in Strings zu, die Nutzer sehen; das feste
   Kriterium verlangt englischen Code. Der Inhalt ist richtig, nur die Sprache
   nicht — übersetzen, wie die beiden anderen.

**Befunde** (keine Mängel):

2. **Ohne Optionen fragt der Hinweis weiter nach einer Antwort.** An der
   dritten Instanz gemessen: bei `options={[]}` und leerem Freitext steht neben
   dem gesperrten Knopf „Wählen Sie eine Antwort oder schreiben Sie eine." —
   es gibt aber keine Antwort zu wählen, nur zu schreiben. Der Zweig ist neu
   (aus der Abnahme von 0060) und hat noch keine eigene Story; sein Grundtext
   ist bisher niemandem aufgefallen. Gehört zum selben Anfassen wie Befund 3.
3. **Der Zweig „ohne Optionen" hat weiterhin keine eigene Story.** Er ist
   belegt, aber im Storybook nicht zu sehen — unverändert aus der Vorrunde.
4. **`pending` setzt kein `aria-busy` und zeigt keinen Spinner.** Vom Erbauer
   aufgenommen und an 0004 verwiesen; das Kriterium verlangt nur das Wort.
5. **`defaultOptionId` fehlt in der Schnittstelle der Spec**, und
   `freeText.required` hat keine Story — beides unverändert aus den Vorrunden.
6. **Die Story-JSDoc in `ChoicePrompt.stories.tsx` ist deutsch** (`:23`,
   `:41`, `:54`, `:78`, `:92`, `:107`). Set-weiter Befund, in 0010 als eigene
   Aufgabe abgelegt; kein Kriterium dieser Aufgabe nennt die Story-Datei.
7. **`.v2field__label` in Versalien** — trifft hier „ANTWORT" und „ANMERKUNG".
   Set-weit, wie in 0017.

Geprüft von / am: Claude (Abnahme-Agent), 2026-09-05

## Der Mangel der dritten Abnahme (2026-09-05) — behoben

Von drei deutschen Kommentarblöcken waren nur zwei übersetzt; der dritte
(`ChoicePrompt.tsx:101–104`, „Keine Gruppe ohne Gegenstand …") steht jetzt
ebenfalls auf Englisch.

**Dazu der Befund derselben Abnahme, der ein Mangel ist:** bei `options={[]}`
stand neben dem gesperrten Knopf weiter „Wählen Sie eine Antwort oder
schreiben Sie eine." — es gibt dort aber nichts zu wählen. Der Satz heißt in
diesem Zweig „Schreiben Sie eine Antwort."

Und der Zweig hat endlich seine Story: `FreeTextOnly` zeigt den Fall, der 60 %
des Bestands ausmacht. Gemessen: 0 `fieldset`, 0 `legend`, ein Label
„Antwort *", und der Grund neben dem Knopf schickt niemanden nach einer
Auswahl suchen, die es nicht gibt.

## Abnahmekriterien (Nachtrag der dritten Runde)

- [ ] Kein deutscher Kommentar mehr in `ChoicePrompt.tsx` (`grep`)
- [ ] Ohne Optionen sagt der Grund „Schreiben Sie eine Antwort." (Story `FreeTextOnly`)
- [ ] Die Story `FreeTextOnly` zeigt weder `fieldset` noch `legend`


## Abnahme der dritten Nachbesserung, 2026-09-05

Fünfte Runde (die dritte Nachbesserung), fremder Prüfer — weder Erbauer noch
einer der Vorprüfer. Geprüft gegen die festen Kriterien, die variablen aus der
Spec, den Nachtrag der zweiten Runde **und** den Nachtrag der dritten; die
Punkte der Vorrunden sind nachgemessen, nicht übernommen. Gemessen in einem
eigenen headless Chromium (1440 × 900) auf `localhost:6107`, Strg+Enter als
echter Tastenanschlag über CDP (`Input.dispatchKeyEvent`), und wo mehrere
Instanzen nötig waren, sind sie zur Laufzeit in **einen** React-Baum gerendert
und im DOM ausgelesen.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, Exit 0, keine Ausgabe außer den zwei pnpm-Zeilen (Protokoll 98 Byte). `pnpm build` nicht gestartet: er schreibt nach `storybook-static`, und parallel arbeiten weitere Sitzungen | ✓ (Build zitiert) |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/ChoicePrompt.tsx` mit `ChoicePrompt.stories.tsx` daneben; Titel `v3/Patterns/Prüfen/ChoicePrompt` (`ChoicePrompt.stories.tsx:9`), Gruppe „Prüfen" wie im Barrel (`src/ui/v3/index.ts:242`), Export `:255–259` | ✓ |
| **M3 · Code englisch; `@when`/`@instead` an jedem Export** | **Behoben.** Alle 18 Kommentarblöcke der Datei maschinell ausgeschnitten (Zeichenketten dabei ausgeklammert) und gegen eine Liste deutscher Funktionswörter gehalten: zwei Treffer, beide englische Sätze, die eine deutsche Nutzer-Zeichenkette zitieren — `:10–16` („Ludwig asks: „Bewirtung oder Reisekosten?"") und `:105–108` („… an empty `<fieldset>` with the legend „Antwort" above a field …"). Der Block, der in der Vorrunde riss, steht jetzt englisch: „No group without a subject: on a pure free-text question (60 % of the stock) …". `@when`/`@instead` unverändert in `:30–35`, unmittelbar über `export function ChoicePrompt` (`:36`); die beiden Typ-Exporte `ChoiceOption` (`:18`) und `ChoiceAnswer` (`:25`) tragen wie in allen Vorrunden keine eigenen Zeilen | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}\b|[0-9]+px|fontSize' src/ui/v3/patterns/ChoicePrompt.tsx` → 0; die Maße stehen in `v3.css` (`.v2ask*`). Kein Status im Spiel | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | `index.json`: sieben — `--filled`, `--blocked`, `--with-free-text`, `--free-text-only`, `--pending`, `--error`, `--in-case`. Sechs aus der Ableitung plus `FreeTextOnly` aus dem Nachtrag der dritten Runde. `Leer` und `LeerNachFilter` bleiben begründet ausgeschlossen | ✓ |
| Story-Deckung der Schnittstelle | `question` → alle sieben; `context` → `--filled`/`--with-free-text`/`--free-text-only`/`--in-case`; `options` → alle, der leere Fall in `--free-text-only`; `freeText` → `--with-free-text`, `--free-text-only`, `--error`, `--in-case` (je genau ein `textarea`; `--filled` und `--blocked` haben keins); `freeText.required` → neu belegt in `--free-text-only` (Label „Antwort *"); `submitLabel` → `--in-case` („Antwort an Ludwig senden"); `onSubmit` → `--with-free-text` und `--free-text-only` („Gesendet: …"); `pending` → `--pending`; `error` → `--error`; `defaultOptionId` → `--filled` | ✓ |
| Prüfliste `design-guidelines.md` §9 | Die zwei App-Punkte übersprungen. Stufe `patterns/`, Importe nur abwärts (`ActionButton`, `Callout`, `Form`, `RadioGroup`), kein Fachmodul; kein Hex/px/Label-Map; Text links — zentriert ist in `--free-text-only` nur der Knopf mit seiner eigenen Beschriftung und `<kbd>` (drei Elemente, gemessen), kein Inhalt; Farbe nur am `Callout` im Fehlerfall; jeder Zustand mit Wort (gesperrt: Grundzeile, lädt: „Sende …"); Kontrast gemessen: Grundzeile `.v2ask__why` 6,17:1 bei 12,5 px, Frage 12,71:1, Feldlabel 6,17:1; Fokus und Pfeiltasten aus dem nativen `<fieldset>`, wo es eins gibt; kein Icon, kein Emoji; Karte in `--in-case` mit Rand ohne Schatten; Texte Sie und Imperativ. Set-weiter Befund unverändert: `.v2field__label` in Versalien (gemessen `text-transform: uppercase`) | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sieben Stories nacheinander geöffnet und im DOM ausgelesen (`fieldset`/`legend`/`textarea`/Radio-Namen/Grundzeile/Knopf); dazu drei weitere Instanzen zur Laufzeit gerendert (siehe Nachtrag). Konsole: 0 Meldungen (Fehler und Warnungen) in `--filled` und `--free-text-only` | ✓ |

**Variabel (aus der Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Gesperrter Knopf nennt den Grund im Text daneben (T6) | `--blocked`: `<button disabled>` und daneben `.v2ask__why` „Wählen Sie eine Antwort oder schreiben Sie eine." — **wörtlich der Satz der Vorrunden**, mit Optionen unverändert. In `--filled` (eine Antwort vorgewählt) ist der Knopf frei und `.v2ask__why` fehlt (Anzahl 0) | ✓ |
| Strg+Enter sendet, die Taste steht am Knopf (V14) | `--with-free-text`, **echter Tastenanschlag über CDP**: zweite Antwort geklickt (`checked` `[false,true,false,false]`), Fokus ins `textarea` (`document.activeElement` = `TEXTAREA`), Strg+Enter → die Zeile wechselt von „Gesendet: nichts" auf „Gesendet: reise · ohne Text". Die Taste steht als `<kbd class="v2kbd">Strg+Enter</kbd>` am Knopf, in allen sieben Stories im DOM nachgesehen; `onKeyDown` sitzt am Block (`ChoicePrompt.tsx:94–99`), nicht am Feld | ✓ |
| Nach einem Fehler steht die Eingabe noch da | `--error`, nachgestellt: `Callout` „Die Rückfrage konnte nicht gesendet werden — der Sachverhalt ist gesperrt." steht; danach erste Antwort geklickt und „Das war eine Betriebsveranstaltung." getippt → `textarea` trägt den Satz, `checked` `[true,false,false]`, der `Callout` steht weiter, der Knopf ist frei, die Grundzeile ist weg. Im Code setzt nichts `text` oder `choice` zurück | ✓ |
| Ohne `freeText`-Prop gibt es kein Textfeld | `--filled` und `--blocked`: `textarea`-Anzahl **0**; `--with-free-text`, `--free-text-only`, `--error`, `--in-case`: je **1** | ✓ |
| Ersetzt `RaiseClarificationForm.tsx` ohne Funktionsverlust | Betrifft `ludwig/app`, hier nicht erfüllbar. Der fachliche Befund der Vorrunden bleibt: nicht gedeckt sind das eingeklappte Formular mit Auslöser-Knopf, der Empfänger-Select, der Schalter „Blockiert die Buchung" und ein Abbrechen-Weg, der den Entwurf behält | offen (App) |

**Nachtrag der zweiten Runde**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Von außen gehaltenes `pending` zeigt ein Wort am Knopf (V7) | `--pending`, Knopf ausgelesen: `<button type="button" disabled class="v2btn v2btn--primary v2btn--sm"><span>Sende …</span><kbd class="v2kbd">Strg+Enter</kbd></button>`; die drei Radios sind dabei `disabled` (`[true,true,true]`) | ✓ |
| Der Hinweis neben dem Knopf schweigt, während gesendet wird | `--pending`: `.v2ask__why`-Anzahl **0**. In `--blocked`, `--with-free-text`, `--free-text-only`, `--error` und `--in-case`, wo nichts läuft, steht der Satz. Im Code `const why = pending ? null : …` (`ChoicePrompt.tsx:72–82`) | ✓ |
| Zwei `ChoicePrompt` auf einer Seite wählen sich nicht gegenseitig ab (im Browser gemessen) | Zwei Instanzen mit denselben Optionen zur Laufzeit in einen React-Baum gerendert (`createRoot` im Blatt der Story `--filled`): die Radios der ersten tragen `name="_r_1_"`, die der zweiten `name="_r_2_"`. Erste Option der ersten Frage geklickt → `[true,false]` / `[false,false]`; danach erste Option der zweiten → `[true,false]` / `[true,false]`: **beide** Antworten stehen weiter. `useId()` (`ChoicePrompt.tsx:64`), `name={groupName}` (`:111`) | ✓ |
| Ohne Optionen erscheint keine `RadioGroup` und keine zweite Beschriftung „Antwort" | Dritte Instanz im selben Baum mit `options={[]}` und `freeText={{ label: "Anmerkung" }}`: `fieldset` **0**, `legend` **0**, genau eine Beschriftung („Anmerkung") und genau ein `textarea`. Dasselbe in der Story `--free-text-only`. Der Zweig ist `options.length === 0 ? null : …` (`ChoicePrompt.tsx:109`) | ✓ |

**Nachtrag der dritten Runde**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Kein deutscher Kommentar mehr in `ChoicePrompt.tsx` | Maschinelle Prüfung aller 18 Kommentarblöcke (siehe Zeile M3 oben): kein deutscher Satz mehr, die zwei verbleibenden Treffer sind englische Sätze mit einer zitierten deutschen Nutzer-Zeichenkette | ✓ |
| Ohne Optionen sagt der Grund „Schreiben Sie eine Antwort." (Story `FreeTextOnly`) | `--free-text-only`: `.v2ask__why` = „Schreiben Sie eine Antwort." — genau ein Element, kein Wort von Auswählen. Dieselbe Ausgabe an der dritten Laufzeit-Instanz mit `options={[]}`. Mit Optionen (`--blocked`) steht weiterhin der alte Satz | ✓ |
| Die Story `FreeTextOnly` zeigt weder `fieldset` noch `legend` | `--free-text-only`: `fieldset` **0**, `legend` **0**, `.v2radiogrp` **0**, `input[type=radio]` **0**; ein Label („Antwort *"), ein `textarea`, Frage „Wofür war die Bewirtung am 26.08.?" | ✓ |

**Alles ✓ — Status `fertig`.**

**Befunde** (keine Mängel):

1. **Der zweite Grundtext „Bitte ergänzen Sie den Text." (`ChoicePrompt.tsx:81`) ist weiter nirgends zu sehen.** `freeText.required` hat mit `FreeTextOnly` endlich eine Story (Label „Antwort *"), aber der Satz erscheint nur, wenn eine Option gewählt **und** der Pflichttext leer ist — und in dieser Story gibt es keine Option zu wählen. Eine Zeile in `WithFreeText` mit `required: true` würde ihn zeigen.
2. **`defaultOptionId` fehlt weiterhin in der Schnittstellen-Tabelle der Spec** (`ChoicePrompt.tsx:40,52`), obwohl `Filled` ohne die Prop nicht funktioniert — unverändert aus den Vorrunden.
3. **`pending` setzt kein `aria-busy` und zeigt keinen Spinner.** Vom Erbauer aufgenommen und an 0004 verwiesen; das Kriterium verlangt nur das Wort.
4. **Die Story-JSDoc in `ChoicePrompt.stories.tsx` ist deutsch** (`:23`, `:41`, `:54`, `:78`, `:106`, `:120`, `:135`). Set-weiter Befund, in 0010 als eigene Aufgabe abgelegt; kein Kriterium dieser Aufgabe nennt die Story-Datei.
5. **`.v2field__label` in Versalien** — gemessen `text-transform: uppercase`; trifft hier „ANTWORT", „ANTWORT *" und „ANMERKUNG". Set-weit, wie in 0017.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: das
App-Kriterium (`RaiseClarificationForm`), das in `ludwig/app` fällig wird.

## Nachtrag 2026-10-27: Gruppen von Antworten (Owner über llcto)

**Anlass.** Die Beleg-Einzelprüfung (0223) hat sieben Hauptwege und fünf
Ablagen (Jahresabschluss, Private Steuerunterlage, Lohn, Dauerakte,
Irrelevant). Der Owner will die Ablagen als **eine** Zeile „Ablegen ohne
Buchung ›", die erst beim Wählen aufklappt, nicht als fünf flache Zeilen mit
Präfix. So hat die App es heute gelöst, weil `ChoicePrompt` keine Gruppen kannte
(App-Commit 3fc3d664f).

**Regel aus `spec-schreiben` §3:** 2. Eine Prop an `ChoiceOption` und die
gleiche an `RadioOption` (0017). Die Darstellung liegt im Primitive, damit jede
Radiogruppe sie hat.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `ChoiceOption.options` | `Omit<ChoiceOption, "options">[]` | nein | Die Option ist eine Gruppe. Ihre Zeile trägt rechts das Chevron der Disclosure. Gewählt, oder wenn eine ihrer Optionen gewählt ist, klappen die Optionen eingerückt darunter auf, jede mit ihrer Unterzeile. Eine Ebene | `ChoicePrompt/OptionGroup`, `ChoicePrompt/OptionGroupList`, `SourceDocumentReview/*` |
| `RadioOption.options` | `Omit<RadioOption, "options">[]` | nein | dasselbe im Primitive | `RadioGroup/Grouped` |

**Form, die ich gewählt habe:**

- **Gruppe als Radio:** Die Gruppenzeile ist selbst ein Radio mit demselben
  `name`. Die Unteroptionen sind Radios derselben Gruppe in einem eigenen
  `<fieldset>`; dessen `<legend>` (= Gruppenwort) ist nur für den Screenreader.
- **Tastatur:** Pfeiltasten, Leertaste und Tab-Stopp bleiben beim Browser. Ein
  Pfeil auf die Gruppe klappt sie auf, ↓ geht dann in ihre erste Option, wer die
  Gruppe verlässt, klappt sie zu. Von unten führt ↑ auf die Gruppenzeile und
  das nächste ↑ an ihr vorbei: Die Optionen stehen nach der Zeile, also geht es
  von dort mit ↓ hinein (H1). Kein eigener Tastaturweg, keine Fokusfalle.
- **Höhe:** Beim Auf- und Zuklappen rückt, was darunter steht, nach — auch der
  Knopf (gemessen bis 347 px bei fünf Ablagen). Das ist die Folge der Form, die
  der Owner gewählt hat, und keine Bewegung: Es springt nichts ohne Wahl (H6).
- **Klick auf die offene Gruppenzeile** wählt wieder die Gruppe. Eine gewählte
  Option ist dann zurückgenommen, die Gruppe bleibt offen, der Knopf wartet —
  ohne getippten Freitext; mit Freitext geht dann die reine Freitext-Antwort
  (`optionId: null`, H9).
  Zuklappen geht nur, indem man eine andere Antwort wählt; das Chevron ist
  kein eigener Schalter (H2).
- **Offen ist sie genau dann,** wenn die Gruppe oder eine ihrer Optionen gewählt
  ist. Das ist aus dem Wert abgeleitet, nicht gespeichert.
- **„empfohlen" und Vorauswahl** gelten auch für eine Unteroption. Ohne
  `defaultOptionId` wird die empfohlene vorgewählt, auch in einer Gruppe; die
  Gruppe steht dann offen. Ist sie zu und enthält die Empfehlung, trägt die
  Gruppenzeile „empfohlen", damit die Empfehlung nicht verschwindet.
- **Die Gruppe ist keine Antwort.** Steht die Wahl nur auf der Gruppenzeile,
  gilt das wie „nichts gewählt": Der Knopf wartet und sagt daneben „Wählen Sie
  eine Möglichkeit unter ‚Ablegen ohne Buchung‘." Ist ein Freitext getippt, geht
  er wie ohne Wahl als reine Freitext-Antwort (`optionId: null`), per Klick wie
  per Strg+Enter (M1). `onSubmit` meldet nie die Kennung der Gruppe. `note` gilt
  an Unteroptionen wie an anderen Optionen.
- **`options: []`** ist keine Gruppe: Die Zeile ist eine gewöhnliche Antwort
  ohne Chevron (H4).
- **Vorlesehilfe:** Zugeklappt nennt die Gruppenzeile ihre Zahl, nur für den
  Screenreader („Ablegen ohne Buchung, 5 Möglichkeiten"; bei einer
  „1 Möglichkeit"). Offen entfällt der Zusatz, die verschachtelte Gruppe trägt
  ihr Wort (llcto 2026-10-27, H3, `207621a`). Ein Radio kennt kein
  `aria-expanded`; das Chevron sagt es nur dem Auge.

**Kann bewusst nicht:** keine zweite Ebene; keine Gruppe, die selbst eine
Antwort ist; kein Aufklappen ohne Wahl (ein Klick aufs Chevron allein wählt die
Gruppe, weil die ganze Zeile das Ziel ist).

**Abnahmekriterien (Nachtrag):**

- [ ] Zu: nur die Gruppenzeile mit Chevron, keine Unter-Radios im DOM (`OptionGroup` links)
- [ ] Empfohlene Unteroption: vorgewählt, Gruppe offen (`OptionGroup` rechts, `SourceDocumentReview` Kontoauszug)
- [ ] Zu mit Empfehlung darin: „empfohlen" an der Gruppenzeile (`RadioGroup/Grouped`)
- [ ] Pfeiltasten laufen durch Gruppe und Unteroptionen, verlassen klappt zu
- [ ] Nur Gruppenzeile gewählt: Knopf wartet, Satz daneben; Absenden meldet die Unteroption
- [ ] Screenreader: Unteroptionen in einer Gruppe mit dem Gruppenwort

**Selbst gemessen (2026-10-27, fremde Abnahme steht aus):**
- Tastatur: `next` ↓ `file` (offen, 5 Unter-Radios) ↓ `annual` ↓ `private` ↑ `annual` ↑ `file` ↑ `next` (zu, 0 Unter-Radios).
- Weiter ↓ durch alle fünf bis `client`: zu.
- Gruppenzeile gewählt: „Wählen Sie eine Möglichkeit unter „Ablegen ohne Buchung"."
- Strg+Enter mit „Dauerakte": gemeldet `permanent`.
- Unter-Zeilen um 24 px eingerückt, Chevron offen um 90° gedreht.
- Keine Konsolenfehler.

## Abnahme Nachtrag 2026-10-27 (fremd)

Fremder Prüfer, weder Erbauer noch einer der Vorprüfer. Gegenstand ist Commit
`091af3e`; der Arbeitsbaum war sauber, gemessen ist also genau dieser Stand.
Gemessen in headless Chromium über `scripts/cdp.mjs` gegen den Dev-Server auf
Port 6107. Tasten als echte `Input.dispatchKeyEvent`, Klicks als
`Input.dispatchMouseEvent`, der Screenreader-Baum über
`Accessibility.getFullAXTree`. Wo keine Story einen Rand zeigt, sind acht
Instanzen von `ChoicePrompt` zur Laufzeit in die Seite gerendert (`createRoot`,
dieselbe React-Instanz wie die Story):

R1 Gruppe zuerst, nichts gewählt · R2 `defaultOptionId="private"`
(Unteroption), Empfehlung außerhalb · R3 Gruppe mit `options: []` · R4 `note`
(Pflicht) an der Unteroption `annual` · R5 Gruppe plus `freeText` · R6
`pending`, Empfehlung in der Gruppe · R7 `optionStyle="list"`,
`defaultOptionId="annual"` · R8 `optionStyle="list"`, zu, Empfehlung in der
Gruppe.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` nicht gestartet (Auftrag: kein Build im Arbeitsbaum, parallele Messungen) | ✓ (Build offen) |
| Wächter | `check:when` Exit 0, `check:language` Exit 0 („0 German comment lines"), `check:type` Exit 0, `check:icons` Exit 0, `check:classes` Exit 1 mit genau den vier Altklassen `v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page` — keine neue | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Änderung in `primitives/RadioGroup.tsx` und `patterns/ChoicePrompt.tsx`, keine neue Datei; Stories `v3-primitives-formular-radiogroup--grouped` und `v3-patterns-prüfen-choiceprompt--option-group` in den bestehenden Dateien und Gruppen | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | JSDoc an `RadioOption.options` (`RadioGroup.tsx:29–35`) und `ChoiceOption.options` (`ChoicePrompt.tsx:33–38`) englisch, die deutschen Wörter darin sind zitierte UI-Zeichenketten. `Line` und `radio()` sind nicht exportiert. Story-JSDoc, Story-Namen und Fixture-Kennungen (`file`, `annual`, `payroll`, `permanent`, `irrelevant`, `duplicate`) englisch | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Im Diff kein Hex und kein px in TSX; `size={14}` ist eine Stufe der `IconSize`-Leiter. px nur in `v3.css` (`calc(14px + 8px)`, `3px`, `2px`). `LABEL` in `SourceDocumentReview.stories.tsx:178` ist aus `decisions()` abgeleitet, keine zweite Quelle. Kein Status im Spiel | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--option-group`, `--grouped`, die sechs `SourceDocumentReview`-Stories. Der Nachtrag leitet für die Gruppe keine Zustände ab und begründet keinen Ausschluss; vier Ränder sind nur zur Laufzeit belegt (H5) | ✓ (mit H5) |
| Prüfliste `design-guidelines.md` §9 | Stufe und Importe abwärts (`RadioGroup` → `../Icons`, wie `Disclosure`) ✓ · Text links ✓ · keine neue Farbe, nur `--color-text-muted` am Chevron ✓ · Kontrast gemessen: Chevron 6,69:1 auf Weiß, 6,19:1 auf der gewählten Zeile (`accent-50`), 6,17:1 auf dem Seitengrund; Unterzeile der Unteroption 4,88:1; Fokusring 2 px `rgb(59, 143, 196)` 3,28–3,29:1 ✓ · `prefers-reduced-motion`: Übergang des Chevrons 0,12 s → `1e-05s`/`none` ✓ · Tastatur ✓ (unten) · kein Icon ohne Wort: Chevron `aria-hidden`, in der Zeile mit dem Gruppenwort ✓ · Hover: Gruppenzeile, Unteroption und Chevron färben die Zeile `rgb(244, 246, 248)`, `cursor: pointer` ✓ · Trefferfläche ist die ganze Zeile: `rows` 530 × 61 px, `list` 560 × 33 px ✓ · Lucide `chevron-right`, `stroke-width` 1,5, 14 × 14 über `ACTION_ICON.collapse` — dasselbe Zeichen und dieselbe Drehung um 90° wie `Disclosure`, `DataTable`, `TodoList` ✓ · Schrift: Unteroption 13,5 px wie die Hauptzeilen, Unterzeile 12,5 px ✓ · `min-width: 0` an Gruppe und innerem `fieldset` ✓ · `.v2vh`-Legende 1 × 1 px, kein Querlauf bei 700, 1100, 1280, 1400 und 1920 px (`scrollWidth` = `clientWidth`) ✓ · Texte Sie, kein Ausrufezeichen ✓ | ✓ |
| Im Browser angesehen (Storybook) | Alle 7 `RadioGroup`-, 11 `ChoicePrompt`-, 6 `SourceDocumentReview`- und 23 `ClarificationCard`-Stories, dazu die Editor-Stories mit `RadioGroup` (`ClarificationEditor`, `RecurringRuleEditor`, `CaseEditor`) geöffnet; Konsole (Fehler, Warnungen, Ausnahmen) in jeder 0. Bilder von `--option-group` und `--grouped` angesehen | ✓ |

**Variabel (Nachtrag)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Zu: nur die Gruppenzeile mit Chevron, keine Unter-Radios im DOM (`OptionGroup` links) | `--option-group`, linke Frage: Radios `next* file client`, `.v2radiogrp__group` ohne `is-open`, das innere `fieldset` fehlt ganz (0 Unter-Radios), Chevron vorhanden, `transform: none`. Ebenso `--grouped` und `SourceDocumentReview --filled`/`--states` (Empfehlung außerhalb der Gruppe) | ✓ |
| Empfohlene Unteroption: vorgewählt, Gruppe offen (`OptionGroup` rechts, `SourceDocumentReview` Kontoauszug) | Rechte Frage: `permanent` gewählt, Gruppe offen mit 5 Unter-Radios, „Dauerakte empfohlen", Chevron `matrix(0, 1, -1, 0, 0, 0)` (90°). `SourceDocumentReview --interactive` nach zweimal K: Kontoauszug, `permanent` gewählt, Gruppe offen, „Warum empfohlen:" steht; ebenso beide Instanzen von `--preview-loading`, die Rechnung an eine Privatperson (`private`) und das Rundschreiben (`irrelevant`) | ✓ |
| Zu mit Empfehlung darin: „empfohlen" an der Gruppenzeile (`RadioGroup/Grouped`) | `--grouped` (Wert `next`): Gruppenzeile „Ablegen ohne Buchung empfohlen", im Baum `radio "Ablegen ohne Buchung empfohlen"`. Nach ↓ auf die Gruppe steht das Wort an „Dauerakte" und nicht mehr an der Gruppenzeile. In `ChoicePrompt` dasselbe (R8) | ✓ |
| Pfeiltasten laufen durch Gruppe und Unteroptionen, verlassen klappt zu | `--option-group` links, ab Tab (Fokus `next`): ↓ `file` (offen, 5) ↓ `annual` ↓ `private` ↑ `annual` ↑ `file` ↑ `next` (zu, 0). Siebenmal ↓: `file`, `annual` … `irrelevant`, `client` (zu). ↑ von `client` → `file` (offen), ↑ → `next` (zu), ↑ springt um auf `client`. → und ← wirken wie ↓ und ↑. Tab aus der Unteroption `annual` → Knopf, Shift+Tab zurück auf `annual`, die Leertaste lässt sie gewählt. R1 (nichts gewählt): Tab landet auf der Gruppenzeile, die Leertaste wählt sie und klappt auf, ↓ `annual`, Shift+Tab hinaus, Tab zurück auf `annual`, Tab weiter zum Knopf. `document.activeElement` war in keinem Schritt `body`, keine Falle. Von unten sind die Unteroptionen nur über die Gruppenzeile erreichbar (H1) | ✓ (mit H1) |
| Nur Gruppenzeile gewählt: Knopf wartet, Satz daneben; Absenden meldet die Unteroption | Ohne Freitext hält es: in `--option-group`, `SourceDocumentReview --without-recommendation` und `--interactive` mit gewählter Gruppenzeile ist der Knopf `disabled`, daneben „Wählen Sie eine Möglichkeit unter „Ablegen ohne Buchung“.", Strg+Enter sendet nichts; mit `annual` meldet Strg+Enter `annual`, der Klick mit `irrelevant` meldet `irrelevant`, die Beleg-Prüfung schreibt „Dauerakte". **Mit `freeText` reißt es (R5):** Gruppenzeile gewählt, „Bitte ablegen." getippt → Knopf frei, kein Satz; der Klick meldet `{"optionId":"file","text":"Bitte ablegen."}`, Strg+Enter `{"optionId":null,"text":"Bitte ablegen."}` — siehe M1 | ✗ |
| Screenreader: Unteroptionen in einer Gruppe mit dem Gruppenwort | `Accessibility.getFullAXTree`, `--option-group` rechts: `group "Ablegen ohne Buchung"` liegt in `group "Entscheidung"`, darin die fünf Unteroptionen, z. B. `radio "Dauerakte empfohlen Bleibt dauerhaft abgelegt, …" checked=true`. Die Gruppenzeile ist `radio "Ablegen ohne Buchung Kein Buchungsbeleg; …"` direkt unter „Entscheidung". Zu: keine innere Gruppe im Baum. Ebenso `--grouped` | ✓ (mit H3) |

**Ränder und Aufrufer (aus dem Prüfauftrag)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `defaultOptionId` zeigt auf eine Unteroption | R2: `private` gewählt, Gruppe offen, Gruppenzeile ohne „empfohlen", „In den nächsten Zeitraum empfohlen" bleibt; Tab landet auf `private`, Strg+Enter meldet `{"optionId":"private"}` | ✓ |
| Gruppe ohne Optionen (`options: []`) | R3: gewöhnliche Zeile ohne Chevron und ohne inneres `fieldset`; gewählt ist der Knopf frei, Strg+Enter meldet `{"optionId":"file"}`. Die Spec regelt den Fall nicht (H4) | ✓ (ungeregelt, H4) |
| `note` an einer Unteroption | R4: `annual` gewählt → Feld „Notiz zur Ablage *", Knopf gesperrt mit „Bitte ergänzen Sie den Text."; getippt → frei, Strg+Enter meldet `{"optionId":"annual","text":"Belegt die Rückstellung."}`; Wechsel auf `private` → Feld weg. Keine Story (H5) | ✓ |
| `disabled`/`pending` während des Sendens | R6 (Gruppe offen): alle fünf Radios `disabled`, alle Zeilen `v2radioline--disabled`, Knopf „Sende …", kein Satz; Tab überspringt die Gruppe. `SourceDocumentReview --states`: dasselbe bei zugeklappter Gruppe, die Fehler-Instanz behält die Wahl | ✓ |
| `optionStyle="list"` neben `"rows"` | `list` (`--grouped`, R7): Unter-Radio bei x = 46 px, genau unter dem Text der Gruppenzeile (46), Zeilen 33 px (mit Unterzeile 53 px), Abstand 2 px wie zwischen den übrigen Optionen. `rows` (`--option-group`): Unterzeilen 24 px eingerückt, 61,3 px hoch wie die Hauptzeilen, Abstand 8 px; Unter-Radio bei 749 px, Text der Gruppenzeile bei 747 px (H7) | ✓ |
| Maus: Unteroption, Gruppenzeile, Chevron | `--option-group` links: Klick aufs Chevron wählt `file` und klappt auf, Klick auf das Gruppenwort ebenso; Klick auf „Lohn" und auf ihre Unterzeile wählt `payroll`; Klick auf den gesperrten Knopf meldet nichts; „Irrelevant" plus Knopf → „Entschieden: irrelevant"; Klick auf „In den nächsten Zeitraum" klappt zu. Klick auf die offene Gruppenzeile bei gewählter Unteroption wählt die Gruppe zurück (H2) | ✓ (mit H2) |
| Bestehende Aufrufer schreiben dasselbe | `ClarificationCard` (23 Stories) und `RadioGroup` in `ClarificationEditor`, `RecurringRuleEditor`, `CaseEditor`: ohne `options` nimmt der Code denselben Weg (`answers` = `options`, `answer` = `choice`, `Line` = das bisherige Markup); 0 Chevrons, 0 Gruppen, 0 Konsolenmeldungen. **`SourceDocumentReview --overview` schreibt jetzt anderes:** M2 | ✗ |
| Spec gegen Code, Satz für Satz | Prop-Tabelle (beide `Omit<…, "options">[]`) ✓ · „rechts das Chevron der Disclosure" ✓ · „eingerückt, jede mit ihrer Unterzeile" ✓ · „Eine Ebene" ✓ (Typ) · „Gruppe als Radio … eigenes `<fieldset>` … `<legend>` nur für den Screenreader" ✓ (`legend.v2vh`, 1 × 1 px) · „der nächste Pfeil geht in ihre erste Option" ✓ nur für ↓ (H1) · „wer die Gruppe verlässt, klappt sie zu" ✓ · „aus dem Wert abgeleitet, nicht gespeichert" ✓ (`RadioGroup.tsx:85`) · „empfohlen und Vorauswahl auch für eine Unteroption" ✓ · „wartet der Knopf und sagt daneben …" ✓ ohne, ✗ mit Freitext (M1) · „`onSubmit` meldet immer die Kennung der Unteroption, nie die der Gruppe" ✗ (M1) · „`note` gilt an Unteroptionen" ✓ · „ein Klick aufs Chevron allein wählt die Gruppe" ✓ · Zitat im Satz der Spec (H8) · Nachträge in 0017 und 0223 ✓ | ✗ (wegen M1) |

**Nicht abgenommen — der Nachtrag geht zurück auf `in Arbeit`.** Zwei Mängel:

**M1 — Mit Freitext meldet der Knopf die Gruppe.** Der Klickweg
(`ChoicePrompt.tsx:229–231`) sendet `optionId: choice`, `send()` für Strg+Enter
(`:148–151`) dagegen `optionId: answer`. Solange nur die Gruppenzeile gewählt
ist, ist `choice` die Kennung der Gruppe. Ohne Freitext sperrt `blocked` den
Knopf, und der Unterschied fällt nicht auf. Mit `freeText` gibt ein getippter
Satz den Knopf frei (`blocked = (!answer && !typed) || …`), der Satz „Wählen Sie
eine Möglichkeit unter …" verschwindet (`openGroup && !typed`), und dann meldet
der Klick `{"optionId":"file","text":"Bitte ablegen."}`, Strg+Enter
`{"optionId":null,"text":"Bitte ablegen."}` (R5). Damit reißen zwei Sätze der
Spec, „wartet der Knopf" und „nie die der Gruppe", und dieselbe Eingabe ergibt
je nach Weg zwei verschiedene Antworten. Heute latent: `SourceDocumentReview`
hat keinen Freitext, `ClarificationCard` keine Gruppen; die öffentliche
Schnittstelle erlaubt beides zusammen. Mindestens der Klickweg muss `answer`
senden; ob die Gruppenzeile mit getipptem Satz wartet oder als reine
Freitext-Antwort (`optionId: null`) geht, entscheidet die Spec.

**M2 — Die Übersicht der Beleg-Prüfung zeigt Entschiedenes als „offen".**
`SourceDocumentReview.stories.tsx:347` setzt `decidedOf = { "doc-statement":
"archive", "doc-newsletter": "delete" }`, `:360` fällt auf `"archive"` zurück.
Beide Kennungen hat der Commit entfernt, `LABEL` kennt sie nicht mehr. Gemessen
in `--overview` mit aufgeklappter Liste: Der Kopf sagt „3 von 5 offen", die
Spalte „Entscheidung" zeigt aber in allen fünf Zeilen „offen". Vor dem Commit
standen dort „Archivieren" und „Löschen". Die Kennungen (auch im Fallback) auf
`permanent` und `irrelevant` umstellen.

**Hinweise** (keine Mängel):

- **H1 — Von unten führt kein Pfeil in die Unteroptionen.** ↑ von „Beim
  Mandanten klären" landet auf der Gruppenzeile, das nächste ↑ verlässt die
  Gruppe. „Irrelevant" erreicht man von unten nur mit ↑ und danach fünfmal ↓.
  Das ist keine Falle, aber die Spec beschreibt nur die Richtung ↓. Den Satz
  präzisieren oder das Verhalten bewusst so festhalten.
- **H2 — Ein Klick auf die offene Gruppenzeile nimmt die Unteroption zurück.**
  Ist „Lohn" gewählt, wählt ein Klick auf „Ablegen ohne Buchung" oder auf ihr
  Chevron wieder die Gruppe. Sie bleibt offen, und der Knopf wartet wieder. Wer
  das Chevron wie bei `Disclosure` zum Zuklappen nimmt, verliert seine Wahl,
  ohne dass etwas zuklappt. Die Spec regelt nur den Klick im zugeklappten
  Zustand.
- **H3 — Die Vorlesehilfe sagt nicht, dass die Gruppenzeile aufklappt.** Das
  Chevron ist `aria-hidden`, `aria-expanded` gibt es an `radio` nicht, und die
  neuen Optionen erscheinen ohne Ansage. Zugeklappt hört man nur „Ablegen ohne
  Buchung … Optionsfeld". Ein Text nur für die Vorlesehilfe (etwa die Zahl der
  Möglichkeiten) wäre ein neues Wort und damit eine Frage an den Owner.
- **H4 — `options: []` ist ungeregelt.** Die Zeile wird eine gewöhnliche Antwort
  und meldet die Kennung der „Gruppe" (R3). Das ist vermutlich richtig. Die
  Spec sagt aber „keine Gruppe, die selbst eine Antwort ist" und schweigt zum
  leeren Fall.
- **H5 — Vier Ränder haben keine Story:** `defaultOptionId` auf einer
  Unteroption, `note` an einer Unteroption, `pending` bei offener Gruppe
  (`--states` nimmt einen Beleg, dessen Empfehlung außerhalb der Gruppe liegt)
  und `ChoicePrompt` mit `optionStyle="list"` und Gruppe. Belegt sind sie nur
  zur Laufzeit (R2, R4, R6, R7).
- **H6 — Der Knopf springt beim Durchlaufen um 347 px.** In `--option-group`
  links steht „Entscheiden und weiter" bei y = 263 px. Mit ↓ auf die
  Gruppenzeile steht er bei 610 px, nach dem Verlassen wieder weiter oben. Die
  Form hat der Owner gewählt. Die Folge für den Tastaturweg und die Regel
  „nichts springt" sollte trotzdem festgehalten werden.
- **H7 — In `rows` steht das Unter-Radio 2 px rechts vom Text der
  Gruppenzeile** (749 gegen 747 px), in `list` genau darunter (46/46).
  `calc(14px + 8px)` wiederholt Radiogröße und Abstand als Zahlen, statt sie aus
  einer Quelle zu nehmen.
- **H8 — Im Satz der Spec schließt das innere Zitat mit geradem `"`**
  („…Ablegen ohne Buchung"."), der Code richtig mit `“`.

Geprüft von / am: Claude (Abnahme-Agent, fremd), 2026-10-27 · Offen: M1, M2;
`pnpm build` nicht gelaufen. Der Status im Kopf von 0028 ist unverändert
(`fertig` gilt für den Bestand vor dem Nachtrag).

### Nachbesserung 2026-10-27 (nach der fremden Abnahme des Nachtrags)

| Punkt | Behoben | Nachweis |
|---|---|---|
| M1 Klick meldete die Gruppe | Der Knopf sendet `answer` wie Strg+Enter; Gruppenzeile mit Freitext geht als `optionId: null` | `ChoicePrompt.tsx` (Knopf), Satz unter „Form" |
| M2 Übersicht zeigte „offen" | `decidedOf` und der Rückfall auf `permanent`/`irrelevant` | `SourceDocumentReview --overview` |
| H1 ↑ von unten | als Verhalten beschrieben | „Form → Tastatur" |
| H2 Klick auf die offene Gruppenzeile | als Verhalten beschrieben | „Form" |
| H4 `options: []` | geregelt: gewöhnliche Antwort | „Form" |
| H5 Ränder ohne Story | Story `OptionGroupList`: `list`, `defaultOptionId` in der Gruppe, `note` an der Unteroption | `v3-patterns-prüfen-choiceprompt--option-group-list` |
| H6 Knopf rückt nach | als Folge der Form festgehalten | „Form → Höhe" |
| H7 2 px in `rows`, Zahlen im CSS | eine Einrückung für beide Stile, `calc(14px + var(--space-2))` mit Herkunft im Kommentar | `v3.css` |
| H8 gerades Anführungszeichen | Satz mit ‚…‘ im Zitat | „Form" |
| H3 Ansage „klappt auf" | llcto: bauen (Barrierefreiheit, kein sichtbares Wort) → zugeklappt „<Label>, n Möglichkeiten" nur für den Screenreader | `207621a`, „Form → Vorlesehilfe" |

Stand: M1 und M2 behoben, H1, H2, H4–H8 aufgenommen, H3 bei llcto. Gemessen: Einrückung `rows` 687/687 px, `list` 46/46 px; `--overview` zeigt „Dauerakte" und „Irrelevant"; keine Konsolenfehler. **Kurze fremde Nachprüfung von M1/M2 steht aus.**


## Nachprüfung 2026-10-27 (fremd)

Fremder Prüfer, weder Erbauer noch Prüfer der ersten Abnahme. Gegenstand ist die
Nachbesserung `a05bdb7`. Gemessen wurde der Stand `207621a`: Das ist `a05bdb7`
plus der H3-Commit (Zahl der Möglichkeiten für die Vorlesehilfe in
`RadioGroup.tsx`, `position: relative` an der Gruppe). Er berührt keinen der
Wege, die hier geprüft werden; H3 selbst ist nicht Gegenstand. Der Arbeitsbaum
war sauber. Gemessen in headless Chromium über `scripts/cdp.mjs` gegen den
Dev-Server auf Port 6107, mit echten Tasten- und Mausereignissen. Für M1 sind elf
Instanzen von `ChoicePrompt` zur Laufzeit in die Story-Seite
`--option-group` gerendert (`createRoot`, dieselbe React-Instanz wie die
Story). Grund: Keine Story kombiniert `freeText` mit einer Gruppe.

| Punkt | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| M1: nur Gruppenzeile + Freitext, Klick = Strg+Enter | `ChoicePrompt.tsx:232` sendet `optionId: answer` wie `send()` (`:150`). Zur Laufzeit, Gruppenzeile gewählt, „Bitte ablegen." getippt: Knopf frei, kein Satz. Der Klick meldet `{"optionId":null,"text":"Bitte ablegen."}` (in `rows` und in `list`). Strg+Enter meldet dasselbe, aus dem Textfeld wie vom Radio der Gruppe | ✓ |
| M1: ohne Freitext wartet der Knopf | Gruppenzeile gewählt, Feld leer oder nur Leerzeichen: Knopf `disabled`, daneben „Wählen Sie eine Möglichkeit unter „Ablegen ohne Buchung“.". Klick und Strg+Enter senden nichts (0 Aufrufe von `onSubmit`). Ebenso mit `freeText.toggle` bei zugeklapptem Feld | ✓ |
| M1: Unteroption meldet ihre Kennung | `annual` + Text: Klick und Strg+Enter melden beide `{"optionId":"annual","text":"Für den Abschluss."}`. `private` ohne Freitext: beide `{"optionId":"private"}`. In keinem Lauf kam die Kennung `file` einer Gruppe mit Optionen an | ✓ |
| M2: Spalte „Entscheidung" in `v3-entitäten-beleg-sourcedocumentreview--overview` | Alle drei Listen aufgeklappt. Die erste: Kopf „3 von 5 offen", Spalte `offen · offen · Dauerakte · offen · Irrelevant`, also drei „offen". Die zweite: „alle 5 entschieden", fünf Wörter, gleich der Spalte „Empfehlung". Die dritte: „kein Beleg zu prüfen", Leertext „Alle 61 Belege sind verarbeitet, zugeordnet oder gesichtet.". Ursache behoben: `SourceDocumentReview.stories.tsx:347` und `:360` nutzen `permanent`/`irrelevant`. Konsole 0 | ✓ |
| H7: Unter-Radio unter dem Text der Gruppenzeile | x des Unter-Radios gegen x des Gruppentexts. `--option-group` (`rows`): links 51/51, rechts 747/747 bei 1400 px, 687/687 bei 1280, 1007/1007 bei 1920. `--option-group-list` (`list`) 46/46. `RadioGroup --grouped` (`list`) 46/46. `SourceDocumentReview --preview-loading` (`rows`) 676/676. `padding-left` überall 22 px | ✓ |
| Neue Story `v3-patterns-prüfen-choiceprompt--option-group-list` | Beim Laden ist `annual` gewählt und die Gruppe offen (5 Unter-Radios, Chevron). Der Stil ist `list` (keine Klasse `--rows`). Das Feld „Notiz zur Ablage *" ist da (Platzhalter „Wofür wird er im Abschluss gebraucht?"), der Knopf gesperrt mit „Bitte ergänzen Sie den Text.". Tab fokussiert `annual`. Nach „Belegt die Rückstellung." meldet der Klick „Entschieden: annual · Belegt die Rückstellung.", Strg+Enter nach neuem Laden ebenso. Bei Wechsel auf `private` ist das Feld weg, der Klick meldet `private` ohne Text. Konsole 0 | ✓ |
| Spec „Form → Tastatur" (↑ von unten) | `--option-group` links: Tab `next`, ↓ `file` (offen, 5), ↓ `annual`, ↑ `file`, ↑ `next` (zu). ↑ springt um auf `client`, ↑ `file` (offen), ↑ `next` (zu), also an ihr vorbei. ↓ `file`, ↓ `annual`, also von der Zeile mit ↓ hinein | ✓ |
| Spec „Form → Höhe" | Knopf links bei y = 263 px. Hover auf Gruppenzeile und Chevron: 263. Mit ↓ auf die Gruppe: 610 (+347 px). Bei `client` mit Notizfeld: 377. Rechts (offen von Anfang an): 610. Nichts rückt ohne Wahl | ✓ |
| Spec „Klick auf die offene Gruppenzeile" | `payroll` gewählt, dann Klick auf das Gruppenwort: `file` gewählt, Gruppe offen (5), Knopf gesperrt mit Satz. Ebenso der Klick aufs Chevron der offenen Zeile. Erst „In den nächsten Zeitraum" klappt zu. Mit getipptem Freitext siehe H9 | ✓ (mit H9) |
| Spec „Die Gruppe ist keine Antwort" | wie M1 oben; Satz Wort für Wort gegen `ChoicePrompt.tsx:121–151` (`openGroup`, `answer`, `blocked`, `why`) | ✓ |
| Spec „`options: []`" | Laufzeit: Zeile `file` ohne Chevron, kein inneres `fieldset`, keine Gruppe im DOM. Gewählt ist der Knopf frei, der Klick meldet `{"optionId":"file"}` | ✓ |
| `pnpm typecheck`, `pnpm check:language` | Exit 0 und Exit 0 („0 German comment lines left in 0 files"), auf `207621a` | ✓ |

**Hinweise** (keine Mängel):

- **H9 — Die offene Gruppenzeile mit getipptem Freitext.** Der Satz „… die
  Gruppe bleibt offen, der Knopf wartet" stimmt nur, solange kein Freitext
  getippt ist. Gemessen: `annual` gewählt, „Notiz." getippt, Klick aufs Chevron
  der offenen Zeile. Danach ist `file` gewählt, der Knopf bleibt frei, es steht
  kein Satz daneben, und der Klick meldet `{"optionId":null,"text":"Notiz."}`.
  Das folgt widerspruchsfrei aus „Die Gruppe ist keine Antwort" (M1). Wer das
  Chevron zum Zuklappen nimmt, schickt dann aber eine reine Freitext-Antwort
  statt „Jahresabschluss". Heute ist das latent: Kein Aufrufer verbindet
  Freitext und Gruppe. Kommt der erste, sollte der Satz einen Zusatz bekommen
  („ohne getippten Freitext").
- **H10 — Rest von H7.** `calc(14px + var(--space-2))` (`v3.css:5188`)
  wiederholt die Radiobreite aus `.v2radio` weiter als Zahl. In `list` ist der
  Zeilenabstand das Literal `gap: 8px` (`v3.css:2262`), nicht `--space-2`. Die
  Ausrichtung hält, weil beide heute 8 px sind; ändert sich eins davon, kippt
  `list` still.
- **H11 — Rest von H5.** `pending` bei offener Gruppe hat weiter keine Story
  (nur R6 zur Laufzeit). Die Spalte „Nachweis (Story)" der Prop-Tabelle nennt
  `OptionGroupList` nicht.

M1 und M2 sind behoben, alle Punkte ✓.

**Nachtrag abgenommen**

Geprüft von / am: Claude (Prüf-Agent, fremd), 2026-10-27 · `pnpm build` nicht
gelaufen (Auftrag: kein Build). Der Status im Kopf von 0028 ist unverändert.

### Nachbesserung 2 (2026-10-27, Hinweise der Nachprüfung)

- **H9:** Der Satz zum Klick auf die offene Gruppenzeile nennt jetzt den Fall mit getipptem Freitext.
- **H10:** `.v2radioline` nimmt `gap: var(--space-2)` statt `8px` (gleicher Wert). Die Einrückung der Gruppe rechnet mit demselben Token, nur die Radiobreite 14 steht als Zahl, mit Herkunft im Kommentar.
- **H11:** `OptionGroupList` steht in der Prop-Tabelle. Für „`pending` bei offener Gruppe" gibt es keine eigene Story, gemessen zur Laufzeit (R6 der Abnahme).


## Nachtrag 2026-10-27 — Feld und Knopf an der Wahl

Owner 2026-10-27 über ll-abnahme. Feld, Fehler und Knopf stehen jetzt unter der
gewählten Antwort, über `RadioGroup.underChecked`. Das Feld ist die `note` ihrer
Option oder der offene Freitext, denn beide gehen mit ihr auf den Weg. Unter der
Liste bleiben sie, wenn nichts gewählt ist oder es keine Optionen gibt. Eine
neue Prop gibt es nicht. Anlass, Form und Kriterien stehen in 0229.
