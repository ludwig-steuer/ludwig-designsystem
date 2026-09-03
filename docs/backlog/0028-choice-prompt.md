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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Gesperrter Knopf nennt den Grund im Text daneben (T6) | `v3-patterns-prüfen-choiceprompt--blocked`: Knopf `disabled`, daneben `.v2ask__why` „Wählen Sie eine Antwort oder schreiben Sie eine."; sobald eine Antwort gewählt ist, verschwindet der Satz und der Knopf wird frei (in `--with-free-text` nachgestellt) | ✓ |
| Strg+Enter sendet, die Taste steht am Knopf (V14) | Am Knopf steht sie überall („Antwort senden · Strg+Enter"). Gesendet wird sie aber nur aus dem Freitextfeld: `--with-free-text`, Option gewählt und Text eingetragen, Strg+Enter im `textarea` → „Gesendet: bewirtung · Kunde war dabei". Der einzige `onKeyDown` der Datei sitzt am `Textarea`; `Button`/`ActionButton` melden keine Taste an (kein `addEventListener`). Ohne `freeText` — `Filled`, `Blocked`, `Pending` — verspricht der Knopf also eine Taste, die es nicht gibt. Die in der Spec genannte Story `Interactive` existiert nicht (die Story-Tabelle der Spec führt sie selbst nicht) | ✗ |
| Nach einem Fehler steht die Eingabe noch da | `--error`: Text ins Freitextfeld gegeben, während der `Callout` „Die Rückfrage konnte nicht gesendet werden …" steht — der Text bleibt, nichts setzt den inneren Zustand zurück | ✓ |
| Ohne `freeText`-Prop gibt es kein Textfeld | `--filled`: `textarea`-Anzahl im DOM = 0; mit der Prop (`--with-free-text`) ist genau eins da | ✓ |
| Ersetzt `RaiseClarificationForm.tsx` ohne Funktionsverlust | Vergleich mit `app/apps/web/src/modules/accounting-cases/ui/sachverhalt/RaiseClarificationForm.tsx`: Frage, Freitext, Absenden, Laufzustand und Fehler sind gedeckt, Strg+Enter kommt neu hinzu. Nicht gedeckt: das Formular ist **eingeklappt** (Auslöser-Knopf „Rückfrage stellen"), es hat neben dem Text **zwei weitere Eingaben** (Empfänger-Select mit Hinweiszeile, die mit der Auswahl wechselt, und den Schalter „Blockiert die Buchung") und einen **Abbrechen**-Weg, der den Entwurf behält | ✗ |
| `pnpm typecheck` / `pnpm build` | beide grün | ✓ |

**Nachprüfung der Behebung** (fremder Prüfer, 2026-09-03): Strg+Enter sendet mit Fokus auf einem Radio, ohne Textfeld im Baum; `defaultOptionId` ist vorbelegt.

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte:
(1) Strg+Enter gehört an das Pattern, nicht an das Freitextfeld — sonst muss die
Taste am Knopf verschwinden, wenn `freeText` fehlt. (2) Die Story `Filled` soll
laut Spec „eine gewählt" zeigen, zeigt aber nichts Gewähltes: die Auswahl liegt
ausschließlich im inneren Zustand, es gibt keine Prop, sie vorzubelegen. `Filled`
und `Blocked` rendern deshalb denselben Zustand. Dasselbe trifft `Error`, das
mit leerem Feld startet und die Aussage „Eingabe steht noch da" nicht von selbst
vorführt. (3) `Pending` sperrt alles, aber der Knopf trägt kein Wort für „läuft"
— `pendingLabel` greift nur, wenn `ActionButton` seine eigene Handlung fährt,
nicht bei `pending` von außen. (4) `RadioGroup name="choice"` ist fest verdrahtet:
zwei `ChoicePrompt` auf einer Seite teilen sich eine Radiogruppe.
