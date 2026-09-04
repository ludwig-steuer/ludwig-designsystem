# 0075 · Beleg-Vorschau — `DocumentPreview`

| | |
|---|---|
| Status | spec |
| Stufe | `entities/document/` — `DocumentPreview.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **fast**: ein PDF in einem Rahmen ist kein Fachwort. Sie bleibt trotzdem Entität, weil sie zwei fachliche Regeln trägt — der Grund für eine fehlende Vorschau wird ausgesprochen statt bebildert, und ein Teilbeleg sagt, aus welchen Seiten welches Originals er stammt (`splitPageRange`, `parentSourceDocId`). Ohne die zwei wäre sie ein `<iframe>` an der Aufrufstelle. |
| Quelle | Entitätsprofil `docs/entitaeten/document.md`, Formen-Tabelle Zeile `DocumentPreview`; Datenpunkte Rang 10 und 12 |
| Ersetzt | `BelegPreview` (`ui/beleg/`, drei Aufrufstellen: Rechnung, Nicht-Rechnung, Vertrag) und das inline-`<iframe>` in `DocumentDrawer` (0052) |
| Blockiert | 0076 (der Drawer-Nachzug braucht sie), 0071 (View und Karte) |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

Ein Beleg *hat* ein Original — das ist der Unterschied zwischen ihm und
jeder anderen Entität, und deshalb steht es in Drawer, Karte und Detail an
zweiter Stelle, gleich nach dem Kopf (0052, Zone 2). Heute gibt es dafür
zwei Implementierungen: `BelegPreview` in der App (die selbst schon drei
identische Einzelfassungen ersetzt hat) und ein zweites `<iframe>` im
v3-Drawer.

Beide können dasselbe nicht: sagen, **welchen Ausschnitt** man sieht. Jeder
fünfte Beleg im Bestand ist ein Teilbeleg, aus einem Sammel-PDF
herausgeschnitten (`splitPageRange`, 20 %). Wer die Vorschau ansieht, sieht
drei Seiten und weiß nicht, dass sie Seiten 5–7 eines 24-Seiten-Originals
sind.

## Einordnung

- **Wiederverwenden:** kein `@when` in `src/ui/v3` deckt „das Original einer
  Entität, groß". `DocumentDrawer` (0052) *enthält* die Vorschau, ist aber
  der Rahmen um sie, nicht sie selbst.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — `ui-repraesentationen.md`
  führt die Form „Vorschau" für den Beleg (`BelegPreview`), und keine
  vorhandene Form deckt sie ab. Regel 3 (neue Primitive) greift **nicht**:
  ohne die zwei fachlichen Regeln bliebe zu wenig übrig, und der zweite
  Aufrufer außerhalb der Beleg-Familie fehlt.
- **Zuschnitt:** eine Datei, ein Export. Kein Familienmitglied von
  `Document.tsx` — sie hat eine andere Datenquelle (die signierte URL aus
  `ops_stored_files`, nicht die Beleg-Zeile) und ändert sich aus einem
  anderen Grund (§4 „Trennen", zweiter Punkt).
- **Setzt auf:** `Card`/`CardHead`, `EmptyState`. **Nicht** `Section` — die
  gibt es in v3 nicht (Prüfung des Profils, 2026-09-04).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `url` | `string \| null` | ja | Signierte URL des Originals. `null` heißt **es gibt keine**, nicht „lädt noch". | `Gefuellt`, `OhneVorschau` |
| `unavailableReason` | `string \| null` | nein | Warum es keine gibt, in einem Satz. Ohne ihn steht der Standardsatz. Nie ein Platzhalterbild. | `OhneVorschau` |
| `title` | `string` | nein | Überschrift des Rahmens, Vorgabe „Beleg". Beim Vertrag „Vertrag" — die **Belegart**, aus `sourceDocTypeLabel()` des Aufrufers, nicht hier abgeleitet. | `Ausprägungen` |
| `pageCount` | `number \| null` | nein | Seitenzahl des Dokuments (100 % gefüllt, p90 3, max 27). Steht als Meta neben dem Titel. | `Gefuellt` |
| `excerpt` | `{ pages: string; parentTitle?: string; parentHref?: string } \| null` | nein | Der Ausschnitt: `splitPageRange` („5-7") plus, wenn bekannt, der Weg zum Sammel-Original. `null` = ein ganzes Dokument. | `Teilbeleg` |
| `height` | `"md" \| "lg"` | nein | `md` im Drawer, `lg` in View und Karte. Ein Enum statt zweier Booleans (§5); die Werte sind Token-Höhen aus `v3.css`, keine px in der Komponente. | `Groessen` |

Typen: keiner aus `src/ludwig/` nötig — die Vorschau kennt den Beleg nicht,
nur seine Datei. `splitPageRange` kommt als fertiger String („5-7"), die
Komponente parst nichts.

**Was sie bewusst nicht kann:**

- **Nicht laden.** Keine signierte URL holen, kein Ablaufdatum prüfen, kein
  Neuversuch. Der Aufrufer gibt `url` oder `null` (0042).
- **Kein PDF rendern.** Das `<iframe>` überlässt es dem Browser — kein
  `pdf.js`, keine eigene Seitennavigation. Wer blättern will, öffnet das
  Original.
- **Keinen Platzhalter zeigen.** Fehlt die Vorschau, steht dort ein Satz.
  Ein grauer Kasten in Dokumentform wäre eine Behauptung über etwas, das
  nicht da ist.
- **Nicht auf den Ausschnitt zoomen.** `excerpt` **beschreibt** ihn, es
  schneidet nichts: der Teilbeleg ist bereits eine eigene Datei (F71
  schneidet serverseitig).

## Verhalten

**Server-Component.** Ein `<iframe>` braucht kein `"use client"`.

Zustände:

| Zustand | Was passiert |
|---|---|
| gefüllt | Titel, Seitenzahl, ggf. Ausschnitt-Zeile; darunter das `<iframe>` in der Höhe aus `height` |
| leer (`url = null`) | `EmptyState` **inline** mit `unavailableReason` oder dem Standardsatz „Für diesen Beleg gibt es keine Vorschau." |
| lädt | **nicht anwendbar** — der Aufrufer zeigt `Skeleton` in der Form der Vorschau, wie `DocumentDrawer` es heute tut |
| Fehler | **nicht anwendbar** — die Komponente ruft nichts; eine abgelaufene URL zeigt der Browser im `<iframe>` |
| leer nach Filter | **nicht anwendbar** — es wird nichts gefiltert |

Das `<iframe>` bekommt ein sprechendes `title` („Vorschau von
`<Dateiname>`") — ohne das ist es für einen Screenreader ein namenloser
Rahmen.

## Stories

Titel `v3/Entitäten/Beleg/DocumentPreview`.

| Story | Beweist |
|---|---|
| `Gefuellt` | Ein dreiseitiges PDF mit Titel und Seitenzahl |
| `OhneVorschau` | Beide Leerfälle nebeneinander: mit Begründung und ohne (Standardsatz) — kein Platzhalterbild in beiden |
| `Teilbeleg` | „Seiten 5–7 aus Sammel-PDF vom 12.08.2026" mit Weg zum Original; daneben dasselbe Dokument ohne `excerpt` |
| `Ausprägungen` | Titel „Beleg", „Rechnung", „Vertrag", „Kontoauszug" — die Aufschrift kommt vom Aufrufer, die Vorschau bleibt dieselbe |
| `Groessen` | `md` und `lg` nebeneinander |
| `ImEinsatz` | In einem `Drawer` neben einer Liste — so, wie 0076 sie einsetzt |

Sechs Stories: 2 anwendbare Zustände + 1 je Enum-Prop (`height`, plus
`title` als Ausprägungs-Achse) + 1 Layout-Fall (`excerpt`) + 1 „im Einsatz".
Kein Callback, keine Rand-Story — die Komponente formatiert nichts und kürzt
nichts.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Zur Seite springen (Sammel-PDF, 27 Seiten im Maximum) | `initialPage?: number`, angehängt als `#page=n` | wenn ein Screen ein Sammel-PDF mit Split-Plan zeigt und auf ein Segment zeigen will |
| Herunterladen | `downloadHref?: string` neben dem Titel | wenn eine Seite es anbietet — der Drawer tut es heute bewusst nicht (0052: genau ein Ausgang) |
| Vorschau eines Bildes statt PDF | Fallunterscheidung an `contentType` | wenn Belege als JPG/PNG hochgeladen werden; heute ist alles PDF |

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

- [ ] `url = null` zeigt einen **Satz**, keinen grauen Kasten in Dokumentform (Story `OhneVorschau`)
- [ ] Ohne `unavailableReason` steht der Standardsatz, nicht nichts (Story `OhneVorschau`)
- [ ] `excerpt` nennt Seitenbereich **und** Weg zum Original; ohne `excerpt` steht keine Zeile, kein „ganzes Dokument" (Story `Teilbeleg`)
- [ ] `height` verhält sich wie Zeile 6 der Schnittstelle, beide Werte aus Tokens (Story `Groessen`)
- [ ] Das `<iframe>` trägt ein sprechendes `title` mit dem Dateinamen (Story `Gefuellt`, im Browser geprüft)
- [ ] Ersetzt `BelegPreview` in allen drei App-Aufrufstellen ohne Funktionsverlust
- [ ] Tut bewusst nicht: laden, rendern, zoomen, blättern

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: … · Offene Punkte: …
