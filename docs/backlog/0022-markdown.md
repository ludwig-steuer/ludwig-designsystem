# 0022 · Markdown — der Text, den nicht wir geschrieben haben

| | |
|---|---|
| Status | Abnahme |
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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Roh-HTML im Text erscheint nicht im DOM | `v3-primitives-fläche-markdown--unsicher`, DOM ausgelesen: die einzigen Tags unter `#storybook-root` sind `DIV`, `P`, `A`; `script`: 0, `b`: 0. `<script>alert(1)</script>` und `<b>Roh-HTML</b>` stehen als Text da. `grep -rn dangerouslySetInnerHTML src/` findet nur die Kommentarzeile in `Markdown.tsx:10` | ✓ |
| `javascript:`- und `data:`-Links sind entschärft | `--unsicher`: von `[Bitte hier klicken](javascript:alert(1))` bleibt der reine Text, kein `a` im DOM. `safeHref` lässt ausschließlich `http(s)://`, `mailto:`, `/` und `#` durch | ✓ |
| Kein `<img>` wird geladen | `--unsicher`: `img`: 0 im DOM; nach Neuladen zeigen die 75 aufgezeichneten Netzwerk-Anfragen keine an `example.com` (nur Storybook-Assets und die Google-Fonts der Vorschau) | ✓ |
| Externe Links tragen `rel="noopener noreferrer"` | `--unsicher`: `<a href="https://example.com" rel="noopener noreferrer">`. Hinweis: `Gefuellt` enthält nur `href="#"`, der externe Fall steht in `Unsicher` | ✓ |
| `#` im Text erzeugt keine `h1` | `--gefuellt`: `h1`: 0, `h2`: 0; `## Warum 6815 …` wird `H3.v2mk__h--2` | ✓ |
| Leerer Text rendert kein Element | `--leer`: 0 Knoten mit Klasse `v2mk`; beide gestrichelten Kästen haben leeres `innerHTML` | ✓ |
| `inline` erzeugt keine Blockelemente | `--varianten`: `span.v2mk--inline`, `display: inline`, Kinder ausschließlich `STRONG`, `CODE`, `A`; die `full`-Fassung desselben Textes hat ein `P` | ✓ |
| `maxHeight` blendet und bietet „Ganz lesen" (Offene Frage 2) | `--lang`: `.v2mk__body` auf `max-height: 220px` mit `linear-gradient`-Maske; Klick auf `summary` „Ganz lesen" → `open`, Höhe 220 → 918 px, ohne eine Zeile Zustand (natives `details`) | ✓ |
| `pnpm typecheck` / `pnpm build` | beide grün | ✓ |

**Nachprüfung der Behebung** (fremder Prüfer, 2026-09-03): Links tragen `target="_blank"`, `title` mit dem Ziel und `rel="noopener noreferrer"`; `javascript:` kommt im DOM nicht vor.

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte:
(1) Der Abschnitt „Der Punkt" verlangt drei Dinge von einem Link — `rel`,
**neuer Tab** und **sichtbares Ziel**. Umgesetzt ist nur `rel`: es gibt kein
`target="_blank"` und der Link zeigt seine Adresse nirgends. Entweder nachziehen
oder die Spec auf `rel` zurücknehmen. (2) Die Komponente führt zwei Props über
die Schnittstelle hinaus: `className` und `flow`; `flow` ändert das Verhalten
(harte Zeilenumbrüche werden zu Leerzeichen) und hat keine Story. (3) Winzig:
aus `[…](javascript:alert(1))` bleibt eine verwaiste Klammer im Text stehen,
weil der Link-Ausdruck bei der ersten `)` endet.
