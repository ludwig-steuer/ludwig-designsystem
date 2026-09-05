# 0028 · ChoicePrompt — die Frage mit Antwortoptionen

| | |
|---|---|
| Status | Abnahme |
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
| `options` | `ChoiceOption[]` | ja | `{ id, label, hint? }` — die vorgeschlagenen Antworten | `Filled` |
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

