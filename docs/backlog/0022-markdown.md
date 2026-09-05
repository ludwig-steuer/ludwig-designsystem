# 0022 · Markdown — der Text, den nicht wir geschrieben haben

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | ja, unverändert — „fremd erzeugter Fließtext, sicher dargestellt" hat kein Fachwort |
| Quelle | `docs/v3-backlog.md` „Später": `Markdown` (KI-Texte, Notizen), 5 Dateien / 12 Stellen · Showcase `src/showcase/CaseCrud.stories.tsx` (Zusammenfassung des Sachverhalts) |
| Ersetzt | die rohen `<p>{text}</p>` und `<pre>`-Behelfe für Agenten-Text |
| Blockiert | die Übergabe des Laufs (`client_agent_runs.report` ist Markdown), Sachverhalts-Zusammenfassung, Klärungstexte, Notizen |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Der Agent schreibt Markdown. `client_agent_runs.report` ist die Übergabe eines
ganzen Laufs, `CaseListItem.summary` die Zusammenfassung eines Sachverhalts,
Klärungen und Notizen kommen ebenso. Heute steht das als roher Text auf der
Seite: `**fett**` bleibt `**fett**`, eine Aufzählung wird ein Absatz, eine
Tabelle wird Zeichensalat.

Die Buchhalterin liest diese Texte als Erstes — sie sind die Erklärung, warum
der Lauf so ausgegangen ist. Ein Text, den man nicht überfliegen kann, wird
nicht gelesen.

## Einordnung

- **Wiederverwenden:** `ProseCard` (`@when`) trägt den **Rahmen** für längeren
  Text, nicht seine Auszeichnung — sie nimmt `children`, keinen Markdown-String.
  `LongText` (legacy) kürzt und klappt auf, formatiert aber nicht.
- **Neu, weil:** §3.3 — kein `@when` passt · kein Fachwort · 12 Stellen
  gezählt · **nicht** in ~15 Zeilen an der Aufrufstelle zu bauen: der Teil,
  der Arbeit macht, ist nicht das Rendern, sondern das Nicht-Vertrauen (siehe
  unten).
- **Zuschnitt:** eine Datei, ein Export. `ProseCard` bleibt der Rahmen, in den
  sie gesetzt wird — Rahmen und Inhalt ändern sich aus verschiedenen Gründen (§4).
- **Setzt auf:** nichts aus dem Set.

## Der Punkt: der Text ist nicht vertrauenswürdig

Er stammt aus einem Sprachmodell, das seinerseits Belegtexte, Verwendungszwecke
und E-Mails gelesen hat. Deshalb:

- **Kein `dangerouslySetInnerHTML` auf ungeprüftem HTML.** Roh-HTML im Markdown
  wird nicht gerendert, sondern verworfen.
- **Links tragen `rel="noopener noreferrer"`**, öffnen in einem neuen Tab und
  zeigen ihr Ziel; `javascript:`- und `data:`-URLs fallen weg.
- **Bilder werden nicht geladen.** Eine URL im Agententext ist ein Rückkanal
  nach außen, kein Bild. Was ein Beleg zeigt, zeigt die Beleg-Vorschau.

Das ist der eigentliche Grund für eine eigene Komponente: diese drei Regeln
wären an zwölf Aufrufstellen zwölfmal zu treffen — und einmal zu vergessen.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `text` | `string \| null` | ja | Der Markdown-Quelltext. `null` rendert nichts, keinen Leerzustand | `Filled`, `Empty` |
| `variant` | `"full" \| "inline"` | nein | `full` (Default) erlaubt Blockelemente; `inline` nur Betonung, Code und Links — für eine Zelle oder eine Zeile | `Variants` |
| `maxHeight` | `number` | nein | Ab dieser Höhe wird geblendet und „Ganz lesen" angeboten | `Long` |
| `overflow` | `"clamp" \| "scroll"` | nein | Nur mit `maxHeight`. `clamp` (Default) blendet aus und bietet „Ganz lesen" wie bisher; `scroll` hält die Höhe und scrollt innen — der Reader in Drawer und Detail (Erweiterung A5) | `Reader` |

Keine Ludwig-Typen — das ist der Klassen-Test. Der Aufrufer gibt einen String,
egal aus welchem Feld.

**Was die Komponente nicht kann (bewusst):**

- **Markdown bearbeiten.** Sie zeigt, sie ist kein Editor.
- **Tabellen mit Sortierung.** Was sortierbar sein soll, ist eine `Table` mit
  Daten, kein Markdown-Blob.
- **Eigene Überschriften-Ebene wählen.** `#` im Text wird immer eine Ebene
  unter der Seite gerendert, damit kein Agententext eine `h1` erzeugt.

## Verhalten

- Erlaubt: Absatz, Betonung, Aufzählung, nummerierte Liste, Zitat, Code
  (inline und Block), Tabelle, Überschrift, Trennlinie, Link.
- Verworfen: Roh-HTML, Bilder, Fußnoten, alles Übrige — kommentarlos, nicht
  als sichtbarer Fehler. Ein Agent, der eine Fußnote schreibt, ist kein Anlass
  für eine rote Meldung an die Buchhalterin.
- Ein leerer oder nur aus Leerzeichen bestehender Text rendert **nichts** —
  kein leerer Kasten, kein „—".
- Server-Component, wenn die gewählte Bibliothek es zulässt: der Text ist
  statisch, er braucht keinen Zustand.

## Erweiterung A5 · der Reader

Aus `docs/backlog/0034-shadcn-abgleich.md` §A5 (shadcn-Abgleich, Zeile „Scroll
Area"): ein **scrollbarer** Markdown-Reader ist im Storybook nicht zu finden.
`maxHeight` blendet heute aus und bietet „Ganz lesen" — richtig für die
Zusammenfassung in einer Liste, falsch für den Bericht eines Laufs in einem
Drawer mit fester Höhe: dort soll der Kopf stehen bleiben und der Text innen
scrollen.

Regel §3.2: **eine** Prop, und ein Enum statt eines zweiten Booleans neben
`maxHeight` (§5) — `clamp` und `scroll` schließen sich aus.

- `overflow="scroll"` setzt `overflow-y: auto` auf den Textkörper und erzeugt
  **keine** Maske und **kein** `<details>`/`summary` („Ganz lesen" entfällt).
- Der Scrollbereich ist per Tastatur erreichbar (`tabindex=0`), damit die
  Pfeiltasten ihn scrollen — ein Textblock ohne Fokus ist mit der Tastatur
  nicht zu lesen (V10/V11).
- Ohne `maxHeight` ist `overflow` wirkungslos; das steht in der `@when`-Zeile.
- Im selben Zug bekommen die Story-Exporte in `Markdown.stories.tsx`
  englische Namen (`Gefuellt` → `Filled`, `Leer` → `Empty`, `Varianten` →
  `Variants`, `Lang` → `Long`, `Unsicher` → `Unsafe`, `ImEinsatz` → `InUse`) —
  `CLAUDE.md`: Story-Exportnamen sind englisch, und die Datei wird ohnehin
  angefasst.

## Stories

Nach §6: 2 anwendbare Zustände + 1 Enum (`variant`) + 0 Callbacks + 1 „im
Einsatz" + 1 Rand + 1 Sicherheit = 6, mit der Erweiterung A5 (`overflow`) = 7;
dazu die bereits gebaute `Flow` (Befund aus der Abnahme, Punkt 2).

| Story | Beweist |
|---|---|
| `Filled` | echter Agentenbericht: Überschrift, Aufzählung, Tabelle, Code |
| `Empty` | `null` und `"   "` rendern nichts |
| `Variants` | `full` und `inline` nebeneinander am selben Text |
| `Long` | `maxHeight` blendet und bietet „Ganz lesen" (`overflow="clamp"`) |
| `Reader` | `overflow="scroll"`: fester Rahmen, Kopf steht, Text scrollt innen (A5) |
| `Unsafe` | Roh-HTML, `javascript:`-Link, Bild-URL — nichts davon wirkt |
| `InUse` | in `ProseCard`, wie am Sachverhalt |

Nicht anwendbar: `Loading` (der Text ist da oder nicht) · `EmptyAfterFilter`
(nichts wird gefiltert) · `Error` (unlesbares Markdown gibt es nicht — im
Zweifel steht der Quelltext da).

## Befund beim Bauen von A5 (2026-09-03)

**Der `clamp`-Anriss war in aktuellem Chrome unsichtbar.** Seit Chrome 131
versteckt der Browser den Inhalt eines geschlossenen `<details>` über
`::details-content { content-visibility: hidden }`; die Story `Long` zeigte
deshalb nur noch „Ganz lesen" und darüber nichts — obwohl `.v2mk__body`
weiterhin 220 px Layouthöhe hatte (gemessen in Chrome 152). Behoben mit einer
Zeile in `v3.css`:
`.v2mk--clamp::details-content { content-visibility: visible; block-size: auto; }`.
Kein JavaScript, keine geänderte Schnittstelle; Browser ohne dieses
Pseudoelement lassen die Regel fallen.

## Abgleich 2026-09-03 · Größen aus der Leiter

Owner-Befund am Reader: „der Fließtext hat eine größere Schrift als die
Bulletpoints". Ursache war nicht die Komponente, sondern `tokens.css`: die
Regel `p, .lw-body { font-size: var(--fs-body) }` traf jeden `<p class="v2mk__p">`
mit 16 px, während `li` die 13,5 px des Containers erbte. Der Element-Selektor
ist raus (siehe 0037), und `Markdown` nimmt seine Größen jetzt aus der Leiter
des produktiven Registers:

| Teil | vorher | jetzt |
|---|---|---|
| Block, Absatz, Liste, Zitat | 13,5 px / Absatz faktisch 16 px | `--fs-ui` (13,5 px), Absatz erbt |
| Überschriften `#`…`####` | 17 / 15,5 / 14 / 13 px | `--fs-ui-lg` / `--fs-ui-md` / `--fs-ui` / `--fs-ui-sm` |
| Code-Block | 12 px | `--fs-ui-sm` |
| Tabelle | 13 px | `--fs-ui` |
| „Ganz lesen" | 12,5 px | `--fs-ui-sm` |

Nachweis: `v3-primitives-fläche-markdown--filled`, gemessen — Block, Absatz,
Listenpunkt, Zitat und Tabelle stehen alle auf 13,5 px.

## Abnahmekriterien der Erweiterung A5

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] `overflow="scroll"` erzeugt `overflow-y: auto` und **keine** Maske, kein
      `summary` „Ganz lesen" (Story `Reader`, DOM-Probe)
- [ ] `clamp`-Verhalten aus dieser Spec unverändert (Story `Long`)
- [ ] Tastatur: der Scrollbereich ist fokussierbar (`tabindex=0`), Pfeiltasten
      scrollen ihn (Story `Reader`, im Browser beobachtet)
- [ ] `overflow` ohne `maxHeight` ändert nichts — kein Rahmen, keine Höhe
- [ ] Alle Story-Exporte in `Markdown.stories.tsx` englisch
      (`grep -E "^export const (Gefuellt|Leer|Varianten|Lang|Unsicher|ImEinsatz)"` leer)
- [ ] Server-Component: die Datei trägt weiterhin kein `"use client"`

## Offene Fragen

1. **Welche Bibliothek?** *Ohne Antwort: `marked` plus eine Allowlist beim
   Rendern — klein, ohne React-Abhängigkeit, damit die Komponente Server
   bleiben kann. `react-markdown` zöge `unified` samt Kette nach.*
2. **Zählt `maxHeight` zum ersten Wurf?** *Ohne Antwort: ja — der Lauf-Bericht
   ist regelmäßig zu lang für eine Karte, und ohne die Blende landet er
   ungekürzt auf der Seite.*
3. **Tabellen erlauben?** *Ohne Antwort: ja. Der Agent stellt Vergleiche als
   Tabelle dar, und als Text sind sie unlesbar.*

## Abnahme

**Zweite Abnahme, 2026-09-05** (fremder Prüfer, nicht der Erbauer). Zwei der
drei offenen Punkte der ersten Runde sind erledigt: Links tragen jetzt
`target="_blank"` und ihr Ziel im `title`, und `flow` hat eine eigene Story.
Ein fester Punkt reißt neu. Jedes Kriterium einzeln, fest und variabel:

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; zweimal gelaufen (Beginn und Ende der Abnahme, 2026-09-05) | ✓ |
| **Fest** — `pnpm build` grün | Nicht erneut gelaufen (schreibt nach `storybook-static`, parallele Abnahmen). Der Lauf für diesen Stand war grün („Storybook build completed successfully") | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Markdown.tsx` mit `Markdown.stories.tsx` daneben; Titel `v3/Primitives/Fläche/Markdown` (`Markdown.stories.tsx:6`) — „Fläche" ist die Gruppe aus dem Barrel; Export `src/ui/v3/index.ts:130` | ✓ |
| **M1 · Fest** — `@when`/`@instead` an **jedem** Export | **Reißt.** Die Datei hat drei Funktions-Exporte, und alle drei stehen im Barrel (`index.ts:130`): `Markdown` (`:220`) trägt beide Zeilen (`:214–218`), `parseInline` (`:52`) und `parseMarkdown` (`:94`) tragen **keine**. Beide sind damit öffentliche Schnittstelle ohne die Antwort auf „was nehme ich?"; benutzt werden sie außerhalb der Datei nirgends (`grep -rn "parseMarkdown\|parseInline" src/` findet nur `Markdown.tsx` und die Barrel-Zeile). Derselbe Punkt wurde in 0019 an `parseAmount` gerügt und dort behoben — hier steht er noch offen | ✗ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\|[0-9]+px\|fontSize:" Markdown.tsx` → keine Treffer; die einzige Inline-Angabe ist `--v2mk-max` als Custom Property aus `maxHeight` (`:266`, `:280`). Größen in `v3.css:1952–2002`. Kein Status im Spiel | ✓ |
| **Fest** — alle Stories der Spec vorhanden, ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--empty`, `--variants`, `--flow`, `--long`, `--unsafe`, `--in-use`, `--reader` — acht: die sieben der Ableitung (2 Zustände + 1 Enum + 1 „im Einsatz" + 1 Rand + 1 Sicherheit + `Reader` aus A5) plus `Flow`. `Loading`, `EmptyAfterFilter` und `Error` sind in der Spec mit Grund ausgeschlossen | ✓ |
| **Fest** — Story-Deckung der Schnittstelle | Alle vier Props der Spec sind belegt: `text` → `--filled` und `--empty` (dort beide Fälle, `null` und `"   "`), `variant` → `--variants` (`full` und `inline` am selben Text), `maxHeight` → `--long` und `--reader`, `overflow` → `--long` (`clamp`) und `--reader` (`scroll`). Zusätzlich ist die nicht in der Spec geführte Prop `flow` in `--flow` vorgeführt; `className` bleibt unbelegt (Befund 2) | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 (ohne die zwei App-Punkte) | Stufe `primitives/`, keine Importe außer React, kein Fachmodul ✓ · kein Hex/px/Label-Map ✓ · Text links, nichts zentriert ✓ · Farbe: nur Überschriften in `--color-primary-700`, kein semantischer Ton, kein Rot ✓ · fünf Zustände: zwei gebaut, drei begründet ausgeschlossen ✓ · Kontrast gemessen (auf `--color-bg-soft`): Absatz 12,71:1, Zitat 6,17:1, Tabellenkopf 6,17:1, Code-Block 11,94:1 ✓ · keine Bewegung, `prefers-reduced-motion` gegenstandslos ✓ · Hover: `.v2mk__more:hover` unterstreicht, `.v2link:hover` unterstreicht ✓ · Fokus: `.v2mk--scroll:focus-visible` sichtbar (im Bild geprüft) ✓ · kein Icon, kein Emoji; Unicode aus dem Agententext wird als Text gerendert, nicht als Bedeutungsträger ✓ · Karte in `--in-use` (`ProseCard`) mit Rand, ohne Schatten ✓ · Texte: die Komponente schreibt selbst nur „Ganz lesen" ✓. **Ein Punkt reißt:** `@when`/`@instead`, siehe M1 | ✗ (wegen M1) |
| **Fest** — im Browser angesehen | Alle acht Stories in Chromium auf `localhost:6107` geöffnet, `--long` aufgeklappt, `--reader` mit der Tastatur gescrollt; Bilder von `--filled` und `--reader` geprüft | ✓ |
| **Variabel** — Roh-HTML erscheint nicht im DOM | `--unsafe`, Tag-Zählung unter `#storybook-root`: `{DIV: 3, P: 5, A: 1}` — kein `script`, kein `b`. `<script>alert(1)</script>` und `<b>Roh-HTML</b>` stehen als Text da. `grep -rn dangerouslySetInnerHTML src/` findet nur die Kommentarzeile in `Markdown.tsx:10` | ✓ |
| **Variabel** — `javascript:`- und `data:`-Links sind entschärft | `--unsafe`: von `[Bitte hier klicken](javascript:alert(1))` bleibt reiner Text, im DOM ist genau **ein** `<a>`, und das zeigt auf `https://example.com`. `safeHref` (`:47–50`) lässt nur `http(s)://`, `mailto:`, `/` und `#` durch | ✓ |
| **Variabel** — kein `<img>` wird geladen | `--unsafe`: kein `IMG` in der Tag-Zählung; die aufgezeichneten Anfragen der Seite enthalten keine an `example.com`. Der Bild-Ausdruck wird nur verschluckt, sein Alt-Text bleibt (`:61`) | ✓ |
| **Variabel** — externe Links: `rel`, neuer Tab, sichtbares Ziel | `--unsafe`: `<a href="https://example.com" target="_blank" rel="noopener noreferrer" title="https://example.com">`. Das war Punkt (1) der ersten Runde und ist damit erfüllt; das Ziel steht im `title`, also erst beim Überfahren — für den Fall „nicht klicken, ohne zu sehen wohin" reicht das | ✓ |
| **Variabel** — `#` im Text erzeugt keine `h1` | `--filled`: `h1`-Anzahl 0, `h2`-Anzahl 0; aus `## Warum 6815 …` wird `H3.v2mk__h v2mk__h--2` (`:296`) | ✓ |
| **Variabel** — leerer Text rendert nichts | `--empty`: kein Knoten mit Klasse `v2mk`; beide gestrichelten Kästen haben leeres `innerHTML`. Gilt für `null` und für `"   "` (`:247`) | ✓ |
| **Variabel** — `inline` erzeugt keine Blockelemente | `--variants`: `span.v2mk--inline`, `display: inline`, Kinder ausschließlich `STRONG`, `CODE`, `A`; dieselbe Quelle als `full` hat ein `P` | ✓ |
| **A5 · Variabel** — `overflow="scroll"` erzeugt `overflow-y: auto` und **keine** Maske, kein „Ganz lesen" | `--reader`, gemessen: `DIV.v2mk.v2mk--scroll`, `overflow-y: auto`, `max-height: 260px`, tatsächliche Höhe 260 px bei `scrollHeight` 1282 px. Auf der Seite gibt es 0 `<details>` und 0 `summary`, `maskImage` des Textkörpers ist `none` | ✓ |
| **A5 · Variabel** — `clamp`-Verhalten unverändert | `--long`: `DETAILS.v2mk--clamp`, geschlossen ist `.v2mk__body` 220 px hoch mit `linear-gradient`-Maske; Klick auf „Ganz lesen" → `open`, Höhe 220 → 850 px, `max-height: none`, Maske weg. Die Chrome-Regel `::details-content` aus dem Befund (`v3.css:1985`) greift, der Anriss ist sichtbar | ✓ |
| **A5 · Variabel** — der Scrollbereich ist fokussierbar, Pfeiltasten scrollen ihn | `--reader`: ein Tab landet auf `.v2mk.v2mk--scroll` (`tabIndex: 0`), der Fokusring ist im Bild zu sehen; dreimal Pfeil-ab → `scrollTop` 0 → 120. Der Kopf des `DetailPane` („Bericht des Laufs · Stapel 2026-08") bleibt dabei stehen | ✓ |
| **A5 · Variabel** — `overflow` ohne `maxHeight` ändert nichts | `Markdown.tsx:259` und `:274`: beide Sonderzweige stehen unter `if (maxHeight …)`; ohne `maxHeight` fällt die Komponente auf `<div className="v2mk">` (`:287`) — kein Rahmen, keine Höhe, kein `tabIndex`. Die `@when`-Zeile sagt es (`:214–218`) | ✓ |
| **A5 · Variabel** — alle Story-Exporte englisch | `grep -E "^export const (Gefuellt\|Leer\|Varianten\|Lang\|Unsicher\|ImEinsatz)" Markdown.stories.tsx` → leer. Die acht Exporte heißen `Filled`, `Empty`, `Variants`, `Flow`, `Long`, `Unsafe`, `InUse`, `Reader` | ✓ |
| **A5 · Variabel** — Server-Component: kein `"use client"` | `sed -n 1p Markdown.tsx` → `import { Fragment } from "react";`; die Datei trägt keine `"use client"`-Zeile, alle Zweige kommen ohne Zustand aus (`<details>` statt State) | ✓ |
| **Variabel** — Größen aus der Leiter (Abgleich 2026-09-03) | `--filled`, gemessen: Absatz 13,5 px, Listenpunkt 13,5 px, Zitat 13,5 px, Tabellenzelle 13,5 px, Code-Block 12,5 px, `h2` 14 px. Deckt sich mit `v3.css:1954–1957` (`--fs-ui-lg` / `-md` / `--fs-ui` / `-sm`) und mit der Tabelle oben | ✓ |

**Zurück auf `in Arbeit`.** Zu tun:

1. **M1 — `parseInline` und `parseMarkdown` bekommen `@when`/`@instead`,** oder
   sie verlassen den Barrel und werden dateiintern. Beides ist recht; heute
   sind es zwei öffentliche Exporte ohne die Pflichtzeilen und ohne einen
   einzigen Aufrufer.

**Befunde** (keine Mängel, aber Punkte aus der ersten Runde, die stehen bleiben):

2. **`className` steht nicht in der Schnittstelle der Spec** (`Markdown.tsx:240`).
   `flow` hat mit `Flow` inzwischen eine Story, fehlt in der Tabelle aber
   ebenfalls — beim nächsten Anfassen nachtragen.
3. **Die verwaiste Klammer bleibt.** Aus `[…](javascript:alert(1))` steht im
   Text „Bitte hier klicken) — …", weil der Link-Ausdruck bei der ersten `)`
   endet (`INLINE_RE`, `:40`). Winzig, aber sichtbar in `--unsafe`.
4. **Ein Link im Fließtext springt aus der Leiter.** `.v2link` (`v3.css:190`)
   setzt `font: 600 12.5px` fest; in einem 13,5-px-Absatz wird der Link damit
   kleiner und fetter als sein Satz — genau die Art Bruch, die der Abgleich
   2026-09-03 sonst beseitigt hat. Dazu misst `--color-accent-700` (`#2E78A8`)
   auf Weiß 4,43:1 und bleibt als normal große Textfarbe unter den 4,5:1 aus
   V10. Beides gehört `.v2link` und dem Token, nicht dieser Komponente.

Erste Runde (2026-09-03, Historie): Alle Sicherheitskriterien ✓; offen waren
`target`/sichtbares Ziel am Link (behoben), `flow` ohne Story (behoben) und die
verwaiste Klammer (offen).


## Mangel der Abnahme vom 2026-09-05 — behoben

`parseInline` und `parseMarkdown` waren öffentliche Exporte — auch im Barrel —
**ohne** `@when`/`@instead`. Genau dieser Punkt war in 0019 an `parseAmount`
gerügt und dort behoben worden; hier stand er noch.

Beide tragen jetzt beide Zeilen. Der Fall, für den sie da sind, ist derselbe
wie bei `parseAmount`: die Frage „was wird aus diesem Text?", ohne ihn zu
zeichnen — eine Vorschau, eine Längenprüfung, ein Test. Sie verweisen
aufeinander und auf `Markdown`.

Nicht geändert: dass sie heute keinen Aufrufer haben. Ein Parser ohne
Aufrufer ist kein Fehler, solange die Frage, die er beantwortet, benannt ist —
und das war der Mangel.

## Abnahmekriterien (Nachtrag)

- [ ] `parseInline` und `parseMarkdown` tragen `@when` **und** `@instead` (`grep`)
- [ ] Die Abgrenzung verweist auf `Markdown` und aufeinander

## Abnahme der Nachbesserung, 2026-09-05

Dritte Runde, fremder Prüfer (weder Erbauer noch Vorprüfer). Geprüft gegen
den Nachtrag, gegen die festen Kriterien und gegen die Kriterien der
Erweiterung A5. Gemessen in einem eigenen headless Chromium (1440 × 900) auf
`localhost:6107`.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0 | ✓ |
| **Fest** — `pnpm build` grün | Nicht gestartet: er schreibt nach `storybook-static`, und parallel arbeiten weitere Sitzungen | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Markdown.tsx` mit `Markdown.stories.tsx` daneben; Titel `v3/Primitives/Fläche/Markdown`; Export `src/ui/v3/index.ts:130` | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an **jedem** Export | Drei Funktions-Exporte, alle drei im Barrel: `parseInline` (`Markdown.tsx:63`, JSDoc `:52–62`), `parseMarkdown` (`:112`, JSDoc `:105–111`), `Markdown` (`:238`, JSDoc `:231–237`). Jeder Block steht unmittelbar über seinem Export. Kommentare der Datei durchgängig englisch (`grep` nach deutschen Funktionswörtern in Kommentarzeilen → kein Treffer) | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map | `grep -cE '#[0-9a-fA-F]{3,8}\b|[0-9]+px|fontSize' src/ui/v3/primitives/Markdown.tsx` → 0. Die einzige Inline-Angabe bleibt `--v2mk-max` aus `maxHeight` | ✓ |
| **Fest** — alle Stories vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--empty`, `--variants`, `--flow`, `--long`, `--unsafe`, `--in-use`, `--reader` — acht. `Loading`, `EmptyAfterFilter`, `Error` sind begründet ausgeschlossen | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Der einzige Punkt, der in der Vorrunde riss — `@when`/`@instead` an jedem Export — hält jetzt. Der Rest unverändert wie protokolliert | ✓ |
| **Fest** — im Browser angesehen | `--filled`: kein `h1`, kein `img`, Absatz 13,5 px, aus `##` wird `H3`; Tabelle, Zitat, Code-Block, Liste alle da. `--reader`: `.v2mk--scroll` mit `overflow-y: auto`, `max-height: 260px`, tatsächliche Höhe 260 px bei `scrollHeight` 1282 px, `tabIndex 0`, **kein** `<details>`, **kein** `summary`. `--unsafe`: 0 `img`, 0 `script`, genau ein `<a href="https://example.com" target="_blank" rel="noopener noreferrer" title="https://example.com">` | ✓ |
| **A5** — `overflow="scroll"` erzeugt `overflow-y: auto` und keine Maske, kein „Ganz lesen" | `--reader`, gemessen wie oben | ✓ |
| **A5** — Tastatur: der Scrollbereich ist fokussierbar | `--reader`: `tabIndex: 0` am `.v2mk--scroll` | ✓ |
| **A5** — `overflow` ohne `maxHeight` ändert nichts | Beide Sonderzweige stehen unter `if (maxHeight …)`; ohne `maxHeight` bleibt `<div className="v2mk">` | ✓ |
| **A5** — alle Story-Exporte englisch | `grep -E "^export const (Gefuellt\|Leer\|Varianten\|Lang\|Unsicher\|ImEinsatz)" Markdown.stories.tsx` → leer | ✓ |
| **A5** — Server-Component: kein `"use client"` | `grep -l '"use client"' src/ui/v3/primitives/Markdown.tsx` → kein Treffer | ✓ |

**Nachtrag**

| Kriterium | Nachweis (Befehl · Fundstelle) | Ergebnis |
|---|---|---|
| `parseInline` und `parseMarkdown` tragen `@when` **und** `@instead` (`grep`) | `grep -n "@when\|@instead\|^export function" src/ui/v3/primitives/Markdown.tsx` → `:59 @when`, `:61 @instead`, `:63 export function parseInline`; `:109 @when`, `:110 @instead`, `:112 export function parseMarkdown`. Beide Blöcke stehen unmittelbar über ihrem Export, nicht davor abgehängt | ✓ |
| Die Abgrenzung verweist auf `Markdown` und aufeinander | `parseInline`: „@instead Drawing it → Markdown. A whole document → parseMarkdown." · `parseMarkdown`: „@instead Drawing it → Markdown. A single line → parseInline." Beide Richtungen, plus der Verweis auf den Renderer | ✓ |

**Alles ✓.** Dass die beiden Parser heute keinen Aufrufer außerhalb der Datei
haben, ist wie im Text der Nachbesserung begründet kein Mangel — die Frage,
die sie beantworten, ist benannt.

**Befunde** (unverändert aus der Vorrunde, keine Mängel dieser Aufgabe):

1. `className` und `flow` stehen nicht in der Schnittstelle der Spec —
   beim nächsten Anfassen nachtragen.
2. Die verwaiste Klammer aus `[…](javascript:alert(1))` bleibt in `--unsafe`
   sichtbar.
3. `.v2link` springt im Fließtext aus der Größenleiter, und
   `--color-accent-700` bleibt auf Weiß unter 4,5:1 — beides gehört dem Token
   und der Klasse, nicht dieser Komponente.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05
