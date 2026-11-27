# 0266 · Switch: Schalter für sofort wirkende Einstellungen

| | |
|---|---|
| Status | spec |
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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
