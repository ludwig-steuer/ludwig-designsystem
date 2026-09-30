# 0216 · CommandPalette — Treffer vom Server, Zweitweg, neuer Tab

| | |
|---|---|
| Status | fertig — fremde Abnahme 2026-10-01, abgenommen mit Auflagen (M1, M2); M3, M4 vorbestehend |
| Stufe | `patterns/` — Gruppe Rahmen (Erweiterung von 0039) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, jede Suche über Server-Treffer mit „öffnen / daneben öffnen" |
| Quelle | Anfrage llcto 2026-10-01; `ludwig/app` `docs/backlog/F351-command-palette.md`, Abschnitt „Voraussetzung" |
| Ersetzt | nichts — F351 T351.3 baut das App-Command-Menü darauf |
| Blockiert | F351 T351.3 (App-Command-Menü: Mandant, Beleg, Jahr über Präfixe `m:` `b:` `j:`) |
| Spec von / am | Claude (designsystem), 2026-10-01 |

## Ziel

Die Sachbearbeiterin tippt ⌘K, dann „b:4471" und will den Beleg — nicht die
Seite „Belege". Die Treffer kennt nur der Server, die Präfixe deutet die App.
Heute filtert die Palette selbst nach `label`, kennt nur „Enter springt" und
schließt nach jeder Wahl. Sie braucht: die Eingabe in der Hand des Aufrufers,
Treffer ohne eigenes Matching, eine Ladezeile, einen Zweitweg (Seite oder
Drawer), Einträge, die die Palette offen lassen (Präfix einsetzen), und
⌘↵ für einen neuen Tab.

## Einordnung

- **Wiederverwenden:** `CommandPalette` (0039) trägt den Fall zu vier
  Fünfteln — Hülle, Gruppen, Tastaturweg, Sprung als `<a>`. `Combobox` (0009)
  hat Server-Suche (`onSearch`, `loading`), wählt aber einen Wert für ein Feld.
- **Erweitert, weil:** §3 Regel 2 — das Fehlende ist eine wiederkehrende
  Designentscheidung (jede Suche über viele Objekte kommt vom Server), in der
  `@when`-Zeile mit einem Halbsatz zu sagen. Es sind mehrere Props, aber sie
  bilden **einen** Modus: „Treffer kommen von außen".
- **Zuschnitt:** eine Datei, ein Export wie bisher. Gemeinsamer Zustand
  (Eingabe, Auswahl, Modifier der letzten Wahl) — Trennen erzeugte nur
  Durchreich-Props.
- **Setzt auf:** `cmdk` (`shouldFilter`, gesteuertes `Command.Input`,
  `Command.Loading`, `useCommandState`), `Dialog`, `Kbd`, `TextButton`
  (`quiet`), `format.formatCount`.

## Schnittstelle

Neu an `CommandPalette` (bestehende Props unverändert, siehe 0039):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `query` | `string` | nein | Gesteuerte Eingabe; ohne sie hält die Palette den Suchtext selbst wie bisher | `ServerHits` |
| `onQueryChange` | `(query: string) => void` | nein | Jede Änderung der Eingabe | `ServerHits` |
| `filter` | `"builtin" \| "none"` | nein | Standard `builtin`. `none`: kein eigenes Matching, Gruppen und Einträge in der gelieferten Reihenfolge, Identität eines Eintrags ist `item.id` statt `label` | `ServerHits` (none), `Filled` (builtin) |
| `loading` | `boolean` | nein | Ladezeile „Suche läuft …" unter den stehenden Treffern; der Leertext schweigt solange | `Loading` |
| `error` | `{ message: string; retry?: ReactNode }` | nein | Fehlerzeile über der Liste, im Aussehen der Tabellen-Fehlerzeile (`v2tbl__error`, Form wie `DataTable.error`); der Leertext schweigt. Über die Anfrage hinaus: mit Server-Treffern gilt der Zustand Fehler (V9), sonst stünde bei einem Ausfall „Kein Treffer" | `Error` |

Neu an `CommandItem`:

| Feld | Typ | Bedeutung | Nachweis (Story) |
|---|---|---|---|
| `secondary` | `{ label: string; onSelect: () => void }` | Zweitweg: Shift+Enter, Shift+Klick oder Klick auf den Hinweis „Shift ↵ {label}" rechts in der markierten Zeile; schließt die Palette | `ServerHits` |
| `keepOpen` | `boolean` | `onSelect` läuft, die Palette bleibt offen (Präfix einsetzen). Wirkt nur ohne `href` | `ServerHits` |

Keine Typen aus `src/ludwig/`: das Pattern kennt weiter keine Entität und
keinen Router. Präfixe deutet der Aufrufer.

**Kann bewusst nicht:** selbst laden oder entprellen (der Aufrufer ruft den
Server), Präfixe erkennen, sich Gewähltes merken, verschachtelte Seiten.
Ein `href`-Eintrag mit `keepOpen` bleibt ein Sprung (schließt).

## Verhalten

`"use client"`.

- **Gesteuert:** `query` gesetzt → `Command.Input` ist gesteuert, getippt wird
  über `onQueryChange`. Ein `keepOpen`-Eintrag kann so „m: " ins Feld setzen.
- **`filter="none"`:** `shouldFilter={false}`, `Command.Item value={item.id}`.
  Zwei Belege mit gleichem Namen sind zwei Einträge; `id` muss über alle
  Gruppen eindeutig sein. `keywords` wirken dann nicht. Kommen neue Treffer,
  ist die erste Zeile markiert (siehe Befund beim Bauen).
- **Enter** wie bisher: Sprung folgt dem `<a>`, Handlung läuft, Palette
  schließt — außer `keepOpen`.
- **Shift+Enter / Shift+Klick** auf einem Eintrag mit `secondary` →
  `secondary.onSelect`, Palette schließt. Ohne `secondary` wie Enter.
  Shift+Klick auf den Link öffnet kein Browserfenster.
- **Sichtbarer Zweitweg (V14, Vier-Wochen-Test):** die markierte Zeile zeigt
  rechts dezent `Shift ↵` und das Label als `TextButton quiet` — ein Klick
  darauf ist derselbe Weg ohne Taste. Nicht markierte Zeilen halten den
  Platz frei (`visibility`), damit nichts springt. Schreibweise der Taste wie
  im Set (`Kbd`-Story `Edge`: „Shift ↵"), nicht „⇧↵".
- **⌘↵ / Strg+Enter** auf einem `href`-Eintrag öffnet ihn in einem neuen Tab
  (`window.open(href, "_blank", "noopener")`); ⌘/Strg+Klick überlässt das dem
  Browser. Die Palette bleibt dabei offen, damit mehrere Treffer nacheinander
  in Tabs gehen. Auf Handlungen wirkt ⌘↵ wie Enter.
- **Zustände:** gefüllt · leer (der Aufrufer liefert Einträge für die leere
  Eingabe, z. B. die Präfixe als „Suchen in") · kein Treffer (`emptyText` mit
  Ausweg) · lädt (`loading`) · Fehler (`error` mit Retry). Der Leertext steht
  nur, wenn weder lädt noch Fehler.
- **Live-Region:** ein unsichtbarer, höflicher Satz sagt „Suche läuft …" bzw.
  „n Treffer" an (Z-Regel Statuswechsel); die Fehlerzeile ist `role="alert"`.

## Stories

Titel `v3/Patterns/Frame/CommandPalette`. Bestand 5 (0039) + neu 3 = 8:
lädt (+1 Zustand) · Fehler (+1 Zustand) · `filter="none"` mit
`query`/`onQueryChange`, `secondary`, `keepOpen` und ⌘↵ im Rundlauf (+1
Enum-Wert und Callbacks in einem Rundlauf; `builtin` beweisen die fünf alten).
Der Dialog ist modal — ein Umschalter hinter ihm wäre nicht bedienbar, daher
je Zustand eine Story.

| Story | Beweist |
|---|---|
| `Loading` | `filter="none"`, `loading`: zwei stehende Treffer, darunter „Suche läuft …", kein Leertext |
| `Error` | `error` mit „Erneut suchen": Was fett, `role="alert"`, kein Leertext, Live-Region still |
| `ServerHits` | Rundlauf mit Schein-Server (300 ms): leer stehen die Präfixe als „Suchen in" (`keepOpen`, Enter setzt „m: "); „b: Musterfirma" liefert zwei gleichnamige Rechnungen; Enter → „Seite: #doc-…", Shift+Enter oder Klick auf den Hinweis → „Drawer: …", ⌘↵ → neuer Tab (die Seite bleibt); „xyz" zeigt den Leertext mit Ausweg |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Hinweis für ⌘↵ an der Zeile | `CommandItem.newTabHint?` | die App meldet, dass ⌘↵ nicht gefunden wird |
| Zuletzt geöffnet | Aufrufer liefert eine Gruppe „Zuletzt" | F351 T351.4 oder später |

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

- [ ] Ohne die neuen Props verhält sich die Palette wie in 0039 (alle fünf alten Stories, `keywords` „Kreditor")
- [ ] `query`/`onQueryChange`: ein `keepOpen`-Eintrag setzt „m: " ins Feld, die Palette bleibt offen, der Fokus bleibt im Feld (`ServerHits`)
- [ ] `filter="none"`: kein Eintrag wird ausgeblendet, obwohl sein Label den Suchtext nicht enthält; Reihenfolge wie geliefert; zwei gleichnamige Einträge sind einzeln wählbar (`ServerHits`)
- [ ] `loading`: Ladezeile sichtbar, kein „Kein Treffer" gleichzeitig (`Loading`)
- [ ] `error`: Fehlerzeile mit fettem Was und Retry, `role="alert"`, kein Leertext (`Loading`)
- [ ] Shift+Enter und Shift+Klick lösen `secondary` aus, nicht den Sprung; kein neues Browserfenster (`ServerHits`)
- [ ] Der Hinweis „Shift ↵ {label}" steht nur in der markierten Zeile, ist klickbar (≥ 24 px hoch, Hover), und die Zeilenhöhe ändert sich beim Wandern nicht (`ServerHits`, gemessen)
- [ ] ⌘↵ / Strg+Enter auf einem `href`-Eintrag öffnet einen neuen Tab, die aktuelle Seite bleibt (`ServerHits`)
- [ ] Live-Region sagt „Suche läuft …" bzw. „n Treffer" (DOM-Probe)
- [ ] Kein Fachwort im Pattern (`grep -ic "konto\|mandant\|beleg" src/ui/v3/patterns/CommandPalette.tsx` = 0)

## Befund beim Bauen (2026-10-01)

**Nach dem Eintreffen der Server-Treffer war keine Zeile markiert** — Enter
tat nichts. cmdk markiert die erste Zeile, wenn sich der Suchtext ändert; die
Server-Treffer kommen danach, und die Zeile, die es markiert hatte (ein
veralteter Treffer), ist dann weg. Gemessen in `ServerHits`: nach „b:
Musterfirma" zwei Einträge, `data-selected` bei keinem. Lösung: bei
`filter="none"` hält die Palette die Auswahl selbst (`value`/`onValueChange`
von `Command`); liegt die gemerkte `id` nicht mehr unter den gelieferten,
geht `""` an cmdk, und cmdk markiert die erste neue Zeile auf seinem eigenen
Weg. Danach: erste Zeile markiert, ↓ wandert, Enter öffnet.

**Beobachtet, nicht behoben (cmdk):** `aria-activedescendant` am Eingabefeld
steht erst nach dem ersten Pfeil — auch im Modus `builtin` und in der
unveränderten Story `Filled`, also vorbestehend. Die Live-Region sagt die
Trefferzahl an; der markierte Eintrag wird beim ersten Pfeil vorgelesen.

**Selbst gemessen** (Playwright, 1280 × 900, Storybook :6107): Shift+Enter →
„Drawer: …", Adresse unverändert · Enter auf der zweiten gleichnamigen
Rechnung → `#doc-4502` · ⌘↵ → genau ein neuer Tab `#doc-4471`, die Seite
bleibt auf `#doc-4502`, Palette offen · Shift+Klick auf den Link → Drawer,
kein neues Fenster · Klick auf den Hinweis (nach Hover sichtbar, 164 × 24 px)
→ Drawer, Adresse unverändert · ⌘+Klick auf den Link → ein neuer Tab, Palette
offen · Klick auf den Link → `#doc-4471`, Palette zu · Zeilenhöhe beim
Wandern 52,3 px in beiden Zeilen, Hinweis `hidden`/`visible` · Live-Region
„2 Treffer" bzw. „Suche läuft …".

## Abnahme

Fremde Abnahme (gemessen, nicht schlank). Stand 9c1adbb. Gelesen: diese
Spec, `patterns/CommandPalette.tsx`, `CommandPalette.stories.tsx`,
`.v2cmd__*` in `src/styles/v3.css`. Gemessen mit Playwright an Storybook
6107, 1280 × 900. **Messweg:** die gemeinsame Playwright-Seite bekam
während der Messung fremde Eingaben (im Suchfeld stand plötzlich
„b: Musterfirmadann ") — alle Werte unten stammen deshalb aus einem
eigenen Browser-Kontext desselben Browsers, je Lauf neu geöffnet und
geschlossen. Tasten wirklich gedrückt (`keyboard.press`: Enter,
Shift+Enter, Meta+Enter, Control+Enter, ↑↓, Escape, Meta+K), Klicks mit
Modifiern (`click({ modifiers })`); neue Tabs über die Seiten des Kontexts
gezählt und danach geschlossen. Bildschirmfotos unter `.playwright-mcp/`:
`0216-server-hits-hint-hover.png`, `0216-hint-hover-zoom4.png`,
`0216-loading.png`, `0216-error.png`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` **nicht neu gelaufen** (Weisung: parallele Sitzungen schreiben nach `storybook-static`) — vom Erbauer für 9c1adbb grün gemeldet | ✓ (typecheck gemessen, build laut Erbauer) |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `patterns/CommandPalette.tsx`, `CommandPalette.stories.tsx` daneben, Export über `index.ts:247–251`. Titel `v3/Patterns/Frame/CommandPalette` — der Barrel führt die Gruppe als „Rahmen" (`index.ts:231`) | Datei ✓, Story ✓, Gruppe ✗ vorbestehend → M4 |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0 („0 German comment lines"), `pnpm check:when` Exit 0; `@when` um „with `filter="none"`, from the server" ergänzt (`CommandPalette.tsx:59–65`) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-f]{3,6}\|[0-9]px"` in `CommandPalette.tsx` = 0; kein Status im Pattern; `pnpm check:type` Exit 0 | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Index: `--filled`, `--no-match`, `--interactive`, `--in-use`, `--edge`, `--server-hits`, `--loading`, `--error` = 8 = 5 + 3 wie abgeleitet. Jede neue Prop hat ihre Story: `query`/`onQueryChange`/`secondary`/`keepOpen` → `ServerHits`; `loading` → `Loading` (+ `ServerHits`); `error` → `Error`; `filter="none"` → `ServerHits`, `Loading`, `Error`; `builtin` → die fünf alten. Kein Umschalter, sondern je Zustand eine Story — begründet (Dialog modal) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Kontrast gemessen: Hinweis-Text 6,17:1, `Kbd`-Rand 3,19:1, `Kbd`-Text 6,17:1 auf `--color-bg-soft`; Fehlerzeile 4,99:1. Schrift des Hinweises 12,5 px = Unterzeile `.v2cmd__hint` 12,5 px. Trefferfläche Hinweis 164,7 × 24 px. Hover antwortet (Unterstreichung, Cursor `pointer`). Kein Querlauf in allen 8 Stories. Kein Icon ohne Wort, Taste sichtbar. Rot nur in der Fehlerzeile | ✓ mit M1 |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle 8 Stories geöffnet und bedient; Konsole ohne Fehler und Warnungen | ✓ |
| Ohne die neuen Props verhält sich die Palette wie in 0039 (alle fünf alten Stories, `keywords` „Kreditor") | `--filled`: 7 Einträge, Fokus im Feld; „kredit" und „Kreditor" → nur „Geschäftspartner", Live „1 Treffer"; „bel" + Enter → `#documents`, Palette zu. `--no-match`: „xyz" → „Kein Treffer — kürzer suchen.", Live „0 Treffer". `--interactive`: Meta+K aus dem Feld öffnet, ↓ Enter → „Gewählt: Zurück an Ludwig", Fokus zurück an „Suche". `--in-use`: Klick ins Suchfeld öffnet (8 Einträge), Escape schließt, Fokus zurück an `input.v2search`. `--edge`: 60 Einträge, 59 × ↓ → „6859 · Aufwandskonto 60" im sichtbaren Bereich der Liste (`scrollTop` 2095) | ✓ |
| `query`/`onQueryChange`: ein `keepOpen`-Eintrag setzt „m: " ins Feld, die Palette bleibt offen, der Fokus bleibt im Feld (`ServerHits`) | `--server-hits`: Enter auf „Mandanten" → Feldwert `"m: "`, Cursor an Stelle 3, Palette offen, `document.activeElement` = Eingabefeld; danach zwei Mandanten, erster markiert. Gegenprobe: Meta+Enter auf „Belegen" (Handlung ohne `href`) → `"b: "`, offen — wirkt wie Enter | ✓ |
| `filter="none"`: kein Eintrag wird ausgeblendet, obwohl sein Label den Suchtext nicht enthält; Reihenfolge wie geliefert; zwei gleichnamige Einträge sind einzeln wählbar (`ServerHits`) | „b: 4471" → „Rechnung Musterfirma GmbH" steht (das Label enthält weder „b:" noch „4471"), Live „1 Treffer". „b: Musterfirma" → `data-value` `doc-4471`, `doc-4502` in Lieferreihenfolge, nach dem Eintreffen die erste markiert (der Befund beim Bauen ist behoben). ↓ Enter → „Seite: #doc-4502"; Shift+Enter auf der ersten → „Drawer: Rechnung Musterfirma GmbH (RE-2026-4471)" | ✓ |
| `loading`: Ladezeile sichtbar, kein „Kein Treffer" gleichzeitig (`Loading`) | `--loading`: zwei Treffer, „Suche läuft …" unterhalb der letzten Zeile, kein `[cmdk-empty]`, Live „Suche läuft …" (`0216-loading.png`). In `--server-hits` beim Tippen von „xyz": die alten Treffer stehen, „Suche läuft …", kein Leertext; nach 300 ms „Kein Treffer für „xyz" — kürzer suchen oder ein Präfix wählen.", Live „0 Treffer" | ✓ |
| `error`: Fehlerzeile mit fettem Was und Retry, `role="alert"`, kein Leertext (`Loading`) | Geprüft in `--error` (die Spec nennt hier `Loading` → M2): `.v2tbl__error` mit `role="alert"`, Meldung `font-weight` 600, Knopf „Erneut suchen" (30,2 px hoch), kein `[cmdk-empty]`, Live-Region leer, Fokus im Feld (`0216-error.png`) | ✓ (M2, H1) |
| Shift+Enter und Shift+Klick lösen `secondary` aus, nicht den Sprung; kein neues Browserfenster (`ServerHits`) | Shift+Enter → „Drawer: … (RE-2026-4471)", Adresse bleibt `#doc-4502`, Palette zu, eine Seite im Kontext. Shift+Klick auf den Link der zweiten Zeile → „Drawer: … (RE-2026-4502)", Adresse unverändert, **kein** neues Fenster (weiter eine Seite). Gegenprobe: Shift+Enter auf einem Mandanten (ohne `secondary`) → wie Enter, `#client-1` | ✓ |
| Der Hinweis „Shift ↵ {label}" steht nur in der markierten Zeile, ist klickbar (≥ 24 px hoch, Hover), und die Zeilenhöhe ändert sich beim Wandern nicht (`ServerHits`, gemessen) | `.v2cmd__alt` 164,7 × 24 px, x 729,3 in beiden Zeilen; `visibility` `visible` nur in der markierten Zeile, `hidden` in der anderen; ↓ und ↑ tauschen das. Zeilenhöhe vor, während und nach dem Wandern 52,297 px in beiden Zeilen. `elementFromPoint` in der Mitte trifft den Knopf. Hover: `text-decoration` none → underline, Cursor `pointer`. Klick nach Hover → „Drawer: … (RE-2026-4502)", Adresse unverändert, Palette zu | ✓ (M1) |
| ⌘↵ / Strg+Enter auf einem `href`-Eintrag öffnet einen neuen Tab, die aktuelle Seite bleibt (`ServerHits`) | Meta+Enter auf `doc-4471` → zweite Seite `#doc-4471`, die eigene bleibt `#doc-4502`, Palette offen, Fokus im Feld. Control+Enter auf `doc-4502` → zweite Seite `#doc-4502`, Palette offen. ⌘+Klick auf den Link → eine neue Seite, Palette offen (Fokus dann am Link → H3). Neue Seiten danach geschlossen | ✓ |
| Live-Region sagt „Suche läuft …" bzw. „n Treffer" (DOM-Probe) | `.v2vh[aria-live="polite"]` in `.v2cmd`: „3 Treffer" (Präfixe), „Suche läuft …" beim Tippen, „2 Treffer", „1 Treffer", „0 Treffer"; bei `error` leer | ✓ |
| Kein Fachwort im Pattern (`grep -ic "konto\|mandant\|beleg" src/ui/v3/patterns/CommandPalette.tsx` = 0) | Befehl ausgeführt: 0 | ✓ |
| Prop-Tabellen Zeichen für Zeichen, Sätze darüber und darunter | `CommandPalette` (`CommandPalette.tsx:72–94`): `query?: string`, `onQueryChange?: (query: string) => void`, `filter?: "builtin" \| "none"` (Vorgabe `"builtin"`), `loading?: boolean` (Vorgabe `false`), `error?: { message: string; retry?: ReactNode }` — Typ, Pflicht, Vorgabe wie in der Tabelle. `CommandItem` (`:46–48`): `secondary?: { label: string; onSelect: () => void }`, `keepOpen?: boolean` — Typen wie in der Tabelle; die Tabelle hat keine Spalte „Pflicht" → M2. Sätze: „Bestand 5 (0039) + neu 3 = 8", `window.open(href, "_blank", "noopener")`, `Command.Item value={item.id}`, `value`/`onValueChange` im Befund, „164 × 24 px", „52,3 px" — stimmen mit Code und Messung | ✓ mit M2 |
| Befund „`aria-activedescendant` erst nach dem ersten Pfeil" (beobachtet, nicht behoben) | `--filled` (Modus `builtin`): beim Öffnen `data-selected` an `radix-_r_5_`, `aria-activedescendant` fehlt; nach ↓ `radix-_r_6_`. `--server-hits` ebenso (`null` → `radix-_r_f_`) | vorbestehend → M3, trägt die Abnahme |

### Mängel

**M1 — nicht blockierend (Darstellung).** Beim Hover unterstreicht
`.v2link:hover` (`src/styles/v3.css:253`) den ganzen Knopf, und die Linie
läuft durch die Tastenkappe: „Shift ↵" steht im `Kbd` unterstrichen. Der
`Kbd` ist Flex-Kind des Knopfs (`display: flex`), die Dekoration geht
deshalb hinein. Gemessen: Bildschirmfoto der Kappe vor und nach dem Hover
verschieden (900 zu 913 Byte), vierfach vergrößert
`.playwright-mcp/0216-hint-hover-zoom4.png`. Fundort
`src/ui/v3/patterns/CommandPalette.tsx:254` (`icon={<Kbd>Shift ↵</Kbd>}` —
die einzige Stelle im Set mit einem `Kbd` als `TextButton`-Icon). Nirgends
sonst im Set wird eine Taste unterstrichen. Auflage: nur das Label
unterstreichen (etwa `.v2cmd__alt:hover > span`), die Kappe bleibt still.

**M2 — nicht blockierend (Spec).** (a) Das Kriterium `error` (Zeile 136)
nennt als Nachweis die Story `Loading`; geprüft wurde in `Error`, die die
Tabelle „Stories" dafür führt. (b) Die Tabelle „Neu an `CommandItem`"
(Zeilen 53–56) hat keine Spalte „Pflicht" — dass `secondary` und `keepOpen`
optional sind (`CommandPalette.tsx:46`, `:48`), steht nirgends in der Spec.
Die Abnahme ändert die Kriterien nicht; Auflage an die Nacharbeit:
Nachweis-Story richtigstellen, Spalte „Pflicht" (nein · nein) nachziehen,
mit Datum.

**M3 — nicht blockierend, vorbestehend (Bedienung, cmdk).**
`aria-activedescendant` fehlt am Eingabefeld, bis der erste Pfeil gedrückt
ist — auch im Modus `builtin` (Messung oben). Fundort
`CommandPalette.tsx:133` (`Command.Input`, Verhalten von cmdk).
**Bewertung: trägt die Abnahme.** Das Verhalten ist nicht durch 0216
entstanden (0039, unveränderte Story `Filled`), die Live-Region sagt die
Trefferzahl, und Enter wählt, was die markierte Zeile zeigt. 0216 erhöht aber
das Gewicht: Enter, Shift+Enter und ⌘↵ wirken auf eine Zeile, die ein
Screenreader beim Öffnen und nach jedem Eintreffen neuer Treffer nicht
angesagt hat, und der Hinweis auf den Zweitweg steht nur in dieser Zeile (in
den anderen ist er `visibility: hidden` und damit auch für die Vorlesehilfe
weg). Auflage: als benannter Befund mit Owner in 0119 (gemessene Prüfung)
führen; Lösungsweg zum Beispiel das Attribut aus dem gehaltenen `value`
selbst setzen oder eine neuere cmdk-Version prüfen.

**M4 — nicht blockierend, vorbestehend (Ordnung des Sets).** Der
Story-Titel `v3/Patterns/Frame/CommandPalette`
(`CommandPalette.stories.tsx:14`, Spec Zeile 98) liegt nicht in der Gruppe
des Barrels „Rahmen" (`src/ui/v3/index.ts:231`), die der Skill
`v3-komponente` („Story ist Pflicht") verlangt. Im Storybook-Baum gibt es
dadurch zwei Rahmen-Gruppen: `Rahmen` (Wizard, EntityHeader, Columns) und
`Frame` (CommandPalette, HotkeyLegend, StepRail). Nicht durch 0216
entstanden; eine Umbenennung ändert drei Story-ID-Familien, auf die Specs
und App verweisen — Systementscheid, eigener Auftrag.

**Hinweise (kein Mangel dieser Aufgabe).**
H1 — Die Fehlerzeile setzt die ganze Meldung fett — Was, Ursache und
Schritt —, weil `message` ein einziger String ist
(`.v2tbl__error > span:first-child`, `v3.css:1294`); setweit so, wie bei
`DataTable.error`. Die Beispielmeldung der Story sagt „Der Server antwortet
nicht" (`CommandPalette.stories.tsx:373`): „Server" ist ein Wort des
Systems, die App sollte die Ursache in Worten der Kanzlei sagen.
H2 — In `role="option"` stehen ein Link (seit 0039) und jetzt der
Hinweis-Knopf: verschachtelte Bedienelemente (Kinder einer Option sind nach
ARIA präsentational). Der Knopf ist aus der Tab-Reihe (`tabIndex={-1}`), der
Link nicht (vorbestehend). Für 0119.
H3 — Nach ⌘+Klick steht der Fokus am Link statt im Suchfeld (gemessen);
wer dann weitertippt, tippt nicht ins Feld. Die Spec überlässt ⌘+Klick
bewusst dem Browser; mit der Maus unkritisch.

### Vier Linsen

**Sprache** — „Suche läuft …", „Kein Treffer für „xyz" — kürzer suchen
oder ein Präfix wählen." (mit Weg zurück), „Im Drawer öffnen" als Imperativ
mit Objekt, die Taste als „Shift ↵" wie `Kbd`/`Edge`, „n Treffer" über
`formatCount` ✓; H1. **Bedienung** — jeder Weg per Tastatur gedrückt,
Fokus bleibt im Feld (nach `keepOpen`, nach ⌘↵), Escape schließt und gibt
den Fokus zurück, der Zweitweg hat sichtbare Taste und eine Maus-Alternative
mit 164,7 × 24 px, Hover antwortet ✓; M3, H2, H3. **Logik** — fünf
Zustände (gefüllt, leer = Präfixe, kein Treffer, lädt, Fehler), der
Leertext schweigt bei lädt und Fehler, Identität über `id` statt `label`,
nach neuen Treffern ist die erste Zeile markiert, Präfixe deutet der
Aufrufer ✓. **Darstellung** — Rot nur in der Fehlerzeile (4,99:1), Hinweis
grau (6,17:1), Zeilenhöhe fest bei 52,3 px, nichts springt (`visibility`),
Schrift aus der Skala (12,5 px wie die Unterzeile) ✓; M1.

### Urteil

**Abgenommen mit Auflagen** M1, M2. M3 und M4 sind vorbestehend und nicht
blockierend (M3 → 0119, M4 eigener Auftrag). Jedes Kriterium der Spec ist im
Browser nachgewiesen.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-10-01 · Offene Punkte:
M1 (Unterstreichung in der Tastenkappe), M2 (Spec: Nachweis-Story beim
Kriterium `error`, Spalte „Pflicht" an `CommandItem`); vorbestehend M3
(`aria-activedescendant`, cmdk), M4 (Gruppe „Frame" statt „Rahmen").
