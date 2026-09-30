# 0216 · CommandPalette — Treffer vom Server, Zweitweg, neuer Tab

| | |
|---|---|
| Status | Abnahme — gebaut 2026-10-01 |
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
