# 0267 · Feld für Geheimes: `Input type="password"` statt `SecretInput`

| | |
|---|---|
| Status | spec |
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
  Wert aus dem DOM verschwunden; der Fokus steht auf „Token anzeigen“
- [ ] „Kopieren“ meldet „kopiert“ wie überall (`CopyTextButton`)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
