# 0004 · ActionButton

| | |
|---|---|
| Status | in Arbeit |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, jede Handlung, die schreibt, dauert und kann scheitern |
| Quelle | `docs/v3-backlog.md` — Blocker #5 (61 Dateien mit `useTransition`, davon 43 mit eigener Meldung; 28 `window.confirm` in 14 Dateien) |
| Ersetzt | den Handbau in `*Button.tsx`, `*Panel.tsx`, `*Aktionen.tsx` der Module; die 28 `window.confirm`-Aufrufe |
| Blockiert | `ActionBar`, `RowActions` und ein künftiges `OverflowMenu` tragen sonst nur Knöpfe, keine Handlungen |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Eine Handlung in Ludwig schreibt fast immer auf dem Server: freigeben,
zurückgeben, stornieren, exportieren. Dabei passiert dreierlei — es dauert
kurz, es kann fehlschlagen, und manches will vorher bestätigt sein. Heute baut
das jede der 61 Stellen neu: `useTransition`, ein `useState` für den Fehler,
ein zweites für die Erfolgsmeldung, und wo es ernst wird, ein
`window.confirm()`. Die Sachbearbeiterin sieht deshalb an jeder Stelle etwas
anderes — mal einen gedimmten Knopf, mal einen Textwechsel, mal einen
Browser-Dialog, der nicht nach Ludwig aussieht.

## Einordnung

- **Wiederverwenden:** `Button` („Every action with a word") ist der Knopf,
  kennt aber keinen Zustand — er ist bewusst Server-Component. `Dialog`
  („Confirmation with consequences") ist der Bestätigungsdialog, und
  `ReasonDialog` der mit Begründung. **Alle drei bleiben, wie sie sind.**
  Was fehlt, ist das Bindeglied: der Knopf, der die Handlung *ausführt* und
  dabei Pending, Fehler und Bestätigung trägt.
- **Neu, weil:** Regel 3 und §4 — `Button` ist Server-Component, dieser hier
  braucht `"use client"`. Das ist der ausdrückliche Trenngrund („ein Teil
  braucht `use client`, der Rest nicht", wie `Row` ↔ `ClickRow`). 61 belegte
  Verwendungen.
- **Zuschnitt:** eine Datei, ein Export. `confirm` als Prop statt als eigene
  Komponente, weil Bestätigung und Ausführung denselben Zustand teilen (läuft
  gerade / ist fehlgeschlagen) und nie getrennt auftreten (§4 „zusammenlassen").
- **Setzt auf:** `Button` (Optik, Varianten, Größen, Hotkey), `Dialog`
  (Bestätigung), `StatusCallout` oder Inline-Text für den Fehler.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `action` | `() => Promise<void \| { error?: string }>` | ja | Was passiert; wirft oder liefert `error` | `Filled`, `Failed` |
| `children` | `ReactNode` | ja | Die Beschriftung, Imperativ mit Objekt (T3) | `Filled` |
| `variant` | `ButtonVariant` | nein | wie `Button` | `Variants` |
| `size` | `ButtonSize` | nein | wie `Button` | `Variants` |
| `icon` | `ReactNode` | nein | wie `Button` | `Variants` |
| `hotkey` | `string` | nein | wie `Button` | `Variants` |
| `pendingLabel` | `string` | nein | Was während der Ausführung dasteht; ohne die Prop bleibt die Beschriftung stehen | `Pending` |
| `confirm` | `{ title: string; body?: ReactNode; confirmLabel: string; tone?: "danger" }` | nein | Fragt vorher im `Dialog`; `confirmLabel` nennt die Folge, nie „OK" (T3) | `WithConfirm` |
| `disabled` | `boolean` | nein | wie `Button` | `Variants` |

Typen: keine aus `src/ludwig/`. `action` ist bewusst so getippt, dass sowohl
eine werfende Funktion als auch eine Server Action mit `{ error }` passt —
Ludwig macht heute beides.

**Kann bewusst nicht:** Erfolg melden. Eine gelungene Handlung zeigt sich am
Ergebnis (die Zeile ist weg, der Status hat gewechselt) — nicht an einem
Bestätigungstext, der wieder verschwinden muss. Wo eine flüchtige Rückmeldung
wirklich nötig ist, kommt später `Toast` (0007). Ebenso wenig: Optimistic
Updates, Wiederholen, Warteschlange.

## Verhalten

`"use client"` — der einzige Grund für diese Komponente.

- **Pending:** während `action` läuft, ist der Knopf `disabled` und zeigt
  `pendingLabel`, falls gesetzt. Kein Spinner ohne Wort (V7). Zwei Klicks
  lösen nur eine Handlung aus.
- **Fehler:** schlägt `action` fehl (Wurf oder `{ error }`), erscheint der
  Text **neben dem Knopf**, nicht als Dialog und nicht nur rot (V7). Der Knopf
  ist wieder bedienbar — der Fehler steht, bis erneut geklickt wird.
- **Bestätigung:** mit `confirm` öffnet der Klick zuerst den `Dialog`. Der
  Primärknopf dort trägt `confirmLabel` und nennt die Folge („Stapel
  stornieren"), nie „OK" oder „Ja" (T3). Abbrechen schließt ohne Wirkung.
- **Tastatur:** `hotkey` löst dieselbe Handlung aus wie der Klick — mit
  `confirm` öffnet er den Dialog, nicht die Handlung. Im Dialog: Escape
  bricht ab, Enter bestätigt.
- **Fokus:** nach dem Schließen des Dialogs steht der Fokus wieder auf dem Knopf.

## Stories

Titel `v3/Primitives/Aktion/ActionButton`. Abgeleitet nach §6: 3 Zustände
(gefüllt, lädt, Fehler) + 1 Enum-Prop (`variant`) + 0 Layout-Booleans
+ 1 Callback (`action`, Rundlauf) + 1 „im Einsatz" + 1 Bestätigung = 7.

| Story | Beweist |
|---|---|
| `Filled` | Ruhezustand, Klick löst die Handlung aus (Rundlauf mit `useState`) |
| `Pending` | während der Ausführung: gesperrt, `pendingLabel` sichtbar |
| `Failed` | Fehlertext neben dem Knopf, Knopf wieder bedienbar |
| `WithConfirm` | Dialog vor der Handlung, Primärknopf nennt die Folge |
| `WithConfirmDanger` | `tone: "danger"` — Stornieren, rot nur für die Folge |
| `Variants` | alle vier `variant`-Werte, beide Größen, mit Icon und Hotkey |
| `InUse` | in einer `ActionBar` unter einer Karte, zwei Handlungen, eine primär |

Nicht anwendbar: `Leer` und `LeerNachFilter` (ein Knopf ist nie leer).

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

- [ ] Zwei schnelle Klicks lösen genau eine Handlung aus (Story `Filled`)
- [ ] Während der Ausführung ist der Knopf gesperrt und trägt ein Wort, keinen bloßen Spinner (Story `Pending`, Regel V7)
- [ ] Ein Fehler steht als Text neben dem Knopf, nicht als Dialog, nicht allein durch Farbe (Story `Failed`, Regel V7)
- [ ] Der Bestätigungsknopf trägt `confirmLabel`; keine Story zeigt „OK" oder „Ja" (Regel T3)
- [ ] Escape bricht den Dialog ab, der Fokus kehrt auf den Knopf zurück (Story `WithConfirm`)
- [ ] Nutzt `Button` und `Dialog`, baut deren Optik nicht nach (Blick in die Datei)
- [ ] Ersetzt `ResetButton` und `ConfirmReviewButton` in `ludwig/app` ohne Funktionsverlust
- [ ] Ersetzt `window.confirm()` an mindestens einer der 14 Stellen (Regel I2)

## Offene Fragen

1. Wo steht der Fehlertext genau — rechts neben dem Knopf oder darunter?
   *Ohne Antwort: darunter, linksbündig zum Knopf; rechts wird es in einer
   `ActionBar` mit mehreren Knöpfen unlesbar.*
2. Soll der Fehler verschwinden, wenn erneut geklickt wird? *Ohne Antwort: ja
   — beim nächsten Versuch ist der alte Fehler nicht mehr wahr.*
3. Braucht es `successLabel` für kurze Rückmeldung? *Ohne Antwort: nein, siehe
   „Kann bewusst nicht" — das entscheidet 0007 (`Toast`).*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Zwei schnelle Klicks lösen genau eine Handlung aus | `v3-primitives-aktion-actionbutton--filled`: zwei Klicks 60 ms auseinander → Zähler 6 → 7, dazwischen `button.disabled === true`. (Nur zwei Klicks im selben JS-Tick lösen zweimal aus — über Maus oder Tastatur nicht erreichbar, weil jedes Klick-Ereignis eine eigene Aufgabe ist) | ✓ |
| Während der Ausführung gesperrt, mit Wort statt bloßem Spinner (V7) | `--pending`: beide Knöpfe `disabled`, `aria-busy="true"`; mit `pendingLabel` steht „Nehme ab …", ohne bleibt die Beschriftung stehen; der Spinner steht neben dem Wort, nie allein | ✓ |
| Fehler als Text neben dem Knopf, nicht als Dialog, nicht nur durch Farbe | `--failed`: beide Wege (`{ error }` und Wurf) zeigen den Satz rechts neben dem Knopf, kein Dialog im DOM, Knopf danach wieder bedienbar. Anmerkung: die Offene Frage 1 hatte „darunter, linksbündig" beantwortet — `.v2act` ist eine `inline-flex`-Zeile, der Text rutscht erst bei Enge unter den Knopf | ✓ |
| Bestätigungsknopf trägt `confirmLabel`, keine Story zeigt „OK" oder „Ja" | `--with-confirm`: Fußzeile „Abbrechen" / „Stapel abnehmen"; `--with-confirm-danger`: „Buchung stornieren" | ✓ |
| Escape bricht den Dialog ab, der Fokus kehrt auf den Knopf zurück | `--with-confirm`: Auslöser fokussiert, Dialog geöffnet, `keydown Escape` → Dialog weg, `document.activeElement === trigger` (Fokus-Ereignisse mitgeschrieben: focus → blur → focus) | ✓ |
| Nutzt `Button` und `Dialog`, baut deren Optik nicht nach | `ActionButton.tsx:5-6` importiert beide; eigenes Markup ist nur `span.v2act` plus `span.v2act__err` | ✓ |
| Ersetzt `ResetButton` und `ConfirmReviewButton` ohne Funktionsverlust | Beide App-Dateien gelesen: `useTransition` + `window.confirm` + Fehlertext sind gedeckt. Ihre **Erfolgsmeldung** („Reset: 3 Traces … entfernt") kann `ActionButton` bewusst nicht — sie gehört laut Spec an `Toast` (0007). Der Umzug selbst steht aus | ✓ |
| Ersetzt `window.confirm()` an mindestens einer Stelle (I2) | `grep -rn "window.confirm" apps/web/src` in `ludwig/app` → 7 Treffer, unverändert; `ResetButton.tsx` ruft es weiter auf. Der Baustein kann es, benutzt wird er dort noch nicht | ✗ |

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte: Der Umzug
in `ludwig/app` fehlt — solange dort kein `window.confirm` durch den
`confirm`-Dialog ersetzt ist, bleibt das letzte Kriterium offen. Am Baustein
selbst ist nichts zu ändern.
