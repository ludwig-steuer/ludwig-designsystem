# 0266 · Switch: Schalter für sofort wirkende Einstellungen

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-27 (zwei Nachprüfungen; letzter Mangel vom Auftraggeber behoben und gemessen, siehe Ende der Abnahme) |
| Stufe | `primitives/` · eigene Datei `primitives/Switch.tsx`, Gruppe Formular neben der Form-Familie |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → ja, eine Einstellung, die sofort gilt und sich zurückschalten lässt, kennt jede Software |
| Quelle | Owner-Entscheid 2026-11-27 (Simon über plugin-mananger, Feedback zu den Entwürfen). Er hebt 0018 für sofort wirkende, umkehrbare An/Aus-Einstellungen auf. Seitenprofil `docs/seiten/duo-connect.md`, „Nachtrag 2“, Zeile C2, C3. Fachtext `ludwig-plugin/docs/spec-oberflaeche-und-fehler.md` (Branch `umbau`) C2 und C5, Wörter aus `…/docs/begriffe.md` |
| Ersetzt | nichts im Set (`role="switch"` 0×). Im Plugin die Kästchen der heutigen Einstellungsseite |
| Blockiert | Plugin-Paket C5 (Bereich Einstellungen) und 0263 `ExtensionShell` (Story des Bereichs Einstellungen) |
| Setzt voraus | 0268 `Spinner` (`size="sm"`, `label`) |
| Spec von / am | designsystem, 2026-11-27 (ersetzt den Entwurf „`ActionButton` statt `Switch`“ vom selben Tag) |

## Ziel

Die Steuerfachangestellte öffnet im Plugin die Einstellungen und will die
Belegübergabe einschalten. Sie liest den Namen und darunter in zwei Sätzen,
was die Belegübergabe tut. Rechts steht der Schalter mit dem Wort „Aus“. Sie
klickt irgendwo in die Zeile oder drückt die Leertaste. Der Schalter steht auf
„An“, die Einstellung gilt sofort, einen Speichern-Knopf gibt es nicht. Dauert
das Speichern, sieht sie „wird gespeichert …“. Misslingt es, springt der
Schalter zurück, und der Grund steht darunter. Ein Vorleseprogramm sagt
„Belegübergabe eingeschaltet“, sobald der Wert gespeichert ist. „Fehlermeldungen
senden“ hat dieselbe Form.

## Einordnung

- **Wiederverwenden (§3 Regel 1, geprüft):**
  - `Checkbox` (`@when` „A single yes/no inside a form or a row“) steht für
    eine Angabe, die mit dem Formular gespeichert wird. Ein Kästchen, das
    ohne Speichern sofort wirkt, läse sich anders als jedes andere Kästchen
    im Set.
  - `ActionButton` trägt eine einmalige Handlung und nennt sie im Knopf.
    Einen dauerhaften Zustand zeigt er nicht.
  - `Segmented` schaltet Ansichten, nicht Einstellungen.
  - Kein `@when` trägt den Fall.
- **Neu, weil (§3 Regel 3):** kein `@when` passt, kein Fachwort nötig, zwei
  Verwendungen heute (Belegübergabe, Fehlermeldungen senden) und dazu der
  Owner-Entscheid. Aus vorhandenen Primitives ist es nicht in 15 Zeilen zu
  bauen, weil der Baustein eigenen Zustand trägt: Sperre beim Speichern,
  Rücksprung, Fehler, Ansage.
- **Das Bedenken aus 0018, gelöst im Schalter statt mit einem Nein:** 0018
  fürchtete einen Schalter ohne Wort, „den man versehentlich streift“. Die
  Antwort steckt im Baustein selbst:
  - Das Wort „An“/„Aus“ steht immer sichtbar daneben. Farbe zeigt den
    Zustand nie allein.
  - Der Name und ein Erklärsatz stehen in derselben Zeile.
  - Jede Änderung wird angesagt.
  - Der Rückweg ist derselbe Klick. Eine unumkehrbare Folge darf ein
    Schalter nicht haben, dafür gibt es `ActionButton` mit Rückfrage.
- **Zuschnitt (§4):** eigene Datei, nicht `Form.tsx`. `Switch` braucht
  `"use client"` (Zustand, `useId`, Zeitgeber), `Form.tsx` ist ohne. Läge der
  Schalter dort, würden `Field`, `Input` und `Checkbox` zu Client-Komponenten
  (Muster `Row` ↔ `ClickRow`). Im Barrel steht `Switch` bei der Form-Familie,
  der Story-Titel liegt in der Gruppe Formular. Mit den Props aus der Tabelle
  und sieben Stories liegt er unter den Grenzen.
- **Setzt auf:** `Spinner` (0268), `ActionResult` aus `ActionButton` (derselbe
  Ergebnistyp, keine zweite Definition), `.v2vh` für die Ansage.
- **Mitgeändert, damit Gleiches gleich ist:** `ActionButton` sagt einen
  Fehler neben dem Knopf heute nur im Dialogzweig an (`role="alert"`), im
  einfachen Zweig nicht (`<span className="v2act__err">`). Der Schalter sagt
  seinen Fehler an, also bekommt auch dieser Zweig `role="alert"`. Es gibt
  keine neue Prop. 0267 setzt darauf auf.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | ja | Name der Einstellung („Belegübergabe“). Titel der Zeile, zugänglicher Name über `aria-labelledby` und Teil der Ansage | `Filled` |
| `hint` | `ReactNode` | nein | Erklärtext unter dem Titel, ein bis drei Sätze, über `aria-describedby` verknüpft. Dasselbe Wort wie `RadioOption.hint` und `Field.hint` | `Filled`, `LongText` |
| `checked` | `boolean` | ja | Der gespeicherte Wert. Der Aufrufer hält ihn und setzt ihn nach dem Speichern neu | `Filled`, `Interactive` |
| `onChange` | `(checked: boolean) => void \| Promise<ActionResult>` | ja | Wird mit dem neuen Wert gerufen. `void` heißt: gilt sofort, ohne Warten. Ein Promise heißt: Der Schalter steht schon auf dem neuen Wert und ist gesperrt, bis das Promise antwortet. Antwort `{ error }` oder ein Wurf → Rücksprung mit Fehler. Sonst → Ansage | `Interactive`, `Saving`, `Failed` |
| `disabledReason` | `string` | nein | Gesetzt heißt gesperrt. Der Satz steht unter dem Erklärtext und ist mit `aria-describedby` verknüpft. Gesperrt ohne Grund geht nicht, das sichert der Typ | `Locked` |

Typen: `ActionResult` aus `primitives/ActionButton.tsx` (`void | { error?: string }`).
Aus `src/ludwig/` kommt nichts, der Schalter kennt keine Entität.
GLOSSARY: Die Wörter „Belegübergabe“ und „Fehlermeldungen senden“ kommen nur
als Daten in Stories vor (aus `ludwig-plugin/docs/begriffe.md`).

Feste Wörter im Baustein. Sie sind vom Owner freigegeben (Profil, Nachtrag 2):
„An“, „Aus“, „wird gespeichert …“, die Ansage „{label} eingeschaltet.“ bzw.
„{label} ausgeschaltet.“ und der fette Anfang eines Fehlers „Nicht
gespeichert.“.

Markup, das der Bau einhält:

```
<div class="v2switch">                                  ← Zeile, Hover-Grund
  <label class="v2switch__row">                         ← die ganze Zeile ist das Ziel
    <span class="v2switch__text">
      <span id={labelId} class="v2switch__label">{label}</span>
      <span id={hintId} class="v2switch__hint">{hint}</span>
      <span id={reasonId} class="v2switch__reason">{disabledReason}</span>
    </span>
    <span class="v2switch__state" aria-hidden="true">An | Aus</span>
    <input type="checkbox" role="switch" class="v2switch__knob"
           aria-labelledby={labelId} aria-describedby={hintId reasonId errorId}
           checked={shown} aria-disabled={pending || undefined} disabled={!!disabledReason} />
  </label>
  <div class="v2switch__msg">                           ← Spinner (ab 300 ms) oder Fehler
    <span id={errorId} role="alert">…</span>
  </div>
  <span class="v2vh" role="status">{announcement}</span> ← immer im DOM, anfangs leer
</div>
```

`aria-checked` folgt bei `input type="checkbox" role="switch"` dem nativen
`checked`. Ein eigenes `aria-checked` wäre eine zweite Wahrheit und wird nicht
gesetzt.

Was der Schalter **nicht** kann (bewusst):
- Er ist kein Formularfeld: kein `name`, kein Wert in `FormData`. Eine Angabe
  mit Speichern-Knopf ist ein `Checkbox`.
- Er fragt nicht nach. Eine Einstellung mit unumkehrbarer Folge gehört
  nicht in einen Schalter.
- Er meldet keinen Erfolg per `Toast`. Der Erfolg ist die Stellung plus Wort,
  angesagt über `role="status"`.
- Er hat keine eigene Taste. Eine Einstellung ändert man selten.
- Er speichert nichts selbst und lädt nichts. `onChange` ruft der Aufrufer
  auf.

## Verhalten

- **Ziel und Maus:** Die ganze Zeile ist ein `<label>`. Ein Klick auf Titel,
  Erklärtext, Wort oder Knopf schaltet um. Die Zeile antwortet auf Hover mit
  `--color-bg-soft` wie `.v2radioline` und zeigt `cursor: pointer`. Gesperrt
  hat sie keinen Hover-Grund und zeigt `cursor: not-allowed`. Die Zeile ist
  mindestens 24 px hoch (gemessen). Der Knopf allein misst 32 × 18 px, sein
  Daumen 14 px. Die Maße stehen in `v3.css`.
- **Tastatur:** Tab erreicht den Schalter, die Leertaste schaltet (nativ).
  Enter schaltet nicht: Das ist ein natives Kästchen, und Enter ist laut
  APG-Muster nur optional (offene Frage 2). Der Fokusring
  (`outline` in `--color-focus`, mit Abstand) liegt um den Knopf und ist bei
  `:focus-visible` sichtbar.
- **Stellung und Wort:** An heißt Knopf gefüllt in `--color-primary-700`,
  Daumen weiß rechts, Wort „An“. Aus heißt Rahmen `--color-border-control`
  auf `--color-surface`, Daumen in `--color-border-control` links, Wort
  „Aus“. Der gefüllte Grund steht für „aktiv/ausgewählt“ wie beim
  `Checkbox` (`accent-color: --color-primary-700`), nicht für einen Wert. Das
  Wort trägt den Zustand immer mit. Es hat eine feste Breite (die von „Aus“),
  damit der Knopf beim Wechsel nicht rückt, und es ist `aria-hidden`, weil
  der Zustand über `checked` schon vorgelesen wird.
- **Bewegung:** Der Daumen gleitet mit `--duration-fast` und
  `--ease-standard`. Bei `prefers-reduced-motion: reduce` springt er ohne
  Übergang.
- **Sofort wirkend mit Promise:**
  1. Ein Klick stellt den Schalter auf den neuen Wert, ruft `onChange(neu)`
     und sperrt ihn mit `aria-disabled="true"`. Es ist nicht `disabled`, weil
     der Fokus sonst verloren ginge. Weitere Klicks und die Leertaste wirken
     nicht, solange er gesperrt ist.
  2. Dauert das Promise länger als 300 ms, steht in der Meldungszeile
     `Spinner size="sm" label="wird gespeichert …"`. Speichern in
     `chrome.storage` dauert Millisekunden, dann blitzt nichts auf.
  3. Antwort `{ error }` oder ein Wurf: Der Schalter springt auf `checked`
     zurück. In der Meldungszeile steht
     „**Nicht gespeichert.** {error}“, bei einem Wurf ohne Text „**Nicht
     gespeichert.** Die Einstellung ist unverändert. Bitte versuchen Sie es
     noch einmal.“ Der Fehler wird mit `role="alert"` angesagt, ist mit
     `aria-describedby` verknüpft und verschwindet beim nächsten Umschalten.
  4. Erfolg: Die Sperre geht weg, und die Region sagt „{label}
     eingeschaltet.“ bzw. „… ausgeschaltet.“ an. Angezeigt wird danach
     `checked`. Der Aufrufer setzt den Wert also vor dem Ende seines Promise
     (Muster: `async (v) => { await save(v); setOn(v); }`, Story
     `Interactive`).
- **Ohne Promise (`void`):** Der Schalter zeigt `checked`, der Aufrufer setzt
  den Wert sofort. Es gibt keine Sperre und keine Ansage, weil der
  Zustandswechsel des fokussierten Schalters schon vorgelesen wird.
- **Gesperrt (`disabledReason`):** natives `disabled`, der Grund steht unter
  dem Erklärtext in `--color-text-muted`.
- **Zustände:**
  - Gefüllt: An oder Aus.
  - Lädt: wie Schritt 1 und 2 oben.
  - Fehler: wie Schritt 3 oben.
  - Leer gibt es nicht, weil ein Schalter immer einen Wert hat.
  - Leer nach Filter gibt es nicht, weil kein Filter da ist.
- **Schmal (320 px, Popup):** Titel und Erklärtext brechen um. Wort und Knopf
  bleiben rechts oben auf Höhe der ersten Titelzeile. Es gibt keinen
  waagerechten Scroll.
- **Mehrere Schalter untereinander:** Die Linie `--color-border-subtle`
  trennt sie (`.v2switch + .v2switch`). Es gibt keinen Zellrahmen und keine
  Zebra.
- **Client-Component**, weil der Baustein Zustand für Sperre, angezeigten
  Wert, Fehler und Ansage hält, dazu einen Zeitgeber für 300 ms und `useId`.

## Stories

Titel `v3/Primitives/Formular/Switch`. Ableitung nach §6:
- anwendbare Zustände: gefüllt, lädt, Fehler, dazu gesperrt (Prop
  `disabledReason`) → `Filled`, `Saving`, `Failed`, `Locked`
- Callback `onChange` → `Interactive`
- im Einsatz → `InUse`
- Rand, weil Texte umbrechen → `LongText`

Das sind sieben Stories, die Untergrenze für ein Primitive ist 3, die
Obergrenze 10.

| Story | Beweist |
|---|---|
| `Filled` | Zwei Zeilen untereinander. „Belegübergabe“ steht auf Aus, mit Erklärtext „Lädt Beleg-Dateien, die auf anderem Weg nach Ludwig kamen (zum Beispiel per E-Mail), nach DATEV Unternehmen Online hoch. Welche das sind, bestimmt Ludwig. Buchungen und Buchungsanweisungen werden nicht übertragen.“ „Fehlermeldungen senden“ steht auf An, mit „Bricht ein Abgleich mit einem Fehler ab, schickt das Plugin eine technische Meldung an den Anbieter: Version, Schritt, Fehlertext. Ohne Belegdaten, Namen oder Dateinamen.“ Dazwischen die Trennlinie. `onChange` ist synchron |
| `Saving` | `onChange` liefert ein Promise, das nicht antwortet. `play` klickt, nach 300 ms steht Spinner sm mit „wird gespeichert …“, der Schalter steht auf An und ist `aria-disabled` |
| `Failed` | `onChange` antwortet nach 600 ms mit `{ error: "Der Browser hat die Einstellung abgelehnt. Bitte laden Sie die Seite neu." }`. `play` klickt, der Schalter springt auf Aus zurück, darunter „**Nicht gespeichert.** Der Browser …“ in `role="alert"` |
| `Locked` | „Belegübergabe“ mit `disabledReason` „Erst möglich, wenn das Plugin mit Ludwig verbunden ist.“ Kein Hover, nicht fokussierbar, der Grund ist sichtbar |
| `Interactive` | Rundlauf mit `useState`. Promise mit 600 ms, Ansage „Belegübergabe eingeschaltet.“, eine Ausgabezeile unter der Story zeigt den gespeicherten Wert. Jeder dritte Klick scheitert einmal und springt zurück, der nächste gelingt |
| `InUse` | Eine `Card` mit Kopf „Einstellungen“ wie im Plugin (C5): beide Schalter, darüber eine `FieldList` „Verbindung“ und darunter eine eingeklappte `Disclosure` „Diagnose“. Bei 1280 px und bei 720 px Breite |
| `LongText` | Ein Rahmen von 288 px (Popup 320 px minus 16 px Rand je Seite), ein langer Name „Belege aus Ludwig an DATEV übergeben“ und drei Sätze Erklärtext. Titel bricht um, Wort und Knopf bleiben rechts oben |

Nicht anwendbare Zustände: leer und leer nach Filter, wie unter Verhalten
begründet. Für den Wurf ohne Text gibt es keine eigene Story. Er ist ein
Zweig von `Failed`, die Abnahme prüft ihn im Code.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Eine Gruppe von Schaltern mit Überschrift (`fieldset`/`legend`) | neuer Export `SwitchGroup` mit `label` | Eine Seite hat mehr als drei Schalter, die zusammengehören |
| Eine eigene Ansage, wo „{label} eingeschaltet.“ schief klingt | `announce?: (checked: boolean) => string` | Ein Label liest sich in der Ansage falsch, und der Owner will den Wortlaut ändern |
| Enter schaltet zusätzlich | keine Prop, eine Tastenregel im Baustein | Offene Frage 2 wird mit Ja beantwortet |

## Text für `design-guidelines.md` §11

Wörtlich als Ersatz der Zeile „Formular | Schalter (Toggle)“. Die Guideline
ändert der Bau, nicht diese Spec:

> | Formular | `Switch` (0266): dauerhafte An/Aus-Einstellung, die sofort wirkt und umkehrbar ist; Zustandswort „An“/„Aus“ immer sichtbar, ganze Zeile klickbar, Speichern mit Sperre, Rücksprung und Ansage | Kit `Toggle`; `ClientActiveToggle` bleibt ein Knopf (Zustand des Mandanten, keine Einstellung) | v2 (0266) · **benannte Ausnahme zu 0018, Owner 2026-11-27:** 0018 verwarf den Schalter am 2026-09-04; der Owner hebt das für sofort wirkende, umkehrbare Einstellungen auf. Formularangaben mit Speichern bleiben `Checkbox`, einmalige Handlungen `Button`/`ActionButton`, Wahl zwischen Ansichten `Segmented` |

Dazu erhält 0018 einen datierten Nachtrag mit Verweis auf 0266. Der Status
von 0018 bleibt „verworfen“, denn der verworfene Fall ist der Schalter ohne
Wort.

## Offene Fragen

1. Ansage für Einstellungen, deren Name kein Hauptwort ist: „Fehlermeldungen
   senden eingeschaltet.“ **Ohne Antwort:** Es bleibt bei der Vorlage
   „{label} eingeschaltet.“, und ein eigener Wortlaut kommt erst mit dem
   Ausbau `announce`.
2. Soll Enter den Schalter umschalten? Laut APG ist das optional, das native
   Kästchen tut es nicht. **Ohne Antwort:** nein, nur die Leertaste. Es ist
   ein natives Element ohne eigenen Tastencode, und Enter schickt in keinem
   Formular etwas ab, weil der Schalter in keinem Formular steht.

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

- [ ] Die Props stehen im Typ Zeichen für Zeichen wie in der Tabelle. `onChange` nutzt `ActionResult` aus `ActionButton`, es gibt keine zweite Definition
- [ ] `@when`: „A lasting on/off setting that takes effect at once and can be switched back.“ `@instead`: „A yes/no saved with a form → Checkbox. A one-off action → Button / ActionButton. Choosing between views → Segmented. One of several values → RadioGroup.“ `Checkbox` und `ActionButton` verweisen in ihrem `@instead` auf `Switch`. `pnpm check:when` ist grün
- [ ] Datei `primitives/Switch.tsx` mit `"use client"`, und `Form.tsx` bleibt ohne `"use client"`
- [ ] DOM (`Filled`): `input type="checkbox" role="switch"` ohne eigenes `aria-checked`, `aria-labelledby` zeigt auf den Titel, `aria-describedby` auf den Erklärtext. Der zugängliche Name ist „Belegübergabe“, die Beschreibung der Erklärtext (Barrierefreiheitsbaum gelesen)
- [ ] Ein Klick auf Titel, Erklärtext und Wort schaltet je einmal um (`Filled`). Die Leertaste schaltet, Enter nicht (offene Frage 2)
- [ ] Gemessen bei 1280 px: Zeile mindestens 24 px hoch, Knopf 32 × 18 px, Daumen 14 px. Fokusring sichtbar bei `:focus-visible`, Hover-Grund `--color-bg-soft` auf der ganzen Zeile
- [ ] Kontrast gemessen: Rahmen und Daumen bei Aus gegen `--color-surface` mindestens 3:1, Knopf bei An gegen `--color-surface` mindestens 3:1, Daumen bei An gegen den Knopf mindestens 3:1, das Wort mindestens 4,5:1
- [ ] Wort „An“/„Aus“ sichtbar in jeder Stellung, `aria-hidden`. Der Knopf rückt beim Wechsel nicht (x-Lage vorher = nachher)
- [ ] `prefers-reduced-motion: reduce` (Playwright `emulateMedia`): Der Daumen springt ohne `transition`
- [ ] `Saving`: Nach dem Klick sofort `aria-disabled="true"` und neue Stellung, der Fokus bleibt auf dem Schalter. Nach 300 ms steht Spinner sm mit „wird gespeichert …“, davor nicht. Leertaste und Klick wirken nicht
- [ ] `Failed`: Rücksprung auf den alten Wert. „**Nicht gespeichert.** …“ in `role="alert"`, mit `aria-describedby` verknüpft. Der nächste Klick löscht ihn
- [ ] `Interactive`: Die Region `role="status"` ist vor dem ersten Klick im DOM und leer. Nach Erfolg enthält sie „Belegübergabe eingeschaltet.“ bzw. „… ausgeschaltet.“. Bei Fehler bekommt sie keinen neuen Text
- [ ] `Locked`: natives `disabled`, nicht per Tab erreichbar, kein Hover-Grund. Der Grund ist sichtbar und mit `aria-describedby` verknüpft
- [ ] `LongText` bei 288 px: kein waagerechter Scroll, Wort und Knopf rechts oben auf Höhe der ersten Titelzeile
- [ ] Mehrere Schalter (`Filled`, `InUse`): genau eine Linie `--color-border-subtle` zwischen zwei Zeilen, keine über der ersten
- [ ] `ActionButton` im einfachen Zweig: `<span className="v2act__err" role="alert">`, nachgewiesen in `ActionButton/Failed`
- [ ] `grep -rn 'role="switch"' src` trifft nur `Switch.tsx`

## Befund an die App

Die Zeile L-386 gilt weiter, mit geändertem Lösungsteil. `ClientActiveToggle`
wird kein Schalter: Stilllegen ändert den Zustand eines Mandanten, es ist
keine Vorliebe. Dazu kommt ein Zusammenstoß in der Datenbank, wenn ein
zweiter Mandant mit derselben DATEV-Identität aktiv ist.

## Nachtrag 2026-11-27 — aus der Abnahme

- **Speichern an der Stelle des Erklärtexts:** Dauert das Promise länger als
  300 ms, steht `Spinner size="sm" label="wird gespeichert …"` im **selben
  Gitterfeld wie der Erklärtext** (grid-area-Stapel). Der Erklärtext ist
  dann `visibility: hidden` und bleibt über `aria-describedby` die
  Beschreibung (direkt referenzierte Knoten zählen auch versteckt). Die
  Fläche behält die Höhe des Erklärtexts; der Spinner nimmt dessen
  Schriftstufe (`--fs-ui-sm`), der Kreis bleibt 14 × 14 in Akzent. So
  springt nichts. Die Zelle „An“/„Aus“ zeigt nur das Wort. Der erste Weg
  (Kreis in der Wortzelle, `aria-busy`) ist verworfen: `aria-busy` am
  Kästchen sagen Vorlesehilfen nicht an, und ein Kreis ohne Wort widerspricht
  0268.
- **Hörbar:** Nach 300 ms schreibt die vorhandene polite-Region „{label} wird
  gespeichert …“, danach „{label} eingeschaltet.“ bzw. „… ausgeschaltet.“;
  beim Fehler wird sie leer, den Fehler sagt `role="alert"`.
- **Einziger Fall mit Bewegung:** Ohne `hint` gibt es keine Fläche, an deren
  Stelle der Spinner stehen könnte. Dann kommt die Zeile „wird gespeichert …“
  nur für die Dauer des Speicherns dazu.
- Der Fehler steht unverändert **unter** der Zeile und darf Platz nehmen: Er
  ist eine Rückmeldung.
- **Titel:** `--fs-ui` wie `.v2radioline` (Stufe des Zeilentitels), halbfett.
- **StrictMode:** Der Schalter darf nach einem Aufräumen und erneutem
  Einhängen nicht gesperrt bleiben (die App läuft mit `reactStrictMode`).

Zusätzliche Kriterien:

- [ ] `Saving`: Höhe der Zeile und y-Lage des Elements darunter vorher, bei 400 ms und nachher gleich; Spinner 14 × 14 in `--color-accent-700`; Region-Text bei 400 ms „Belegübergabe wird gespeichert …“; im Barrierefreiheitsbaum hat der Schalter auch während des Speicherns die Beschreibung (Erklärtext)
- [ ] In einem Prüfrahmen mit `<StrictMode>`: Speichern endet, die Ansage kommt, ein Fehler kommt an

## Abnahme

Gemessen am Arbeitsbaum (Stand HEAD `1b9a847` + ungestagte Änderungen), Storybook :6107, Playwright (eigene Seite je Lauf), Chromium. Story-IDs `v3-primitives-formular-switch--…`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| **Fest** · `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build -o <scratchpad>/sb-work`: „Storybook build completed successfully“ | ✓ |
| **Fest** · Datei nach der Familie, Story daneben, Titel in der Gruppe | `primitives/Switch.tsx` und `Switch.stories.tsx` daneben. Titel `v3/Primitives/Formular/Switch`. Im Barrel unter `/* Formular */` direkt nach `Form` | ✓ |
| **Fest** · Code englisch, `@when`/`@instead` an jedem Export | Bezeichner, Kommentare und JSDoc sind englisch. Deutsch steht nur in sichtbaren Strings (`FALLBACK_ERROR`, „An“/„Aus“, Ansage). `@when`/`@instead` an `Switch`. `pnpm check:when` „in Ordnung“, `pnpm check:language` Exit 0 | ✓ |
| **Fest** · kein Hex, kein px, keine Label-Map, Status über Registry | `grep -nE '#[0-9a-f]{3,6}\b\|[0-9]px'` in `Switch.tsx` und `Switch.stories.tsx`: 0 Treffer. 32/18/14 px stehen nur in `v3.css`. Der Baustein hat keinen Status | ✓ |
| **Fest** · alle Stories, ausgeschlossene Zustände begründet | Im Index stehen 7 Stories (`--filled`, `--saving`, `--failed`, `--locked`, `--interactive`, `--in-use`, `--long-text`). Jede Prop hat ihre Story. Leer und leer nach Filter sind begründet. Den Wurf ohne Text habe ich im Code geprüft: `FALLBACK_ERROR` = „Die Einstellung ist unverändert. Bitte versuchen Sie es noch einmal.“, auch beim synchronen Wurf | ✓ |
| **Fest** · Prüfliste §9 | Stufe stimmt, Importe nur abwärts (`Spinner`, Typ aus `ActionButton`). Gefüllter Grund heißt aktiv wie beim `Checkbox`, Rot nur für den Fehler. Jede Stellung hat ihr Wort. Kontrast, Fokus, reduce-motion, Hover und Trefferfläche: siehe die Zeilen unten. `check:type` Exit 0. `.v2switch` ist `position: relative` für `.v2vh`. **Befunde (H):** (1) Der Titel hat 14 px/600 (`--fs-ui-md`, Stufe Kartenkopf), der Zeilentitel und das Nachbar-Label `.v2radioline` haben 13,5 px. (2) Die Meldungszeile hält keine Höhe frei. Spinner oder Fehler schieben den Inhalt darunter um rund 25 px (`--saving` 129,5 px, `--filled` 104,5 px je Schalter) | ✓ (mit Befund) |
| **Fest** · im Browser angesehen | Alle 7 Stories bei 1280 px, `--in-use` auch bei 720 px, `--long-text` bei 320 px. Screenshots `scratchpad/shots/switch-*.png`. Keine Konsole mit `error` oder `warning` | ✓ |
| Props Zeichen für Zeichen, `ActionResult` aus `ActionButton` | `SwitchProps`: `label: string`, `hint?: ReactNode`, `checked: boolean`, `onChange: (checked: boolean) => void \| Promise<ActionResult>`, `disabledReason?: string`. `import type { ActionResult } from "./ActionButton"`, keine zweite Definition | ✓ |
| `@when`/`@instead` im Wortlaut, Verweise, `check:when` | Der Wortlaut in `Switch.tsx` ist gleich der Spec. `Checkbox` verweist mit „… without a form to save → Switch“, `ActionButton` mit „A lasting on/off setting → Switch“. `check:when` grün | ✓ |
| `"use client"` in `Switch.tsx`, nicht in `Form.tsx` | `Switch.tsx` Zeile 1. `grep "use client" Form.tsx`: 0 Treffer | ✓ |
| DOM und Barrierefreiheitsbaum (`--filled`) | `input type=checkbox role=switch`, `getAttribute('aria-checked')` = null. `aria-labelledby` zeigt auf „Belegübergabe“, `aria-describedby` auf den Erklärtext. CDP `Accessibility.getFullAXTree`: role `switch`, name „Belegübergabe“, description = Erklärtext, checked „false“. Zweite Zeile: „Fehlermeldungen senden“, checked „true“ | ✓ |
| Klick auf Titel, Erklärtext und Wort; Leertaste ja, Enter nein | `--filled`, echte Mausklicks auf Titel, Erklärtext, Wort, Knopf, die Lücke Text↔Wort, die Lücke Wort↔Knopf, das Polster oben links und unten rechts und die Fläche unter dem Knopf: je genau eine Umschaltung (9/9), die Nachbarzeile blieb gleich. Tab erreicht den Schalter, die Leertaste schaltet (false→true), Enter nicht (true→true) | ✓ |
| 1280 px: Zeile ≥ 24 px, Knopf 32 × 18, Daumen 14, Fokusring, Hover-Grund | Zeile (`label`) 698 × 96,6 px, Knopf 32 × 18, Daumen `::before` 14 × 14, bei An `translateX(14px)`. Tab-Fokus: `:focus-visible`, `outline: 2px solid rgb(59,143,196)`, offset 2px. Nach Mausklick kein Ring. Hover: `rgb(244,246,248)` = `--color-bg-soft` auf der ganzen Zeile, `cursor: pointer`. **Trefferfläche:** Das Ziel ist das `<label>` der ganzen Zeile, alle 9 Punkte oben schalten. WCAG 2.5.8 misst das Ziel als „region of the display that will accept a pointer action“. Überlappende Ziele zählen mit, wenn sie dieselbe Handlung auslösen, und Label und Kästchen tun das. In die Zeile passt ein Quadrat von 24 px; ohne Erklärtext ist sie rechnerisch 20,3 + 2 × 8 = 36,3 px hoch. Hausregel §9 „24 × 24, auch wo das Zeichen kleiner ist“: Das Zeichen ist der Knopf (32 × 18), die Fläche ist die Zeile. Der Knopf selbst muss also nicht 24 px hoch sein | ✓ |
| Kontrast | Gemessen am berechneten Stil, Formel WCAG. Rand bei Aus `rgb(138,138,138)`: 3,45:1 auf `--color-surface`, 3,19:1 auf dem Hover-Grund. Daumen bei Aus: 3,45:1 auf dem weißen Knopfgrund. Knopf bei An `rgb(26,58,92)`: 11,64:1, auf Hover 10,75:1. Daumen bei An, weiß auf Knopf: 11,64:1. Wort `rgb(92,92,92)`: 6,69:1, auf Hover 6,17:1. Fokusring: 3,55:1 | ✓ |
| Wort sichtbar, `aria-hidden`, Knopf rückt nicht | „Aus“ und „An“ sind je nach Stellung sichtbar (`visibility`). `.v2switch__state` hat `aria-hidden="true"`. Die Zelle misst 22,62 px (Breite von „Aus“; „An“ 16,02 px). Knopf-x ist 685 bei Aus, bei An und wieder bei Aus | ✓ |
| `prefers-reduced-motion: reduce` | `emulateMedia({ reducedMotion: 'reduce' })`: Am Daumen gilt `transition-property: none`. Im ersten Frame nach dem Klick steht er schon auf `matrix(…, 14, 0)`. Ohne reduce: `transform, background-color 0.12s`, nach 20 ms Zwischenstand 9,39 px | ✓ |
| `Saving` | `--saving` mit MutationObserver ab dem Laden: `aria-disabled="true"` und `checked=true` 3 ms nach dem Klick. Spinner `v3spinner--sm` „wird gespeichert …“ nach 326 ms, davor keiner. Danach wirken Mausklick auf den Titel und Leertaste nicht (bleibt An). Fokus geprüft in `--interactive` (derselbe Zweig): Tab und Leertaste, während der Sperre ist `activeElement` der Schalter, nach der Antwort ebenso. Spinner bei 250 ms nein, bei 400 ms ja | ✓ |
| `Failed` | `--failed` nach 600 ms: `checked=false`, Wort „Aus“. `role="alert"` (AX live assertive) enthält „**Nicht gespeichert.** Der Browser hat die Einstellung abgelehnt. …“. `aria-describedby` = `…-hint …-error`, die AX-Beschreibung enthält den Satz. Nächste Leertaste: Fehler leer, `aria-describedby` nur noch der Erklärtext, Fokus bleibt | ✓ |
| `Interactive`: Region `role="status"` | Die Region steht vor dem ersten Klick im DOM und ist leer. 1. Leertaste → „Belegübergabe eingeschaltet.“, 2. → „Belegübergabe ausgeschaltet.“. Die 3. scheitert: Der Schalter springt auf Aus zurück, die Region bleibt leer, der Fehler steht im `alert`. 4. → „Belegübergabe eingeschaltet.“. Die Ausgabezeile „Gespeichert: …“ folgt jedes Mal | ✓ |
| `Locked` | `disabled=true`, kein `aria-disabled`. Viermal Tab bleibt auf `BODY`. Hover-Grund `rgba(0,0,0,0)`, `cursor: not-allowed`, ein Klick wirkt nicht. Der Grund ist sichtbar (`--color-text-muted`). `aria-describedby` = `…-hint …-reason`, AX disabled, die Beschreibung enthält den Grund | ✓ |
| `LongText` bei 288 px | Fenster 320 px, Story-Rand 16 px, Rahmen 288 px. `scrollWidth` 320 = `clientWidth`. Der Titel bricht in 2 Zeilen um (Oberkanten 29,5/49,8). Mitte der ersten Titelzeile 38,0, Mitte des Worts 38,0, Mitte des Knopfs 38,1. Der Knopf schließt rechts bei 304 = Rahmenkante | ✓ |
| Genau eine Linie zwischen zwei Zeilen | `--filled` und `--in-use` (1280 und 720 px): erster `.v2switch` `border-top: 0px`, zweiter `1px rgb(236,239,243)` = `--color-border-subtle`. Kein `border-bottom`. Bei 720 px kein Querlauf | ✓ |
| `ActionButton` einfacher Zweig mit `role="alert"` | `ActionButton.tsx`: `<span className="v2act__err" role="alert">`. `--failed` (Aktion) nach Klick auf beide Knöpfe: beide Fehler mit `role="alert"` (AX alert, live assertive). **Bildvergleich gegen HEAD** `1b9a847`: Scratch-Klon `git clone --shared` + `storybook build -o`, Arbeitsbaum ebenso. Alle 10 `ActionButton`-Stories und dazu `--failed` nach Klick, 1280 × 800 px: 0 abweichende Pixel (0,0000 %) | ✓ |
| `grep -rn 'role="switch"' src` trifft nur `Switch.tsx` | Treffer: `Switch.tsx` (Bauteil und JSDoc), `Switch.stories.tsx:46` (nur Selektor im `play`), `src/showcase/duo-connect/drafts.tsx:326/387` (Stellvertreter in den Entwürfen) | ✗ — **Nachlauf**, kein Mangel des Baus. Der Stellvertreter fällt beim Umstellen der Entwürfe weg. Der Story-Selektor ist harmlos (H: auf `.v2switch__knob` umstellen, dann trifft der grep wörtlich nur `Switch.tsx`) |
| **Zusatz (kein Kriterium der Spec)** · Speichern unter React-`StrictMode` | `Switch` mit esbuild in einem Prüfrahmen gebündelt (`<scratchpad>/a0266/strict`, Promise 100 ms). Ohne `StrictMode` korrekt. **Mit `StrictMode` (dev) bleibt nach dem Erfolg `aria-disabled="true"` stehen, und die Ansage bleibt leer.** Ein Fehler käme nie an. Ursache `Switch.tsx` Z. 76–84 (Prüfung in Z. 111 und 123): Der Effekt setzt `alive.current` nur im Cleanup auf `false` und nie zurück auf `true`. Der Doppellauf der Effekte in `StrictMode` lässt ihn dauerhaft auf `false`. ludwig/app hat `reactStrictMode: true` (`apps/web/next.config.ts:66`). Abhilfe: `useEffect(() => { alive.current = true; return () => { … }; }, [])` | ✗ (M) |
| Wächter | `check:type`, `check:when`, `check:icons`, `check:language` Exit 0. `check:classes` Exit 1 mit 4 fremden Klassen (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`), im HEAD-Klon dieselben 4, also vorbestehend; die `.v2switch*`-Klassen haben alle eine Regel. `check:css` rot, weil `dist/ludwig.css` veraltet ist: absichtlich bis zum Commit, dann `pnpm build:css` | ✓ (Nachlauf `build:css`) |

Abgenommen von / am: fremder Prüfer (Abnahme-Agent, nicht der Bauer) / 2026-11-27 · **nicht abgenommen**, ein Mangel. Offene Punkte: **M** `Switch.tsx` hängt nach dem ersten Speichern unter `StrictMode` (Zeile „Zusatz“). **Nachlauf**: `role="switch"`-Stellvertreter in `drafts.tsx`, `pnpm build:css` beim Commit. **H**: Titelgröße 14 statt 13,5 px, Meldungszeile ohne feste Höhe (Inhalt rückt um rund 25 px), Story-Selektor auf `.v2switch__knob`.

### Nachprüfung 2026-11-27

Der Bauer meldet M, Nachlauf und H behoben, dazu den „Nachtrag 2026-11-27 — aus der Abnahme“ mit zwei Kriterien. Jeden Punkt habe ich selbst nachgemessen, den `StrictMode`-Fall im eigenen Prüfrahmen. Die Zeilen oben bleiben stehen.

| Kriterium / Punkt | Nachweis | Ergebnis |
|---|---|---|
| M `StrictMode` (Zeile „Zusatz“) und Kriterium „In einem Prüfrahmen mit `<StrictMode>`: Speichern endet, die Ansage kommt, ein Fehler kommt an“ | Eigener Prüfrahmen neu gebündelt (`<scratchpad>/a0266/strict`, `Switch.tsx` mit `alive.current = true` im Effekt). Drei Schalter, Promise je 500 ms, mit und ohne `<StrictMode>`. Erfolg: `aria-disabled`/`aria-busy` gehen weg, die Ansage lautet „Belegübergabe eingeschaltet.“, ein zweiter Lauf ergibt „… ausgeschaltet.“. `{ error }`: Der Schalter springt zurück, „Nicht gespeichert. Der Browser hat …“ steht im `alert` und ist verknüpft. Wurf ohne Text: „Nicht gespeichert. Die Einstellung ist unverändert. …“. In beiden Modi gleich | ✓ |
| Nachtrag-Kriterium `Saving`: nichts bewegt sich, Knopf an seiner x-Lage, `aria-busy="true"` | `--interactive`, Leertaste. Vorher, bei 100 ms, bei 400 ms (Kreis sichtbar) und nach der Antwort bleibt alles gleich: Höhe des Schalters 105,17 px, y der Ausgabezeile darunter 146,17, Knopf x 685, Zelle 22,62 px. `aria-busy="true"` und `aria-disabled="true"` am Schalter. `--saving`: Kartenunterkante 146,17 = ohne Kreis | ✓ |
| Bisheriges Kriterium `Saving`: „Nach 300 ms steht Spinner sm mit „wird gespeichert …““ | Das Wort gibt es nicht mehr. Im DOM steht kein „wird gespeichert“, die Zelle zeigt nur noch einen Kreis. Der Nachtrag ersetzt das Wort. Es ist aber ein vom Owner freigegebenes festes Wort (Schnittstelle, „Feste Wörter im Baustein“). Ein Wort wegzunehmen ist eine Wortänderung und braucht den Owner (CLAUDE.md §7), keinen Nachtrag aus der Abnahme | ✗ — siehe die zwei M unten |
| **M** · Vorlesehilfen hören „wird gespeichert“? | CDP `Accessibility.getFullAXTree` bei 400 ms: Der Schalter heißt „Belegübergabe“, die Beschreibung ist nur der Erklärtext, dazu `busy=1` und `disabled=true`. Kein Knoten im Baum enthält „gespeichert“ außer der Ausgabezeile der Story. Die Region `role="status"` ist leer, die Zelle hat `aria-hidden`, der Kreis `label={null}`. `aria-busy` an einem Kästchen sagen NVDA und JAWS nicht an, VoiceOver nicht verlässlich. Wer Vorlesehilfen nutzt, erfährt vom Speichern nichts. Abhilfe ohne neues Wort: Nach 300 ms schreibt die vorhandene Region „{label} wird gespeichert …“ (polite), die Antwort ersetzt den Satz. Oder ein `.v2vh`-Satz „wird gespeichert …“ kommt in `aria-describedby` | ✗ (M) |
| **M** · Der Kreis in der Zelle ist zerbrochen | `.v2switch__state .v2spin` hat `display: inline`. Außerhalb von Flex/Grid greifen `width`/`height` 14 px nicht, gemessen werden 4 × 19 px. Zu sehen ist eine Klammer „[“ aus den zwei Seitenrändern, kein Kreis (Ausschnitt `<scratchpad>/a0266/np-cell-zoom.png`, `np-saving-400.png`). Die Farbe ist `--color-text-muted` statt des Akzents aus `.v3spinner > .v2spin`. Dazu der Vertrag von `Spinner` (0268): „`null` only where the word already stands beside it — inside a button … never a bare circle (V7)“. Im Knopf bleibt das Wort neben dem Kreis stehen, hier verschwindet „An“/„Aus“. Ein Kreis ohne Wort ist also entweder zu beheben (Wort für die Vorlesehilfe s. o., sichtbar: Owner-Frage) oder vom Owner als Ausnahme mit Datum zu benennen | ✗ (M) |
| Nachlauf `grep -rn 'role="switch"' src` | Nur noch `src/ui/v3/primitives/Switch.tsx:45` (JSDoc) und `:175` (Bauteil). Die Entwürfe sind umgestellt, `drafts.tsx` ist gelöscht | ✓ |
| H Story-Selektor | `Switch.stories.tsx:46` nutzt `.v2switch__knob` | ✓ |
| H Titelgröße | `--filled`: `.v2switch__label` 13,5 px / 600 / 20,9 px (`--fs-ui`, wie `.v2radioline`). Mitte der ersten Titelzeile 51,25, Knopfmitte 51,46 | ✓ |
| H Meldungszeile | Die Höhe springt beim Speichern nicht mehr (Zeile oben). Der Fehler nimmt Platz, wie der Nachtrag es erlaubt | ✓ |
| Rückfrage gegen Rückschritt | `--long-text` bei 320 px: Der Titel bricht in 2 Zeilen um, Mitten 38,3 / Knopf 38,5 / Wort 38,0, `scrollWidth` 320. `--filled`: 4/4 Klickpunkte schalten, eine Linie (`0px`/`1px`), Zeile 97,2 px. `--failed` und `--locked` wie zuvor. Konsole ohne `error`/`warning` | ✓ |
| Wächter, Build | `pnpm typecheck`, `check:type`, `check:when`, `check:icons`, `check:language` Exit 0. `check:classes` hat dieselben 4 fremden Klassen wie HEAD. `pnpm build -o <scratchpad>/a0266/sb-work2` grün | ✓ |

Nachgeprüft von / am: fremder Prüfer (Abnahme-Agent, nicht der Bauer) / 2026-11-27 · **nicht abgenommen**. `StrictMode`, grep, Selektor, Titel und Höhe sind behoben. Neu sind zwei Mängel aus der Behebung „Speichern an der Stelle des Worts“: **M1** Vorlesehilfen hören kein „wird gespeichert“ (nur `aria-busy`). **M2** Der Kreis rendert als 4 × 19-px-Klammer (`.v2spin` inline in `.v2switch__state`), und ein Kreis ohne Wort bricht den `Spinner`-Vertrag (V7). Owner-Frage: Darf das vom Owner freigegebene Wort „wird gespeichert …“ sichtbar entfallen? Das hörbare Wort ist davon unabhängig Pflicht. `pnpm build:css` bleibt Nachlauf zum Commit.

### Nachprüfung 2 2026-11-27

Neue Lösung laut Bauer, der Nachtrag „aus der Abnahme“ ist umgeschrieben: Die Wortzelle zeigt nur „An“/„Aus“. Erklärtext und Speicherzeile teilen ein Gitterfeld (`.v2switch__sub`). Die polite-Region spricht. Alles nachgemessen (Storybook :6107, eigener Prüfrahmen `<scratchpad>/a0266/strict` mit `tokens.css`/`v3.css`). Die Zeilen oben bleiben stehen.

| Kriterium / Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 hörbar: Region und Barrierefreiheitsbaum bei 400 ms | `--interactive`, Leertaste. Bei 400 ms enthält die Region `role="status"` (AX live polite) „Belegübergabe wird gespeichert …“. Im Baum stehen die Texte „wird gespeichert …“ und „Belegübergabe wird gespeichert …“. Der Schalter behält Name „Belegübergabe“ und Beschreibung, den versteckten Erklärtext mit 213 Zeichen, weil `aria-describedby` = `…-hint` bleibt. Kein `aria-busy` mehr. Nach der Antwort „Belegübergabe eingeschaltet.“, dann „… ausgeschaltet.“. Beim 3. Lauf (Fehler) wird die Region leer, und der Fehler steht im `alert` | ✓ |
| M2 Spinner 14 × 14 in Akzent, mit Wort | `--saving`: `.v2switch__saving .v2spin` hat `display: block`, `offsetWidth`/`offsetHeight` 14 × 14 (ruhend unter reduce-motion `getBoundingClientRect` 14). Farbe `rgb(43,111,156)` = `--color-accent-700`. Daneben „wird gespeichert …“ in 12,5 px/18,75 px (Stufe des Erklärtexts), Mitte des Kreises = Mitte des Worts. Die Wortzelle hat nur 2 Kinder („An“, „Aus“). Screenshot `<scratchpad>/a0266/np2-saving-400.png` | ✓ |
| Altes Kriterium `Saving`: „Nach 300 ms steht Spinner sm mit „wird gespeichert …“, davor nicht“ | MutationObserver ab Laden: Spinner `v3spinner--sm` mit „wird gespeichert …“ nach 308 ms (unter reduce 334 ms), davor keiner. `aria-disabled="true"`, Stellung An, Fokus bleibt (in `--interactive` gemessen) | ✓ |
| Nachtrag-Kriterium `Saving`: Höhe und y darunter vorher, bei 400 ms und nachher gleich; Spinner 14 × 14 Akzent; Region-Text; Beschreibung im Baum | `--interactive` vorher, bei 100 ms, bei 400 ms und nachher: Schalter 105,17 px, Zeile 97,17 px, Gitterfeld 56,25 px, y der Zeile darunter 146,17, Knopf x 685. `--saving`: Kartenunterkante 146,17 = ohne Speichern. Spinner, Region und Beschreibung wie in den Zeilen oben | ✓ |
| **M** · Bewegung bei einzeiligem Erklärtext | Der Nachtrag nennt „ohne `hint`“ als einzigen Fall mit Bewegung. Gemessen bewegt sich auch ein **einzeiliger** Erklärtext: `--interactive` mit Erklärtext „Gilt sofort.“ (nur im DOM gekürzt, zum Messen). Das Gitterfeld wächst von 18,75 auf 20,92 px, die Zeile darunter rückt um 2,17 px (108,67 → 110,84) und danach zurück. Im Prüfrahmen dasselbe: „Gilt sofort.“ und „Schickt eine technische Meldung.“ je 67,67 → 69,84 px. Ursache: `.v2switch__saving` erbt 13,5 px/20,925 px; die Schriftstufe steht nur an `.v3spinner`, und die Zeile des äußeren Blocks hält die Höhe des geerbten Zeilenmaßes. Gegenprobe mit eingeschobener Regel `.v2switch__saving { font-size: var(--fs-ui-sm); line-height: var(--lh-ui-sm); }`: 67,67 → 67,67, y unverändert, Kreis mittig zum Wort. Ein unbenannter zweiter Fall mit Bewegung, und der CSS-Kommentar „a one-line explanation does not grow either“ stimmt nicht | ✗ (M) |
| Ohne `hint` (der benannte Fall) | Prüfrahmen: 44,92 → 69,84 px während des Speicherns, danach 44,92. So steht es im Nachtrag benannt | ✓ |
| `StrictMode` | Prüfrahmen neu gebündelt, mit und ohne `<StrictMode>` gleich. Erfolg: Region „… wird gespeichert …“, dann „Belegübergabe eingeschaltet.“, `aria-disabled` geht weg. `{ error }` und Wurf ohne Text: Rücksprung, Region leer, „Nicht gespeichert. …“ im `alert` | ✓ |
| reduce-motion | `emulateMedia({ reducedMotion: 'reduce' })`: `.v2spin` `animation: none`, Daumen `transition-property: none`. Ohne reduce: `v2spin 0.7s` und Übergang am Daumen | ✓ |
| Kontrast | Kreis `#2B6F9C` 5,45:1 auf `--color-surface`, 5,03:1 auf dem Hover-Grund. „wird gespeichert …“ `rgb(92,92,92)` 6,69:1, auf Hover 6,17:1. Schalter-Werte unverändert (Zeilen der Abnahme) | ✓ |
| Übrige Stories ohne Rückschritt | `--filled`: AX switch/Name/Beschreibung/checked wie zuvor, kein `aria-checked`, Wort `aria-hidden`, Knopf 32 × 18, Titel 13,5 px, eine Linie (`0px`/`1px`), Leertaste ja, Enter nein, Fokusring 2 px `rgb(59,143,196)`, Hover `rgb(244,246,248)`. `--failed`: Rücksprung, `alert` verknüpft, Region leer, Erklärtext sichtbar. `--locked`: `disabled`, Grund verknüpft, `not-allowed`. `--long-text` bei 320 px: 2 Titelzeilen, Mitte 38,3/Knopf 38,5, kein Querlauf. `--in-use` bei 1280 und 720 px: eine Linie, kein Querlauf. Konsole ohne `error`/`warning` | ✓ |
| grep, Wächter, Build | `grep -rn 'role="switch"' src`: nur `Switch.tsx:45` (JSDoc) und `:191`. `typecheck`, `check:type`, `check:when`, `check:icons`, `check:language` Exit 0. `check:classes` mit denselben 4 fremden Klassen wie HEAD. `pnpm build -o <scratchpad>/a0266/sb-work3` grün | ✓ |

Nachgeprüft von / am: fremder Prüfer (Abnahme-Agent, nicht der Bauer) / 2026-11-27 · **nicht abgenommen**, ein Mangel und ein Einzeiler. M1 und M2 der ersten Nachprüfung sind behoben: Das Speichern ist hörbar, der Spinner ist richtig gezeichnet, „wird gespeichert …“ ist wieder sichtbar, damit erledigt sich auch die Owner-Frage. Das alte und das neue `Saving`-Kriterium, `StrictMode`, reduce-motion und Kontrast sind ✓. **M** Bei einzeiligem Erklärtext rückt der Inhalt um 2,17 px, ein zweiter, unbenannter Fall mit Bewegung. Behebung in `v3.css`: `.v2switch__saving { font-size: var(--fs-ui-sm); line-height: var(--lh-ui-sm); }`, gegengeprüft. `pnpm build:css` bleibt Nachlauf zum Commit.

### Behebung des letzten Mangels (Auftraggeber, 2026-11-27)

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Einzeiliger Erklärtext rückt beim Speichern nicht (M aus Nachprüfung 2) | `.v2switch__saving { font-size: var(--fs-ui-sm); line-height: var(--lh-ui-sm); }` wie vom Prüfer vorgeschlagen; gemessen in `v3-primitives-formular-switch--interactive` mit „Gilt sofort.“ bei 1280 px: Fläche 18,75 → 18,75 → 18,75 px, Zeile 67,67 → 67,67 → 67,67 px, y darunter 108,67 → 108,67 → 108,67 (vorher · bei 450 ms mit Spinner · nachher) | ✓ |
