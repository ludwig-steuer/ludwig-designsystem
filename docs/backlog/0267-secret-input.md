# 0267 · Feld für Geheimes: `Input type="password"` statt `SecretInput`

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-27 (Nachprüfung ✓) |
| Stufe | Seitenaufgabe auf `primitives/` (`Field`, `Input`, `ActionButton`), **kein neuer Export**. Dazu ein Satz in `@instead` an `Input`, damit jedes künftige Geheimnis dieselbe Form bekommt |
| Klassen-Test | ja: ein Token oder Kennwort einzutragen, das danach nie wieder gezeigt wird, gibt es in jeder Software |
| Quelle | Anfrage plugin-mananger 2026-11-27 (Simon): `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Zeile „Feld für Geheimes“ („Token eintragen · verdeckt, ‚ist gesetzt‘“). Fachtext: `…/docs/spec-verbinden-und-store-pruefung.md` (Token von Hand, `lag_…`, F918) und `…/docs/spec-oberflaeche-und-fehler.md` C1 („Das Token-Feld ist nur als aufklappbare Alternative sichtbar“) |
| Ersetzt | nichts im Set. In der App gibt es kein Kennwortfeld (`type="password"`: 0 Treffer in `apps/web/src`). Im Plugin ersetzt es das heutige Token-Feld der Einstellungen |
| Blockiert | Plugin-Paket C1 (Einrichtung, Token als Alternative) und C5; 0263 `ExtensionShell` (Story der Einrichtung) |
| Setzt voraus | 0266: `ActionButton` sagt seinen Fehler an (`role="alert"`) |
| Spec von / am | designsystem, 2026-11-27 |

## Ziel

Die Steuerfachangestellte kann das Plugin nicht über „Mit Ludwig verbinden“
verbinden und klappt deshalb die Alternative „Token von Hand eintragen“ auf.
Das Token kopiert sie aus Ludwig und fügt es ins Feld ein. Das Feld zeigt nur
Punkte. Ein Klick auf „Token speichern“ prüft es: Fehlt das Präfix, nennt das
Feld den Grund, und die Eingabe bleibt stehen. Lehnt Ludwig das Token ab, steht
der Grund neben dem Knopf und wird angesagt. Ist ein Token gespeichert, zeigt
das Plugin es nie wieder an. Das Feld heißt dann „Neues Token“ und sagt in
einem Satz, dass ein neues das gespeicherte ersetzt.

## Einordnung

- **Wiederverwenden (§3 Regel 1):** `Input` (`@when` „A single-line field
  inside a `Field`“) trägt die verdeckte Eingabe mit dem nativen
  `type="password"`. Die Punkte, das Verbot, aus dem Feld zu kopieren, und die
  Ansage „geschütztes Textfeld“ für Vorleseprogramme kommen damit vom Browser.
  `Field` trägt Wort, Hinweis und Fehler. `ActionButton` trägt das Speichern
  mit Prüfung, Ladezustand und dem Fehler, der angesagt wird (0266).
- **Warum kein eigener `SecretInput` (§3 Regel 3 geprüft):** Ein neues
  Primitive braucht zwei Verwendungen oder eine Design-Datei. Heute gibt es
  genau eine, das Token-Feld des Plugins. Zusammengesetzt sind es etwa zehn
  Zeilen (`Field` + `Input` mit fünf Attributen), und der Zustand „gespeichert“
  ist ein anderes Wort im Label, kein eigener Zustand mit Tastaturweg. Was
  wiederkommen muss, ist die **Regel**. Die steht künftig in `@instead` an
  `Input` und in den Stories. Den Namen `SecretInput` aus der Einschätzung
  vom 2026-11-27 gibt es damit nicht.
- **Warum kein „Anzeigen“:**
  - Das Token wird eingefügt, nicht getippt, und ist eine Zufallsfolge. Das
    Auge kann es nicht prüfen. Die Prüfung macht der Knopf (Präfix,
    dann Ludwig).
  - In Kanzleien ist Fernwartung mit geteiltem Bildschirm üblich, und ein
    angezeigtes Token gäbe dort den Zugang zu allen Mandanten preis.
  - Als `type="text"` würde der Wert von der erweiterten Rechtschreibprüfung
    des Browsers an einen Dienst geschickt.
  - „Anzeigen“ bräuchte ein Zeichen und ein Wort, die die Registry nicht hat
    (`ACTION_ICON` kennt kein „Anzeigen“). Das wäre ein neues Wort und damit
    eine Sache für den Owner (offene Frage 1).
- **Zuschnitt:** kein neuer Baustein. Geändert wird nur JSDoc an `Input`, dazu
  kommen zwei Stories in `Field.stories.tsx`.
- **Setzt auf:** `Field`, `Input` (`primitives/Form.tsx`), `ActionButton`,
  `Card`/`CardHead` für die Story.

## Schnittstelle

Keine neue Prop. Die Form eines Geheimnisses besteht aus diesen Teilen:

| Teil | Baustein · Prop | Wert | Nachweis (Story) |
|---|---|---|---|
| Wort | `Field.label` | „Token“, solange keins gespeichert ist; „Neues Token“, sobald eins gespeichert ist | `Field/Secret` |
| Hinweis | `Field.hint` | woher das Token kommt: „Das Token erzeugt Ludwig unter ‚Administration › Beleg-Intake (Drittanbieter)‘. Kopieren Sie es und fügen Sie es hier ein.“ Im Zustand „gespeichert“: „Ein Token ist gespeichert. Ein neues ersetzt es beim Speichern.“ | `Field/Secret` |
| Verdeckt | `Input type="password"` | Punkte statt Zeichen | `Field/Secret` |
| Kein Merken, keine Korrektur | `Input autoComplete="off" spellCheck={false} autoCapitalize="off" autoCorrect="off"`, ohne `name` | rät dem Browser vom Speichern ab, schaltet Rechtschreibung und Großschreibung aus | `Field/Secret` (DOM) |
| Formatfehler | `Field.error` + `Input invalid` | „**Token nicht erkannt.** Ein Token beginnt mit ‚lag_‘. Kopieren Sie es noch einmal vollständig aus Ludwig.“ Die Eingabe bleibt stehen | `Field/SecretInUse` |
| Speichern und prüfen | `ActionButton` („Token speichern“, `pendingLabel` „Wird geprüft …“) | `action` gibt `{ error }` zurück, wenn Ludwig ablehnt: „**Ludwig kennt dieses Token nicht.** Es ist abgelaufen oder widerrufen. Bitte lassen Sie in Ludwig ein neues erzeugen.“ | `Field/SecretInUse` |
| Gesperrt | `Input disabled` + Grund im `Field.hint` | „Gesperrt, solange die Verbindung geprüft wird.“ | `Field/Secret` |

Geändert wird `Input` im JSDoc, mit einem zusätzlichen Fall in `@instead`:
„A secret (token, password) → `type="password"` with `autoComplete="off"`,
`spellCheck={false}`, no `name`; once stored it is never shown again (0267).“

Regeln für den Aufrufer. Das Set kann sie nicht erzwingen, die Stories halten
sie vor:

1. **Der gespeicherte Wert kommt nie in die Oberfläche.** Die Oberfläche
   bekommt nur „gespeichert ja/nein“. Im Plugin liefert das die Schicht „Daten
   für die Oberfläche“ (C0) als Boolean. Kein `defaultValue` aus dem Speicher.
2. **Der Wert steht nie** in `title`, `placeholder`, `aria-*`, `data-*`,
   einer Adresse, der Konsole, dem Lauf-Protokoll oder Sentry.
3. **Einfügen bleibt erlaubt** (WCAG 3.3.8). Kein `onPaste`, das blockiert.
4. **Vor der Prüfung wird getrimmt** (`value.trim()`). Ein eingefügtes Token
   trägt oft einen Zeilenumbruch mit.
5. **Kein Kopieren-Knopf.** Ein Geheimnis geht nur in eine Richtung in die
   Oberfläche hinein.

Was die Form **nicht** kann (bewusst):
- Sie zeigt den Wert nicht, auch nicht teilweise (kein „endet auf 3f9a“).
- Sie entfernt das gespeicherte Token nicht. Im Plugin macht das „Verbindung
  trennen“ (C5) mit seiner Rückfrage.
- Sie verhindert nicht, dass der Browser trotzdem anbietet, das Token als
  Kennwort zu speichern. Chrome übergeht `autoComplete="off"` bei
  Kennwortfeldern teilweise. Ein Umweg wie `-webkit-text-security` auf einem
  Textfeld ist ausgeschlossen, weil Vorleseprogramme den Wert dann laut
  vorlesen.

## Verhalten

- **Tastatur:** Tab ins Feld, `Strg+V` fügt ein, Tab auf „Token speichern“,
  Enter. Der Fokus bleibt nach einem Fehler, wo er war: Beim Formatfehler
  steht er auf dem Knopf, und der Satz steht am Feld.
- **Hover und Fokus:** kommen von `.v2in` und `Button`. Die Höhe des Felds
  wird gemessen, sie muss mindestens 24 px betragen. Der Fokusring ist
  sichtbar.
- **Zustände:**
  - Leer: Wort „Token“ mit Hinweis.
  - Gefüllt: Punkte.
  - Gespeichert: Wort „Neues Token“ mit dem Satz zum Ersetzen, das Feld
    ist leer.
  - Lädt: Der Knopf trägt „Wird geprüft …“, das Feld ist gesperrt.
  - Fehler: Der Formatfehler steht am Feld, die Ablehnung durch Ludwig neben
    dem Knopf. Beide Male bleibt die Eingabe stehen.
  - Gesperrt: Der Grund steht im Hinweis.
  - Leer nach Filter gibt es nicht, weil kein Filter da ist.
- **Ansage:** Die Ablehnung neben dem Knopf wird angesagt (`role="alert"`,
  0266). Der Formatfehler am Feld wird heute **nicht** angesagt (Befund im
  Set, siehe unten). Bis dahin setzt `Input` `aria-invalid`.
- **Client:** Die Stories sind Client wegen `useState`. `Field` und `Input`
  bleiben, was sie sind.

## Stories

Seitenaufgabe, deshalb zwei Stories in `Field.stories.tsx` unter
`v3/Primitives/Formular/Field`, neben `Filled`, `WithError` und `Disabled`.

| Story | Beweist |
|---|---|
| `Secret` | Vier Felder untereinander: leer („Token“ mit Hinweis), gespeichert („Neues Token“ mit dem Satz zum Ersetzen, Feld leer), Fehler (Punkte, „Token nicht erkannt …“, `aria-invalid`), gesperrt (Grund im Hinweis). Jedes `input` hat `type="password"`, `autocomplete="off"`, `spellcheck="false"`, `autocapitalize="off"` und kein `name` |
| `SecretInUse` | Eine Karte „Token von Hand eintragen“ mit Feld und „Token speichern“. Rundlauf: Eine Eingabe ohne „lag_“ ergibt den Formatfehler am Feld und behält die Eingabe. Ein Wert mit „lag_“ und der Endung „-alt“ wird nach 600 ms von „Ludwig“ abgelehnt, der Fehler steht neben dem Knopf. Ein anderer Wert mit „lag_“ gelingt: Das Feld leert sich, das Wort wird „Neues Token“, der Hinweis wird zum Satz zum Ersetzen. Eingefügte Leerzeichen und Zeilenumbrüche werden getrimmt. Die Werte sind erfunden, kein echtes Token |

Nicht anwendbare Zustände: leer nach Filter, weil kein Filter da ist.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Ein eigener Baustein `SecretInput` (Form-Familie) mit `isSet` und dem Wortwechsel „Token“ → „Neues Token“ | `isSet?: boolean` | Ein zweites Geheimnis kommt dazu, zum Beispiel ein API-Schlüssel in den Einstellungen der App |
| „Anzeigen“ für Kennwörter, die getippt werden | `revealable?: boolean`, dazu ein Registry-Eintrag in `ACTION_ICON` mit Zeichen und Wort | Der Owner entscheidet offene Frage 1 mit Ja, oder ein Feld nimmt getippte Kennwörter auf |
| „Entfernen“ am Feld | `onClear?: () => void` | Ein Geheimnis lässt sich nicht über einen eigenen Weg wie „Verbindung trennen“ entfernen |
| Ansage des Fehlers am Feld | in `Field`: `id` für Hinweis und Fehler, `role="alert"` am Fehler, `aria-describedby` an der Eingabe | Befund im Set, unten. Eigene Aufgabe, weil sie jedes Feld betrifft |

## Befund im Set (keine App-Sache)

`Field` verknüpft Hinweis und Fehler nicht mit der Eingabe. Das `div` hat
keine `id`, und die Eingabe hat kein `aria-describedby`. Ein Fehler am Feld
wird außerdem nicht angesagt. Ein Vorleseprogramm hört bei jedem Feld nur
„ungültig“, nicht den Grund. Das betrifft jedes Formular im Set und gehört in
eine eigene Aufgabe. `Field` kennt sein Kind nicht (siehe JSDoc zu `htmlFor`),
deshalb braucht die Lösung eine Entscheidung zum Zuschnitt.

## Offene Fragen

1. Soll ein Geheimnis „Anzeigen“ anbieten? **Ohne Antwort:** nein.
   Begründung unter Einordnung. „Anzeigen“ wäre ein neues Wort mit neuem
   Zeichen und bräuchte den Owner.
2. Soll trotz einer einzigen Verwendung ein eigener Baustein `SecretInput`
   kommen, wie in der Einschätzung vom 2026-11-27 genannt? **Ohne Antwort:**
   nein. Die Form steht im `@instead` an `Input` und in den Stories, und der
   Baustein kommt mit dem zweiten Geheimnis (Ausbau).

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

- [ ] Kein neuer Export. `Input` trägt den Satz zu Geheimnissen in `@instead` wie unter Schnittstelle, und `pnpm check:when` ist grün
- [ ] `Secret`: Jedes der vier `input` hat `type="password"`, `autocomplete="off"`, `spellcheck="false"`, `autocapitalize="off"` und kein `name` (DOM gelesen)
- [ ] `Secret`: Der Zustand „gespeichert“ hat das Label „Neues Token“ und den Satz zum Ersetzen, `input.value` ist leer, und kein Element der Story trägt einen Token-Wert in `title`, `placeholder`, `aria-*` oder `data-*`
- [ ] `SecretInUse`: Einfügen per `Strg+V` funktioniert. Ein Wert ohne „lag_“ zeigt den Formatfehler am Feld, `aria-invalid="true"`, und die Eingabe bleibt stehen
- [ ] `SecretInUse`: Die Ablehnung durch „Ludwig“ steht neben dem Knopf in `role="alert"` (0266), die Eingabe bleibt stehen, und während der Prüfung trägt der Knopf „Wird geprüft …“ und das Feld ist gesperrt
- [ ] `SecretInUse`: Das Gelingen leert das Feld und wechselt Wort und Hinweis auf den Zustand „gespeichert“. Ein Wert mit Leerzeichen am Rand wird getrimmt geprüft
- [ ] Höhe des Felds mindestens 24 px, Fokusring sichtbar, Hover antwortet. Gemessen bei 1280 px und bei 360 px Breite, ohne waagerechten Scroll
- [ ] Keine Fehlermeldung in der Konsole. Kein Token-Wert erscheint in der Konsole, auch nicht in den Story-Logs

## Nachtrag 2026-11-27 — Token anzeigen in der Diagnose (Owner)

Simon (Owner, über plugin-mananger) will das gespeicherte Token an **einer**
Stelle ansehen können: in der Erweiterung unter Einstellungen › Diagnose ›
„Verbindung, technisch“ (Seitenprofil `docs/seiten/duo-connect.md`, C5a).
Das ist eine **benannte Ausnahme** zu offener Frage 1 dieser Spec; überall
sonst gilt die Spec unverändert (kein „Anzeigen“ am Feld, die Oberfläche
kennt sonst nur „gesetzt: ja/nein“).

- **Kein neuer Baustein.** Eine Verwendung, Zustand an der Aufrufstelle
  (§3 Regel 3 und 4 greifen nicht). Komposition: `FieldList`-Zeile „Token“
  mit Kennung `lag_…` + letzte vier Zeichen in `RawValue`; `TextButton`
  „Token anzeigen“ — **nur Wort**, kein Zeichen, deshalb kein neuer Eintrag
  in `ACTION_ICON` (der Einwand unter Einordnung betraf das Zeichen);
  aufgedeckt `RawValue` mit vollem Wert, `CopyTextButton` „Kopieren“, ein
  ruhiger Satz „Wird nach 30 Sekunden wieder ausgeblendet.“ (kein
  laufender Zähler: nichts springt) und `TextButton` „Ausblenden“.
- **Ausblenden:** nach 30 s, beim Verlassen des Abschnitts (Reiterwechsel,
  Diagnose zugeklappt, `visibilitychange`) und auf „Ausblenden“. Stand der
  Fokus im aufgedeckten Teil, springt er auf „Token anzeigen“; die
  Live-Region der Seite sagt „Token ausgeblendet“. 2.2.1 (Zeitlimit) ist
  nicht berührt: Aufdecken kostet jederzeit einen Klick, nichts geht
  verloren.
- **Nie** im Seitentitel, in einem `title`-Attribut, im Lauf-Protokoll oder
  im Bericht für den Support; der aufgedeckte Wert ist nicht Teil der
  URL oder des gemerkten Zustands.

Zusätzliche Kriterien (gelten für die Story in diesem Set und für die
Aufrufstelle im Plugin):

- [ ] Verdeckt zeigt die Zeile nur `lag_…` und vier Zeichen; im DOM steht
  der volle Wert erst nach „Token anzeigen“
- [ ] Nach 30 s, beim Zuklappen der Diagnose und beim Reiterwechsel ist der
  Wert aus dem DOM verschwunden. Nach 30 s und nach „Ausblenden“ steht der
  Fokus auf „Token anzeigen“; beim Zuklappen und beim Reiterwechsel bleibt er,
  wo die Nutzerin ihn gesetzt hat (Zusammenfassung bzw. Reiter) — dort gibt es
  „Token anzeigen“ nicht mehr (berichtigt 2026-11-27 aus dem Bau)
- [ ] „Kopieren“ meldet „kopiert“ wie überall (`CopyTextButton`)

## Nachtrag 2 2026-11-27 — Fokus nach dem Aufdecken (aus der Abnahme)

Nach „Token anzeigen“ ist der Knopf weg, der Fokus fiel auf die Seite. Nach
dem Aufdecken geht der Fokus auf **„Ausblenden“** — den Rückweg, gleich ob
per Maus oder Tastatur aufgedeckt. Der 30-Sekunden-Lauf startet genau einmal
je Aufdecken.

- [ ] `SecretReveal`: Enter auf „Token anzeigen“ → `document.activeElement` ist „Ausblenden“; nach 29 s ist der Wert noch da, nach 30 s weg, auch wenn zwischendurch neu gerendert wurde (z. B. „Kopieren“ gedrückt)

## Abnahme

Gemessen am Arbeitsbaum (HEAD `1b9a847` + ungestagte Änderungen), Storybook :6107, Playwright (eigene Seite je Lauf), Chromium. Story-IDs `v3-primitives-formular-field--…`. Die Werte sind erfunden; eingegeben wurden nur Testwerte.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| **Fest** · `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build -o <scratchpad>/sb-work`: „Storybook build completed successfully“ | ✓ |
| **Fest** · Datei nach der Familie, Story daneben, Titel in der Gruppe | Die Stories stehen in `Field.stories.tsx` unter `v3/Primitives/Formular/Field`, neben `Filled`, `WithError` und `Disabled`. Keine neue Datei | ✓ |
| **Fest** · Code englisch, `@when`/`@instead` an jedem Export | `SECRET`, `TOKEN_HINT`, `STORED_HINT`, `HIDE_AFTER_MS` und die Kommentare sind englisch, Deutsch steht nur in sichtbaren Strings. Kein neuer Export. `Input` hat den ergänzten `@instead`. `check:when` grün, `check:language` Exit 0 | ✓ |
| **Fest** · kein Hex, kein px, keine Label-Map, Status über Registry | `grep -nE '#[0-9a-f]{3,6}\b\|[0-9]px'` in den neuen Zeilen von `Field.stories.tsx`: 0 Treffer. Breiten nur über `var(--space-…)` und `--container-narrow`. Kein Status | ✓ |
| **Fest** · alle Stories, ausgeschlossene Zustände begründet | `--secret`, `--secret-in-use` und aus dem Nachtrag `--secret-reveal` stehen im Index. Leer nach Filter ist begründet | ✓ |
| **Fest** · Prüfliste §9 | Bausteine aus `primitives/`, nichts Neues. Die Fehler stehen als Satz, Rot nur für Fehler. Kein Zeichen ohne Wort (`TextButton` nur Wort, `CopyTextButton` mit Registry-Zeichen und Wort). **Befunde (H):** (1) `TextButton` „Token anzeigen“ misst 102,7 × 20,9 px, „Ausblenden“ 78,4 × 20,9 px. Das ist unter dem Hausmaß 24 px; WCAG 2.5.8 ist über die Abstandsausnahme erfüllt (12 px Lücke zu „Kopieren“, das 30 px hoch ist). (2) `.v2in` hat kein `:hover`, und sein Rand misst 1,62:1 (`--color-border-strong`). Das ist ein Befund im Set an `Form`, nicht an 0267 | ✓ (mit Befund) |
| **Fest** · im Browser angesehen | Alle drei Stories bei 1280 und 360 px. Screenshots `scratchpad/a0266/reveal-1280.png` und `reveal-360.png` | ✓ |
| Kein neuer Export, `Input` mit dem Satz zu Geheimnissen, `check:when` grün | `index.ts` ohne 0267-Export. `Input`-`@instead` ist gleich der Schnittstelle: „A secret (token, password) → `type="password"` with `autoComplete="off"`, `spellCheck={false}`, no `name`; once stored it is never shown again (0267).“ `check:when` grün | ✓ |
| `Secret`: Attribute der vier Felder | `--secret`, DOM gelesen: 4/4 `input` mit `type=password`, `autocomplete=off`, `spellcheck=false`, `autocapitalize=off` und zusätzlich `autocorrect=off`. `hasAttribute('name')` ist bei allen false | ✓ |
| `Secret`: Zustand gespeichert, kein Wert in Attributen | `label[for=sec-stored]` „Neues Token“, Hinweis „Ein Token ist gespeichert. Ein neues ersetzt es beim Speichern.“, `value` leer. Alle `title`, `placeholder`, `aria-*` und `data-*` unter `#storybook-root` gescannt: nur `aria-invalid=true` am Fehlerfeld, kein Wert | ✓ |
| `SecretInUse`: Einfügen, Formatfehler, `aria-invalid`, Eingabe bleibt | Clipboard-Rechte für :6107, `navigator.clipboard.writeText` + `ControlOrMeta+V`: Der Testwert (16 Zeichen) steht im Feld. „Token speichern“: Der Satz „**Token nicht erkannt.** …“ steht am Feld, `aria-invalid="true"`, der Wert bleibt. Der Fokus steht auf dem Knopf | ✓ |
| `SecretInUse`: Ablehnung mit `role="alert"`, Eingabe bleibt, „Wird geprüft …“, Feld gesperrt | Eingefügt „␣␣lag_…-alt␣“; den Zeilenumbruch nimmt der Browser beim Einfügen selbst heraus. Nach 150 ms trägt der Knopf „Wird geprüft …“ (`disabled`, `aria-busy`), das Feld ist `disabled`. Nach 600 ms steht `.v2act__err role="alert"` „Ludwig kennt dieses Token nicht. …“ neben dem Knopf, die Eingabe bleibt (25 Zeichen) | ✓ |
| `SecretInUse`: Gelingen leert das Feld und wechselt Wort und Hinweis; Trimmen | Bei „␣␣lag_…“ wird das Feld leer, das Label heißt „Neues Token“, der Hinweis wird der Satz zum Ersetzen. Dass getrimmt wird, zeigt der Wert davor: „␣␣lag_…-alt␣“ wurde als `-alt` abgelehnt und ergab keinen Formatfehler; ohne `trim` wäre `startsWith("lag_")` falsch gewesen | ✓ |
| Höhe ≥ 24 px, Fokusring, Hover, 1280 und 360 px ohne Querlauf | `--secret-in-use` und `--secret` bei 1280 und 360 px: Das Feld ist 34,9 px hoch. Tab-Fokus: `:focus-visible`, Rand → `rgb(26,58,92)`, dazu ein Schatten von 3 px. Hover: Zeiger `text`, der Rand bleibt (kein `:hover` an `.v2in`, Befund im Set, siehe §9). Der Knopf misst 141 × 34,8 px. `scrollWidth` = `clientWidth` bei 1280 und 360 | ✓ (mit Befund) |
| Konsole ohne Fehler, kein Wert in der Konsole | Alle drei Stories ohne `error` und `warning`. Der einzige Eintrag ist Chromes `verbose` „[DOM] Password field is not contained in a form“. Kein Eintrag enthält „lag_“ oder einen eingegebenen Wert. Die Stories haben keine Actions | ✓ |
| **Nachtrag** · Verdeckt nur `lag_…` + vier Zeichen, voller Wert erst nach „Token anzeigen“ | `--secret-reveal`: Text „lag_…3f9a“, `outerHTML` enthält den vollen Wert nicht. Nach „Token anzeigen“ steht er im DOM, mit „Wird nach 30 Sekunden wieder ausgeblendet.“ | ✓ |
| **Nachtrag** · Ausblenden nach 30 s, beim Zuklappen und beim Reiterwechsel; Fokus (berichtigte Fassung) | Mit `page.clock.install()` und Fokus auf „Kopieren“: nach 29 s noch im DOM, nach 30,1 s weg. Der Fokus steht auf „Token anzeigen“, die Region der Seite sagt „Token ausgeblendet“. „Ausblenden“ per Enter: weg, Fokus „Token anzeigen“, Ansage. Zuklappen (Klick auf `summary`): weg, der Fokus bleibt auf `summary`. Reiter „Abgleich“: weg, der Fokus bleibt auf dem Reiter. `visibilitychange` mit `hidden`: weg. 30 s mit Fokus auf einem Reiter: Der Fokus bleibt dort. Kein Wert in `title`, Seitentitel, URL oder local/sessionStorage | ✓ |
| **Nachtrag** · „Kopieren“ meldet „kopiert“ | Nach dem Klick heißt der Knopf „Kopiert“, und die Zwischenablage hält den Wert | ✓ |
| **Zusatz (kein Kriterium des Nachtrags)** · Fokus beim Aufdecken | Tab über Reiter, Reiter und Zusammenfassung zu „Token anzeigen“, dann Enter: Der Knopf verschwindet, und `activeElement` ist `BODY`. Chrome setzt den nächsten Tab zwar auf „Kopieren“ fort, aber ein Vorleseprogramm hört nichts und verliert seinen Ort. Nach I13 ist ein Fokus auf `body` ein Verstoß. Der Nachtrag regelt nur das Ausblenden. Vorschlag: Nach dem Aufdecken geht der Fokus auf „Ausblenden“ (oder auf den aufgedeckten Wert mit `tabIndex={-1}`) | ✗ (M) |
| Wächter | `check:type`, `check:when`, `check:icons`, `check:language` Exit 0. `check:classes` hat 4 fremde Klassen, die auch im HEAD-Klon stehen. `check:css` ist bis zum Commit absichtlich rot | ✓ |

Abgenommen von / am: fremder Prüfer (Abnahme-Agent, nicht der Bauer) / 2026-11-27 · **nicht abgenommen**, ein Mangel. Alle Kriterien der Spec und des Nachtrags ✓. Offene Punkte: **M** Fokus fällt beim Aufdecken auf `body` (`Field.stories.tsx`, `SecretReveal`, Zeile „Zusatz“). **H**: (1) `ActionButton` sperrt den Knopf beim Laden mit `disabled`, deshalb steht der Fokus nach der Ablehnung durch Ludwig auf `body`. Das widerspricht „Der Fokus bleibt nach einem Fehler, wo er war“ (Verhalten) und betrifft jedes `ActionButton` → eigene Aufgabe: `aria-disabled` wie beim `Switch`. (2) Der Fehlertext von `ActionButton` ist ein String, deshalb kann der Anfang „Ludwig kennt dieses Token nicht.“ nicht fett stehen (T: Was fett). (3) In `SecretReveal` hat der `useEffect` keine Abhängigkeiten: Der 30-s-Zeitgeber startet bei jedem Render neu, und eine Aufrufstelle, die rendert (etwa durch Abfragen), hielte den Wert länger offen. (4) `TextButton` ist 20,9 px hoch. (5) `.v2in` hat kein `:hover` und 1,62:1 Rand (Befund im Set).

### Nachprüfung 2026-11-27

Der Bauer meldet M und H(3) behoben, dazu „Nachtrag 2“ mit einem Kriterium. Gemessen mit `page.clock.install()` in `--secret-reveal`. Die Zeilen oben bleiben stehen.

| Kriterium / Punkt | Nachweis | Ergebnis |
|---|---|---|
| M Fokus beim Aufdecken. Nachtrag-2-Kriterium „Enter auf „Token anzeigen“ → `document.activeElement` ist „Ausblenden“; nach 29 s ist der Wert noch da, nach 30 s weg, auch wenn zwischendurch neu gerendert wurde (z. B. „Kopieren“ gedrückt)“ | Tab über Reiter, Reiter und Zusammenfassung zu „Token anzeigen“, dann Enter: `activeElement` ist „Ausblenden“ mit `:focus-visible`. Per Maus aufgedeckt ebenso „Ausblenden“. Nach 10 s „Kopieren“ gedrückt („Kopiert“, die Zwischenablage hält den Wert). Nach 20 s die Story selbst neu gerendert: Über den React-Fiber den Zustand `said` gesetzt, die Region zeigte „Neu gerendert“. Bei 29,4 s ist der Wert noch im DOM, bei 30,2 s weg. Der Fokus springt von „Kopieren“ auf „Token anzeigen“, die Ansage lautet „Token ausgeblendet“ | ✓ |
| H(3) genau ein 30-s-Lauf je Aufdecken | Der Effekt hängt an `[shown]` (`Field.stories.tsx`). Gemessen wie oben: Das Neu-Rendern bei 20 s hat den Lauf nicht neu gestartet. Ein zweites Aufdecken bekommt eigene 30 s (29,5 s da, 30,2 s weg) | ✓ |
| Rückfrage gegen Rückschritt, Kriterien des ersten Nachtrags | „Ausblenden“ → weg, Fokus „Token anzeigen“, Ansage. Zuklappen → weg, Fokus bleibt auf `summary`. Reiter „Abgleich“ → weg, Fokus bleibt auf dem Reiter. Konsole ohne `error`/`warning`, kein Eintrag mit „lag_“ | ✓ |
| Wächter, Build | `pnpm typecheck`, `check:type`, `check:when`, `check:icons`, `check:language` Exit 0. `check:classes` vorbestehend wie HEAD. `pnpm build -o <scratchpad>/a0266/sb-work2` grün | ✓ |
| Neuer Hinweis | Ein Klick auf den **schon aktiven** Reiter „Einstellungen“ blendet ebenfalls aus (`onPick` ruft `hide()` ohne Vergleich). Das geht in die sichere Richtung, ist aber kein Reiterwechsel | H |

Nachgeprüft von / am: fremder Prüfer (Abnahme-Agent, nicht der Bauer) / 2026-11-27 · **abgenommen**. Alle Kriterien der Spec, des Nachtrags und von Nachtrag 2 sind ✓, das M ist behoben. Es bleiben Hinweise, die zum Set gehören und nicht zu 0267: `ActionButton` sperrt beim Laden mit `disabled`, der Fokus fällt dann auf `body`; der Fehlertext ist ein String ohne fetten Anfang; `TextButton` ist 20,9 px hoch; `.v2in` hat kein `:hover` und 1,62:1 Rand. Dazu der Reiter-Hinweis oben.
