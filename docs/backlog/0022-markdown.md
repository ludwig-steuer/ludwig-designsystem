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
| `text` | `string \| null` | ja | Der Markdown-Quelltext. `null` rendert nichts, keinen Leerzustand | `Gefuellt`, `Leer` |
| `variant` | `"full" \| "inline"` | nein | `full` (Default) erlaubt Blockelemente; `inline` nur Betonung, Code und Links — für eine Zelle oder eine Zeile | `Varianten` |
| `maxHeight` | `number` | nein | Ab dieser Höhe wird geblendet und „Ganz lesen" angeboten | `Lang` |

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

## Stories

Nach §6: 2 anwendbare Zustände + 1 Enum (`variant`) + 0 Callbacks + 1 „im
Einsatz" + 1 Rand + 1 Sicherheit = 6.

| Story | Beweist |
|---|---|
| `Gefuellt` | echter Agentenbericht: Überschrift, Aufzählung, Tabelle, Code |
| `Leer` | `null` und `"   "` rendern nichts |
| `Varianten` | `full` und `inline` nebeneinander am selben Text |
| `Lang` | `maxHeight` blendet und bietet „Ganz lesen" |
| `Unsicher` | Roh-HTML, `javascript:`-Link, Bild-URL — nichts davon wirkt |
| `ImEinsatz` | in `ProseCard`, wie am Sachverhalt |

Nicht anwendbar: `Laedt` (der Text ist da oder nicht) · `LeerNachFilter`
(nichts wird gefiltert) · `Fehler` (unlesbares Markdown gibt es nicht — im
Zweifel steht der Quelltext da).

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

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte:
(1) Der Abschnitt „Der Punkt" verlangt drei Dinge von einem Link — `rel`,
**neuer Tab** und **sichtbares Ziel**. Umgesetzt ist nur `rel`: es gibt kein
`target="_blank"` und der Link zeigt seine Adresse nirgends. Entweder nachziehen
oder die Spec auf `rel` zurücknehmen. (2) Die Komponente führt zwei Props über
die Schnittstelle hinaus: `className` und `flow`; `flow` ändert das Verhalten
(harte Zeilenumbrüche werden zu Leerzeichen) und hat keine Story. (3) Winzig:
aus `[…](javascript:alert(1))` bleibt eine verwaiste Klammer im Text stehen,
weil der Link-Ausdruck bei der ersten `)` endet.
