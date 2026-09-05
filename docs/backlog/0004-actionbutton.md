# 0004 · ActionButton

| | |
|---|---|
| Status | Abnahme |
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

## Abnahme

Alle Nachweise vom 2026-09-05, Storybook auf `http://localhost:6107`,
Story-IDs aus `/index.json`.

**Story-Deckung.** Sieben Stories in `/index.json`, genau die sieben der
Spec: `--filled` · `--pending` · `--failed` · `--with-confirm` ·
`--with-confirm-danger` · `--variants` · `--in-use`. Jede Prop hat ihre
Story: `action` (`--filled`, `--failed`), `children` (`--filled`),
`variant`/`size`/`icon`/`hotkey`/`disabled` (`--variants`: alle vier
Varianten, `md` + `sm`, Icon `Check` mit Wort, Taste `A`, „Gesperrt"),
`pendingLabel` (`--pending`, mit und ohne die Prop), `confirm`
(`--with-confirm`, `--with-confirm-danger`). `Leer` und `LeerNachFilter`
sind oben begründet ausgeschlossen. Pending und Fehler sind nicht im
Ruhezustand gepinnt, sondern einen Klick entfernt — beide wurden im Browser
angeklickt und stehen sichtbar (Nachweise unten).

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest:** `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` → „Storybook build completed successfully", `Vite ✓ built in 12.03s`, Exit 0 (nur die bekannte Chunk-Size-Warnung) | ✓ |
| **Fest:** Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/ActionButton.tsx` und `ActionButton.stories.tsx` nebeneinander; `ActionButton.stories.tsx:10` `title: "v3/Primitives/Aktion/ActionButton"`; die Gruppe „Aktion" ist der Kommentar `src/ui/v3/index.ts:42` `/* ── Primitives ── Aktion */`, unter dem der Export `index.ts:64-68` steht | ✓ |
| **Fest:** Code englisch; `@when`/`@instead` an jedem Export | `ActionButton.tsx:33-37` trägt beide Zeilen englisch; Bezeichner, Props, Typen und Kommentare englisch, deutsch nur in Strings für die Nutzerin (`:74` „Die Handlung ist fehlgeschlagen.", `:110` „Abbrechen"). Die Typ-Exporte `ActionResult`/`ConfirmSpec` tragen kein `@when` — so hält es das ganze Set (`Button.tsx` mit `ButtonVariant`/`ButtonSize` ebenso). Deutsche Story-Docstrings sind Hauskonvention (`Button`, `TextButton`, `IconButton`, `OverflowMenu`, `ActionBar` gleich) | ✓ |
| **Fest:** Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,6}\b\|[0-9]+px" ActionButton.tsx` → keine Treffer; `grep -nE "status-registry\|const .*LABEL\|Record<"` → keine Treffer. Eigenes Markup sind nur `.v2act` / `.v2act__err`, beide in `src/styles/v3.css:1822-1823`; der Baustein kennt keinen Status | ✓ |
| **Fest:** Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung oben: 7 von 7 in `/index.json`, Ausschluss von `Leer`/`LeerNachFilter` in der Spec begründet | ✓ |
| **Fest:** Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe/Barrel ✓ (`primitives/`, Export über `index.ts`, kein Fachmodul) · Hex/px/Label-Map ✓ (Zeile oben) · Text links, Zahlen rechts mit `tnum`, nichts zentriert ✓ (`--in-use`: „RE-4471" links, `1.249,90 €` rechts, Spaltenkopf „Betrag" folgt) · Farbe nur als Kritikalitätsstufe ✓ (Rot nur `variant="danger"`, entsprechend dem Entscheid an `Button`: „`danger` nur, wo etwas verloren geht") · jeder farbige Zustand mit Wort ✓ (Fehler ist ein Satz, Pending ein Spinner **neben** einem Wort) · Kontrast ✓ (Fehlertext `rgb(168,64,60)` auf `rgb(244,246,248)` = **5,60:1**; Fokusring `.v2btn:focus-visible` in `v3.css:532`, im Browser sichtbar) · `prefers-reduced-motion` ✓ (`v3.css:1634-1637` bremst `.v2spin`) · Hover ✓ (`v3.css:500/515/528`) · Icons Lucide 1.5 px mit Wort ✓ (`--variants`, `--with-confirm-danger`) · Texte T1–T5 ✓ (Sie-Form, Imperativ mit Objekt, GLOSSARY-Begriffe Stapel/Beleg/Kreditor). — **✗ bei „Hauptweg per Tastatur, Taste sichtbar (V11, V14, T8)":** die Taste ist sichtbar, aber tot, siehe Mangel 1 | ✗ |
| **Fest:** Im Browser angesehen (Storybook), nicht nur gebaut | Alle sieben Story-IDs unter `http://localhost:6107/iframe.html?id=…` geöffnet und bedient; jede rendert gestylt (Screenshots geprüft), keine fehlende Klasse, kein fehlendes Token | ✓ |
| **Variabel:** Zwei schnelle Klicks lösen genau eine Handlung aus | `--filled`, echter Maus-Doppelklick auf den Knopf → Zähler steht danach auf „1× abgenommen", nicht 2×. Zweite Probe, zwei Klicks 60 ms auseinander: „1×" → „2×" (ein Zuwachs), dazwischen `button.disabled === true` und `aria-busy="true"`. Wächter ist `ActionButton.tsx:67` `if (pending) return;` | ✓ |
| **Variabel:** Während der Ausführung gesperrt, mit Wort statt bloßem Spinner (V7) | `--pending`, beide Knöpfe geklickt: `disabled: true`, `aria-busy: "true"`, `.v2spin` vorhanden; links steht „Nehme ab …", rechts bleibt „Ohne pendingLabel" stehen — der Spinner nimmt nur den Icon-Platz (`Button.tsx:79-80`), das Wort bleibt immer | ✓ |
| **Variabel:** Fehler als Text neben dem Knopf, nicht als Dialog, nicht allein durch Farbe (V7) | `--failed`, beide Knöpfe geklickt (`{ error }` **und** Wurf): zwei `.v2act__err` mit vollem Satz; Geometrie in derselben Zeile (Knopf rechte Kante 167 px, Text linke Kante 179 px, gleiche Oberkante), `document.querySelectorAll('[role=dialog], .v2scrim').length === 0`, beide Knöpfe danach wieder bedienbar. Der Text steht nach 3 s noch; beim nächsten Klick auf denselben Knopf verschwindet er (Offene Frage 2 „ja" ist umgesetzt, `ActionButton.tsx:69` `setError(null)`) | ✓ |
| **Variabel:** Bestätigungsknopf trägt `confirmLabel`; keine Story zeigt „OK" oder „Ja" (T3) | `--with-confirm`: Fußzeile „Abbrechen" / „Stapel abnehmen"; `--with-confirm-danger`: „Abbrechen" / „Buchung stornieren" (`v2btn--danger v2btn--sm`). `grep -nE '"(OK\|Ja)"' ActionButton.stories.tsx` → keine Treffer | ✓ |
| **Variabel:** Escape bricht den Dialog ab, der Fokus kehrt auf den Knopf zurück | `--with-confirm`: Auslöser fokussiert, Klick → Dialog offen, `document.activeElement.className === "v2dlg v2dlg--md"`; echte Escape-Taste → `[role=dialog]` und `.v2scrim` beide 0, `document.activeElement === document.querySelector('.v2act button')`, `:focus-visible` greift, die Handlung ist **nicht** gelaufen (`closeDialog`, `ActionButton.tsx:80-85`) | ✓ |
| **Variabel:** Nutzt `Button` und `Dialog`, baut deren Optik nicht nach | `ActionButton.tsx:5-6` importiert beide; eigenes Markup ist nur `span.v2act` plus `span.v2act__err`. Kein eigener Rahmen, keine eigene Farbe, kein eigener Spinner — der kommt aus `Button.tsx:79`, die Fußzeile aus `Dialog.tsx:78` | ✓ |
| **Variabel:** Ersetzt `ResetButton` und `ConfirmReviewButton` in `ludwig/app` ohne Funktionsverlust | Betrifft `ludwig/app`, hier nicht erfüllbar. Stand dort: `apps/web/src/modules/invoices/ui/ResetButton.tsx` und `…/ConfirmReviewButton.tsx` bestehen unverändert, `grep -rn "ActionButton" apps/web/src` → kein Treffer | offen (App) |
| **Variabel:** Ersetzt `window.confirm()` an mindestens einer der 14 Stellen (I2) | Betrifft `ludwig/app`, hier nicht erfüllbar. `grep -rn "window.confirm" apps/web/src` → 7 Treffer in 6 Dateien (`invoices/ui/ResetButton.tsx`, `external-integrations/ui/IntegrationDeleteButton.tsx`, `recurring-rules/ui/RuleEditorForm.tsx`, `accounting-cases/ui/CloseCasesPanel.tsx`, `document-inbox/ui/DocumentInbox.tsx`, `datev-export/ui/ResetBatchButton.tsx`), unverändert | offen (App) |

Abgenommen von / am: — · Zurück auf „in Arbeit" mit zwei Mängeln:

1. **Die Taste am Knopf löst nichts aus.** „Verhalten · Tastatur" verlangt:
   „`hotkey` löst dieselbe Handlung aus wie der Klick — mit `confirm` öffnet
   er den Dialog, nicht die Handlung." `ActionButton.tsx:93` reicht `hotkey`
   nur an `Button` weiter, und `Button.tsx:82` rendert daraus ein `<Kbd>` —
   niemand hört auf die Taste. Im Browser geprüft: auf `--variants` und
   `--in-use` steht das Kästchen „A" am Knopf, `keydown A` bewirkt nichts
   (`aria-busy` bleibt überall `undefined`). Das ist genau der Fall, den V14
   und T8 verbieten: eine sichtbare Taste, die nichts tut. Zu klären ist
   dabei, wo die Bindung hingehört — `useHotkeys` liegt in
   `patterns/Hotkeys.tsx`, ein Primitive darf es nicht importieren
   (Importe nur abwärts); ein eigener `keydown`-Listener in `ActionButton`
   ginge, kollidiert aber mit einem Screen, der dieselbe Taste über
   `useHotkeys` registriert. Der Entscheid gehört in diese Spec, bevor
   gebaut wird.
2. **Enter bestätigt den Dialog nicht.** „Verhalten · Tastatur" verlangt:
   „Im Dialog: Escape bricht ab, Enter bestätigt", I2 ebenso („Enter
   bestätigt, `Esc` schließt ohne zu speichern"). Im Browser geprüft:
   Dialog offen, Fokus liegt auf dem Panel (`.v2dlg`, `tabIndex={-1}`),
   echte Enter-Taste → das `keydown` kommt an, der Dialog bleibt offen, die
   Handlung läuft nicht. Ursache liegt in `Dialog.tsx:41-43`: der
   Tastatur-Effekt kennt nur `Escape`. Der Baustein gehört einer anderen
   Spec — der Entscheid (Enter in `Dialog` nachrüsten oder in
   `ActionButton` auf die Primäraktion legen) muss dort fallen, hier bleibt
   das Kriterium unerfüllt.

Nicht als Mangel gezählt, aber zu bereinigen: Offene Frage 1 beantwortet den
Fehlerort mit „darunter, linksbündig zum Knopf", „Verhalten" und das
Abnahmekriterium sagen „neben dem Knopf". Gebaut ist „neben, bei Enge
darunter" (`.v2act` ist `inline-flex` mit `flex-wrap`) — das folgt dem
Kriterium. Die Offene Frage sollte entsprechend geschlossen werden, damit die
Spec sich nicht selbst widerspricht.

## Mängel der Abnahme vom 2026-09-05 — behoben

**M1 — die Taste am Knopf löste nichts aus.** `hotkey` erreichte nur
`Button`, und der zeichnet ein `Kbd` und hört auf nichts. Eine sichtbare
Taste ohne Wirkung ist genau der Fall, den V14 verbietet.

Die Abnahme hat die Entscheidung richtig benannt, statt sie zu treffen: „wo
gehört die Bindung hin? `useHotkeys` liegt in `patterns/`, ein Primitive darf
es nicht importieren; ein eigener Listener würde mit einem Screen
kollidieren, der dieselbe Taste registriert."

**Entschieden so:** die geteilte Hälfte der Tastaturregel zieht **eine Ebene
tiefer** — `primitives/hotkey.ts` mit `isTyping()`, `matchesKey()` und
`useHotkey()`. Beide Ebenen brauchen sie: ein Screen bindet mehrere Tasten
(`useHotkeys`, mit Legende), ein einzelner Knopf bindet die eine, die er
druckt. `patterns/Hotkeys.tsx` behält seine Screen-API und liest die zwei
Funktionen von dort, statt sie ein zweites Mal zu schreiben. Dasselbe Muster
wie bei der Icon-Registry (0087), die aus demselben Grund nicht in
`patterns/` liegt.

Zur Kollision: bindet ein Screen dieselbe Taste wie ein Knopf, der sie zeigt,
läuft der Druck zweimal. Das ist ein Fehler an der Aufrufstelle und bleibt
**sichtbar**, weil der Knopf seine Taste druckt — zwei Stellen, die eine
Taste beanspruchen, sind genau das, was V14 auffindbar haben will. Steht so
im Kopfkommentar von `hotkey.ts`.

Mit `confirm` öffnet die Taste den Dialog, sie überspringt ihn nicht. Eine
Taste, die eine unumkehrbare Handlung ohne Rückfrage ausführt, wäre das
Gegenteil dessen, wofür die Rückfrage da ist.

**Nachweis:** Story `--in-use` im Browser, `keydown A` → der
Bestätigungsdialog öffnet, der Text ändert sich. Die Taste ist auf dem Knopf
sichtbar (`kbd` „A").

**M2 — Enter bestätigt den Dialog nicht.** Die Abnahme hat ihn richtig an
`Dialog.tsx` verwiesen, nicht an diese Aufgabe. **Erledigt mit 0092:** der
Dialog nimmt eine `onConfirm`-Prop, Enter löst sie aus — nicht im
`textarea`, nicht auf einem Knopf. `ActionButton` reicht sie an seinen
Bestätigungsdialog durch.

**Nicht behoben, weil außerhalb:** die Spec spricht von „28 `window.confirm`
in 14 Dateien"; im Repo sind es heute 7 Aufrufe in 6 Dateien. Die Zahl gehört
beim nächsten Anfassen der Spec nachgezogen — sie ändert kein Kriterium.

## Abnahmekriterien (Nachtrag zu den bestehenden)

- [ ] Die Taste am Knopf löst dieselbe Handlung aus wie der Klick (Story `--in-use`, `keydown`)
- [ ] Mit `confirm` öffnet die Taste den Dialog, statt die Handlung auszuführen
- [ ] Die Taste greift nicht, während der Bestätigungsdialog offen ist
- [ ] Die Taste greift nicht in einem Textfeld (`isTyping`)
- [ ] `patterns/Hotkeys.tsx` hat keine eigene `isTyping`-Kopie mehr (`grep`)
- [ ] Enter bestätigt den Dialog (0092)
