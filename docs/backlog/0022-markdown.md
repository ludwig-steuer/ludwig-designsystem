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

- [ ] Roh-HTML im Text erscheint nicht im DOM (`Unsicher`, Blick ins DOM)
- [ ] `javascript:`- und `data:`-Links sind entschärft (`Unsicher`)
- [ ] Kein `<img>` wird geladen (`Unsicher`, Netzwerk-Tab bleibt leer)
- [ ] Externe Links tragen `rel="noopener noreferrer"` (`Gefuellt`, DOM)
- [ ] `#` im Text erzeugt keine `h1` (`Gefuellt`, DOM)
- [ ] Leerer Text rendert kein Element (`Leer`)
- [ ] `inline` erzeugt keine Blockelemente (`Varianten`)

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

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
